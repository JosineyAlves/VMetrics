#!/usr/bin/env node

/**
 * 🧪 Teste de Integração de Webhooks - VMetrics
 * 
 * Este script testa a integração completa dos webhooks do Stripe
 */

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

function logHeader(title) {
  log('\n' + '='.repeat(60), 'bright')
  log(`  ${title}`, 'cyan')
  log('='.repeat(60), 'bright')
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'yellow')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

async function testWebhookIntegration() {
  logHeader('🧪 TESTE DE INTEGRAÇÃO DE WEBHOOKS - VMETRICS')

  try {
    // 1. Verificar configuração
    logStep('1', 'Verificando configuração dos webhooks')
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      logError('STRIPE_WEBHOOK_SECRET não configurado')
      logInfo('Configure a variável de ambiente STRIPE_WEBHOOK_SECRET')
      return false
    }
    logSuccess('Webhook secret configurado')

    // 2. Verificar servidor
    logStep('2', 'Verificando se o servidor está rodando')
    
    try {
      const response = await fetch('http://localhost:3001/api/stripe/webhook-status')
      if (response.ok) {
        const status = await response.json()
        logSuccess(`Servidor rodando: ${status.status}`)
      } else {
        logError('Servidor não respondeu corretamente')
        return false
      }
    } catch (error) {
      logError('Servidor não está rodando')
      logInfo('Execute: npm run dev:server')
      return false
    }

    // 3. Testar endpoint de webhook
    logStep('3', 'Testando endpoint de webhook')
    
    try {
      const testEvent = {
        id: 'evt_test_' + Date.now(),
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_' + Date.now(),
            customer: 'cus_test_' + Date.now(),
            subscription: 'sub_test_' + Date.now(),
            status: 'complete'
          }
        }
      }

      const response = await fetch('http://localhost:3001/api/stripe/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testEvent)
      })

      if (response.ok) {
        logSuccess('Endpoint de webhook funcionando')
      } else {
        logError('Endpoint de webhook retornou erro')
        return false
      }
    } catch (error) {
      logError('Erro ao testar webhook:', error.message)
      return false
    }

    // 4. Verificar integração com PlanService
    logStep('4', 'Verificando integração com PlanService')
    
    try {
      // Simular ativação de plano
      const planService = require('./src/services/planService').planService
      
      const result = await planService.activateUserPlan(
        'cus_test_' + Date.now(),
        'sub_test_' + Date.now(),
        'pro',
        { status: 'active' }
      )

      if (result.success) {
        logSuccess('PlanService funcionando corretamente')
      } else {
        logError('PlanService retornou erro:', result.error)
        return false
      }
    } catch (error) {
      logError('Erro ao testar PlanService:', error.message)
      return false
    }

    // 5. Resumo final
    logHeader('🎯 RESUMO DOS TESTES')
    logSuccess('Todos os testes passaram com sucesso!')
    logInfo('A integração de webhooks está funcionando corretamente')
    
    logHeader('📋 PRÓXIMOS PASSOS')
    logInfo('1. Configure o webhook no Stripe Dashboard')
    logInfo('2. Use a URL: https://vmetrics.com.br/api/webhooks/stripe')
    logInfo('3. Teste com eventos reais do Stripe')
    logInfo('4. Monitore os logs para verificar processamento')

    return true

  } catch (error) {
    logError('Erro durante os testes:', error.message)
    return false
  }
}

// Executar testes
if (require.main === module) {
  testWebhookIntegration()
    .then(success => {
      if (success) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
    .catch(error => {
      logError('Erro fatal:', error.message)
      process.exit(1)
    })
}

module.exports = { testWebhookIntegration }
