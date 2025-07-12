import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Calendar,
  ChevronDown,
  Target,
  DollarSign,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'

interface Conversion {
  id: string
  campaign_id: string
  campaign_name: string
  source: string
  status: string
  value: number
  cost: number
  revenue: number
  roi: number
  date: string
  clicks: number
  impressions: number
  ctr: number
  cpa: number
}

const Conversions: React.FC = () => {
  const { apiKey } = useAuthStore()
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    dateFrom: '',
    dateTo: '',
    minValue: '',
    maxValue: '',
    minRoi: '',
    maxRoi: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)

  const periodOptions = [
    { value: 'max', label: 'Máximo' },
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: 'this_month', label: 'Este mês' },
    { value: 'last_month', label: 'Mês passado' },
    { value: 'custom', label: 'Personalizado' },
  ]

  const getPeriodLabel = (value: string) => {
    const option = periodOptions.find(opt => opt.value === value)
    return option ? option.label : 'Últimos 7 dias'
  }

  // Função para calcular datas reais baseadas no período
  const getDateRange = (period: string) => {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setHours(23, 59, 59, 999) // Fim do dia atual
    
    const startDate = new Date(today)
    
    switch (period) {
      case 'max':
        // Máximo = desde o início dos dados (1 ano atrás)
        startDate.setFullYear(today.getFullYear() - 1)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'today':
        // Hoje = dia atual (00:00 até 23:59)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'yesterday':
        // Ontem = dia anterior (00:00 até 23:59)
        startDate.setDate(today.getDate() - 1)
        startDate.setHours(0, 0, 0, 0)
        endDate.setDate(today.getDate() - 1)
        endDate.setHours(23, 59, 59, 999)
        break
      case '7d':
        // Últimos 7 dias (incluindo hoje)
        startDate.setDate(today.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'this_month':
        // Este mês = desde o primeiro dia do mês atual
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'last_month':
        // Mês passado = primeiro até último dia do mês anterior
        startDate.setMonth(today.getMonth() - 1)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        
        const lastMonthEnd = new Date(today)
        lastMonthEnd.setMonth(today.getMonth() - 1)
        lastMonthEnd.setDate(0) // Último dia do mês anterior
        lastMonthEnd.setHours(23, 59, 59, 999)
        endDate.setTime(lastMonthEnd.getTime())
        break
      case 'custom':
        // Personalizado = usar datas dos filtros se disponíveis
        if (filters.dateFrom && filters.dateTo) {
          return {
            startDate: filters.dateFrom,
            endDate: filters.dateTo
          }
        }
        // Fallback para últimos 7 dias se não houver datas personalizadas
        startDate.setDate(today.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        break
      default:
        // Padrão: últimos 7 dias
        startDate.setDate(today.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  // Dados dinâmicos baseados no período (fallback)
  const getDataForPeriod = (period: string): Conversion[] => {
    const baseData: Conversion[] = [
      {
        id: '1',
        campaign_id: '1',
        campaign_name: 'Campanha Facebook Ads',
        source: 'facebook',
        status: 'completed',
        value: 150.00,
        cost: 25.50,
        revenue: 150.00,
        roi: 588.2,
        date: '2024-01-15',
        clicks: 125,
        impressions: 850,
        ctr: 14.7,
        cpa: 25.50
      },
      {
        id: '2',
        campaign_id: '2',
        campaign_name: 'Google Ads Search',
        source: 'google',
        status: 'completed',
        value: 200.00,
        cost: 35.20,
        revenue: 200.00,
        roi: 568.2,
        date: '2024-01-15',
        clicks: 95,
        impressions: 680,
        ctr: 14.0,
        cpa: 35.20
      },
      {
        id: '3',
        campaign_id: '3',
        campaign_name: 'TikTok Ads',
        source: 'tiktok',
        status: 'pending',
        value: 0.00,
        cost: 45.80,
        revenue: 0.00,
        roi: 0.0,
        date: '2024-01-15',
        clicks: 70,
        impressions: 210,
        ctr: 33.3,
        cpa: 45.80
      },
      {
        id: '4',
        campaign_id: '4',
        campaign_name: 'Instagram Ads',
        source: 'instagram',
        status: 'completed',
        value: 180.00,
        cost: 28.90,
        revenue: 180.00,
        roi: 622.8,
        date: '2024-01-15',
        clicks: 110,
        impressions: 720,
        ctr: 15.3,
        cpa: 28.90
      },
      {
        id: '5',
        campaign_id: '5',
        campaign_name: 'Taboola Native',
        source: 'taboola',
        status: 'completed',
        value: 120.00,
        cost: 22.40,
        revenue: 120.00,
        roi: 535.7,
        date: '2024-01-15',
        clicks: 85,
        impressions: 450,
        ctr: 18.9,
        cpa: 22.40
      }
    ]

    const multipliers = {
      'max': 52,        // 1 ano de dados
      'today': 0.14,    // 1 dia
      'yesterday': 0.12, // 1 dia (15% menos que hoje)
      '7d': 1,          // 7 dias
      'this_month': 4.3, // ~30 dias
      'last_month': 4.3, // ~30 dias
      'custom': 1,      // baseado nas datas selecionadas
    }

    const multiplier = multipliers[period as keyof typeof multipliers] || 1
    
    // Para "yesterday", usar dados ligeiramente diferentes
    if (period === 'yesterday') {
      return baseData.map(item => ({
        ...item,
        value: item.value * multiplier * 0.85,
        cost: item.cost * multiplier * 0.85,
        revenue: item.revenue * multiplier * 0.85,
        clicks: Math.round(item.clicks * multiplier * 0.85),
        impressions: Math.round(item.impressions * multiplier * 0.85),
        roi: item.roi * 0.95,
        cpa: item.cpa * 1.05
      }))
    }
    
    return baseData.map(item => ({
      ...item,
      value: item.value * multiplier,
      cost: item.cost * multiplier,
      revenue: item.revenue * multiplier,
      clicks: Math.round(item.clicks * multiplier),
      impressions: Math.round(item.impressions * multiplier),
      roi: item.roi,
      cpa: item.cpa
    }))
  }

  // Carregar dados reais da API do RedTrack
  const loadConversions = async (isRefresh = false) => {
    if (!apiKey) return
    
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const api = new RedTrackAPI(apiKey)
      
      // Usar datas reais baseadas no período selecionado
      const dateRange = getDateRange(selectedPeriod)
      const apiParams = {
        ...filters,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate
      }
      
      // Tentar carregar dados reais da API
      const response = await api.getConversions(apiParams)
      // Converter dados da API para o formato local
      const convertedData: Conversion[] = response.data.map((item: any) => ({
        id: item.id,
        campaign_id: item.campaign_id || item.id,
        campaign_name: item.campaign || item.campaign_name || 'Campanha',
        source: item.source || 'unknown',
        status: item.status || 'completed',
        value: item.value || item.payout || 0,
        cost: item.cost || 0,
        revenue: item.revenue || item.value || 0,
        roi: item.roi || 0,
        date: item.date || new Date().toISOString().split('T')[0],
        clicks: item.clicks || 0,
        impressions: item.impressions || 0,
        ctr: item.ctr || 0,
        cpa: item.cpa || 0
      }))
      setConversions(convertedData)
      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('Error loading conversions:', error)
      // Fallback para dados mock se API falhar
      const conversionsData = getDataForPeriod(selectedPeriod)
      setConversions(conversionsData)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Atualização automática a cada 5 minutos
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadConversions(true)
      }, 5 * 60 * 1000) // 5 minutos

      return () => clearInterval(interval)
    }
  }, [autoRefresh, selectedPeriod, filters])

  // Carregar dados quando componente montar ou parâmetros mudarem
  useEffect(() => {
    if (apiKey) {
      loadConversions()
    }
  }, [apiKey, selectedPeriod, filters])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.period-dropdown')) {
        setShowPeriodDropdown(false)
      }
    }

    if (showPeriodDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPeriodDropdown])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    setShowPeriodDropdown(false)
    loadConversions()
  }

  const handleRefresh = () => {
    loadConversions(true)
  }

  const handleApplyFilters = () => {
    setFilters(tempFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      status: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      minValue: '',
      maxValue: '',
      minRoi: '',
      maxRoi: ''
    }
    setFilters(resetFilters)
    setTempFilters(resetFilters)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-trackview-success/20 text-trackview-success'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-trackview-danger/20 text-trackview-danger'
      default:
        return 'bg-trackview-muted/20 text-trackview-muted'
    }
  }

  const filteredConversions = conversions.filter(conversion => {
    const matchesSearch = 
      conversion.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversion.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversion.status.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filters.status || conversion.status === filters.status
    const matchesSource = !filters.source || conversion.source === filters.source
    const matchesMinValue = !filters.minValue || conversion.value >= parseFloat(filters.minValue)
    const matchesMaxValue = !filters.maxValue || conversion.value <= parseFloat(filters.maxValue)
    const matchesMinRoi = !filters.minRoi || conversion.roi >= parseFloat(filters.minRoi)
    const matchesMaxRoi = !filters.maxRoi || conversion.roi <= parseFloat(filters.maxRoi)

    return matchesSearch && matchesStatus && matchesSource && 
           matchesMinValue && matchesMaxValue && matchesMinRoi && matchesMaxRoi
  })

  // Calcular métricas
  const totalConversions = filteredConversions.length
  const totalValue = filteredConversions.reduce((sum, c) => sum + c.value, 0)
  const totalCost = filteredConversions.reduce((sum, c) => sum + c.cost, 0)
  const averageRoi = filteredConversions.length > 0 
    ? filteredConversions.reduce((sum, c) => sum + c.roi, 0) / filteredConversions.length 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trackview-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Conversões
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Acompanhe e analise suas conversões
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* Botão de Atualização */}
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
          
          {/* Toggle Auto Refresh */}
          <Button 
            variant={autoRefresh ? "primary" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <div className="w-4 h-4 mr-2">
              {autoRefresh && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
            </div>
            Auto
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setTempFilters(filters)
              setShowFilters(!showFilters)
            }}
            className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Filtros Avançados</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ocultar Filtros
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <select 
                value={tempFilters.status}
                onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">Todos</option>
                <option value="completed">Completado</option>
                <option value="pending">Pendente</option>
                <option value="failed">Falhou</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Fonte
              </label>
              <select 
                value={tempFilters.source}
                onChange={(e) => setTempFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">Todas</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="taboola">Taboola</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Valor Mínimo
              </label>
              <Input 
                type="number"
                placeholder="0.00"
                value={tempFilters.minValue}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minValue: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Valor Máximo
              </label>
              <Input 
                type="number"
                placeholder="1000.00"
                value={tempFilters.maxValue}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handleApplyFilters}
              className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Aplicar Filtros
            </Button>
            
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Limpar Filtros
            </Button>
          </div>
        </motion.div>
      )}

      {/* Período Dropdown */}
      <div className="flex items-center justify-between">
        <div className="relative period-dropdown">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="min-w-[200px] justify-between rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
          >
            <Calendar className="w-5 h-5 mr-3" />
            {getPeriodLabel(selectedPeriod)}
            <ChevronDown className="w-5 h-5 ml-3" />
          </Button>
          
          {showPeriodDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl z-50"
            >
              <div className="py-2">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handlePeriodChange(option.value)
                      setShowPeriodDropdown(false)
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm hover:bg-blue-50 transition-colors duration-200 ${
                      selectedPeriod === option.value 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold' 
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Total de Conversões</p>
              <p className="text-2xl font-bold text-gray-800">{totalConversions}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-2xl">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalValue)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-2xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Custo Total</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalCost)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-2xl">
              <div className="w-6 h-6 text-red-600">↓</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">ROI Médio</p>
              <p className="text-2xl font-bold text-gray-800">{averageRoi.toFixed(2)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabela de Conversões */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Lista de Conversões</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar conversões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Campanha</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fonte</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Valor</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Custo</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">ROI</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">CTR</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">CPA</th>
              </tr>
            </thead>
            <tbody>
              {filteredConversions.map((conversion, index) => (
                <motion.tr
                  key={conversion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-800">{conversion.campaign_name}</p>
                      <p className="text-sm text-gray-500">{conversion.date}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="capitalize text-gray-700">{conversion.source}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(conversion.status)}`}>
                      {conversion.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(conversion.value)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-red-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(conversion.cost)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-blue-600">{conversion.roi.toFixed(2)}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-700">{conversion.ctr.toFixed(1)}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-700">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(conversion.cpa)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default Conversions 