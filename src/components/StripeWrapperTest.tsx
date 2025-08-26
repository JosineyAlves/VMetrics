import React, { useState, useEffect } from 'react'
import { stripeWrapperService } from '../services/stripeWrapperService'
import type { StripeSubscription, StripeCheckout, StripeInvoice } from '../services/stripeWrapperService'

const StripeWrapperTest: React.FC = () => {
  const [isWrapperConfigured, setIsWrapperConfigured] = useState<boolean | null>(null)
  const [subscriptions, setSubscriptions] = useState<StripeSubscription[]>([])
  const [checkouts, setCheckouts] = useState<StripeCheckout[]>([])
  const [invoices, setInvoices]>([])
  const [revenueData, setRevenueData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testEmail, setTestEmail] = useState('test@example.com')

  useEffect(() => {
    checkWrapperStatus()
  }, [])

  const checkWrapperStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const configured = await stripeWrapperService.isWrapperConfigured()
      setIsWrapperConfigured(configured)
      
      if (configured) {
        console.log('✅ Stripe Wrapper está configurado')
      } else {
        console.log('❌ Stripe Wrapper não está configurado')
      }
    } catch (err) {
      setError('Erro ao verificar status do wrapper')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const testGetAllSubscriptions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await stripeWrapperService.getAllActiveSubscriptions()
      setSubscriptions(data)
      
      console.log('✅ Assinaturas carregadas:', data)
    } catch (err) {
      setError('Erro ao buscar assinaturas')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const testGetUserSubscription = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await stripeWrapperService.getUserSubscription(testEmail)
      
      if (data) {
        setSubscriptions([data])
        console.log('✅ Assinatura do usuário encontrada:', data)
      } else {
        setSubscriptions([])
        console.log('ℹ️ Nenhuma assinatura encontrada para:', testEmail)
      }
    } catch (err) {
      setError('Erro ao buscar assinatura do usuário')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const testGetUserCheckout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await stripeWrapperService.getUserCheckout(testEmail)
      
      if (data) {
        setCheckouts([data])
        console.log('✅ Checkout do usuário encontrado:', data)
      } else {
        setCheckouts([])
        console.log('ℹ️ Nenhum checkout encontrado para:', testEmail)
      }
    } catch (err) {
      setError('Erro ao buscar checkout do usuário')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const testGetUserInvoices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await stripeWrapperService.getUserInvoices(testEmail)
      setInvoices(data)
      
      console.log('✅ Faturas do usuário carregadas:', data)
    } catch (err) {
      setError('Erro ao buscar faturas do usuário')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const testGetRevenueData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await stripeWrapperService.getRevenueData('month')
      setRevenueData(data)
      
      console.log('✅ Dados de receita carregados:', data)
    } catch (err) {
      setError('Erro ao buscar dados de receita')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const testSyncStripeData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await stripeWrapperService.syncStripeData()
      
      if (result.success) {
        console.log('✅ Sincronização concluída:', result.message)
        alert(`Sincronização concluída! ${result.synced_count} itens processados.`)
      } else {
        setError(result.message)
        console.error('❌ Sincronização falhou:', result.message)
      }
    } catch (err) {
      setError('Erro na sincronização')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(amount / 100) // Stripe armazena em centavos
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🧪 Teste do Stripe Wrapper - VMetrics
        </h1>

        {/* Status do Wrapper */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Status do Stripe Wrapper</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            {isWrapperConfigured === null ? (
              <span className="text-yellow-500">Verificando...</span>
            ) : isWrapperConfigured ? (
              <span className="text-green-500">✅ Configurado</span>
            ) : (
              <span className="text-red-500">❌ Não configurado</span>
            )}
          </div>
          <button
            onClick={checkWrapperStatus}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Verificar Status
          </button>
        </div>

        {/* Email de teste */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Email para Teste</h2>
          <div className="flex space-x-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Digite um email para testar"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Botões de teste */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Testes Disponíveis</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              onClick={testGetAllSubscriptions}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Todas Assinaturas
            </button>
            <button
              onClick={testGetUserSubscription}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Assinatura do Usuário
            </button>
            <button
              onClick={testGetUserCheckout}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Checkout do Usuário
            </button>
            <button
              onClick={testGetUserInvoices}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
            >
              Faturas do Usuário
            </button>
            <button
              onClick={testGetRevenueData}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Dados de Receita
            </button>
            <button
              onClick={testSyncStripeData}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Sincronizar Dados
            </button>
          </div>
        </div>

        {/* Loading e Erro */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processando...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Resultados */}
        {subscriptions.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Assinaturas Encontradas</h2>
            <div className="space-y-2">
              {subscriptions.map((sub, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><strong>ID:</strong> {sub.subscription_id}</div>
                    <div><strong>Email:</strong> {sub.customer_email}</div>
                    <div><strong>Status:</strong> {sub.subscription_status}</div>
                    <div><strong>Preço:</strong> {formatCurrency(sub.price_amount, sub.price_currency)}</div>
                    <div><strong>Produto:</strong> {sub.product_name}</div>
                    <div><strong>Período:</strong> {sub.billing_interval}</div>
                    <div><strong>Início:</strong> {formatDate(sub.current_period_start)}</div>
                    <div><strong>Fim:</strong> {formatDate(sub.current_period_end)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {checkouts.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Checkouts Encontrados</h2>
            <div className="space-y-2">
              {checkouts.map((checkout, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><strong>Session ID:</strong> {checkout.session_id}</div>
                    <div><strong>Email:</strong> {checkout.customer_email}</div>
                    <div><strong>Status:</strong> {checkout.payment_status}</div>
                    <div><strong>Data:</strong> {formatDate(checkout.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {invoices.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Faturas Encontradas</h2>
            <div className="space-y-2">
              {invoices.map((invoice, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><strong>ID:</strong> {invoice.invoice_id}</div>
                    <div><strong>Email:</strong> {invoice.customer_email}</div>
                    <div><strong>Status:</strong> {invoice.invoice_status}</div>
                    <div><strong>Valor:</strong> {formatCurrency(invoice.amount, invoice.currency)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {revenueData && (
          <div className="mb-6 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-2">Dados de Receita (Último Mês)</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenueData.total_revenue, revenueData.currency)}
                </div>
                <div className="text-sm text-gray-600">Receita Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {revenueData.subscription_count}
                </div>
                <div className="text-sm text-gray-600">Assinaturas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {revenueData.currency}
                </div>
                <div className="text-sm text-gray-600">Moeda</div>
              </div>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Instruções de Uso</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Primeiro, execute o script SQL no Supabase para configurar o Stripe Wrapper</li>
            <li>Verifique se o status está "Configurado"</li>
            <li>Use os botões de teste para verificar cada funcionalidade</li>
            <li>Monitore o console para logs detalhados</li>
            <li>Se houver erros, verifique a configuração do Wrapper</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default StripeWrapperTest

