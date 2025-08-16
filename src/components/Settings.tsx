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
import CustomSelect from './ui/CustomSelect'

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
    name: 'Carregando...',
    price: 'Carregando...',
    period: 'mês',
    features: [],
    status: 'loading',
    nextBilling: 'Carregando...'
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

  // Links diretos do Stripe para checkout
  const STRIPE_CHECKOUT_LINKS = {
    starter: 'https://buy.stripe.com/test_14A7sM1AQ8FddZD0aU33W01',
    pro: 'https://buy.stripe.com/test_8x200k0wM6x53kZ5ve33W02'
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

  // Função para carregar plano atual do usuário
  const loadCurrentPlan = async () => {
    try {
      // TODO: Implementar busca real do plano atual no banco de dados
      // Por enquanto, simula carregamento
      setCurrentPlan({
        name: 'Nenhum plano ativo',
        price: 'Gratuito',
        period: 'mês',
        features: ['Acesso básico'],
        status: 'inactive',
        nextBilling: 'N/A'
      })
    } catch (error) {
      console.error('Erro ao carregar plano atual:', error)
      setCurrentPlan({
        name: 'Erro ao carregar',
        price: 'Erro',
        period: 'mês',
        features: ['Erro ao carregar recursos'],
        status: 'error',
        nextBilling: 'Erro'
      })
    }
  }

  useEffect(() => {
    if (activeTab === 'billing') {
      loadInvoices()
      loadCurrentPlan()
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
                  <div className="p-3 bg-[#3cd48f]/20 rounded-2xl">
          <Key className="w-7 h-7 text-[#3cd48f]" />
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
                className="pr-12 rounded-xl border-gray-200 focus:border-[#3cd48f] focus:ring-[#3cd48f] shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3cd48f] transition-colors duration-200"
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
              className="flex items-center space-x-3 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80"
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
                  <div className="p-3 bg-[#3cd48f]/20 rounded-2xl">
          <DollarSign className="w-7 h-7 text-[#3cd48f]" />
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
            <CustomSelect
              value={currency}
              onChange={(value) => setCurrency(value)}
              options={[
                { value: 'BRL', label: 'R$ - Real Brasileiro (BRL)' },
                { value: 'USD', label: '$- Dólar Americano (USD)' },
                { value: 'EUR', label: '€ - Euro (EUR)' },
                { value: 'GBP', label: '£ - Libra Esterlina (GBP)' },
                { value: 'CAD', label: 'C$ - Dólar Canadense (CAD)' },
                { value: 'AUD', label: 'A$ - Dólar Australiano (AUD)' },
                { value: 'MXN', label: 'MX$ - Peso Mexicano (MXN)' },
                { value: 'ARS', label: 'AR$ - Peso Argentino (ARS)' },
                { value: 'CLP', label: 'CL$ - Peso Chileno (CLP)' },
                { value: 'COP', label: 'CO$ - Peso Colombiano (COP)' },
                { value: 'PEN', label: 'S/ - Sol Peruano (PEN)' },
                { value: 'UYU', label: 'UY$ - Peso Uruguaio (UYU)' }
              ]}
              placeholder="Selecione a moeda"
              className="w-full"
            />
          </div>

          {/* Status da Moeda */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-600">Moeda Atual</p>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-[#3cd48f] mr-2">{currencySymbol}</span>
                <span className="text-lg font-mono bg-[#3cd48f]/20 px-3 py-1 rounded">{currency}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-500 mt-1">Configurada</p>
            </div>
          </div>

                  <div className="bg-[#3cd48f]/10 border border-[#3cd48f]/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-[#3cd48f] mt-0.5" />
            <div className="text-sm text-[#1f1f1f]">
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
          <div className="p-3 bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 rounded-2xl">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Plano Atual</h3>
            <p className="text-sm text-gray-600">
              Seu plano atual e próximas cobranças
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#3cd48f]/10 to-[#3cd48f]/20 border border-[#3cd48f]/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">{currentPlan.name}</h4>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-[#3cd48f]">{currentPlan.price}</span>
                <span className="text-gray-600">/{currentPlan.period}</span>
              </div>
            </div>
                         <div className="text-right">
               <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                 currentPlan.status === 'active' ? 'bg-green-100 text-green-800' :
                                   currentPlan.status === 'loading' ? 'bg-[#3cd48f]/20 text-[#3cd48f]' :
                 currentPlan.status === 'error' ? 'bg-red-100 text-red-800' :
                 'bg-gray-100 text-gray-800'
               }`}>
                 <div className={`w-2 h-2 rounded-full mr-2 ${
                   currentPlan.status === 'active' ? 'bg-green-500' :
                   currentPlan.status === 'loading' ? 'bg-[#3cd48f]' :
                   currentPlan.status === 'error' ? 'bg-red-500' :
                   'bg-gray-500'
                 }`}></div>
                 {currentPlan.status === 'active' ? 'Ativo' :
                  currentPlan.status === 'loading' ? 'Carregando...' :
                  currentPlan.status === 'error' ? 'Erro' :
                  'Inativo'}
               </div>
               <p className="text-sm text-gray-600 mt-1">
                 {currentPlan.nextBilling === 'N/A' ? 'Sem cobrança' :
                  currentPlan.nextBilling === 'Carregando...' ? 'Carregando...' :
                  currentPlan.nextBilling === 'Erro' ? 'Erro ao carregar' :
                  `Próxima cobrança: ${new Date(currentPlan.nextBilling).toLocaleDateString('pt-BR')}`}
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

                     <div className="mt-6 pt-6 border-t border-[#3cd48f]/20">
             {currentPlan.status === 'active' && currentPlan.name.includes('Pro') ? (
               <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                 <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                 <p className="text-green-800 font-medium">Plano Pro já ativo!</p>
                 <p className="text-sm text-green-600">Seus recursos premium estão disponíveis</p>
               </div>
             ) : (
               <Button 
                 onClick={() => window.open(STRIPE_CHECKOUT_LINKS.pro, '_blank')}
                 className="w-full bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
               >
                 <Zap className="w-5 h-5 mr-2" />
                 {currentPlan.status === 'loading' ? 'Carregando...' : 'Fazer Upgrade do Plano'}
               </Button>
             )}
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
              <div className="text-3xl font-bold text-[#3cd48f] mb-1">
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
                         <Button 
               onClick={() => window.open(STRIPE_CHECKOUT_LINKS.starter, '_blank')}
               variant="outline" 
               className="w-full rounded-xl hover:bg-[#3cd48f]/10 hover:border-[#3cd48f]/30"
               disabled={currentPlan.status === 'loading'}
             >
               {currentPlan.status === 'loading' ? 'Carregando...' : 'Fazer Upgrade'}
             </Button>
          </div>

          {/* Plano Pro */}
          <div className="border-2 border-[#3cd48f] rounded-2xl p-6 bg-[#3cd48f]/10 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#3cd48f] text-white px-3 py-1 rounded-full text-xs font-medium">
                Popular
              </span>
            </div>
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{STRIPE_PRODUCTS.pro.name}</h4>
              <div className="text-3xl font-bold text-[#3cd48f] mb-1">
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
               onClick={() => window.open(STRIPE_CHECKOUT_LINKS.pro, '_blank')}
               className="w-full bg-[#3cd48f] hover:bg-[#3cd48f]/90 text-white font-semibold rounded-xl"
               disabled={currentPlan.status === 'loading'}
             >
               {currentPlan.status === 'loading' ? 'Carregando...' : 'Fazer Upgrade'}
             </Button>
          </div>

          {/* Plano Enterprise */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">Enterprise</h4>
              <div className="text-3xl font-bold text-[#3cd48f] mb-1">Sob consulta</div>
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
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3cd48f] border-t-transparent mx-auto mb-4"></div>
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
                            className="rounded-xl bg-[#3cd48f] hover:bg-[#3cd48f]/90 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Gerenciar Faturamento
          </Button>
          <div className="text-sm text-gray-500">
            Abra o portal do cliente Stripe para gerenciar assinaturas e faturas
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
          {/* Título removido para evitar duplicação com a navbar */}
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
                    ? 'bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white shadow-lg'
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