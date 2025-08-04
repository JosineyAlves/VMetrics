import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Monitor,
  Globe,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Target,
  MousePointer,
  Clock,
  Hash,
  User,
  Shield,
  Eye,
  Smartphone as DeviceIcon,
  Monitor as BrowserIcon,
  MapPin as LocationIcon,
  BarChart2 as SourceIcon
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart as RechartsPieChart, Pie } from 'recharts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, periodPresets } from '../lib/utils'
import { useDateRangeStore } from '../store/dateRange'
import { useCurrencyStore } from '../store/currency'

interface PerformanceData {
  // Dados de dispositivos
  devicePerformance: {
    device: string
    conversions: number
    revenue: number
    cost: number
    roi: number
    avgTicket: number
  }[]
  
  // Dados de browsers
  browserPerformance: {
    browser: string
    conversions: number
    revenue: number
    cost: number
    roi: number
    avgTicket: number
  }[]
  
  // Dados de localização
  locationPerformance: {
    country: string
    city: string
    state: string
    conversions: number
    revenue: number
    cost: number
    roi: number
    avgTicket: number
  }[]
  
  // Dados de fonte de tráfego
  sourcePerformance: {
    source: string
    network: string
    conversions: number
    revenue: number
    cost: number
    roi: number
    avgTicket: number
  }[]
  
  // Dados por hora do dia
  hourlyPerformance: {
    hour: number
    conversions: number
    revenue: number
    cost: number
    roi: number
  }[]
  
  // Resumo geral
  summary: {
    totalConversions: number
    totalRevenue: number
    totalCost: number
    totalROI: number
    avgTicket: number
    bestDevice: string
    bestBrowser: string
    bestLocation: string
    bestSource: string
    bestHour: number
  }
}

