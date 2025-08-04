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
  Eye,
  MousePointer,
  Target,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  Hash,
  User,
  Shield,
  Activity
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, periodPresets } from '../lib/utils'
import { useDateRangeStore } from '../store/dateRange'
import { useCurrencyStore } from '../store/currency'

// Interface expandida com todos os campos do RedTrack
interface Conversion {
  // Identificadores
  id: string
  click_id: string
  clickid: string
  
  // Informações básicas
  date: string
  campaign: string
  campaign_id: string
  offer: string
  offer_id: string
  source: string
  source_id: string
  network: string
  
  // Dados financeiros
  payout: number
  payout_default: number
  payout_network: number
  cost: number
  cost_default: number
  cost_source: number
  pub_revenue: number
  pub_revenue_default: number
  pub_revenue_source: number
  revenue?: number
  
  // Status e tipo
  status: string
  type: string
  event: string
  
  // Dados geográficos
  country: string
  city: string
  region: string
  
  // Dados técnicos
  device: string
  device_brand: string
  device_fullname: string
  os: string
  browser: string
  connection_type: string
  isp: string
  ip: string
  postback_ip: string
  
  // Dados de tracking
  track_time: string
  conv_time: string
  created_at: string
  fingerprint: string
  deduplicate_token: string
  duplicate_status: number
  
  // Dados de campanha
  landing: string
  landing_id: string
  prelanding: string
  prelanding_id: string
  deeplink: string
  referer: string
  page: string
  page_url: string
  
  // Sub-IDs (20 campos)
  sub1: string
  sub2: string
  sub3: string
  sub4: string
  sub5: string
  sub6: string
  sub7: string
  sub8: string
  sub9: string
  sub10: string
  sub11: string
  sub12: string
  sub13: string
  sub14: string
  sub15: string
  sub16: string
  sub17: string
  sub18: string
  sub19: string
  sub20: string
  
  // P-Sub-IDs (20 campos)
  p_sub1: string
  p_sub2: string
  p_sub3: string
  p_sub4: string
  p_sub5: string
  p_sub6: string
  p_sub7: string
  p_sub8: string
  p_sub9: string
  p_sub10: string
  p_sub11: string
  p_sub12: string
  p_sub13: string
  p_sub14: string
  p_sub15: string
  p_sub16: string
  p_sub17: string
  p_sub18: string
  p_sub19: string
  p_sub20: string
  
  // ConvTypes (40 campos)
  type1: number
  type2: number
  type3: number
  type4: number
  type5: number
  type6: number
  type7: number
  type8: number
  type9: number
  type10: number
  type11: number
  type12: number
  type13: number
  type14: number
  type15: number
  type16: number
  type17: number
  type18: number
  type19: number
  type20: number
  type21: number
  type22: number
  type23: number
  type24: number
  type25: number
  type26: number
  type27: number
  type28: number
  type29: number
  type30: number
  type31: number
  type32: number
  type33: number
  type34: number
  type35: number
  type36: number
  type37: number
  type38: number
  type39: number
  type40: number
  
  // RedTrack specific
  rt_campaign: string
  rt_campaign_id: string
  rt_source: string
  rt_medium: string
  rt_ad: string
  rt_ad_id: string
  rt_adgroup: string
  rt_adgroup_id: string
  rt_keyword: string
  rt_placement: string
  rt_placement_id: string
  rt_placement_hashed: string
  rt_role_1: string
  rt_role_2: string
  
  // Outros
  user_agent: string
  server: string
  program_id: string
  ref_id: string
  external_id: string
  order: string
  coupon: string
  currency: string
  attribution_type: string
  default_type: number
  is_transaction: number
}

