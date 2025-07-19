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
  Palette
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import { addDays, format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, periodPresets } from '../lib/utils'

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
  impressions: item.impressions || item.total_impressions || 0
})

const Campaigns: React.FC = () => {
  console.log('Montou Campanhas')
  const { apiKey } = useAuthStore()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [utmCreatives, setUtmCreatives] = useState<UTMCreative[]>([])
  const [loading, setLoading] = useState(true)
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
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [totalCampaigns, setTotalCampaigns] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Date range picker state
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  // Remover periodOptions, periodPresets, getPeriodLabel, getDateRange antigos se não forem mais usados

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
      
      // Processar dados que já vêm com title correto
      let campaignsArray: any[] = []
      
      if (data && Array.isArray(data)) {
        campaignsArray = data.map(item => {
          const stat = item.stat || {}
          
          return {
            id: item.id,
            name: item.title || 'Campanha sem nome',
            source: item.source_title || '',
            status: item.status || 'active',
            spend: stat.cost || 0,
            revenue: stat.revenue || 0,
            cpa: stat.cost > 0 && stat.conversions > 0 ? stat.cost / stat.conversions : 0,
            roi: stat.cost > 0 ? ((stat.revenue - stat.cost) / stat.cost) * 100 : 0,
            conversions: stat.conversions || 0,
            clicks: stat.clicks || 0,
            impressions: stat.impressions || 0
          }
        })
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

  useEffect(() => {
    console.log('useEffect - apiKey:', apiKey, 'selectedPeriod:', selectedPeriod, 'filters:', filters);
    if (apiKey) {
      loadCampaigns()
    } else {
      console.log('API Key não definida no useEffect')
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
    if (period !== 'custom') {
      setCustomRange({ from: '', to: '' })
    }
    // Atualizar filtros para buscar campanhas
    // O cálculo do range já é feito no onChange do PeriodDropdown
    // Esta função pode ser removida ou mantida apenas para compatibilidade
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-trackview-success/20 text-trackview-success'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
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
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Campanhas & UTM
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
            Gerencie campanhas e analise performance por UTM
          </p>
        </div>
        <div className="flex items-center space-x-3">
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
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-trackview-background rounded-lg p-1 mb-4">
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

      {/* Filtro de período padronizado - sempre visível */}
      <div className="flex items-center justify-between">
        <div className="relative period-dropdown">
        <PeriodDropdown
          value={selectedPeriod}
          customRange={customRange}
          onChange={(period, custom) => {
            setSelectedPeriod(period);
              const dateRange = getDateRange(period, custom);
            if (period === 'custom' && custom) {
              setCustomRange(custom);
            } else {
                setCustomRange({ from: '', to: '' });
            }
              setFilters(prev => ({
                ...prev,
                dateFrom: dateRange.startDate,
                dateTo: dateRange.endDate,
              }));
          }}
            presets={periodPresets}
        />
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

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-trackview-accent overflow-hidden"
      >
        <div className="overflow-x-auto">
          {activeTab === 'campaigns' ? (
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
                    Conversões
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-trackview-background">
                {filteredCampaigns.map((campaign, index) => (
                  <motion.tr 
                    key={campaign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
                      <div className="text-sm text-gray-900">{campaign.conversions.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${campaign.spend.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${campaign.revenue.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.roi}%</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${campaign.cpa}</div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-trackview-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Medium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    UTM Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    CPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-trackview-primary uppercase tracking-wider">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-trackview-background">
                {filteredUTMCreatives.map((creative, index) => (
                  <motion.tr 
                    key={creative.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-trackview-background"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-trackview-primary capitalize">
                        {creative.utm_source}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text uppercase">
                        {creative.utm_medium}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        {creative.utm_campaign}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        {creative.utm_term}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        {creative.utm_content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-primary">
                        ${creative.spend.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-primary">
                        ${creative.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        {creative.ctr}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-trackview-text">
                        ${creative.cpa}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {creative.roi > 100 ? (
                          <TrendingUp className="w-4 h-4 text-trackview-success mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-trackview-danger mr-1" />
                        )}
                        <span className={`text-sm font-medium ${creative.roi > 100 ? 'text-trackview-success' : 'text-trackview-danger'}`}>
                          {creative.roi}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
            </div>
  )
}

export default Campaigns 