const Performance: React.FC = () => {
  const { apiKey } = useAuthStore()
  const { selectedPeriod, customRange } = useDateRangeStore()
  const { currency } = useCurrencyStore()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<'device' | 'browser' | 'location' | 'source' | 'hourly'>('device')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    campaign: '',
    type: '',
    status: '',
    device: '',
    browser: '',
    country: '',
    source: ''
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  const loadPerformanceData = async (isRefresh = false) => {
    if (!apiKey) return
    
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const api = new RedTrackAPI(apiKey)
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      console.log('Performance - Carregando dados de conversões...')
      
      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        per: 1000, // Máximo para obter mais dados
        ...filters
      }
      
      const response = await api.getConversions(params)
      console.log('Performance - Resposta da API:', response)
      
      // Processar diferentes formatos de resposta
      let conversionsData = []
      
      if (response) {
        if (Array.isArray(response)) {
          conversionsData = response
        } else if (response.items && Array.isArray(response.items)) {
          conversionsData = response.items
        } else if (response.data && Array.isArray(response.data)) {
          conversionsData = response.data
        } else if (typeof response === 'object' && !Array.isArray(response)) {
          if (response.conversions) {
            conversionsData = Array.isArray(response.conversions) ? response.conversions : [response.conversions]
          } else if (response.conversion) {
            conversionsData = Array.isArray(response.conversion) ? response.conversion : [response.conversion]
          } else {
            conversionsData = [response]
          }
        }
      }

      console.log('Performance - Dados processados:', conversionsData.length, 'conversões')

      // Mapear dados para o formato padrão
      const mappedConversions = conversionsData.map((item: any, index: number) => ({
        id: item.id || item.conversion_id || `conv_${index}`,
        date: item.date || item.created_at || item.timestamp || new Date().toISOString().split('T')[0],
        campaign: item.campaign || item.campaign_name || item.name || 'Campanha sem nome',
        campaign_id: item.campaign_id || item.campaign_id || '',
        offer: item.offer || item.offer_name || '',
        offer_id: item.offer_id || '',
        source: item.source || item.traffic_source || 'N/A',
        source_id: item.source_id || '',
        network: item.network || '',
        payout: item.payout || item.revenue || item.amount || 0,
        payout_default: item.payout_default || 0,
        payout_network: item.payout_network || 0,
        cost: item.cost || item.spend || 0,
        cost_default: item.cost_default || 0,
        cost_source: item.cost_source || 0,
        pub_revenue: item.pub_revenue || 0,
        pub_revenue_default: item.pub_revenue_default || 0,
        pub_revenue_source: item.pub_revenue_source || 0,
        revenue: item.revenue || item.payout || 0,
        status: item.status || item.conversion_status || 'pending',
        type: item.type || item.conversion_type || '',
        event: item.event || '',
        country: item.country || item.geo_country || '',
        city: item.city || item.geo_city || '',
        region: item.region || item.geo_region || item.state || '',
        device: item.device || item.device_type || '',
        device_brand: item.device_brand || '',
        device_fullname: item.device_fullname || '',
        os: item.os || item.operating_system || '',
        browser: item.browser || item.user_agent_browser || '',
        connection_type: item.connection_type || '',
        isp: item.isp || '',
        ip: item.ip || '',
        postback_ip: item.postback_ip || '',
        track_time: item.track_time || '',
        conv_time: item.conv_time || '',
        created_at: item.created_at || item.date || new Date().toISOString(),
        fingerprint: item.fingerprint || '',
        deduplicate_token: item.deduplicate_token || '',
        duplicate_status: item.duplicate_status || 0,
        landing: item.landing || '',
        landing_id: item.landing_id || '',
        prelanding: item.prelanding || '',
        prelanding_id: item.prelanding_id || '',
        deeplink: item.deeplink || '',
        referer: item.referer || '',
        page: item.page || '',
        page_url: item.page_url || '',
        // Sub-IDs
        sub1: item.sub1 || '',
        sub2: item.sub2 || '',
        sub3: item.sub3 || '',
        sub4: item.sub4 || '',
        sub5: item.sub5 || '',
        sub6: item.sub6 || '',
        sub7: item.sub7 || '',
        sub8: item.sub8 || '',
        sub9: item.sub9 || '',
        sub10: item.sub10 || '',
        sub11: item.sub11 || '',
        sub12: item.sub12 || '',
        sub13: item.sub13 || '',
        sub14: item.sub14 || '',
        sub15: item.sub15 || '',
        sub16: item.sub16 || '',
        sub17: item.sub17 || '',
        sub18: item.sub18 || '',
        sub19: item.sub19 || '',
        sub20: item.sub20 || '',
        // P-Sub-IDs
        p_sub1: item.p_sub1 || '',
        p_sub2: item.p_sub2 || '',
        p_sub3: item.p_sub3 || '',
        p_sub4: item.p_sub4 || '',
        p_sub5: item.p_sub5 || '',
        p_sub6: item.p_sub6 || '',
        p_sub7: item.p_sub7 || '',
        p_sub8: item.p_sub8 || '',
        p_sub9: item.p_sub9 || '',
        p_sub10: item.p_sub10 || '',
        p_sub11: item.p_sub11 || '',
        p_sub12: item.p_sub12 || '',
        p_sub13: item.p_sub13 || '',
        p_sub14: item.p_sub14 || '',
        p_sub15: item.p_sub15 || '',
        p_sub16: item.p_sub16 || '',
        p_sub17: item.p_sub17 || '',
        p_sub18: item.p_sub18 || '',
        p_sub19: item.p_sub19 || '',
        p_sub20: item.p_sub20 || '',
        // ConvTypes
        type1: item.type1 || 0,
        type2: item.type2 || 0,
        type3: item.type3 || 0,
        type4: item.type4 || 0,
        type5: item.type5 || 0,
        type6: item.type6 || 0,
        type7: item.type7 || 0,
        type8: item.type8 || 0,
        type9: item.type9 || 0,
        type10: item.type10 || 0,
        type11: item.type11 || 0,
        type12: item.type12 || 0,
        type13: item.type13 || 0,
        type14: item.type14 || 0,
        type15: item.type15 || 0,
        type16: item.type16 || 0,
        type17: item.type17 || 0,
        type18: item.type18 || 0,
        type19: item.type19 || 0,
        type20: item.type20 || 0,
        type21: item.type21 || 0,
        type22: item.type22 || 0,
        type23: item.type23 || 0,
        type24: item.type24 || 0,
        type25: item.type25 || 0,
        type26: item.type26 || 0,
        type27: item.type27 || 0,
        type28: item.type28 || 0,
        type29: item.type29 || 0,
        type30: item.type30 || 0,
        type31: item.type31 || 0,
        type32: item.type32 || 0,
        type33: item.type33 || 0,
        type34: item.type34 || 0,
        type35: item.type35 || 0,
        type36: item.type36 || 0,
        type37: item.type37 || 0,
        type38: item.type38 || 0,
        type39: item.type39 || 0,
        type40: item.type40 || 0,
        // RedTrack specific
        rt_campaign: item.rt_campaign || '',
        rt_campaign_id: item.rt_campaign_id || '',
        rt_source: item.rt_source || '',
        rt_medium: item.rt_medium || '',
        rt_ad: item.rt_ad || '',
        rt_ad_id: item.rt_ad_id || '',
        rt_adgroup: item.rt_adgroup || '',
        rt_adgroup_id: item.rt_adgroup_id || '',
        rt_keyword: item.rt_keyword || '',
        rt_placement: item.rt_placement || '',
        rt_placement_id: item.rt_placement_id || '',
        rt_placement_hashed: item.rt_placement_hashed || '',
        rt_role_1: item.rt_role_1 || '',
        rt_role_2: item.rt_role_2 || '',
        // Outros
        user_agent: item.user_agent || '',
        server: item.server || '',
        program_id: item.program_id || '',
        ref_id: item.ref_id || '',
        external_id: item.external_id || '',
        order: item.order || '',
        coupon: item.coupon || '',
        currency: item.currency || '',
        attribution_type: item.attribution_type || '',
        default_type: item.default_type || 0,
        is_transaction: item.is_transaction || 0
      }))

      // Calcular análises de performance
      const analysis = calculatePerformanceAnalysis(mappedConversions)
      setPerformanceData(analysis)

    } catch (error) {
      console.error('Erro ao carregar dados de performance:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculatePerformanceAnalysis = (conversions: any[]): PerformanceData => {
    if (conversions.length === 0) {
      return {
        devicePerformance: [],
        browserPerformance: [],
        locationPerformance: [],
        sourcePerformance: [],
        hourlyPerformance: [],
        summary: {
          totalConversions: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalROI: 0,
          avgTicket: 0,
          bestDevice: '',
          bestBrowser: '',
          bestLocation: '',
          bestSource: '',
          bestHour: 0
        }
      }
    }

    // Análise por dispositivo
    const deviceAnalysis = conversions.reduce((acc, conv) => {
      const device = conv.device || 'Unknown'
      if (!acc[device]) {
        acc[device] = { conversions: 0, revenue: 0, cost: 0 }
      }
      acc[device].conversions++
      acc[device].revenue += conv.revenue || 0
      acc[device].cost += conv.cost || 0
      return acc
    }, {} as Record<string, { conversions: number, revenue: number, cost: number }>)

    const devicePerformance = Object.entries(deviceAnalysis).map(([device, data]) => ({
      device,
      conversions: data.conversions,
      revenue: data.revenue,
      cost: data.cost,
      roi: data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0,
      avgTicket: data.conversions > 0 ? data.revenue / data.conversions : 0
    })).sort((a, b) => b.revenue - a.revenue)

    // Análise por browser
    const browserAnalysis = conversions.reduce((acc, conv) => {
      const browser = conv.browser || 'Unknown'
      if (!acc[browser]) {
        acc[browser] = { conversions: 0, revenue: 0, cost: 0 }
      }
      acc[browser].conversions++
      acc[browser].revenue += conv.revenue || 0
      acc[browser].cost += conv.cost || 0
      return acc
    }, {} as Record<string, { conversions: number, revenue: number, cost: number }>)

    const browserPerformance = Object.entries(browserAnalysis).map(([browser, data]) => ({
      browser,
      conversions: data.conversions,
      revenue: data.revenue,
      cost: data.cost,
      roi: data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0,
      avgTicket: data.conversions > 0 ? data.revenue / data.conversions : 0
    })).sort((a, b) => b.revenue - a.revenue)

    // Análise por localização
    const locationAnalysis = conversions.reduce((acc, conv) => {
      const location = `${conv.country}-${conv.city}-${conv.region}`
      if (!acc[location]) {
        acc[location] = { 
          country: conv.country || 'Unknown',
          city: conv.city || 'Unknown',
          state: conv.region || 'Unknown',
          conversions: 0, 
          revenue: 0, 
          cost: 0 
        }
      }
      acc[location].conversions++
      acc[location].revenue += conv.revenue || 0
      acc[location].cost += conv.cost || 0
      return acc
    }, {} as Record<string, { country: string, city: string, state: string, conversions: number, revenue: number, cost: number }>)

    const locationPerformance = Object.values(locationAnalysis).map(data => ({
      ...data,
      roi: data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0,
      avgTicket: data.conversions > 0 ? data.revenue / data.conversions : 0
    })).sort((a, b) => b.revenue - a.revenue)

    // Análise por fonte de tráfego
    const sourceAnalysis = conversions.reduce((acc, conv) => {
      const source = `${conv.source}-${conv.network}`
      if (!acc[source]) {
        acc[source] = { 
          source: conv.source || 'Unknown',
          network: conv.network || 'Unknown',
          conversions: 0, 
          revenue: 0, 
          cost: 0 
        }
      }
      acc[source].conversions++
      acc[source].revenue += conv.revenue || 0
      acc[source].cost += conv.cost || 0
      return acc
    }, {} as Record<string, { source: string, network: string, conversions: number, revenue: number, cost: number }>)

    const sourcePerformance = Object.values(sourceAnalysis).map(data => ({
      ...data,
      roi: data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0,
      avgTicket: data.conversions > 0 ? data.revenue / data.conversions : 0
    })).sort((a, b) => b.revenue - a.revenue)

    // Análise por hora do dia
    const hourlyAnalysis = conversions.reduce((acc, conv) => {
      const hour = new Date(conv.created_at).getHours()
      if (!acc[hour]) {
        acc[hour] = { conversions: 0, revenue: 0, cost: 0 }
      }
      acc[hour].conversions++
      acc[hour].revenue += conv.revenue || 0
      acc[hour].cost += conv.cost || 0
      return acc
    }, {} as Record<number, { conversions: number, revenue: number, cost: number }>)

    const hourlyPerformance = Object.entries(hourlyAnalysis).map(([hour, data]) => ({
      hour: parseInt(hour),
      conversions: data.conversions,
      revenue: data.revenue,
      cost: data.cost,
      roi: data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0
    })).sort((a, b) => a.hour - b.hour)

    // Resumo geral
    const totalRevenue = conversions.reduce((sum, conv) => sum + (conv.revenue || 0), 0)
    const totalCost = conversions.reduce((sum, conv) => sum + (conv.cost || 0), 0)
    const totalROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0
    const avgTicket = conversions.length > 0 ? totalRevenue / conversions.length : 0

    const bestDevice = devicePerformance[0]?.device || ''
    const bestBrowser = browserPerformance[0]?.browser || ''
    const bestLocation = locationPerformance[0]?.city || ''
    const bestSource = sourcePerformance[0]?.source || ''
    const bestHour = hourlyPerformance.reduce((best, current) => 
      current.revenue > best.revenue ? current : best
    ).hour

    return {
      devicePerformance,
      browserPerformance,
      locationPerformance,
      sourcePerformance,
      hourlyPerformance,
      summary: {
        totalConversions: conversions.length,
        totalRevenue,
        totalCost,
        totalROI,
        avgTicket,
        bestDevice,
        bestBrowser,
        bestLocation,
        bestSource,
        bestHour
      }
    }
  }

  useEffect(() => {
    loadPerformanceData()
  }, [apiKey, selectedPeriod, customRange, filters])

  const handleRefresh = () => {
    loadPerformanceData(true)
  }

  const getAnalysisData = () => {
    if (!performanceData) return []
    
    switch (selectedAnalysis) {
      case 'device':
        return performanceData.devicePerformance
      case 'browser':
        return performanceData.browserPerformance
      case 'location':
        return performanceData.locationPerformance
      case 'source':
        return performanceData.sourcePerformance
      case 'hourly':
        return performanceData.hourlyPerformance
      default:
        return []
    }
  }

  const getAnalysisTitle = () => {
    switch (selectedAnalysis) {
      case 'device':
        return 'Performance por Dispositivo'
      case 'browser':
        return 'Performance por Navegador'
      case 'location':
        return 'Performance por Localização'
      case 'source':
        return 'Performance por Fonte de Tráfego'
      case 'hourly':
        return 'Performance por Hora do Dia'
      default:
        return 'Análise de Performance'
    }
  }

  const getAnalysisIcon = () => {
    switch (selectedAnalysis) {
      case 'device':
        return <DeviceIcon className="w-5 h-5" />
      case 'browser':
        return <BrowserIcon className="w-5 h-5" />
      case 'location':
        return <LocationIcon className="w-5 h-5" />
      case 'source':
        return <SourceIcon className="w-5 h-5" />
      case 'hourly':
        return <Clock className="w-5 h-5" />
      default:
        return <BarChart3 className="w-5 h-5" />
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">Performance</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl border border-gray-400 text-gray-700 font-semibold bg-white shadow-lg hover:bg-gray-100 transition"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
        
        <div className="flex gap-3">
          <PeriodDropdown />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-xl border border-gray-400 text-gray-700 font-semibold bg-white shadow-lg hover:bg-gray-100 transition"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Filtrar por campanha..."
              value={filters.campaign}
              onChange={(e) => setFilters({ ...filters, campaign: e.target.value })}
              className="rounded-xl"
            />
            <Input
              placeholder="Filtrar por tipo..."
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="rounded-xl"
            />
            <Input
              placeholder="Filtrar por status..."
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="rounded-xl"
            />
            <Input
              placeholder="Filtrar por dispositivo..."
              value={filters.device}
              onChange={(e) => setFilters({ ...filters, device: e.target.value })}
              className="rounded-xl"
            />
          </div>
        </motion.div>
      )}

      {/* Cards de Resumo */}
      {performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Conversões</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.summary.totalConversions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(performanceData.summary.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI Total</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.summary.totalROI.toFixed(2)}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(performanceData.summary.avgTicket)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Seletor de Análise */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setSelectedAnalysis('device')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedAnalysis === 'device'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <DeviceIcon className="w-5 h-5 mr-2" />
          Dispositivos
        </Button>
        <Button
          onClick={() => setSelectedAnalysis('browser')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedAnalysis === 'browser'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <BrowserIcon className="w-5 h-5 mr-2" />
          Navegadores
        </Button>
        <Button
          onClick={() => setSelectedAnalysis('location')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedAnalysis === 'location'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <LocationIcon className="w-5 h-5 mr-2" />
          Localização
        </Button>
        <Button
          onClick={() => setSelectedAnalysis('source')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedAnalysis === 'source'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <SourceIcon className="w-5 h-5 mr-2" />
          Fontes
        </Button>
        <Button
          onClick={() => setSelectedAnalysis('hourly')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedAnalysis === 'hourly'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-5 h-5 mr-2" />
          Horário
        </Button>
      </div>

      {/* Gráfico de Análise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-6">
          {getAnalysisIcon()}
          <h2 className="text-xl font-semibold text-gray-800">{getAnalysisTitle()}</h2>
        </div>

        {getAnalysisData().length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Barras */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getAnalysisData().slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={selectedAnalysis === 'device' ? 'device' : 
                             selectedAnalysis === 'browser' ? 'browser' : 
                             selectedAnalysis === 'location' ? 'city' : 
                             selectedAnalysis === 'source' ? 'source' : 'hour'} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 12, background: '#fff', boxShadow: '0 4px 24px #0001' }}
                  />
                  <Bar dataKey="revenue" name="Receita" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela de Dados */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      {selectedAnalysis === 'device' ? 'Dispositivo' : 
                       selectedAnalysis === 'browser' ? 'Navegador' : 
                       selectedAnalysis === 'location' ? 'Localização' : 
                       selectedAnalysis === 'source' ? 'Fonte' : 'Hora'}
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Conversões</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Receita</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {getAnalysisData().slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {selectedAnalysis === 'device' ? item.device : 
                         selectedAnalysis === 'browser' ? item.browser : 
                         selectedAnalysis === 'location' ? `${item.city}, ${item.country}` : 
                         selectedAnalysis === 'source' ? `${item.source} (${item.network})` : 
                         `${item.hour}h`}
                      </td>
                      <td className="text-right py-3 px-4">{item.conversions}</td>
                      <td className="text-right py-3 px-4 font-semibold">{formatCurrency(item.revenue)}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.roi > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.roi.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-semibold text-gray-600">Nenhum dado disponível</p>
            <p className="text-sm text-gray-500">Tente ajustar os filtros ou período selecionado</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Performance 