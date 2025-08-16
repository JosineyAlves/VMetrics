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
import CustomSelect from './ui/CustomSelect'

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

  // Calcular métricas básicas
  const calculateMetrics = () => {
    if (conversions.length === 0) return {}
    
    const totalPayout = conversions.reduce((sum, conv) => sum + (conv.payout || 0), 0)
    const totalCost = conversions.reduce((sum, conv) => sum + (conv.cost || 0), 0)
    const totalProfit = totalPayout - totalCost
    const avgTicket = totalPayout / conversions.length
    
    return {
      totalPayout,
      totalCost,
      totalProfit,
      avgTicket
    }
  }

  const metrics = calculateMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vmetrics-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Nav Container */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedData(!showAdvancedData)}
            className="px-4 py-2 rounded-xl border border-[#3cd48f]/30 text-[#1f1f1f] font-semibold bg-white shadow-lg hover:bg-[#3cd48f]/5 transition"
          >
            {showAdvancedData ? <Eye className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
            {showAdvancedData ? 'Dados Básicos' : 'Dados Avançados'}
          </Button>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-xl border border-[#3cd48f]/30 text-[#1f1f1f] font-semibold bg-white shadow-lg hover:bg-[#3cd48f]/5 transition"
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
                className="w-full rounded-xl border-gray-200 focus:border-[#3cd48f] focus:ring-[#3cd48f]/40 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo
              </label>
              <CustomSelect
                value={tempFilters.type}
                onChange={(value) => setTempFilters(prev => ({ ...prev, type: value }))}
                options={[
                  { value: '', label: 'Todos os tipos' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'sale', label: 'Venda' },
                  { value: 'upsell', label: 'Upsell' }
                ]}
                placeholder="Selecione o tipo"
                className="w-full"
              />
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
                className="w-full rounded-xl border-gray-200 focus:border-[#3cd48f] focus:ring-[#3cd48f]/40 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <CustomSelect
                value={tempFilters.status}
                onChange={(value) => setTempFilters(prev => ({ ...prev, status: value }))}
                options={[
                  { value: '', label: 'Todos os status' },
                  { value: 'approved', label: 'Aprovado' },
                  { value: 'pending', label: 'Pendente' },
                  { value: 'declined', label: 'Rejeitado' }
                ]}
                placeholder="Selecione o status"
                className="w-full"
              />
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
                className="w-full rounded-xl border-gray-200 focus:border-[#3cd48f] focus:ring-[#3cd48f]/40 shadow-sm"
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
                className="w-full rounded-xl border-gray-200 focus:border-[#3cd48f] focus:ring-[#3cd48f]/40 shadow-sm"
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
                className="w-full rounded-xl border-gray-200 focus:border-[#3cd48f] focus:ring-[#3cd48f]/40 shadow-sm"
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
                className="w-full rounded-xl border-gray-200 focus:border-[#3cd48f] focus:ring-[#3cd48f]/40 shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handleApplyFilters}
              className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80"
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
                    <div className="p-3 bg-[#3cd48f]/20 rounded-xl">
          <TrendingUp className="w-6 h-6 text-[#3cd48f]" />
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fingerprint
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duplicate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sub1
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sub4
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sub5
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sub6
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sub7
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type1
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RT Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RT Campaign
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RT Ad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RT Placement
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
                        conversion.type === 'lead' ? 'bg-[#3cd48f]/20 text-[#3cd48f]' :
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-mono text-xs" title={conversion.fingerprint}>
                          {conversion.fingerprint ? `${conversion.fingerprint.substring(0, 8)}...` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          conversion.duplicate_status === 0 ? 'bg-green-100 text-green-800' :
                          conversion.duplicate_status === 1 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {conversion.duplicate_status === 0 ? 'OK' : 
                           conversion.duplicate_status === 1 ? 'DUP' : 'DUP+'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-mono text-xs" title={conversion.sub1}>
                          {conversion.sub1 ? `${conversion.sub1.substring(0, 12)}...` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.sub4 || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.sub5 || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className="text-xs" title={conversion.sub6}>
                          {conversion.sub6 ? `${conversion.sub6.substring(0, 15)}...` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.sub7 || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          Number(conversion.type1) > 0 ? 'bg-[#3cd48f]/20 text-[#3cd48f]' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {Number(conversion.type1) > 0 ? Number(conversion.type1) : '0'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.rt_source || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className="text-xs" title={conversion.rt_campaign}>
                          {conversion.rt_campaign ? `${conversion.rt_campaign.substring(0, 15)}...` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.rt_ad || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {conversion.rt_placement || 'N/A'}
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




    </div>
  )
}

export default Conversions 
