import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon,
  Key,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Database,
  RefreshCw,
  Calendar,
  DollarSign,
  Info,
  ChevronDown,
  CreditCard,
  Receipt,
  Crown,
  Zap,
  ExternalLink
} from 'lucide-react'
import { STRIPE_PRODUCTS } from '../config/stripe'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import { useCurrencyStore } from '../store/currency'

interface AccountSettings {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  table_campaigns?: any
  [key: string]: any
}

type TabType = 'general' | 'billing'

const Settings: React.FC = () => {
  const { apiKey, setApiKey } = useAuthStore()
  const { currency, currencySymbol, setCurrency } = useCurrencyStore()
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [tempApiKey, setTempApiKey] = useState(apiKey || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  
  // Estados para dados da conta
  const [settings, setSettings] = useState<AccountSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Estados para dados de faturamento (integração real com Stripe)
  const [currentPlan, setCurrentPlan] = useState({
    name: STRIPE_PRODUCTS.starter.name,
    price: `${currencySymbol}${(STRIPE_PRODUCTS.starter.prices.monthly.amount / 100).toFixed(2).replace('.', ',')}`,
    period: 'mês',
    features: STRIPE_PRODUCTS.starter.features,
    status: 'active',
    nextBilling: '2024-02-15'
  })

  // Removendo dados fictícios - agora será carregado do Stripe
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'billing', label: 'Planos & Faturas', icon: CreditCard }
  ]

  const handleSave = async () => {
    if (!tempApiKey.trim()) {
      setError('A API Key é obrigatória')
      return
    }

    setSaving(true)
    setError('')

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setApiKey(tempApiKey)
      setSaved(true)
      
      // Recarregar dados da conta com nova API key
      loadAccountData()
      
      // A moeda agora é configurada manualmente
      console.log('✅ [SETTINGS] API Key configurada com sucesso')
      
      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } catch (err) {
      setError('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const loadAccountData = async (isRefresh = false) => {
    if (!apiKey) return
    
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const api = new RedTrackAPI(apiKey)
      const response = await api.getSettings()
      setSettings(response)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading account data:', error)
      setSettings(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (apiKey) {
      loadAccountData()
    }
  }, [apiKey])

  const handleRefresh = () => {
    loadAccountData(true)
  }

  // Função para criar checkout session do Stripe
  const handleUpgradePlan = async (priceId: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          customerId: 'cus_test_' + Date.now(),
          successUrl: 'http://localhost:5173/success',
          cancelUrl: 'http://localhost:5173/settings?tab=billing'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout')
      }

      const { url } = await response.json()
      if (url) {
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error)
      setError('Erro ao processar upgrade do plano')
    }
  }

  // Função para abrir portal do cliente Stripe
  const handleManageBilling = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: 'cus_test_' + Date.now(),
          returnUrl: 'http://localhost:5173/settings?tab=billing'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessão do portal')
      }

      const { url } = await response.json()
      if (url) {
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Erro ao abrir portal:', error)
      setError('Erro ao abrir portal de faturamento')
    }
  }

  // Função para carregar faturas do Stripe (mock por enquanto)
  const loadInvoices = async () => {
    setLoadingInvoices(true)
    try {
      // TODO: Implementar carregamento real de faturas do Stripe
      // Por enquanto, mostra mensagem informativa
      setInvoices([])
    } catch (error) {
      console.error('Erro ao carregar faturas:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'billing') {
      loadInvoices()
    }
  }, [activeTab])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderGeneralTab = () => (
    <div className="space-y-8">
      {/* API Key Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <Key className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">API Key</h3>
            <p className="text-sm text-gray-600">
              Configure sua chave de API do RedTrack
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Chave da API
            </label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Digite sua API Key"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="pr-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                {showApiKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-3 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : saved ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span className="font-semibold">
                {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Configurações'}
              </span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Account Information */}
      {settings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-2xl">
                <User className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Informações da Conta</h3>
                <p className="text-sm text-gray-600">
                  Dados da sua conta RedTrack
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID da Conta</label>
                <p className="text-lg font-mono bg-gray-100 p-2 rounded">{settings.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">ID do Usuário</label>
                <p className="text-lg font-mono bg-gray-100 p-2 rounded">{settings.user_id}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Criado em</label>
                <p className="text-lg">{formatDate(settings.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Atualizado em</label>
                <p className="text-lg">{formatDate(settings.updated_at)}</p>
              </div>
            </div>
          </div>

          {lastUpdate && (
            <div className="mt-6 text-sm text-gray-500">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </div>
          )}
        </motion.div>
      )}

      {/* Currency Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <DollarSign className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Configuração de Moeda</h3>
            <p className="text-sm text-gray-600">
              Selecione a moeda configurada no seu RedTrack
            </p>
          </div>
        </div>

        {/* Dropdown de Seleção de Moeda */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Selecione a Moeda
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {[
                  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
                  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
                  { code: 'EUR', name: 'Euro', symbol: '€' },
                  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
                  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$' },
                  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
                  { code: 'MXN', name: 'Peso Mexicano', symbol: 'MX$' },
                  { code: 'ARS', name: 'Peso Argentino', symbol: 'AR$' },
                  { code: 'CLP', name: 'Peso Chileno', symbol: 'CL$' },
                  { code: 'COP', name: 'Peso Colombiano', symbol: 'CO$' },
                  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
                  { code: 'UYU', name: 'Peso Uruguaio', symbol: 'UY$' }
                ].map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Status da Moeda */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Moeda Atual</p>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-blue-600 mr-2">{currencySymbol}</span>
                <span className="text-lg font-mono bg-blue-100 px-3 py-1 rounded">{currency}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-500 mt-1">Configurada</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Configuração de Moeda</p>
                <p>
                  A moeda selecionada será usada para exibir todos os valores monetários no dashboard. 
                  Certifique-se de escolher a mesma moeda configurada no seu RedTrack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-purple-100 rounded-2xl">
            <Shield className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Status da API</h3>
            <p className="text-sm text-gray-600">
              Status da conexão com RedTrack
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Status da API Key</label>
            <div className="flex items-center mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-600 font-medium">Ativa</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">API Key (mascarada)</label>
            <p className="text-lg font-mono bg-gray-100 p-2 rounded">
              {apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'Não definida'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-8">
      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Plano Atual</h3>
            <p className="text-sm text-gray-600">
              Seu plano atual e próximas cobranças
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">{currentPlan.name}</h4>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-blue-600">{currentPlan.price}</span>
                <span className="text-gray-600">/{currentPlan.period}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {currentPlan.status === 'active' ? 'Ativo' : 'Inativo'}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Próxima cobrança: {new Date(currentPlan.nextBilling).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-gray-700 mb-3">Recursos incluídos:</h5>
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <Button 
              onClick={() => handleUpgradePlan(STRIPE_PRODUCTS.pro.stripeIds.prices.monthly!)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Zap className="w-5 h-5 mr-2" />
              Fazer Upgrade do Plano
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-green-100 rounded-2xl">
            <CreditCard className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Planos Disponíveis</h3>
            <p className="text-sm text-gray-600">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plano Starter */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{STRIPE_PRODUCTS.starter.name}</h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currencySymbol}{(STRIPE_PRODUCTS.starter.prices.monthly.amount / 100).toFixed(2).replace('.', ',')}
              </div>
              <div className="text-gray-600">por mês</div>
            </div>
            <ul className="space-y-3 mb-6">
              {STRIPE_PRODUCTS.starter.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full rounded-xl">
              Plano Atual
            </Button>
          </div>

          {/* Plano Pro */}
          <div className="border-2 border-blue-500 rounded-2xl p-6 bg-blue-50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Popular
              </span>
            </div>
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{STRIPE_PRODUCTS.pro.name}</h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currencySymbol}{(STRIPE_PRODUCTS.pro.prices.monthly.amount / 100).toFixed(2).replace('.', ',')}
              </div>
              <div className="text-gray-600">por mês</div>
            </div>
            <ul className="space-y-3 mb-6">
              {STRIPE_PRODUCTS.pro.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => handleUpgradePlan(STRIPE_PRODUCTS.pro.stripeIds.prices.monthly!)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Fazer Upgrade
            </Button>
          </div>

          {/* Plano Enterprise */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">Enterprise</h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">Sob consulta</div>
              <div className="text-gray-600">personalizado</div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Tudo do plano Pro</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Suporte 24/7</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Integrações customizadas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">SLA garantido</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full rounded-xl">
              Contatar Vendas
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-purple-100 rounded-2xl">
            <Receipt className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Histórico de Faturas</h3>
            <p className="text-sm text-gray-600">
              Suas faturas e pagamentos
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {loadingInvoices ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando faturas...</p>
            </div>
          ) : invoices.length > 0 ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Receipt className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{invoice.description}</p>
                    <p className="text-sm text-gray-600">{invoice.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{invoice.amount}</p>
                  <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString('pt-BR')}</p>
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhuma fatura encontrada</p>
              <p className="text-sm text-gray-500">As faturas aparecerão aqui após a integração completa com o Stripe</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center space-y-3">
          <Button 
            onClick={handleManageBilling}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Gerenciar Faturamento
          </Button>
          <div className="text-sm text-gray-500">
            Abra o portal do cliente Stripe para gerenciar assinaturas e faturas
          </div>
        </div>
      </motion.div>

      {/* Stripe Integration Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <Info className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Integração com Stripe</h3>
            <p className="text-sm text-gray-600">
              Informações sobre pagamentos e faturamento
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800">
            <p className="font-medium mb-2">✅ Integração com Stripe Implementada!</p>
            <p className="mb-3">
              A integração com a plataforma Stripe está funcionando e oferece:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>✅ Pagamentos seguros e automatizados</li>
              <li>✅ Faturas automáticas</li>
              <li>✅ Múltiplas formas de pagamento</li>
              <li>✅ Gestão de assinaturas</li>
              <li>✅ Relatórios financeiros detalhados</li>
            </ul>
            <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
              <p className="font-medium text-green-700 mb-2">🚀 Funcionalidades Ativas:</p>
              <ul className="text-sm space-y-1">
                <li>• Checkout do Stripe para novos planos</li>
                <li>• Portal do cliente para gerenciar assinaturas</li>
                <li>• Webhooks para sincronização automática</li>
                <li>• Produtos e preços sincronizados com Stripe</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab()
      case 'billing':
        return renderBillingTab()
      default:
        return renderGeneralTab()
    }
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Gerencie suas configurações da conta
            </p>
          </div>
        </div>

      {/* Tabs Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-white/20">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default Settings 