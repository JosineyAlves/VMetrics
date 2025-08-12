import React, { useEffect, useState } from 'react'
import { useStripeStore } from '../store/stripe'
import { STRIPE_CONFIG } from '../config/stripe'
import { Button } from './ui/button'
import { CheckCircle, XCircle, AlertTriangle, Loader2, ExternalLink, Zap, TestTube } from 'lucide-react'

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
    serverStatus: 'online' | 'offline' | 'checking'
    webhookStatus: 'configured' | 'not_configured' | 'checking'
  }>({
    stripeConfigured: false,
    publishableKey: null,
    secretKey: null,
    webhookSecret: null,
    serverStatus: 'checking',
    webhookStatus: 'checking'
  })

  const [webhookTestResult, setWebhookTestResult] = useState<string | null>(null)
  const [webhookTestLoading, setWebhookTestLoading] = useState(false)

  useEffect(() => {
    // Verificar configuração do Stripe
    const checkStripeConfig = () => {
      const isConfigured = !!process.env.VITE_STRIPE_PUBLISHABLE_KEY
      const config = STRIPE_CONFIG
      
      setConfigStatus(prev => ({
        ...prev,
        stripeConfigured: isConfigured,
        publishableKey: config.publishableKey,
        secretKey: config.secretKey ? `${config.secretKey.substring(0, 20)}...` : null,
        webhookSecret: config.webhookSecret
      }))
    }

    // Verificar status do servidor
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: 'test', customerId: 'test' })
        })
        
        // Se chegou até aqui, o servidor está online
        setConfigStatus(prev => ({ ...prev, serverStatus: 'online' }))
        
        // Verificar status do webhook
        await checkWebhookStatus()
      } catch (error) {
        setConfigStatus(prev => ({ ...prev, serverStatus: 'offline' }))
      }
    }

    // Verificar status do webhook
    const checkWebhookStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/stripe/webhook-status')
        if (response.ok) {
          const data = await response.json()
          setConfigStatus(prev => ({ 
            ...prev, 
            webhookStatus: data.webhookConfigured ? 'configured' : 'not_configured' 
          }))
        }
      } catch (error) {
        setConfigStatus(prev => ({ ...prev, webhookStatus: 'not_configured' }))
      }
    }

    checkStripeConfig()
    checkServerStatus()
    loadProducts()
  }, [loadProducts])

  const handleTestCheckout = async (priceId: string) => {
    if (!configStatus.stripeConfigured) {
      setCheckoutError('Stripe não está configurado')
      return
    }

    if (configStatus.serverStatus !== 'online') {
      setCheckoutError('Servidor não está rodando. Execute: npm run dev:server')
      return
    }

    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      // Primeiro, criar um cliente de teste via API
      const customerResponse = await fetch('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          customerId: 'cus_test_' + Date.now(), // ID temporário para teste
          successUrl: 'http://localhost:5173/success',
          cancelUrl: 'http://localhost:5173/pricing'
        })
      })

      if (!customerResponse.ok) {
        throw new Error(`Erro do servidor: ${customerResponse.status}`)
      }

      const { url } = await customerResponse.json()

      if (url) {
        console.log('✅ Sessão de checkout criada, redirecionando...')
        window.open(url, '_blank')
      } else {
        throw new Error('URL de checkout não recebida')
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar checkout:', error)
      setCheckoutError(`Erro: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleTestPortal = async () => {
    if (configStatus.serverStatus !== 'online') {
      setCheckoutError('Servidor não está rodando')
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'cus_test_portal',
          returnUrl: 'http://localhost:5173/dashboard'
        })
      })

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`)
      }

      const { url } = await response.json()

      if (url) {
        console.log('✅ Sessão do portal criada, redirecionando...')
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('❌ Erro ao criar sessão do portal:', error)
      setCheckoutError(`Erro do portal: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleTestWebhook = async (eventType: string) => {
    if (configStatus.serverStatus !== 'online') {
      setCheckoutError('Servidor não está rodando')
      return
    }

    setWebhookTestLoading(true)
    setWebhookTestResult(null)

    try {
      const response = await fetch('http://localhost:3001/api/stripe/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: eventType,
          eventData: {
            id: 'test_' + Date.now(),
            customer: 'cus_test_webhook',
            metadata: { test: 'true' }
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Erro do servidor: ${response.status}`)
      }

      const result = await response.json()
      setWebhookTestResult(`✅ ${result.message}`)
      
    } catch (error) {
      console.error('❌ Erro ao testar webhook:', error)
      setWebhookTestResult(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setWebhookTestLoading(false)
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

            <div className="flex items-center space-x-3">
              {configStatus.serverStatus === 'online' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : configStatus.serverStatus === 'offline' ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
              )}
              <span className="font-medium">
                Servidor: {configStatus.serverStatus === 'online' ? 'Online' : configStatus.serverStatus === 'offline' ? 'Offline' : 'Verificando...'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {configStatus.webhookStatus === 'configured' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : configStatus.webhookStatus === 'not_configured' ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
              )}
              <span className="font-medium">
                Webhook: {configStatus.webhookStatus === 'configured' ? 'Configurado' : configStatus.webhookStatus === 'not_configured' ? 'Não configurado' : 'Verificando...'}
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
                <div>Servidor: http://localhost:3001</div>
              </div>
            </div>

            {/* Botão para testar portal */}
            <Button
              onClick={handleTestPortal}
              disabled={configStatus.serverStatus !== 'online'}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Testar Portal do Cliente
            </Button>
          </div>
        </div>
      </div>

      {/* Teste de Webhooks */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-purple-500" />
          Teste de Webhooks
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Eventos Disponíveis:</h3>
            <div className="space-y-2">
              {STRIPE_CONFIG.webhookEvents.map((eventType) => (
                <Button
                  key={eventType}
                  onClick={() => handleTestWebhook(eventType)}
                  disabled={webhookTestLoading || configStatus.serverStatus !== 'online'}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {eventType}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Resultado do Teste:</h3>
            <div className="bg-gray-50 p-4 rounded-lg min-h-[120px]">
              {webhookTestLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">Testando webhook...</span>
                </div>
              ) : webhookTestResult ? (
                <div className="text-sm">
                  <div className="font-medium text-gray-700 mb-2">Último teste:</div>
                  <div className="text-gray-600">{webhookTestResult}</div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Clique em um evento para testar o webhook
                </div>
              )}
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
                        disabled={checkoutLoading || !product.stripeIds.prices.monthly || configStatus.serverStatus !== 'online'}
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
                        disabled={checkoutLoading || !product.stripeIds.prices.yearly || configStatus.serverStatus !== 'online'}
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
          <div>2. ✅ <strong>Servidor configurado</strong> - Endpoints Stripe implementados</div>
          <div>3. ✅ <strong>Webhooks implementados</strong> - Serviço de processamento criado</div>
          <div>4. 🔄 <strong>Configurar webhook no Stripe</strong> - Para receber eventos reais</div>
          <div>5. 🧪 <strong>Testar checkout</strong> - Use os botões acima para testar</div>
          <div>6. 🚀 <strong>Implementar Fase 4</strong> - Lógica de negócio nos webhooks</div>
        </div>
      </div>

      {/* Configuração do Webhook */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-3">🔧 Configurar Webhook:</h3>
        <div className="text-yellow-700 space-y-2 text-sm">
          <div>1. No Stripe Dashboard → Developers → Webhooks</div>
          <div>2. Add endpoint: <code className="bg-yellow-100 px-2 py-1 rounded">http://localhost:3001/api/webhooks/stripe</code></div>
          <div>3. Events: checkout.session.completed, customer.subscription.*, invoice.payment_*</div>
          <div>4. Copie o signing secret e adicione ao .env como STRIPE_WEBHOOK_SECRET</div>
          <div>5. Reinicie o servidor após configurar o webhook</div>
        </div>
      </div>
    </div>
  )
}

export default StripeTest
