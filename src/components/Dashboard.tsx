import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  Calculator
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, getCurrentRedTrackDate, periodPresets } from '../lib/utils'
import { useDateRangeStore } from '../store/dateRange'
import MetricsSelector from './MetricsSelector'
import MetricsOrder from './MetricsOrder'
import FunnelChart from './FunnelChart'
import { useMetricsStore } from '../store/metrics'
import type { Metric } from '../store/metrics'

const Dashboard: React.FC = () => {
  const { apiKey } = useAuthStore()
  const { selectedMetrics, availableMetrics } = useMetricsStore()
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


  const [dashboardData, setDashboardData] = useState<any>({})

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

  // Modificar a função loadDashboardData para adicionar logs detalhados:
  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      console.log('🔍 [DASHBOARD] Carregando dados do dashboard...')
      console.log('🔍 [DASHBOARD] API Key:', apiKey ? 'SIM' : 'NÃO')
      console.log('🔍 [DASHBOARD] Período selecionado:', selectedPeriod)
      console.log('🔍 [DASHBOARD] Filtros:', filters)
      console.log('🔍 [DASHBOARD] Range customizado:', customRange)

      if (!apiKey) throw new Error('API Key não definida')
      const api = new RedTrackAPI(apiKey)
      
      // Calcular datas baseadas no período selecionado
      const dateRange = getDateRange(selectedPeriod, customRange)
      console.log('🔍 [DASHBOARD] Range de datas:', dateRange)

      // Parâmetros para a API
      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        ...filters
      }

      console.log('🔍 [DASHBOARD] Parâmetros para API:', params)

      // Buscar dados do dashboard
      const realData = await api.getDashboardData(params)
      console.log('🔍 [DASHBOARD] Dados reais recebidos:', realData)

      // Processar dados
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
        console.log('🔍 [DASHBOARD] Dados agregados:', summary)
      } else {
        summary = realData || {};
        console.log('🔍 [DASHBOARD] Dados diretos:', summary)
      }

      // Buscar dados de distribuição por fonte
      try {
        const trafficSourcesResponse = await fetch(`/api/traffic-sources?date_from=${dateRange.startDate}&date_to=${dateRange.endDate}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        })
        
        if (trafficSourcesResponse.ok) {
          const trafficSources = await trafficSourcesResponse.json()
          summary.traffic_sources = trafficSources
          console.log('📊 [DASHBOARD] Dados de distribuição por fonte:', trafficSources)
        } else {
          console.log('⚠️ [DASHBOARD] Erro ao buscar distribuição por fonte')
          summary.traffic_sources = []
        }
      } catch (error) {
        console.log('⚠️ [DASHBOARD] Erro ao buscar distribuição por fonte:', error)
        summary.traffic_sources = []
      }

      setDailyData(daily);
      setDashboardData(summary);
      
      // Se não houver dados, usar objeto zerado
      if (!summary || Object.keys(summary).length === 0) {
        console.log('⚠️ [DASHBOARD] Nenhum dado encontrado - usando dados zerados')
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
          lp_views: 0,
          lp_clicks: 0,
          lp_ctr: 0,
          lp_click_ctr: 0,
          offer_views: 0,
          offer_clicks: 0,
          offer_ctr: 0,
          offer_click_ctr: 0,
          prelp_to_lp_rate: 0,
          lp_to_offer_rate: 0,
          offer_to_conversion_rate: 0,
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
          epc_roi: 0,
          traffic_sources: []
        }
        setDashboardData(emptyData)
      }
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('❌ [DASHBOARD] Erro ao carregar dados:', error)
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
        epc_roi: 0,
        traffic_sources: []
      }
      setDashboardData(emptyData)
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

  // Corrigir a função formatValue:
  const formatValue = (value: any, format: string) => {
    // Verificar se o valor é um número válido
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'USD'
        }).format(numValue)
      case 'percentage':
        return `${numValue.toFixed(2)}%`
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(numValue)
      default:
        return numValue.toString()
    }
  }

  // Modificar a função getMetricsFromData para adicionar logs:
  const getMetricsFromData = (data: any) => {
    console.log('🔍 [METRICS] Dados recebidos:', data)
    console.log('🔍 [METRICS] Métricas selecionadas:', selectedMetrics)
    
    const selectedMetricsData = selectedMetrics.map(metricId => {
      const metric = availableMetrics.find(m => m.id === metricId)
      if (!metric) {
        console.warn(`⚠️ [METRICS] Métrica não encontrada: ${metricId}`)
        return null
      }

      const value = data[metricId] || 0
      console.log(`�� [METRICS] ${metricId}: ${value} (${typeof value})`)
      
      let formattedValue = value

      // Formatar valor baseado no tipo
      if (metric.unit === 'currency') {
        formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'USD'
        }).format(value)
      } else if (metric.unit === 'percentage') {
        formattedValue = `${value.toFixed(2)}%`
      } else if (metric.format === 'integer') {
        formattedValue = new Intl.NumberFormat('pt-BR').format(value)
      } else {
        formattedValue = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)
      }

      // Mapear para o formato esperado pelo componente
      return {
        id: metricId,
        label: metric.label,
        value: formattedValue,
        rawValue: value,
        description: metric.description,
        icon: metric.icon,
        color: metric.color,
        unit: metric.unit,
        format: metric.format || 'number',
        change: 0, // Zerar mudança quando não há dados históricos
        visible: true
      }
    }).filter(Boolean) as any[]

    console.log('✅ [METRICS] Métricas processadas:', selectedMetricsData.length)
    return selectedMetricsData
  }

  // Remover as funções getIconComponent, getColorClass, getTextColorClass, getColorClasses que não são mais necessárias

  const getSelectedMetricsInOrder = () => {
    const { selectedMetrics, metricsOrder, availableMetrics } = useMetricsStore.getState()
    return metricsOrder
      .filter(metricId => selectedMetrics.includes(metricId))
      .map(metricId => availableMetrics.find(m => m.id === metricId))
      .filter((metric): metric is Metric => metric !== null)
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trackview-primary"></div>
      </div>
    )
  }

  const metrics = getMetricsFromData(dashboardData)

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-600">Análise completa das suas campanhas</p>
        </div>
        <div className="flex items-center gap-3">
          <MetricsSelector />
          <MetricsOrder />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getSelectedMetricsInOrder().map((metric) => {
          const value = dashboardData[metric.id as keyof typeof dashboardData] || 0
          const formattedValue = formatValue(value, metric.format || 'integer')
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-600 mb-2 truncate">{metric.label}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {formattedValue}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">{metric.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
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

        {/* Funil de Marketing */}
        <FunnelChart data={dashboardData} />
      </div>

      {/* Gráficos Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Fonte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribuição por Fonte</h3>
          {dashboardData.traffic_sources && dashboardData.traffic_sources.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.traffic_sources}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.traffic_sources.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => value?.toLocaleString?.('pt-BR') ?? value} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-lg font-semibold">Distribuição por Fonte</p>
                <p className="text-sm">Dados reais serão exibidos quando disponíveis</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Espaço para futuro gráfico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Análise Avançada</h3>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-lg font-semibold">Análise Avançada</p>
              <p className="text-sm">Novos gráficos e análises serão adicionados aqui</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard 