import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  DollarSign,
  Target,
  Users,
  BarChart3,
  Eye,
  MousePointer,
  Calendar,
  ChevronDown,
  Filter,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'


interface Metric {
  id: string
  label: string
  value: number
  change: number
  icon: React.ReactNode
  color: string
  format: 'currency' | 'number' | 'percentage'
  visible: boolean
}

const Dashboard: React.FC = () => {
  const { apiKey } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    utm_source: '',
    traffic_channel: '',
    country: '',
    device: '',
    browser: '',
    os: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Novo estado para datas personalizadas
  const [customRange, setCustomRange] = useState({ from: '', to: '' })

  const periodOptions = [
    { value: 'max', label: 'Máximo' },
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: 'this_month', label: 'Este mês' },
    { value: 'last_month', label: 'Mês passado' },
    { value: 'custom', label: 'Personalizado' },
  ]

  const trafficChannelOptions = [
    { value: '', label: 'Todos os canais' },
    { value: 'facebook', label: 'Facebook Ads' },
    { value: 'google', label: 'Google Ads' },
    { value: 'tiktok', label: 'TikTok Ads' },
    { value: 'taboola', label: 'Taboola' },
    { value: 'outbrain', label: 'Outbrain' }
  ]

  // Atualizar label do período para customizado
  const getPeriodLabel = (value: string) => {
    if (value === 'custom' && customRange.from && customRange.to) {
      return `${customRange.from} a ${customRange.to}`
    }
    const option = periodOptions.find(opt => opt.value === value)
    return option ? option.label : 'Últimos 7 dias'
  }

  // Função para calcular datas reais baseadas no período (não utilizada)
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
        if (customRange.from && customRange.to) {
          return {
            startDate: customRange.from,
            endDate: customRange.to
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



  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'revenue',
      label: 'Receita',
      value: 0,
      change: 12.5,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
      format: 'currency',
      visible: true
    },
    {
      id: 'profit',
      label: 'Lucro',
      value: 0,
      change: 8.2,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-blue-600',
      format: 'currency',
      visible: true
    },
    {
      id: 'conversions',
      label: 'Conversões',
      value: 0,
      change: 15.3,
      icon: <Target className="w-5 h-5" />,
      color: 'text-purple-600',
      format: 'number',
      visible: true
    },
    {
      id: 'ctr',
      label: 'CTR',
      value: 0,
      change: -2.1,
      icon: <MousePointer className="w-5 h-5" />,
      color: 'text-orange-600',
      format: 'percentage',
      visible: true
    },
    {
      id: 'impressions',
      label: 'Impressões',
      value: 0,
      change: 5.7,
      icon: <Eye className="w-5 h-5" />,
      color: 'text-indigo-600',
      format: 'number',
      visible: true
    },
    {
      id: 'clicks',
      label: 'Cliques',
      value: 0,
      change: 9.4,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-teal-600',
      format: 'number',
      visible: true
    }
  ])

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

  // Carregar dados reais da API do RedTrack
  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      if (!apiKey) throw new Error('API Key não definida')
      const api = new RedTrackAPI(apiKey)
      
      // Usar datas reais baseadas no período selecionado
      const dateRange = getDateRange(selectedPeriod)
      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        group_by: 'date', // Agrupamento por data para dashboard
        ...filters
      }
      
      const realData = await api.getReport(params)
      
      // Se não houver dados, usar objeto zerado
      if (!realData || Object.keys(realData).length === 0) {
        const emptyData = {
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
          profit: 0,
          roi: 0,
          cpa: 0,
          cpl: 0,
          impressions: 0,
          ctr: 0,
          conversion_rate: 0,
          visible_impressions: 0,
          unique_clicks: 0,
          prelp_views: 0,
          prelp_clicks: 0,
          prelp_click_ctr: 0,
          lp_ctr: 0,
          lp_click_ctr: 0,
          conversion_cr: 0,
          all_conversions: 0,
          all_conversions_cr: 0,
          approved: 0,
          ar: 0,
          pending: 0,
          pr: 0,
          declined: 0,
          dr: 0,
          other: 0,
          or: 0,
          transactions: 0,
          tr: 0,
          epv: 0,
          conversion_revenue: 0,
          publisher_revenue: 0,
          publisher_revenue_legacy: 0,
          conversion_roi: 0,
          cpc: 0,
          conversion_cpa: 0,
          total_cpa: 0,
          total_aov: 0,
          conversion_aov: 0,
          cpt: 0,
          eplpc: 0,
          epuc: 0,
          listicle_epv: 0,
          roas_percentage: 0,
          conversion_roas: 0,
          conversion_roas_percentage: 0,
          conversion_profit: 0,
          epc_roi: 0
        }
      } else {
        // Dados reais encontrados
      }
      
      const updatedMetrics = metrics.map(metric => ({
        ...metric,
        value: (realData as any)[metric.id] || 0
      }))
      setMetrics(updatedMetrics)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // NÃO usar dados mock - mostrar dados reais vazios
      const emptyData = {
        clicks: 0,
        conversions: 0,
        spend: 0,
        revenue: 0,
        profit: 0,
        roi: 0,
        cpa: 0,
        cpl: 0,
        impressions: 0,
        ctr: 0,
        conversion_rate: 0,
        visible_impressions: 0,
        unique_clicks: 0,
        prelp_views: 0,
        prelp_clicks: 0,
        prelp_click_ctr: 0,
        lp_ctr: 0,
        lp_click_ctr: 0,
        conversion_cr: 0,
        all_conversions: 0,
        all_conversions_cr: 0,
        approved: 0,
        ar: 0,
        pending: 0,
        pr: 0,
        declined: 0,
        dr: 0,
        other: 0,
        or: 0,
        transactions: 0,
        tr: 0,
        epv: 0,
        conversion_revenue: 0,
        publisher_revenue: 0,
        publisher_revenue_legacy: 0,
        conversion_roi: 0,
        cpc: 0,
        conversion_cpa: 0,
        total_cpa: 0,
        total_aov: 0,
        conversion_aov: 0,
        cpt: 0,
        eplpc: 0,
        epuc: 0,
        listicle_epv: 0,
        roas_percentage: 0,
        conversion_roas: 0,
        conversion_roas_percentage: 0,
        conversion_profit: 0,
        epc_roi: 0
      }

      const updatedMetrics = metrics.map(metric => ({
        ...metric,
        value: 0
      }))
      setMetrics(updatedMetrics)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Atualização automática a cada 5 minutos
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData(true)
      }, 5 * 60 * 1000) // 5 minutos

      return () => clearInterval(interval)
    }
  }, [autoRefresh, selectedPeriod, filters])

  // Carregar dados quando componente montar ou parâmetros mudarem
  useEffect(() => {
    if (apiKey) {
      loadDashboardData()
    }
  }, [apiKey, selectedPeriod, filters])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    setShowPeriodDropdown(false)
    loadDashboardData()
  }

  const handleRefresh = () => {
    loadDashboardData(true)
  }

  const handleApplyFilters = () => {
    setFilters(tempFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      utm_source: '',
      traffic_channel: '',
      country: '',
      device: '',
      browser: '',
      os: ''
    }
    setFilters(resetFilters)
    setTempFilters(resetFilters)
  }

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value)
      case 'percentage':
        return `${value.toFixed(2)}%`
      case 'number':
        return value.toLocaleString('pt-BR')
      default:
        return value.toString()
    }
  }



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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Visão geral das métricas de performance
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
                Data Inicial
              </label>
              <Input 
                type="date"
                value={tempFilters.dateFrom}
                onChange={(e) => setTempFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Data Final
              </label>
              <Input 
                type="date"
                value={tempFilters.dateTo}
                onChange={(e) => setTempFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Canal de Tráfego
              </label>
              <select 
                value={tempFilters.traffic_channel}
                onChange={(e) => setTempFilters(prev => ({ ...prev, traffic_channel: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                {trafficChannelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                País
              </label>
              <Input 
                type="text"
                placeholder="Ex: BR, US"
                value={tempFilters.country}
                onChange={(e) => setTempFilters(prev => ({ ...prev, country: e.target.value }))}
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
                      if (option.value !== 'custom') {
                        setShowPeriodDropdown(false)
                        setCustomRange({ from: '', to: '' })
                      }
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
                
                {/* Campos de data para modo personalizado - sempre visíveis quando custom está selecionado */}
                {selectedPeriod === 'custom' && (
                  <div className="border-t border-gray-200 mt-3 pt-4 px-4 pb-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Data Inicial
                        </label>
                        <input
                          type="date"
                          value={customRange.from}
                          onChange={e => setCustomRange(r => ({ ...r, from: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                          placeholder="Selecione a data inicial"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Data Final
                        </label>
                        <input
                          type="date"
                          value={customRange.to}
                          onChange={e => setCustomRange(r => ({ ...r, to: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                          placeholder="Selecione a data final"
                        />
                      </div>
                      
                      <button
                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          (!customRange.from || !customRange.to) 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        }`}
                        disabled={!customRange.from || !customRange.to}
                        onClick={() => {
                          handlePeriodChange('custom')
                          setShowPeriodDropdown(false)
                          setFilters(prev => ({ ...prev, dateFrom: customRange.from, dateTo: customRange.to }))
                        }}
                      >
                        Aplicar Período Personalizado
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {metrics.filter(metric => metric.visible).map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 mb-2 truncate">{metric.label}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  {formatValue(metric.value, metric.format)}
                </p>
                <div className="flex items-center">
                  <span className={`text-sm font-semibold ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2 truncate">vs período anterior</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl ${metric.color.replace('text-', 'bg-')}20 ml-4 flex-shrink-0`}>
                <div className={`${metric.color} w-8 h-8`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance por Dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-8">Performance por Dia</h3>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-lg font-semibold">Gráfico de Performance</p>
              <p className="text-sm">Dados reais serão exibidos quando disponíveis</p>
            </div>
          </div>
        </motion.div>

        {/* Distribuição por Fonte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-8">Distribuição por Fonte</h3>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-lg font-semibold">Distribuição por Fonte</p>
              <p className="text-sm">Dados reais serão exibidos quando disponíveis</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard 