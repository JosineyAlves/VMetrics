import React, { useEffect, useState } from 'react'
import { useStripeStore } from '../store/stripe'
import { stripeService } from '../services/stripe'
import { STRIPE_CONFIG } from '../config/stripe'
import { Button } from './ui/button'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

const StripeTest: React.FC = () => {
  const { 
    products, 
    loading, 
    error, 
    loadProducts,
    checkoutLoading,
    setCheckoutLoading,
    setCheckoutError
  } = useStripeStore()
  
  const [configStatus, setConfigStatus] = useState<{
    stripeConfigured: boolean
    publishableKey: string | null
    secretKey: string | null
    webhookSecret: string | null
  }>({
    stripeConfigured: false,
    publishableKey: null,
    secretKey: null,
    webhookSecret: null
  })

  useEffect(() => {
    // Verificar configuração do Stripe
    const checkStripeConfig = () => {
      const isConfigured = stripeService.isConfigured()
      const config = stripeService.getConfig()
      
      setConfigStatus({
        stripeConfigured: isConfigured,
        publishableKey: config.publishableKey,
        secretKey: config.secretKey ? `${config.secretKey.substring(0, 20)}...` : null,
        webhookSecret: config.webhookSecret
      })
    }

    checkStripeConfig()
    loadProducts()
  }, [loadProducts])

  const handleTestCheckout = async (priceId: string) => {
    if (!stripeService.isConfigured()) {
      setCheckoutError('Stripe não está configurado')
      return
    }

    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      // Simular criação de cliente (em produção, isso viria do usuário logado)
      const testCustomer = await stripeService.createCustomer({
        email: 'teste@vmetrics.com.br',
        name: 'Usuário Teste',
        metadata: { test: 'true' }
      })

      // Criar sessão de checkout
      const session = await stripeService.createCheckoutSession({
        customerId: testCustomer.id,
        priceId: priceId,
        metadata: { test: 'true' }
      })

      console.log('✅ Sessão de checkout criada:', session)
      
      // Redirecionar para checkout (em produção)
      if (session.url) {
        window.open(session.url, '_blank')
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar checkout:', error)
      setCheckoutError(`Erro: ${error}`)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100)
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🧪 Teste de Integração Stripe
        </h1>
        <p className="text-gray-600 text-lg">
          Verifique se a integração com o Stripe está funcionando corretamente
        </p>
      </div>

      {/* Status da Configuração */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3 text-yellow-500" />
          Status da Configuração
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {configStatus.stripeConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                Stripe Configurado: {configStatus.stripeConfigured ? 'Sim' : 'Não'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {configStatus.publishableKey ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                Chave Publicável: {configStatus.publishableKey ? 'Configurada' : 'Não configurada'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {configStatus.secretKey ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                Chave Secreta: {configStatus.secretKey ? 'Configurada' : 'Não configurada'}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Configuração Atual:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Ambiente: {STRIPE_CONFIG.isProduction ? 'Produção' : 'Desenvolvimento'}</div>
                <div>Moeda: {STRIPE_CONFIG.defaultCurrency.toUpperCase()}</div>
                <div>Trial: {STRIPE_CONFIG.trialPeriodDays} dias</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Configurados */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
          Produtos Configurados
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Carregando produtos...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="space-y-3 mb-6">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  {product.prices.monthly && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-800">
                          {formatCurrency(product.prices.monthly.amount)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">/mês</span>
                      </div>
                      <Button
                        onClick={() => handleTestCheckout(product.prices.monthly!.id)}
                        disabled={checkoutLoading || !product.stripeIds.prices.monthly}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {checkoutLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Testar'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {product.prices.yearly && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-800">
                          {formatCurrency(product.prices.yearly.amount)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">/ano</span>
                      </div>
                      <Button
                        onClick={() => handleTestCheckout(product.prices.yearly!.id)}
                        disabled={checkoutLoading || !product.stripeIds.prices.yearly}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {checkoutLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Testar'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* IDs do Stripe */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">IDs Stripe:</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Produto: {product.stripeIds.product || 'Não configurado'}</div>
                    <div>Preço Mensal: {product.stripeIds.prices.monthly || 'Não configurado'}</div>
                    <div>Preço Anual: {product.stripeIds.prices.yearly || 'Não configurado'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3">📝 Próximos Passos:</h3>
        <div className="text-blue-700 space-y-2">
          <div>1. ✅ <strong>Chaves configuradas</strong> - Stripe está funcionando</div>
          <div>2. 🔄 <strong>Configurar webhook</strong> - Para receber eventos do Stripe</div>
          <div>3. 🧪 <strong>Testar checkout</strong> - Use os botões acima para testar</div>
          <div>4. 🚀 <strong>Implementar Fase 2</strong> - Checkout e pagamentos</div>
        </div>
      </div>
    </div>
  )
}

export default StripeTest
