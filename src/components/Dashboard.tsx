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
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, getCurrentRedTrackDate, periodPresets } from '../lib/utils'
import { useDateRangeStore } from '../store/dateRange'


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

  // Remover estados locais de datas
  const { selectedPeriod, customRange } = useDateRangeStore()

  // Remover periodOptions, getPeriodLabel, getDateRange antigos se não forem mais usados

  const trafficChannelOptions = [
    { value: '', label: 'Todos os canais' },
    { value: 'facebook', label: 'Facebook Ads' },
    { value: 'google', label: 'Google Ads' },
    { value: 'tiktok', label: 'TikTok Ads' },
    { value: 'taboola', label: 'Taboola' },
    { value: 'outbrain', label: 'Outbrain' }
  ]

  // Atualizar label do período para customizado
  // Função para calcular datas reais baseadas no período (não utilizada)
  // Função para calcular datas reais baseadas no período (não utilizada)


  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'revenue',
      label: 'Receita',
      value: 0,
      change: 0,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
      format: 'currency',
      visible: true
    },
    {
      id: 'profit',
      label: 'Lucro',
      value: 0,
      change: 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-blue-600',
      format: 'currency',
      visible: true
    },
    {
      id: 'clicks',
      label: 'Cliques',
      value: 0,
      change: 0,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-teal-600',
      format: 'number',
      visible: true
    },
    {
      id: 'unique_clicks',
      label: 'Cliques Únicos',
      value: 0,
      change: 0,
      icon: <Users className="w-5 h-5" />,
      color: 'text-cyan-600',
      format: 'number',
      visible: true
    },
    {
      id: 'conversions',
      label: 'Conversões',
      value: 0,
      change: 0,
      icon: <Target className="w-5 h-5" />,
      color: 'text-purple-600',
      format: 'number',
      visible: true
    },
    {
      id: 'all_conversions',
      label: 'Todas Conversões',
      value: 0,
      change: 0,
      icon: <Target className="w-5 h-5" />,
      color: 'text-violet-600',
      format: 'number',
      visible: true
    },
    {
      id: 'impressions',
      label: 'Impressões',
      value: 0,
      change: 0,
      icon: <Eye className="w-5 h-5" />,
      color: 'text-indigo-600',
      format: 'number',
      visible: true
    },
    {
      id: 'ctr',
      label: 'CTR',
      value: 0,
      change: 0,
      icon: <MousePointer className="w-5 h-5" />,
      color: 'text-orange-600',
      format: 'percentage',
      visible: true
    },
    {
      id: 'approved',
      label: 'Aprovadas',
      value: 0,
      change: 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600',
      format: 'number',
      visible: true
    },
    {
      id: 'pending',
      label: 'Pendentes',
      value: 0,
      change: 0,
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-yellow-600',
      format: 'number',
      visible: true
    },
    {
      id: 'declined',
      label: 'Recusadas',
      value: 0,
      change: 0,
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-red-600',
      format: 'number',
      visible: true
    }
  ])

  // Novo estado para armazenar dados diários para o gráfico
  const [dailyData, setDailyData] = useState<any[]>([]);

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
      
      // Usar a base padronizada de datas
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      console.log('Dashboard - Timezone UTC - Data atual:', getCurrentRedTrackDate())
      console.log('Dashboard - Timezone UTC - Parâmetros enviados:', {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        timezone: 'UTC'
      })

      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        group_by: 'date', // Agrupamento por data para dashboard
        ...filters
      }
      
      const realData = await api.getReport(params)
      console.log('Dashboard - Resposta da API:', realData)
      
      let summary: any = {};
      let daily: any[] = [];
      if (Array.isArray(realData)) {
        daily = realData;
        summary = realData.reduce((acc: any, item: any) => {
          Object.keys(item).forEach(key => {
            if (typeof item[key] === 'number') {
              acc[key] = (acc[key] || 0) + item[key];
            }
          });
          return acc;
        }, {});
      } else {
        summary = realData || {};
      }
      setDailyData(daily);
      // Se não houver dados, usar objeto zerado
      if (!summary || Object.keys(summary).length === 0) {
        summary = {
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
      }
      const updatedMetrics = metrics.map(metric => ({
        ...metric,
        value: (summary as any)[metric.id] || 0,
        change: 0 // Zerar mudança quando não há dados históricos
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
        value: 0,
        change: 0 // Zerar mudança quando há erro
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
  }, [autoRefresh, selectedPeriod, filters, customRange])

  // Carregar dados quando componente montar ou parâmetros mudarem
  useEffect(() => {
    if (apiKey) {
      loadDashboardData()
    }
  }, [apiKey, selectedPeriod, filters, customRange])

  // Remover handlePeriodChange e qualquer uso de setSelectedPeriod

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
      {/* Botão de filtros fixo, alinhado à direita */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl border border-gray-400 text-gray-700 font-semibold bg-white shadow-lg hover:bg-gray-100 transition"
        >
          <Filter className="w-4 h-4 mr-2 inline" />
          Filtros
        </Button>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros Avançados</h3>
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
            {/* Removido: Data Inicial */}
            {/* Removido: Data Final */}
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
      {/* Removido: PeriodDropdown duplicado do Dashboard */}

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
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
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
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Performance por Dia</h3>
          {dailyData && dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => value?.toLocaleString?.('pt-BR') ?? value} />
                <Line type="monotone" dataKey="clicks" stroke="#6366f1" name="Cliques" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversões" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e42" name="Receita" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-lg font-semibold">Gráfico de Performance</p>
              <p className="text-sm">Dados reais serão exibidos quando disponíveis</p>
            </div>
          </div>
          )}
        </motion.div>

        {/* Distribuição por Fonte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribuição por Fonte</h3>
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