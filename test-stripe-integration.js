#!/usr/bin/env node

/**
 * Script de teste para verificar a integração completa do Stripe
 * Execute: node test-stripe-integration.js
 */

import fetch from 'node-fetch'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const SERVER_URL = 'http://localhost:3001'
const STRIPE_CONFIG = {
  publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
}

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue')
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`)
  console.log('='.repeat(message.length))
}

// Função para testar endpoint
async function testEndpoint(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${SERVER_URL}${endpoint}`, options)
    const data = await response.json()
    
    return { success: response.ok, status: response.status, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Teste principal
async function runTests() {
  logHeader('🧪 TESTE DE INTEGRAÇÃO STRIPE - VMETRICS')
  
  // 1. Verificar configuração
  logHeader('1. VERIFICAÇÃO DE CONFIGURAÇÃO')
  
  if (!STRIPE_CONFIG.publishableKey) {
    logError('VITE_STRIPE_PUBLISHABLE_KEY não configurada')
    return
  } else {
    logSuccess('VITE_STRIPE_PUBLISHABLE_KEY configurada')
  }
  
  if (!STRIPE_CONFIG.secretKey) {
    logError('STRIPE_SECRET_KEY não configurada')
    return
  } else {
    logSuccess('STRIPE_SECRET_KEY configurada')
  }
  
  if (!STRIPE_CONFIG.webhookSecret) {
    logWarning('STRIPE_WEBHOOK_SECRET não configurada (webhooks não funcionarão)')
  } else {
    logSuccess('STRIPE_WEBHOOK_SECRET configurada')
  }
  
  // 2. Testar conectividade do servidor
  logHeader('2. TESTE DE CONECTIVIDADE DO SERVIDOR')
  
  const serverTest = await testEndpoint('GET', '/api/stripe/webhook-status')
  
  if (serverTest.success) {
    logSuccess('Servidor está rodando e respondendo')
    logInfo(`Status do webhook: ${serverTest.data.webhookConfigured ? 'Configurado' : 'Não configurado'}`)
    logInfo(`URL do webhook: ${serverTest.data.webhookUrl}`)
  } else {
    logError('Servidor não está respondendo')
    logInfo('Execute: npm run dev:server')
    return
  }
  
  // 3. Testar endpoints Stripe
  logHeader('3. TESTE DOS ENDPOINTS STRIPE')
  
  // Teste de checkout
  logInfo('Testando endpoint de checkout...')
  const checkoutTest = await testEndpoint('POST', '/api/stripe/create-checkout-session', {
    priceId: 'price_test',
    customerId: 'cus_test'
  })
  
  if (checkoutTest.success) {
    logSuccess('Endpoint de checkout funcionando')
  } else {
    logError(`Endpoint de checkout falhou: ${checkoutTest.data?.error || checkoutTest.error}`)
  }
  
  // Teste do portal
  logInfo('Testando endpoint do portal...')
  const portalTest = await testEndpoint('POST', '/api/stripe/create-portal-session', {
    customerId: 'cus_test'
  })
  
  if (portalTest.success) {
    logSuccess('Endpoint do portal funcionando')
  } else {
    logError(`Endpoint do portal falhou: ${portalTest.data?.error || portalTest.error}`)
  }
  
  // 4. Teste de webhook (se configurado)
  if (STRIPE_CONFIG.webhookSecret) {
    logHeader('4. TESTE DE WEBHOOK')
    
    logInfo('Testando processamento de webhook...')
    const webhookTest = await testEndpoint('POST', '/api/stripe/test-webhook', {
      eventType: 'checkout.session.completed',
      eventData: {
        id: 'cs_test_' + Date.now(),
        customer: 'cus_test_webhook',
        metadata: { test: 'true' }
      }
    })
    
    if (webhookTest.success) {
      logSuccess('Webhook processado com sucesso')
      logInfo(`Evento: ${webhookTest.data.event.type}`)
    } else {
      logError(`Webhook falhou: ${webhookTest.data?.error || webhookTest.error}`)
    }
  } else {
    logHeader('4. TESTE DE WEBHOOK')
    logWarning('Webhook não configurado - pulando teste')
  }
  
  // 5. Resumo final
  logHeader('5. RESUMO DOS TESTES')
  
  logInfo('Para configurar o webhook no Stripe:')
  logInfo('1. Acesse: https://dashboard.stripe.com/webhooks')
  logInfo('2. Add endpoint: http://localhost:3001/api/webhooks/stripe')
  logInfo('3. Events: checkout.session.completed, customer.subscription.*, invoice.payment_*')
  logInfo('4. Copie o signing secret para STRIPE_WEBHOOK_SECRET')
  logInfo('5. Reinicie o servidor')
  
  logInfo('\nPara testar checkout real:')
  logInfo('1. Acesse o componente StripeTest no frontend')
  logInfo('2. Clique em "Testar" nos planos')
  logInfo('3. Use cartões de teste do Stripe')
  
  logSuccess('\n🎉 Teste de integração concluído!')
}

// Executar testes
runTests().catch(error => {
  logError(`Erro durante os testes: ${error.message}`)
  process.exit(1)
})
