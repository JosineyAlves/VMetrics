import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye, 
  Pause, 
  Play,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  BarChart3,
  Target,
  Link,
  Palette,
  Settings
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import { addDays, format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, periodPresets } from '../lib/utils'
import { useDateRangeStore } from '../store/dateRange'
import { useCurrencyStore } from '../store/currency'

interface UTMCreative {
  id: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
  spend: number
  revenue: number
  conversions: number
  clicks: number
  impressions: number
  ctr: number
  cpa: number
  roi: number
}

const mapRedTrackCampaign = (item: any) => ({
  id: item.campaign_id || item.id || item.campaign_id || Math.random().toString(36).slice(2),
  name: item.campaign || item.campaign_name || item.name || item.campaign_name || item.title || 'Campanha sem nome',
  source: item.source || item.traffic_source || item.media_source || '',
  status: item.status || item.campaign_status || 'active',
  spend: item.cost || item.spend || item.campaign_cost || 0,
  revenue: item.revenue || item.campaign_revenue || item.earnings || 0,
  cpa: item.cpa || item.cost_per_acquisition || 0,
  roi: item.roi || item.return_on_investment || 0,
  conversions: item.conversions || item.approved || item.total_conversions || 0,
  clicks: item.clicks || item.total_clicks || 0,
  unique_clicks: item.unique_clicks || 0,
  impressions: item.impressions || item.total_impressions || 0,
  all_conversions: item.all_conversions || 0,
  approved: item.approved || 0,
  pending: item.pending || 0,
  declined: item.declined || 0,
  ctr: item.ctr || 0,
  conversion_rate: item.conversion_rate || 0,
  cpc: item.cpc || 0,
  epc: item.epc || 0,
  epl: item.epl || 0,
  roas: item.roas || 0
})

