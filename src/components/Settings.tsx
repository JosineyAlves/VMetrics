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

  // Hook para gerenciar plano do usuário
  const userEmail = 'alvesjosiney@yahoo.com.br' // TODO: Pegar do contexto de autenticação
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
  } = useUserPlan(userEmail)

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
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      setError('Erro ao salvar API Key')
    } finally {
      setSaving(false)
    }
  }

  // Função para abrir o Customer Portal do Stripe
  const handleManageSubscription = async () => {
    try {
      // Verificar se temos o customer ID
      if (!planData?.user?.stripe_customer_id) {
        setError('ID do cliente não encontrado')
        return
      }

      // Criar sessão do portal
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: planData.user.stripe_customer_id 
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessão do portal')
      }

      const { url } = await response.json()
      
      // Redirecionar para o portal
      window.open(url, '_blank')
    } catch (error) {
      console.error('Erro ao abrir portal:', error)
      setError('Erro ao abrir portal de gerenciamento')
    }
  }

  // ... resto do código existente ...

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

          {/* Botão para Gerenciar Assinatura */}
          {hasActivePlan && (
            <div className="mt-6 pt-6 border-t border-[#3cd48f]/20">
              <Button 
                onClick={handleManageSubscription}
                className="w-full bg-[#3cd48f] hover:bg-[#3cd48f]/90 text-white font-semibold rounded-xl py-3"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Assinatura
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Atualizar plano, cancelar ou gerenciar pagamentos
              </p>
            </div>
          )}

            </>
          )}
        </div>
      </motion.div>

      {/* ... resto do código existente ... */}
    </div>
  )

  // ... resto do código existente ...

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