const Conversions: React.FC = () => {
  const { apiKey } = useAuthStore()
  const { selectedPeriod, customRange } = useDateRangeStore()
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    campaign: '',
    type: '',
    country: '',
    status: '',
    device: '',
    os: '',
    browser: '',
    source: '',
    offer: '',
    dateFrom: '',
    dateTo: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)
  const [totalConversions, setTotalConversions] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showAdvancedData, setShowAdvancedData] = useState(false)

  const loadConversions = async (isRefresh = false) => {
    if (!apiKey) return
    
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const api = new RedTrackAPI(apiKey)
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      console.log('Conversões - Parâmetros enviados:', {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        ...filters
      })
      
      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        per: 1000, // Máximo para obter mais dados
        ...filters
      }
      
      const response = await api.getConversions(params)
      console.log('Conversões - Resposta da API:', response)
      
      // Processar diferentes formatos de resposta
      let conversionsData = []
      let totalCount = 0
      
      if (response) {
        // Se response é um array direto
        if (Array.isArray(response)) {
          conversionsData = response
          totalCount = response.length
        }
        // Se response tem propriedade items (formato RedTrack)
        else if (response.items && Array.isArray(response.items)) {
          conversionsData = response.items
          totalCount = response.total || response.items.length
        }
        // Se response tem propriedade data
        else if (response.data && Array.isArray(response.data)) {
          conversionsData = response.data
          totalCount = response.total || response.data.length
        }
        // Se response é um objeto com dados diretos
        else if (typeof response === 'object' && !Array.isArray(response)) {
          // Tentar extrair dados de diferentes propriedades possíveis
          if (response.conversions) {
            conversionsData = Array.isArray(response.conversions) ? response.conversions : [response.conversions]
          } else if (response.conversion) {
            conversionsData = Array.isArray(response.conversion) ? response.conversion : [response.conversion]
          } else {
            // Se não encontrar estrutura específica, usar o próprio response
            conversionsData = [response]
          }
          totalCount = conversionsData.length
        }
      }
      
      console.log('Conversões - Dados processados:', {
        conversionsData,
        totalCount,
        originalResponse: response
      })
      
      // Mapear dados para o formato expandido
      const mappedConversions = conversionsData.map((item: any, index: number) => ({
        // Identificadores
        id: item.id || item.conversion_id || `conv_${index}`,
        click_id: item.click_id || item.clickid || '',
        clickid: item.clickid || item.click_id || '',
        
        // Informações básicas
        date: item.date || item.created_at || item.timestamp || new Date().toISOString().split('T')[0],
        campaign: item.campaign || item.campaign_name || item.name || 'Campanha sem nome',
        campaign_id: item.campaign_id || item.campaign_id || '',
        offer: item.offer || item.offer_name || '',
        offer_id: item.offer_id || '',
        source: item.source || item.traffic_source || 'N/A',
        source_id: item.source_id || '',
        network: item.network || '',
        
        // Dados financeiros
        payout: item.payout || item.revenue || item.amount || 0,
        payout_default: item.payout_default || 0,
        payout_network: item.payout_network || 0,
        cost: item.cost || item.spend || 0,
        cost_default: item.cost_default || 0,
        cost_source: item.cost_source || 0,
        pub_revenue: item.pub_revenue || 0,
        pub_revenue_default: item.pub_revenue_default || 0,
        pub_revenue_source: item.pub_revenue_source || 0,
        revenue: item.revenue || item.payout || item.amount || 0,
        
        // Status e tipo
        status: item.status || item.approval_status || 'approved',
        type: item.type || item.conversion_type || 'sale',
        event: item.event || '',
        
        // Dados geográficos
        country: item.country || item.geo || 'N/A',
        city: item.city || '',
        region: item.region || '',
        
        // Dados técnicos
        device: item.device || item.device_type || '',
        device_brand: item.device_brand || '',
        device_fullname: item.device_fullname || '',
        os: item.os || item.operating_system || '',
        browser: item.browser || '',
        connection_type: item.connection_type || '',
        isp: item.isp || '',
        ip: item.ip || '',
        postback_ip: item.postback_ip || '',
        
        // Dados de tracking
        track_time: item.track_time || item.timestamp || '',
        conv_time: item.conv_time || item.conversion_time || '',
        created_at: item.created_at || item.date || '',
        fingerprint: item.fingerprint || '',
        deduplicate_token: item.deduplicate_token || '',
        duplicate_status: item.duplicate_status || 0,
        
        // Dados de campanha
        landing: item.landing || item.landing_page || '',
        landing_id: item.landing_id || '',
        prelanding: item.prelanding || item.pre_landing || '',
        prelanding_id: item.prelanding_id || '',
        deeplink: item.deeplink || '',
        referer: item.referer || item.referrer || '',
        page: item.page || '',
        page_url: item.page_url || '',
        
        // Sub-IDs (20 campos)
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
        
        // P-Sub-IDs (20 campos)
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
        
        // ConvTypes (40 campos)
        type1: item.type1 || item.convtype1 || 0,
        type2: item.type2 || item.convtype2 || 0,
        type3: item.type3 || item.convtype3 || 0,
        type4: item.type4 || item.convtype4 || 0,
        type5: item.type5 || item.convtype5 || 0,
        type6: item.type6 || item.convtype6 || 0,
        type7: item.type7 || item.convtype7 || 0,
        type8: item.type8 || item.convtype8 || 0,
        type9: item.type9 || item.convtype9 || 0,
        type10: item.type10 || item.convtype10 || 0,
        type11: item.type11 || item.convtype11 || 0,
        type12: item.type12 || item.convtype12 || 0,
        type13: item.type13 || item.convtype13 || 0,
        type14: item.type14 || item.convtype14 || 0,
        type15: item.type15 || item.convtype15 || 0,
        type16: item.type16 || item.convtype16 || 0,
        type17: item.type17 || item.convtype17 || 0,
        type18: item.type18 || item.convtype18 || 0,
        type19: item.type19 || item.convtype19 || 0,
        type20: item.type20 || item.convtype20 || 0,
        type21: item.type21 || item.convtype21 || 0,
        type22: item.type22 || item.convtype22 || 0,
        type23: item.type23 || item.convtype23 || 0,
        type24: item.type24 || item.convtype24 || 0,
        type25: item.type25 || item.convtype25 || 0,
        type26: item.type26 || item.convtype26 || 0,
        type27: item.type27 || item.convtype27 || 0,
        type28: item.type28 || item.convtype28 || 0,
        type29: item.type29 || item.convtype29 || 0,
        type30: item.type30 || item.convtype30 || 0,
        type31: item.type31 || item.convtype31 || 0,
        type32: item.type32 || item.convtype32 || 0,
        type33: item.type33 || item.convtype33 || 0,
        type34: item.type34 || item.convtype34 || 0,
        type35: item.type35 || item.convtype35 || 0,
        type36: item.type36 || item.convtype36 || 0,
        type37: item.type37 || item.convtype37 || 0,
        type38: item.type38 || item.convtype38 || 0,
        type39: item.type39 || item.convtype39 || 0,
        type40: item.type40 || item.convtype40 || 0,
        
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
        currency: item.currency || 'USD',
        attribution_type: item.attribution_type || '',
        default_type: item.default_type || 0,
        is_transaction: item.is_transaction || 0
      }))
      
      console.log('Conversões - Dados mapeados:', mappedConversions)
      
      setConversions(mappedConversions)
      setTotalConversions(totalCount)
      
      // Calcular receita total
      const revenue = mappedConversions.reduce((sum: number, conv: Conversion) => 
        sum + (conv.revenue || conv.payout || 0), 0)
      setTotalRevenue(revenue)
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading conversions:', error)
      setConversions([])
      setTotalConversions(0)
      setTotalRevenue(0)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (apiKey) {
      loadConversions()
    }
  }, [apiKey, selectedPeriod, filters])

  const handleRefresh = () => {
    loadConversions(true)
  }

  const handleExport = () => {
    // Implementar exportação de conversões
    console.log('Exportando conversões...')
  }

  const handleApplyFilters = () => {
    setFilters(tempFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      campaign: '',
      type: '',
      country: '',
      status: '',
      device: '',
      os: '',
      browser: '',
      source: '',
      offer: '',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(resetFilters)
    setTempFilters(resetFilters)
  }

  const { currency } = useCurrencyStore()
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Calcular métricas adicionais
  const calculateMetrics = () => {
    if (conversions.length === 0) return {}
    
    const totalPayout = conversions.reduce((sum, conv) => sum + (conv.payout || 0), 0)
    const totalCost = conversions.reduce((sum, conv) => sum + (conv.cost || 0), 0)
    const totalProfit = totalPayout - totalCost
    const avgTicket = totalPayout / conversions.length
    
    // Contar por status
    const statusCounts = conversions.reduce((acc, conv) => {
      const status = conv.status || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Contar por dispositivo
    const deviceCounts = conversions.reduce((acc, conv) => {
      const device = conv.device || 'unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Contar por país
    const countryCounts = conversions.reduce((acc, conv) => {
      const country = conv.country || 'unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Análise de Sub-IDs (Direct Response)
    const subIdAnalysis = conversions.reduce((acc, conv) => {
      // Analisar Sub1 (geralmente Ad ID)
      if (conv.sub1) {
        acc.sub1Counts[conv.sub1] = (acc.sub1Counts[conv.sub1] || 0) + 1
      }
      // Analisar Sub4 (geralmente Ad Name)
      if (conv.sub4) {
        acc.sub4Counts[conv.sub4] = (acc.sub4Counts[conv.sub4] || 0) + 1
      }
      // Analisar Sub5 (geralmente Ad Set Name)
      if (conv.sub5) {
        acc.sub5Counts[conv.sub5] = (acc.sub5Counts[conv.sub5] || 0) + 1
      }
      // Analisar Sub6 (geralmente Campaign Name)
      if (conv.sub6) {
        acc.sub6Counts[conv.sub6] = (acc.sub6Counts[conv.sub6] || 0) + 1
      }
      // Analisar Sub7 (geralmente Placement)
      if (conv.sub7) {
        acc.sub7Counts[conv.sub7] = (acc.sub7Counts[conv.sub7] || 0) + 1
      }
      return acc
    }, {
      sub1Counts: {} as Record<string, number>,
      sub4Counts: {} as Record<string, number>,
      sub5Counts: {} as Record<string, number>,
      sub6Counts: {} as Record<string, number>,
      sub7Counts: {} as Record<string, number>
    })
    
    // Análise de ConvTypes (Direct Response)
    const convTypeAnalysis = conversions.reduce((acc, conv) => {
      // Contar ConvTypes ativos
      for (let i = 1; i <= 40; i++) {
        const typeKey = `type${i}` as keyof Conversion
        const value = Number(conv[typeKey])
        if (value > 0) {
          acc.activeTypes.push(i)
          acc.typeCounts[i] = (acc.typeCounts[i] || 0) + value
        }
      }
      return acc
    }, {
      activeTypes: [] as number[],
      typeCounts: {} as Record<number, number>
    })
    
    // Análise de Fingerprints (Fraude/Qualidade)
    const fingerprintAnalysis = conversions.reduce((acc, conv) => {
      if (conv.fingerprint) {
        acc.fingerprintCounts[conv.fingerprint] = (acc.fingerprintCounts[conv.fingerprint] || 0) + 1
      }
      if (conv.duplicate_status > 0) {
        acc.duplicateCount++
      }
      return acc
    }, {
      fingerprintCounts: {} as Record<string, number>,
      duplicateCount: 0
    })
    
    return {
      totalPayout,
      totalCost,
      totalProfit,
      avgTicket,
      statusCounts,
      deviceCounts,
      countryCounts,
      subIdAnalysis,
      convTypeAnalysis,
      fingerprintAnalysis
    }
  }

  const metrics = calculateMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trackview-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Nav Container */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedData(!showAdvancedData)}
            className="px-4 py-2 rounded-xl border border-gray-400 text-gray-700 font-semibold bg-white shadow-lg hover:bg-gray-100 transition"
          >
            {showAdvancedData ? <Eye className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
            {showAdvancedData ? 'Dados Básicos' : 'Dados Avançados'}
          </Button>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleExport}
            className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Campanha
              </label>
              <Input 
                type="text"
                placeholder="Todas as campanhas"
                value={tempFilters.campaign}
                onChange={(e) => setTempFilters(prev => ({ ...prev, campaign: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo
              </label>
              <select
                value={tempFilters.type}
                onChange={(e) => setTempFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="lead">Lead</option>
                <option value="sale">Venda</option>
                <option value="upsell">Upsell</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                País
              </label>
              <Input 
                type="text"
                placeholder="Todos os países"
                value={tempFilters.country}
                onChange={(e) => setTempFilters(prev => ({ ...prev, country: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <select
                value={tempFilters.status}
                onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">Todos os status</option>
                <option value="approved">Aprovado</option>
                <option value="pending">Pendente</option>
                <option value="declined">Rejeitado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Dispositivo
              </label>
              <Input 
                type="text"
                placeholder="Todos os dispositivos"
                value={tempFilters.device}
                onChange={(e) => setTempFilters(prev => ({ ...prev, device: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sistema Operacional
              </label>
              <Input 
                type="text"
                placeholder="Todos os SOs"
                value={tempFilters.os}
                onChange={(e) => setTempFilters(prev => ({ ...prev, os: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Navegador
              </label>
              <Input 
                type="text"
                placeholder="Todos os navegadores"
                value={tempFilters.browser}
                onChange={(e) => setTempFilters(prev => ({ ...prev, browser: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Fonte
              </label>
              <Input 
                type="text"
                placeholder="Todas as fontes"
                value={tempFilters.source}
                onChange={(e) => setTempFilters(prev => ({ ...prev, source: e.target.value }))}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Conversões</p>
              <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalPayout || 0)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalConversions > 0 ? formatCurrency(metrics.avgTicket || 0) : formatCurrency(0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalProfit || 0)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Conversions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Lista de Conversões {showAdvancedData && '(Modo Avançado)'}
          </h2>
        </div>

        {conversions.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">✅ API conectada com sucesso!</p>
            <p className="text-gray-400 text-sm mt-2">Sua conta trial ainda não possui conversões registradas.</p>
            <p className="text-gray-400 text-sm mt-1">Crie campanhas e comece a rastrear conversões para ver dados aqui.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campanha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    País
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  {showAdvancedData && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispositivo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OS
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Navegador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                    </>
                  )}
                  {showAdvancedData && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispositivo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OS
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Navegador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                    </>
                  )}
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversions.map((conversion) => (
                  <tr key={conversion.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(conversion.date)}
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {conversion.campaign}
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conversion.type === 'sale' ? 'bg-green-100 text-green-800' :
                        conversion.type === 'lead' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {conversion.type}
                    </span>
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {conversion.country}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {conversion.source}
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conversion.status === 'approved' ? 'bg-green-100 text-green-800' :
                        conversion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {conversion.status || 'N/A'}
                    </span>
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(conversion.revenue || conversion.payout || 0)}
                  </td>
                  {showAdvancedData && (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.device || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.os || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.browser || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.ip || 'N/A'}
                      </td>
                    </>
                  )}
                  {showAdvancedData && (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.device || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.os || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.browser || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.ip || 'N/A'}
                      </td>
                    </>
                  )}
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </motion.div>

      {/* Dados Avançados - Debug */}
      {showAdvancedData && conversions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Dados Avançados (Debug)</h2>
            <p className="text-sm text-gray-600">Todos os campos disponíveis do RedTrack</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primeira conversão como exemplo */}
              {conversions.slice(0, 1).map((conv, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Exemplo de Conversão #{index + 1}</h3>
                  
                  <div className="space-y-2">
                    <div className="text-xs">
                      <strong>ID:</strong> {conv.id}
                    </div>
                    <div className="text-xs">
                      <strong>Click ID:</strong> {conv.click_id}
                    </div>
                    <div className="text-xs">
                      <strong>Campaign ID:</strong> {conv.campaign_id}
                    </div>
                    <div className="text-xs">
                      <strong>Offer ID:</strong> {conv.offer_id}
                    </div>
                    <div className="text-xs">
                      <strong>Source ID:</strong> {conv.source_id}
                    </div>
                    <div className="text-xs">
                      <strong>Program ID:</strong> {conv.program_id}
                    </div>
                    <div className="text-xs">
                      <strong>Landing ID:</strong> {conv.landing_id}
                    </div>
                    <div className="text-xs">
                      <strong>Prelanding ID:</strong> {conv.prelanding_id}
                    </div>
                    <div className="text-xs">
                      <strong>Network:</strong> {conv.network}
                    </div>
                    <div className="text-xs">
                      <strong>Event:</strong> {conv.event}
                    </div>
                    <div className="text-xs">
                      <strong>Fingerprint:</strong> {conv.fingerprint}
                    </div>
                    <div className="text-xs">
                      <strong>Deduplicate Token:</strong> {conv.deduplicate_token}
                    </div>
                    <div className="text-xs">
                      <strong>Duplicate Status:</strong> {conv.duplicate_status}
                    </div>
                    <div className="text-xs">
                      <strong>Landing:</strong> {conv.landing}
                    </div>
                    <div className="text-xs">
                      <strong>Prelanding:</strong> {conv.prelanding}
                    </div>
                    <div className="text-xs">
                      <strong>Deeplink:</strong> {conv.deeplink}
                    </div>
                    <div className="text-xs">
                      <strong>Referer:</strong> {conv.referer}
                    </div>
                    <div className="text-xs">
                      <strong>Page:</strong> {conv.page}
                    </div>
                    <div className="text-xs">
                      <strong>Page URL:</strong> {conv.page_url}
                    </div>
                    <div className="text-xs">
                      <strong>User Agent:</strong> {conv.user_agent}
                    </div>
                    <div className="text-xs">
                      <strong>Currency:</strong> {conv.currency}
                    </div>
                    <div className="text-xs">
                      <strong>Attribution Type:</strong> {conv.attribution_type}
                    </div>
                    <div className="text-xs">
                      <strong>Is Transaction:</strong> {conv.is_transaction}
                    </div>
                    <div className="text-xs">
                      <strong>Default Type:</strong> {conv.default_type}
                    </div>
                    <div className="text-xs">
                      <strong>Order:</strong> {conv.order}
                    </div>
                    <div className="text-xs">
                      <strong>Coupon:</strong> {conv.coupon}
                    </div>
                    <div className="text-xs">
                      <strong>Ref ID:</strong> {conv.ref_id}
                    </div>
                    <div className="text-xs">
                      <strong>External ID:</strong> {conv.external_id}
                    </div>
                    <div className="text-xs">
                      <strong>Server:</strong> {conv.server}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Seção de Sub-IDs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Sub-IDs (Parâmetros Personalizados)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {conversions.slice(0, 1).map((conv, index) => (
                    <div key={index} className="space-y-2">
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                        const subKey = `sub${num}` as keyof Conversion;
                        const value = conv[subKey];
                        if (value) {
                          return (
                            <div key={num} className="text-xs">
                              <strong>Sub{num}:</strong> {String(value)}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Seção de ConvTypes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">ConvTypes (Tipos de Conversão)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {conversions.slice(0, 1).map((conv, index) => (
                    <div key={index} className="space-y-2">
                      {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => {
                        const typeKey = `type${num}` as keyof Conversion;
                        const value = conv[typeKey];
                        if (value && Number(value) > 0) {
                          return (
                            <div key={num} className="text-xs">
                              <strong>Type{num}:</strong> {String(value)}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Seção de RedTrack Specific */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">RedTrack Specific</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {conversions.slice(0, 1).map((conv, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-xs">
                        <strong>RT Source:</strong> {conv.rt_source}
                      </div>
                      <div className="text-xs">
                        <strong>RT Medium:</strong> {conv.rt_medium}
                      </div>
                      <div className="text-xs">
                        <strong>RT Campaign:</strong> {conv.rt_campaign}
                      </div>
                      <div className="text-xs">
                        <strong>RT Ad Group:</strong> {conv.rt_adgroup}
                      </div>
                      <div className="text-xs">
                        <strong>RT Ad:</strong> {conv.rt_ad}
                      </div>
                      <div className="text-xs">
                        <strong>RT Placement:</strong> {conv.rt_placement}
                      </div>
                      <div className="text-xs">
                        <strong>RT Keyword:</strong> {conv.rt_keyword}
                      </div>
                      <div className="text-xs">
                        <strong>RT Campaign ID:</strong> {conv.rt_campaign_id}
                      </div>
                      <div className="text-xs">
                        <strong>RT Ad Group ID:</strong> {conv.rt_adgroup_id}
                      </div>
                      <div className="text-xs">
                        <strong>RT Ad ID:</strong> {conv.rt_ad_id}
                      </div>
                      <div className="text-xs">
                        <strong>RT Placement ID:</strong> {conv.rt_placement_id}
                      </div>
                      <div className="text-xs">
                        <strong>RT Role 1:</strong> {conv.rt_role_1}
                      </div>
                      <div className="text-xs">
                        <strong>RT Role 2:</strong> {conv.rt_role_2}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Análises de Direct Response */}
      {showAdvancedData && conversions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Análises de Direct Response</h2>
            <p className="text-sm text-gray-600">Métricas específicas para otimização de campanhas</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Análise de Sub-IDs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Análise de Sub-IDs</h3>
                <div className="space-y-2">
                  <div className="text-xs">
                    <strong>Sub1 (Ad ID):</strong> {Object.keys(metrics.subIdAnalysis?.sub1Counts || {}).length} valores únicos
                  </div>
                  <div className="text-xs">
                    <strong>Sub4 (Ad Name):</strong> {Object.keys(metrics.subIdAnalysis?.sub4Counts || {}).length} valores únicos
                  </div>
                  <div className="text-xs">
                    <strong>Sub5 (Ad Set):</strong> {Object.keys(metrics.subIdAnalysis?.sub5Counts || {}).length} valores únicos
                  </div>
                  <div className="text-xs">
                    <strong>Sub6 (Campaign):</strong> {Object.keys(metrics.subIdAnalysis?.sub6Counts || {}).length} valores únicos
                  </div>
                  <div className="text-xs">
                    <strong>Sub7 (Placement):</strong> {Object.keys(metrics.subIdAnalysis?.sub7Counts || {}).length} valores únicos
                  </div>
                </div>
              </div>
              
              {/* Análise de ConvTypes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Análise de ConvTypes</h3>
                <div className="space-y-2">
                  <div className="text-xs">
                    <strong>ConvTypes Ativos:</strong> {metrics.convTypeAnalysis?.activeTypes?.length || 0} tipos
                  </div>
                  <div className="text-xs">
                    <strong>Total de ConvTypes:</strong> {Object.values(metrics.convTypeAnalysis?.typeCounts || {}).reduce((a, b) => a + b, 0)}
                  </div>
                  {metrics.convTypeAnalysis?.activeTypes?.map((type) => (
                    <div key={type} className="text-xs">
                      <strong>Type{type}:</strong> {metrics.convTypeAnalysis?.typeCounts?.[type] || 0}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Análise de Qualidade */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Análise de Qualidade</h3>
                <div className="space-y-2">
                  <div className="text-xs">
                    <strong>Fingerprints Únicos:</strong> {Object.keys(metrics.fingerprintAnalysis?.fingerprintCounts || {}).length}
                  </div>
                  <div className="text-xs">
                    <strong>Conversões Duplicadas:</strong> {metrics.fingerprintAnalysis?.duplicateCount || 0}
                  </div>
                  <div className="text-xs">
                    <strong>Taxa de Duplicação:</strong> {conversions.length > 0 ? ((metrics.fingerprintAnalysis?.duplicateCount || 0) / conversions.length * 100).toFixed(2) : 0}%
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Conversions 