const Campaigns: React.FC = () => {
  console.log('Montou Campanhas')
  const { apiKey } = useAuthStore()
  const { currency } = useCurrencyStore()
  
  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value)
  }
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [utmCreatives, setUtmCreatives] = useState<UTMCreative[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Carregando campanhas...')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'utm'>('campaigns')
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    source: '',
    minSpend: '',
    maxSpend: '',
    minRoi: '',
    maxRoi: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)
  const { selectedPeriod, customRange } = useDateRangeStore()
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [totalCampaigns, setTotalCampaigns] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Date range picker state
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  // Função utilitária para obter datas do período
  // Atualizar filtros ao selecionar um preset
  const handlePreset = (preset: any) => {
    const range = preset.getRange()
    setDateRange(range)
    setTempFilters(prev => ({ ...prev, dateFrom: range.from, dateTo: range.to }))
    setFilters(prev => ({ ...prev, dateFrom: range.from, dateTo: range.to }))
  }

  // Remover uso de getDateRange e garantir parâmetros obrigatórios na chamada de campanhas
  // Novo fluxo: buscar campanhas usando /api/campaigns que agora retorna dados combinados
  const loadCampaigns = async () => {
    console.log('Chamando loadCampaigns')
    if (!apiKey) {
      console.log('API Key não definida, não vai buscar campanhas')
      return
    }
    
    // Usar getDateRange para obter datas corretas
    const { getDateRange, getCurrentRedTrackDate } = await import('../lib/utils')
    const dateRange = getDateRange(selectedPeriod, customRange)
    
    if (!dateRange.startDate || !dateRange.endDate) {
      console.error('Datas não definidas ou inválidas! startDate:', dateRange.startDate, 'endDate:', dateRange.endDate);
      return;
    }
    
    setLoading(true)
    setLoadingMessage('Carregando campanhas...')
    try {
      const params = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        group_by: 'campaign'
      }
      
      console.log('Campanhas - Parâmetros enviados:', params);
      
      // Log da URL para depuração
      const url = new URL('/api/campaigns', window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString());
        }
      });
      console.log('Campanhas - URL da requisição:', url.toString());
      
      // Log de timezone para debug
      console.log('Campanhas - Timezone UTC - Data atual:', getCurrentRedTrackDate());
      console.log('Campanhas - Timezone UTC - Período selecionado:', selectedPeriod);
      console.log('Campanhas - Timezone UTC - Datas calculadas:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        timezone: 'UTC'
      });
      
      // Chamada para API que agora retorna dados combinados
      const response = await fetch(url.toString());
      const data = await response.json();
      
      console.log('Campanhas - Resposta da API:', data);
      
      // Processar dados de campanhas
      let campaignsArray: any[] = []
      
      if (data && data.campaigns && Array.isArray(data.campaigns)) {
        campaignsArray = data.campaigns.map((item: { id: string; title: string; source_title?: string; status: string; stat?: any }) => {
          const stat = item.stat || {}
          const campaignName = item.title || 'Campanha sem nome'
          
          return {
            id: item.id,
            name: campaignName,
            source: item.source_title || '',
            status: item.status || 'active',
            spend: stat.cost || 0,
            revenue: stat.revenue || 0,
            cpa: stat.cost > 0 && stat.conversions > 0 ? stat.cost / stat.conversions : 0,
            roi: stat.cost > 0 ? ((stat.revenue - stat.cost) / stat.cost) * 100 : 0,
            conversions: stat.conversions || 0,
            clicks: stat.clicks || 0,
            unique_clicks: stat.unique_clicks || 0,
            impressions: stat.impressions || 0,
            all_conversions: stat.all_conversions || 0,
            approved: stat.approved || 0,
            pending: stat.pending || 0,
            declined: stat.declined || 0,
            ctr: stat.ctr || 0,
            conversion_rate: stat.conversion_rate || 0
          }
        })
      }
      
      // Atualizar dados de performance
      if (data && data.performance) {
        setBestCampaigns([
          ...data.performance.campaigns.today,
          ...data.performance.campaigns.yesterday
        ]);
        setBestAds([
          ...data.performance.ads.today,
          ...data.performance.ads.yesterday
        ]);
        setBestOffers([
          ...data.performance.offers.today,
          ...data.performance.offers.yesterday
        ]);
      }
      
      console.log('Campanhas - Campanhas mapeadas:', campaignsArray);
      
      setCampaigns(campaignsArray)
      setTotalCampaigns(campaignsArray.length)
      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para carregar dados de UTM/Creativos
  const loadUTMCreatives = async () => {
    if (!apiKey) {
      console.log('API Key não definida, não vai buscar UTMs')
      return
    }
    const { getDateRange, getCurrentRedTrackDate } = await import('../lib/utils')
    const dateRange = getDateRange(selectedPeriod, customRange)
    if (!dateRange.startDate || !dateRange.endDate) {
      console.error('Datas não definidas ou inválidas! startDate:', dateRange.startDate, 'endDate:', dateRange.endDate);
      return;
    }
    setLoading(true)
    setLoadingMessage('Carregando dados UTM/Criativos...')
    try {
      // Montar parâmetros
      const params: Record<string, string> = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        group_by: 'rt_source,rt_medium,rt_campaign,rt_adgroup,rt_ad,rt_placement',
      }
      // Adicionar filtros de UTM se existirem (usando os campos rt_*)
      if (filters.utm_source) params.rt_source = filters.utm_source
      if (filters.utm_medium) params.rt_medium = filters.utm_medium
      if (filters.utm_campaign) params.rt_campaign = filters.utm_campaign
      if (filters.utm_term) params.rt_adgroup = filters.utm_term
      if (filters.utm_content) params.rt_ad = filters.utm_content
      // Montar URL
      const url = new URL('/api/report', window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString())
        }
      })
      console.log('UTM/Creativos - URL da requisição:', url.toString())
      // Chamada para API
      const response = await fetch(url.toString())
      const data = await response.json()
      console.log('UTM/Creativos - Resposta da API:', data)
      // Mapear resposta para UTMCreative[] usando campos rt_*
      let utmArray: UTMCreative[] = []
      if (data && Array.isArray(data)) {
        utmArray = data.map((item: any) => {
          const stat = item.stat || item // fallback para quando não há stat aninhado
          return {
            id: [item.rt_source, item.rt_medium, item.rt_campaign, item.rt_adgroup, item.rt_ad, item.rt_placement].join('-') || Math.random().toString(36).slice(2),
            utm_source: item.rt_source || '',
            utm_medium: item.rt_medium || '',
            utm_campaign: item.rt_campaign || '',
            utm_term: item.rt_adgroup || '',
            utm_content: item.rt_ad || '',
            spend: stat.cost || 0,
            revenue: stat.revenue || 0,
            conversions: stat.conversions || 0,
            clicks: stat.clicks || 0,
            impressions: stat.impressions || 0,
            ctr: stat.ctr || 0,
            cpa: stat.cost > 0 && stat.conversions > 0 ? stat.cost / stat.conversions : 0,
            roi: stat.cost > 0 ? ((stat.revenue - stat.cost) / stat.cost) * 100 : 0,
          }
        })
      }
      setUtmCreatives(utmArray)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading UTM Creatives:', error)
    } finally {
      setLoading(false)
    }
  }

  // Novos estados para os blocos de performance
  const [bestCampaigns, setBestCampaigns] = useState<any[]>([])
  const [bestAds, setBestAds] = useState<any[]>([])
  const [bestOffers, setBestOffers] = useState<any[]>([])

  // Função utilitária para buscar e ordenar top 3
  const fetchBestPerformers = async (groupBy: string, setter: (data: any[]) => void) => {
    if (!apiKey) return;
    const { getDateRange } = await import('../lib/utils')
    const dateRange = getDateRange(selectedPeriod, customRange)
    const params = {
      api_key: apiKey,
      date_from: dateRange.startDate,
      date_to: dateRange.endDate,
      group_by: groupBy
    }
    const url = new URL('/api/report', window.location.origin)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value.toString())
      }
    })
    try {
      const response = await fetch(url.toString())
      const data = await response.json()
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 3)
        setter(sorted)
      } else {
        setter([])
      }
    } catch {
      setter([])
    }
  }

  // useEffect para carregar dados ao trocar de aba ou filtros
  useEffect(() => {
    if (apiKey) {
      if (activeTab === 'campaigns') {
        loadCampaigns()
      } else if (activeTab === 'utm') {
        loadUTMCreatives()
      }
    }
    // eslint-disable-next-line
  }, [apiKey, selectedPeriod, filters, activeTab, customRange])

  // useEffect para buscar os blocos de performance ao trocar filtros/aba
  useEffect(() => {
    if (activeTab === 'utm' && apiKey) {
      fetchBestPerformers('campaign', setBestCampaigns)
      fetchBestPerformers('ad', setBestAds)
      fetchBestPerformers('offer', setBestOffers)
    }
    // eslint-disable-next-line
  }, [apiKey, selectedPeriod, filters, activeTab, customRange])

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



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-trackview-success/20 text-trackview-success'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-trackview-danger/20 text-trackview-danger'
      default:
        return 'bg-trackview-muted/20 text-trackview-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />
      case 'paused':
        return <Pause className="w-4 h-4" />
      case 'deleted':
        return <Eye className="w-4 h-4" />
      case 'inactive':
        return <Eye className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.status.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filters.status || campaign.status === filters.status
    const matchesSource = !filters.source || campaign.source === filters.source
    const matchesMinSpend = !filters.minSpend || campaign.spend >= parseFloat(filters.minSpend)
    const matchesMaxSpend = !filters.maxSpend || campaign.spend <= parseFloat(filters.maxSpend)
    const matchesMinRoi = !filters.minRoi || campaign.roi >= parseFloat(filters.minRoi)
    const matchesMaxRoi = !filters.maxRoi || campaign.roi <= parseFloat(filters.maxRoi)

    return matchesSearch && matchesStatus && matchesSource && 
           matchesMinSpend && matchesMaxSpend && matchesMinRoi && matchesMaxRoi
  })

  const filteredUTMCreatives = utmCreatives.filter(creative => {
    const matchesSearch = 
      creative.utm_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.utm_medium.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.utm_campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.utm_term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creative.utm_content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesUTMSource = !filters.utm_source || creative.utm_source === filters.utm_source
    const matchesUTMMedium = !filters.utm_medium || creative.utm_medium === filters.utm_medium
    const matchesUTMCampaign = !filters.utm_campaign || creative.utm_campaign === filters.utm_campaign
    const matchesUTMTerm = !filters.utm_term || creative.utm_term === filters.utm_term
    const matchesUTMContent = !filters.utm_content || creative.utm_content === filters.utm_content
    const matchesMinSpend = !filters.minSpend || creative.spend >= parseFloat(filters.minSpend)
    const matchesMaxSpend = !filters.maxSpend || creative.spend <= parseFloat(filters.maxSpend)
    const matchesMinRoi = !filters.minRoi || creative.roi >= parseFloat(filters.minRoi)
    const matchesMaxRoi = !filters.maxRoi || creative.roi <= parseFloat(filters.maxRoi)

    return matchesSearch && matchesUTMSource && matchesUTMMedium && matchesUTMCampaign && 
           matchesUTMTerm && matchesUTMContent && matchesMinSpend && matchesMaxSpend && 
           matchesMinRoi && matchesMaxRoi
  })

  // Calcular métricas
  const totalSpend = activeTab === 'campaigns' 
    ? filteredCampaigns.reduce((sum, c) => sum + c.spend, 0)
    : filteredUTMCreatives.reduce((sum, c) => sum + c.spend, 0)
  const totalRevenue = activeTab === 'campaigns'
    ? filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0)
    : filteredUTMCreatives.reduce((sum, c) => sum + c.revenue, 0)
  const totalConversions = activeTab === 'campaigns'
    ? filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0)
    : filteredUTMCreatives.reduce((sum, c) => sum + c.conversions, 0)
  const averageRoi = activeTab === 'campaigns'
    ? (filteredCampaigns.length > 0 
        ? filteredCampaigns.reduce((sum, c) => sum + c.roi, 0) / filteredCampaigns.length 
        : 0)
    : (filteredUTMCreatives.length > 0
        ? filteredUTMCreatives.reduce((sum, c) => sum + c.roi, 0) / filteredUTMCreatives.length
        : 0)
  const averageCTR = activeTab === 'utm' && filteredUTMCreatives.length > 0
    ? filteredUTMCreatives.reduce((sum, c) => sum + c.ctr, 0) / filteredUTMCreatives.length
    : 0

  // Mensagem amigável se não houver campanhas
  // Mostrar filtros sempre, mesmo sem campanhas
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Nav Container */}
          <div className="flex items-center justify-between mb-4">
      {/* Tabs */}
      <div className="flex space-x-1 bg-trackview-background rounded-lg p-1">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'bg-white text-trackview-primary shadow-sm'
              : 'text-trackview-muted hover:text-trackview-primary'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Campanhas
        </button>
        <button
          onClick={() => setActiveTab('utm')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'utm'
              ? 'bg-white text-trackview-primary shadow-sm'
              : 'text-trackview-muted hover:text-trackview-primary'
          }`}
        >
          <Link className="w-4 h-4 mr-2" />
          UTM / Criativos
        </button>
      </div>

          {/* Botão de filtros alinhado à direita */}
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

      {/* Filtro de período padronizado - sempre visível */}
      <div className="flex items-center justify-between">
        <div className="relative period-dropdown">
        </div>
      </div>
      {/* Filtros Avançados */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-trackview-primary">Filtros Avançados</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Ocultar Filtros
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeTab === 'campaigns' ? (
              <>
                {/* Remover campos de data simples */}
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    Status
                  </label>
                  <select 
                    value={tempFilters.status}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
                  >
                    <option value="">Todos</option>
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    Fonte
                  </label>
                  <select 
                    value={tempFilters.source}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
                  >
                    <option value="">Todas</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Filtros UTM mantidos */}
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Source
                  </label>
                  <select
                    value={tempFilters.utm_source}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
                  >
                    <option value="">Todos</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Medium
                  </label>
                  <select
                    value={tempFilters.utm_medium}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_medium: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
                  >
                    <option value="">Todos</option>
                    <option value="cpc">CPC</option>
                    <option value="cpm">CPM</option>
                    <option value="social">Social</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Campaign
                  </label>
                  <Input 
                    placeholder="Ex: black_friday_2024"
                    value={tempFilters.utm_campaign}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_campaign: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Term
                  </label>
                  <Input 
                    placeholder="Ex: desconto"
                    value={tempFilters.utm_term}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_term: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-trackview-text mb-2">
                    UTM Content
                  </label>
                  <Input
                    placeholder="Ex: banner_principal"
                    value={tempFilters.utm_content}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_content: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Spend Mínimo
              </label>
              <Input 
                type="number"
                placeholder="0"
                value={tempFilters.minSpend}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minSpend: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Spend Máximo
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxSpend}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxSpend: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                ROI Mínimo
              </label>
              <Input 
                type="number"
                placeholder="0"
                value={tempFilters.minRoi}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minRoi: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                ROI Máximo
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxRoi}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxRoi: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              variant="primary"
              onClick={() => {
                setFilters(tempFilters)
                setShowFilters(false)
              }}
            >
              Aplicar Filtros
            </Button>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-trackview-muted w-4 h-4" />
          <Input
            placeholder={activeTab === 'campaigns' ? "Buscar campanhas..." : "Buscar UTM/criativos..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Período Dropdown */}
        {/* This div is now handled by PeriodDropdown component */}
      </div>

      {/* Performance Blocks - Mostrar em ambas as abas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Best performing campaigns */}
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <h3 className="font-bold text-blue-700 mb-2">Best performing campaigns (RT):</h3>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Campaign</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {bestCampaigns.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400">No data</td></tr>
              ) : bestCampaigns.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}.</td>
                  <td>{item.name || '-'} </td>
                  <td className="text-right">{formatCurrency(item.revenue || 0)}</td>
                  <td className="text-right">{item.conversions || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Best performing ads */}
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <h3 className="font-bold text-blue-700 mb-2">Best performing ads (RT):</h3>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Ad</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {bestAds.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400">No data</td></tr>
              ) : bestAds.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}.</td>
                  <td>{item.name || '-'} </td>
                  <td className="text-right">{formatCurrency(item.revenue || 0)}</td>
                  <td className="text-right">{item.conversions || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Best offers */}
        <div className="bg-blue-50 rounded-xl p-4 shadow">
          <h3 className="font-bold text-blue-700 mb-2">Best offers:</h3>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Offer</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {bestOffers.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400">No data</td></tr>
              ) : bestOffers.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}.</td>
                  <td>{item.name || '-'}</td>
                  <td className="text-right">{formatCurrency(item.revenue || 0)}</td>
                  <td className="text-right">{item.conversions || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-trackview-accent overflow-hidden"
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-trackview-primary"></div>
                <span className="text-trackview-text">{loadingMessage}</span>
              </div>
              <p className="text-sm text-trackview-muted mt-2">
                Isso pode levar alguns segundos na primeira vez...
              </p>
            </div>
          ) : activeTab === 'campaigns' ? (
            <table className="w-full">
              <thead className="bg-trackview-background">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campanha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliques
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliques Únicos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressões
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversões
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Todas Conversões
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aprovadas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendentes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recusadas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa Conv.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gasto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EPC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EPL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROAS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-trackview-background">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={22} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm || Object.values(filters).some(v => v) ? 
                        'Nenhuma campanha encontrada com os filtros aplicados.' :
                        'Nenhuma campanha encontrada para o período selecionado.'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign, index) => (
                    <motion.tr 
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-trackview-background"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{campaign.source}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1">{campaign.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.clicks.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.unique_clicks.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.impressions.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.conversions.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.all_conversions.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.approved.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.pending.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.declined.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.ctr}%</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.conversion_rate}%</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(campaign.spend)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(campaign.revenue)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.roi}%</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(campaign.cpa)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(campaign.cpc || 0)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(campaign.epc || 0)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(campaign.epl || 0)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{campaign.roas || 0}%</div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div>
              {/* UTM/Criativos Table */}
              {filteredUTMCreatives.length === 0 || filteredUTMCreatives.every(c => !c.utm_source && !c.utm_medium && !c.utm_campaign && !c.utm_term && !c.utm_content) ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhum dado de UTM/Criativos encontrado para o período ou filtros selecionados.<br/>
                  Tente ampliar o período ou revisar os filtros.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-trackview-background">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTM Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTM Medium</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTM Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTM Term</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTM Content</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-trackview-background">
                    {filteredUTMCreatives.map((creative, index) => (
                      <motion.tr 
                        key={creative.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-trackview-background"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_source}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_medium}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_campaign}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_term}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_content}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.conversions.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatCurrency(creative.spend)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatCurrency(creative.revenue)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.roi.toFixed(2)}%</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </motion.div>
            </div>
  )
}

export default Campaigns 