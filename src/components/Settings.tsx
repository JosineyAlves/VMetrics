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
import { useUserPlan } from '../hooks/useUserPlan'

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

  // Hook para gerenciar plano do usuário - CORRIGIDO
  const { 
    planData, 
    loading: planLoading, 
    error: planError, 
    refreshPlan,
    hasActivePlan,
    planType,
    planName,
    planPrice,
    planFeatures,
    planStatus
  } = useUserPlan() // Remover parâmetro - usa user_id automaticamente

  // Gerar array de faturas baseado no plano
  const generateInvoices = () => {
    if (!planData?.invoice) return []
    return [planData.invoice]
  }

  const invoices = generateInvoices()
  const hasInvoices = invoices.length > 0

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
    monthly: 'https://buy.stripe.com/test_8x214oa7m2gP5t7e1K33W03', // R$ 79,00
    quarterly: 'https://buy.stripe.com/test_8x2aEY0wM5t11cRaPy33W04' // R$ 197,00
  }





    // Função para carregar plano atual do usuário (agora usa o hook)
  const loadCurrentPlan = () => {
    console.log('🔄 [SETTINGS] Atualizando plano do usuário...')
    refreshPlan()
  }

  useEffect(() => {
    if (activeTab === 'billing') {
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
          {planLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3cd48f] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando plano...</p>
            </div>
          ) : planError ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Erro ao carregar plano</p>
              <p className="text-sm text-gray-500">{planError}</p>
              <Button 
                onClick={refreshPlan}
                variant="outline" 
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <>
          <div className="flex items-center justify-between mb-6">
            <div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">{planName}</h4>
              <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[#3cd48f]">{planPrice}</span>
                    <span className="text-gray-600">/mês</span>
              </div>
            </div>
                         <div className="text-right">
               <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    planStatus === 'active' ? 'bg-green-100 text-green-800' :
                    planStatus === 'canceled' ? 'bg-red-100 text-red-800' :
                    planStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                    planStatus === 'unpaid' ? 'bg-red-100 text-red-800' :
                 'bg-gray-100 text-gray-800'
               }`}>
                 <div className={`w-2 h-2 rounded-full mr-2 ${
                      planStatus === 'active' ? 'bg-green-500' :
                      planStatus === 'canceled' ? 'bg-red-500' :
                      planStatus === 'past_due' ? 'bg-yellow-500' :
                      planStatus === 'unpaid' ? 'bg-red-500' :
                   'bg-gray-500'
                 }`}></div>
                    {planStatus === 'active' ? 'Ativo' :
                     planStatus === 'canceled' ? 'Cancelado' :
                     planStatus === 'past_due' ? 'Vencido' :
                     planStatus === 'unpaid' ? 'Não Pago' :
                  'Inativo'}
               </div>
                  {planData?.plan?.current_period_end && (
               <p className="text-sm text-gray-600 mt-1">
                      Expira em: {new Date(planData.plan.current_period_end).toLocaleDateString('pt-BR')}
               </p>
                  )}
             </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-gray-700 mb-3">Recursos incluídos:</h5>
                {planFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>


            </>
          )}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plano Mensal */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{STRIPE_PRODUCTS.monthly.name}</h4>
              <div className="text-3xl font-bold text-[#3cd48f] mb-1">
                {currencySymbol}{(STRIPE_PRODUCTS.monthly.prices.monthly.amount / 100).toFixed(2).replace('.', ',')}
              </div>
              <div className="text-gray-600">por mês</div>
              <div className="text-sm text-gray-500 mt-1">
                <span className="line-through text-gray-400">
                  {currencySymbol}{(STRIPE_PRODUCTS.monthly.prices.monthly.originalPrice / 100).toFixed(2).replace('.', ',')}
                </span>
                <span className="text-green-600 font-medium ml-2">
                  {STRIPE_PRODUCTS.monthly.prices.monthly.discount}% de desconto
                </span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {STRIPE_PRODUCTS.monthly.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
                         <Button 
              onClick={() => window.open(STRIPE_CHECKOUT_LINKS.monthly, '_blank')}
              variant={planType === 'monthly' ? 'outline' : 'outline'}
              className={`w-full rounded-xl ${
                planType === 'monthly' 
                  ? 'bg-[#3cd48f]/10 border-[#3cd48f] text-[#3cd48f] cursor-default' 
                  : 'hover:bg-[#3cd48f]/10 hover:border-[#3cd48f]/30'
              }`}
              disabled={planLoading || planType === 'monthly'}
            >
              {planLoading ? 'Carregando...' : planType === 'monthly' ? 'Plano Atual' : 'Mudar para Mensal'}
             </Button>
          </div>

          {/* Plano Trimestral */}
          <div className="border-2 border-[#3cd48f] rounded-2xl p-6 bg-[#3cd48f]/10 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#3cd48f] text-white px-3 py-1 rounded-full text-xs font-medium">
                Melhor Valor
              </span>
            </div>
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{STRIPE_PRODUCTS.quarterly.name}</h4>
              <div className="text-3xl font-bold text-[#3cd48f] mb-1">
                {currencySymbol}{(STRIPE_PRODUCTS.quarterly.prices.quarterly.amount / 100).toFixed(2).replace('.', ',')}
              </div>
              <div className="text-gray-600">por mês</div>
              <div className="text-sm text-gray-500 mt-1">
                <span className="line-through text-gray-400">
                  {currencySymbol}{(STRIPE_PRODUCTS.quarterly.prices.quarterly.originalPrice / 100).toFixed(2).replace('.', ',')}
                </span>
                <span className="text-green-600 font-medium ml-2">
                  {STRIPE_PRODUCTS.quarterly.prices.quarterly.discount}% de desconto
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Cobrança a cada 3 meses: {currencySymbol}{(STRIPE_PRODUCTS.quarterly.prices.quarterly.totalAmount / 100).toFixed(2).replace('.', ',')}
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {STRIPE_PRODUCTS.quarterly.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
                         <Button 
              onClick={() => window.open(STRIPE_CHECKOUT_LINKS.quarterly, '_blank')}
              className={`w-full font-semibold rounded-xl ${
                planType === 'quarterly' 
                  ? 'bg-[#3cd48f]/20 text-[#3cd48f] border-2 border-[#3cd48f] cursor-default' 
                  : 'bg-[#3cd48f] hover:bg-[#3cd48f]/90 text-white'
              }`}
              disabled={planLoading || planType === 'quarterly'}
            >
              {planLoading ? 'Carregando...' : planType === 'quarterly' ? 'Plano Atual' : 'Mudar para Trimestral'}
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
          {planLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3cd48f] border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando faturas...</p>
            </div>
          ) : hasInvoices ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    invoice.status_color === 'green' ? 'bg-green-100' :
                    invoice.status_color === 'yellow' ? 'bg-yellow-100' :
                    invoice.status_color === 'red' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    <Receipt className={`w-5 h-5 ${
                      invoice.status_color === 'green' ? 'text-green-600' :
                      invoice.status_color === 'yellow' ? 'text-yellow-600' :
                      invoice.status_color === 'red' ? 'text-red-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{invoice.description}</p>
                    <p className="text-sm text-gray-600">Fatura #{invoice.number}</p>
                    <p className="text-xs text-gray-500">Criada em: {new Date(invoice.created).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{invoice.formatted_amount}</p>
                  <p className="text-sm text-gray-600">Vence: {new Date(invoice.due_date).toLocaleDateString('pt-BR')}</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    invoice.status_color === 'green' ? 'bg-green-100 text-green-800' :
                    invoice.status_color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    invoice.status_color === 'red' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status_text}
                  </div>
                  {invoice.hosted_invoice_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver Fatura
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhuma fatura encontrada</p>
            <p className="text-sm text-gray-500">
              As faturas aparecerão aqui quando disponíveis
            </p>
            </div>
          )}
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
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Tabs Navigation */}
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
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default Settings 