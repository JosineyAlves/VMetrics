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
  Calendar
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'

interface AccountSettings {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  table_campaigns?: any
  [key: string]: any
}

const Settings: React.FC = () => {
  const { apiKey, setApiKey } = useAuthStore()
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

      {/* Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-purple-100 rounded-2xl">
            <SettingsIcon className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Informações</h3>
            <p className="text-sm text-gray-600">
              Sobre o TrackView
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Sobre</h4>
            <p className="text-gray-600 leading-relaxed">
              O TrackView é uma plataforma de análise de campanhas que integra com a API do RedTrack 
              para fornecer insights detalhados sobre performance de marketing digital.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Funcionalidades</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Dashboard com métricas em tempo real</li>
              <li>Análise de campanhas e conversões</li>
              <li>Análise geográfica de performance</li>
              <li>Filtros avançados e relatórios</li>
              <li>Integração completa com RedTrack API</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Versão</h4>
            <p className="text-gray-600">
              TrackView v1.0.0
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings 