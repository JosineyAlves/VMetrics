#!/usr/bin/env node

/**
 * Script para sincronizar produtos e preços com o Stripe
 * 
 * Uso:
 * npm run sync:stripe
 * 
 * Este script:
 * 1. Cria produtos no Stripe baseado na configuração local
 * 2. Cria preços para cada produto
 * 3. Atualiza os IDs no arquivo de configuração
 */

import { stripeService } from '../services/stripe'
import { STRIPE_PRODUCTS } from '../config/stripe'

interface SyncResult {
  success: boolean
  products: Array<{
    name: string
    stripeId: string
    prices: Array<{
      interval: string
      stripeId: string
    }>
  }>
  errors: string[]
}

async function syncStripeProducts(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    products: [],
    errors: []
  }

  console.log('🚀 Iniciando sincronização com Stripe...')
  console.log('')

  try {
    // Verificar se o Stripe está configurado
    if (!stripeService.isConfigured()) {
      throw new Error('Stripe não está configurado. Configure as variáveis de ambiente primeiro.')
    }

    // Sincronizar cada produto
    for (const [productKey, productData] of Object.entries(STRIPE_PRODUCTS)) {
      console.log(`📦 Sincronizando produto: ${productData.name}`)
      
      try {
        // Criar produto no Stripe
        const stripeProduct = await stripeService.createProduct({
          name: productData.name,
          description: productData.description,
          metadata: {
            product_key: productKey,
            features: productData.features.join(',')
          }
        })

        const productResult = {
          name: productData.name,
          stripeId: stripeProduct.id,
          prices: []
        }

        // Criar preços para o produto
        for (const [priceKey, priceData] of Object.entries(productData.prices)) {
          if (priceData.amount > 0) { // Pular preços customizados
            console.log(`  💰 Criando preço ${priceKey}: ${priceData.amount} ${priceData.currency.toUpperCase()}`)
            
            const stripePrice = await stripeService.createPrice({
              productId: stripeProduct.id,
              amount: priceData.amount,
              currency: priceData.currency,
              interval: priceData.interval as 'month' | 'year',
              metadata: {
                price_key: priceKey,
                product_key: productKey
              }
            })

            productResult.prices.push({
              interval: priceKey,
              stripeId: stripePrice.id
            })

            console.log(`    ✅ Preço criado: ${stripePrice.id}`)
          } else {
            console.log(`  ⏭️  Pulando preço customizado: ${priceKey}`)
          }
        }

        result.products.push(productResult)
        console.log(`✅ Produto sincronizado: ${stripeProduct.id}`)
        console.log('')

      } catch (error) {
        const errorMsg = `Erro ao sincronizar produto ${productData.name}: ${error}`
        console.error(`❌ ${errorMsg}`)
        result.errors.push(errorMsg)
        result.success = false
      }
    }

    // Resumo da sincronização
    console.log('📊 Resumo da Sincronização:')
    console.log('========================')
    
    if (result.products.length > 0) {
      console.log(`✅ Produtos sincronizados: ${result.products.length}`)
      result.products.forEach(product => {
        console.log(`  📦 ${product.name} (${product.stripeId})`)
        product.prices.forEach(price => {
          console.log(`    💰 ${price.interval}: ${price.stripeId}`)
        })
      })
    }

    if (result.errors.length > 0) {
      console.log(`❌ Erros encontrados: ${result.errors.length}`)
      result.errors.forEach(error => {
        console.log(`  ${error}`)
      })
    }

    console.log('')
    
    if (result.success) {
      console.log('🎉 Sincronização concluída com sucesso!')
      console.log('')
      console.log('📝 Próximos passos:')
      console.log('1. Copie os IDs dos produtos e preços acima')
      console.log('2. Atualize o arquivo de configuração com os IDs reais')
      console.log('3. Configure as variáveis de ambiente para produção')
      console.log('4. Teste o checkout com os produtos reais')
    } else {
      console.log('⚠️  Sincronização concluída com erros. Verifique os logs acima.')
    }

  } catch (error) {
    console.error('❌ Erro fatal durante sincronização:', error)
    result.success = false
    result.errors.push(`Erro fatal: ${error}`)
  }

  return result
}

// Executar script se chamado diretamente
if (require.main === module) {
  syncStripeProducts()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro não tratado:', error)
      process.exit(1)
    })
}

export default syncStripeProducts
