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
import { useDateRangeStore } from '../store/dateRange'
import { useCurrencyStore } from '../store/currency'
import ColumnsSelector from './ColumnsSelector'
import ColumnsOrder from './ColumnsOrder'
import { useColumnsStore } from '../store/columns'

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



const mapRedTrackCampaign = (item: any) => {
  // Acessar dados do objeto stat se disponível
  const stat = item.stat || {};
  

  
  const mappedCampaign = {
    id: item.campaign_id || item.id || item.campaign_id || Math.random().toString(36).slice(2),
    name: item.campaign || item.campaign_name || item.name || item.campaign_name || item.title || 'Campanha sem nome',
    source: item.source || item.traffic_source || item.media_source || item.source_title || '',
    status: item.status || item.campaign_status || 'active',
    spend: stat.cost || item.cost || item.spend || item.campaign_cost || 0,
    revenue: stat.revenue || item.revenue || item.campaign_revenue || item.earnings || 0,
    cpa: stat.cpa || item.cpa || item.cost_per_acquisition || 0,
    roi: stat.roi || item.roi || item.return_on_investment || 0,
    conversions: stat.conversions || item.conversions || item.approved || item.total_conversions || 0,
    clicks: stat.clicks || item.clicks || item.total_clicks || 0,
    unique_clicks: stat.unique_clicks || item.unique_clicks || 0,
    impressions: stat.impressions || item.impressions || item.total_impressions || 0,
    // Usar total_conversions do RedTrack (campo correto)
    all_conversions: stat.total_conversions || (stat.approved || 0) + (stat.pending || 0) + (stat.declined || 0) + (stat.other || 0) || 0,
    approved: stat.approved || item.approved || 0,
    pending: stat.pending || item.pending || 0,
    declined: stat.declined || item.declined || 0,
    ctr: stat.ctr || item.ctr || 0,
    conversion_rate: stat.conversion_rate || item.conversion_rate || 0,
    cpc: stat.cpc || item.cpc || 0,
    epc: stat.epc || item.epc || 0,
    epl: stat.epl || item.epl || 0,
    roas: stat.roas || item.roas || 0,
    // Métricas de funil - usar o mesmo padrão dos outros campos
    prelp_views: stat.prelp_views || 0,
    prelp_clicks: stat.prelp_clicks || 0,
    lp_views: stat.lp_views || 0,
    lp_clicks: stat.lp_clicks || 0,
    // InitiateCheckout usando convtype1 (mesmo padrão do Dashboard)
    initiatecheckout: stat.convtype1 || 0,
    
    // Métricas adicionais importantes do RedTrack
    aov: stat.aov || 0,
    epc_lp: stat.epc_lp || 0,
    epuc: stat.epuc || 0,
    epv: stat.epv || 0,
    lp_clicks_cr: stat.lp_clicks_cr || 0,
    lp_views_cr: stat.lp_views_cr || 0,
    prelp_clicks_cr: stat.prelp_clicks_cr || 0,
    prelp_views_cr: stat.prelp_views_cr || 0,
    impressions_visible: stat.impressions_visible || 0,
    attribution: stat.attribution || 0,
    attribution_rate: stat.attribution_rate || 0,
    baddevice: stat.baddevice || 0,
    baddevice_rate: stat.baddevice_rate || 0,
    datacenter: stat.datacenter || 0,
    datacenter_rate: stat.datacenter_rate || 0,
    transactions: stat.transactions || 0,
    tr: stat.tr || 0
  };
  

  
  return mappedCampaign;
}

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
  
  // Usar o store de colunas
  const { selectedColumns, columnsOrder, availableColumns } = useColumnsStore()
  
  const getVisibleColumns = () => {
    return columnsOrder
      .filter(columnId => selectedColumns.includes(columnId))
      .map(columnId => availableColumns.find(c => c.id === columnId))
      .filter(Boolean)
  }
  
  // Função para renderizar célula baseada na coluna
  const renderCell = (campaign: any, column: any) => {
    switch (column.id) {
      case 'name':
        return (
          <div className="flex flex-col">
            <div 
              className="text-sm font-semibold text-gray-900 truncate max-w-[180px] cursor-help relative group" 
              title={campaign.name}
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {campaign.name}
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap pointer-events-none max-w-xs">
                {campaign.name}
                <div className="absolute bottom-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )
      case 'source':
        return (
          <div className="text-sm text-gray-600 font-medium">
            {campaign.source}
          </div>
        )
      case 'status':
        return (
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
            {getStatusIcon(campaign.status)}
            <span className="ml-1.5">{campaign.status}</span>
          </span>
        )
      case 'clicks':
        return (
          <div className="text-sm font-semibold text-gray-900">
            {campaign.clicks !== undefined && campaign.clicks > 0 ? campaign.clicks.toLocaleString() : '0'}
          </div>
        )
      case 'unique_clicks':
        return (
          <div className="text-sm font-semibold text-gray-900">
            {campaign.unique_clicks.toLocaleString()}
          </div>
        )
      case 'impressions':
        return (
          <div className="text-sm font-semibold text-gray-900">
            {campaign.impressions.toLocaleString()}
          </div>
        )
      case 'conversions':
        return (
          <div className="text-sm font-bold text-green-700">
            {campaign.conversions !== undefined && campaign.conversions > 0 ? campaign.conversions.toLocaleString() : '0'}
          </div>
        )
      case 'all_conversions':
        return (
          <div className="text-sm font-semibold text-gray-900">
            {campaign.all_conversions !== undefined && campaign.all_conversions > 0 ? campaign.all_conversions.toLocaleString() : '0'}
          </div>
        )
      case 'approved':
        return (
          <div className="text-sm font-semibold text-green-600">
            {campaign.approved.toLocaleString()}
          </div>
        )
      case 'pending':
        return (
          <div className="text-sm font-semibold text-yellow-600">
            {campaign.pending.toLocaleString()}
          </div>
        )
      case 'declined':
        return (
          <div className="text-sm font-semibold text-red-600">
            {campaign.declined.toLocaleString()}
          </div>
        )
      case 'ctr':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {campaign.ctr}%
          </div>
        )
      case 'conversion_rate':
        return (
          <div className="text-sm font-semibold text-green-700">
            {campaign.conversion_rate}%
          </div>
        )
      case 'spend':
        console.log('🔍 [CAMPAIGNS] Renderizando spend:', campaign.spend, 'para campanha:', campaign.name);
        return (
          <div className="text-sm font-semibold text-red-700">
            {campaign.spend !== undefined && campaign.spend > 0 ? formatCurrency(campaign.spend) : 'R$ 0,00'}
          </div>
        )
      case 'revenue':
        return (
          <div className="text-sm font-bold text-green-700">
            {formatCurrency(campaign.revenue)}
          </div>
        )
      case 'roi':
        return (
          <div className={`text-sm font-bold ${campaign.roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {campaign.roi}%
          </div>
        )
      case 'cpa':
        return (
          <div className="text-sm font-semibold text-orange-700">
            {formatCurrency(campaign.cpa)}
          </div>
        )
      case 'cpc':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {formatCurrency(campaign.cpc || 0)}
          </div>
        )
      case 'epc':
        return (
          <div className="text-sm font-semibold text-green-700">
            {formatCurrency(campaign.epc || 0)}
          </div>
        )
      case 'epl':
        return (
          <div className="text-sm font-semibold text-green-700">
            {formatCurrency(campaign.epl || 0)}
          </div>
        )
      case 'roas':
        return (
          <div className={`text-sm font-bold ${(campaign.roas || 0) >= 100 ? 'text-green-700' : 'text-orange-700'}`}>
            {campaign.roas || 0}%
          </div>
        )
      case 'prelp_views':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {campaign.prelp_views !== undefined ? campaign.prelp_views.toLocaleString() : '0'}
          </div>
        )
      case 'prelp_clicks':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {campaign.prelp_clicks !== undefined ? campaign.prelp_clicks.toLocaleString() : '0'}
          </div>
        )
      case 'lp_views':
        return (
          <div className="text-sm font-semibold text-indigo-600">
            {campaign.lp_views !== undefined ? campaign.lp_views.toLocaleString() : '0'}
          </div>
        )
      case 'lp_clicks':
        return (
          <div className="text-sm font-semibold text-indigo-700">
            {campaign.lp_clicks !== undefined ? campaign.lp_clicks.toLocaleString() : '0'}
          </div>
        )
      case 'initiatecheckout':
        return (
          <div className="text-sm font-bold text-orange-600">
            {campaign.initiatecheckout !== undefined ? campaign.initiatecheckout.toLocaleString() : '0'}
          </div>
        )
      case 'aov':
        return (
          <div className="text-sm font-semibold text-green-700">
            {formatCurrency(campaign.aov || 0)}
          </div>
        )
      case 'epc_lp':
        return (
          <div className="text-sm font-semibold text-green-700">
            {formatCurrency(campaign.epc_lp || 0)}
          </div>
        )
      case 'epuc':
        return (
          <div className="text-sm font-semibold text-green-700">
            {formatCurrency(campaign.epuc || 0)}
          </div>
        )
      case 'epv':
        return (
          <div className="text-sm font-semibold text-green-700">
            {formatCurrency(campaign.epv || 0)}
          </div>
        )
      case 'lp_clicks_cr':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {(campaign.lp_clicks_cr || 0).toFixed(2)}%
          </div>
        )
      case 'lp_views_cr':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {(campaign.lp_views_cr || 0).toFixed(2)}%
          </div>
        )
      case 'prelp_clicks_cr':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {(campaign.prelp_clicks_cr || 0).toFixed(2)}%
          </div>
        )
      case 'prelp_views_cr':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {(campaign.prelp_views_cr || 0).toFixed(2)}%
          </div>
        )
      case 'impressions_visible':
        return (
          <div className="text-sm font-semibold text-[#3cd48f]">
            {campaign.impressions_visible !== undefined ? campaign.impressions_visible.toLocaleString() : '0'}
          </div>
        )
      case 'transactions':
        return (
          <div className="text-sm font-semibold text-green-600">
            {campaign.transactions !== undefined ? campaign.transactions.toLocaleString() : '0'}
          </div>
        )
      case 'tr':
        return (
          <div className="text-sm font-semibold text-green-700">
            {(campaign.tr || 0).toFixed(2)}%
          </div>
        )
      case 'attribution':
        return (
          <div className="text-sm font-semibold text-purple-600">
            {campaign.attribution !== undefined ? campaign.attribution.toLocaleString() : '0'}
          </div>
        )
      case 'attribution_rate':
        return (
          <div className="text-sm font-semibold text-purple-700">
            {(campaign.attribution_rate || 0).toFixed(2)}%
          </div>
        )
      case 'baddevice':
        return (
          <div className="text-sm font-semibold text-red-600">
            {campaign.baddevice !== undefined ? campaign.baddevice.toLocaleString() : '0'}
          </div>
        )
      case 'baddevice_rate':
        return (
          <div className="text-sm font-semibold text-red-700">
            {(campaign.baddevice_rate || 0).toFixed(2)}%
          </div>
        )
      case 'datacenter':
        return (
          <div className="text-sm font-semibold text-orange-600">
            {campaign.datacenter !== undefined ? campaign.datacenter.toLocaleString() : '0'}
          </div>
        )
      case 'datacenter_rate':
        return (
          <div className="text-sm font-semibold text-orange-700">
            {(campaign.datacenter_rate || 0).toFixed(2)}%
          </div>
        )
      default:
        return <div className="text-sm text-gray-500">-</div>
    }
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
    utm_content: '',
    minConversions: '',
    minRevenue: ''
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
          // Usar a função mapRedTrackCampaign que inclui as métricas de funil
          return mapRedTrackCampaign(item)
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

  // Função para carregar dados de RT Campaign, RT Adgroup, RT Ad baseados em conversões
  const loadUTMCreatives = async () => {
    if (!apiKey) {
      console.log('API Key não definida, não vai buscar dados RT')
      return
    }
    const { getDateRange, getCurrentRedTrackDate } = await import('../lib/utils')
    const dateRange = getDateRange(selectedPeriod, customRange)
    if (!dateRange.startDate || !dateRange.endDate) {
      console.error('Datas não definidas ou inválidas! startDate:', dateRange.startDate, 'endDate:', dateRange.endDate);
      return;
    }
    setLoading(true)
    setLoadingMessage('Carregando dados RT Campaign/Adgroup/Ad...')
    try {
      // Buscar conversões com dados RT
      const params: Record<string, string> = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        per: '10000', // Máximo para obter mais dados
      }
      
      // Montar URL para buscar conversões
      const url = new URL('/api/conversions', window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString())
        }
      })
      console.log('RT Data - URL da requisição:', url.toString())
      
      // Chamada para API
      const response = await fetch(url.toString())
      const data = await response.json()
      console.log('RT Data - Resposta da API:', data)
      
      // Processar conversões para extrair dados RT
      let rtArray: UTMCreative[] = []
      if (data && data.items && Array.isArray(data.items)) {
        // Agrupar por RT Campaign, RT Adgroup, RT Ad
        const rtMap = new Map()
        
        data.items.forEach((conversion: any) => {
          // Filtrar apenas conversões aprovadas
          const status = conversion.status || conversion.approval_status || ''
          if (status !== 'APPROVED') {
            return
          }
          
          // Criar chave única para agrupamento
          const rtCampaign = conversion.rt_campaign || 'Unknown Campaign'
          const rtAdgroup = conversion.rt_adgroup || 'Unknown Adgroup'
          const rtAd = conversion.rt_ad || 'Unknown Ad'
          const key = `${rtCampaign}-${rtAdgroup}-${rtAd}`
          
          if (!rtMap.has(key)) {
            rtMap.set(key, {
              id: key,
              utm_source: conversion.rt_source || '',
              utm_medium: conversion.rt_medium || '',
              utm_campaign: rtCampaign,
              utm_term: rtAdgroup,
              utm_content: rtAd,
              spend: 0, // Não temos dados de custo por conversão
              revenue: 0,
              conversions: 0,
              clicks: 0,
              impressions: 0,
              ctr: 0,
              cpa: 0,
              roi: 0,
            })
          }
          
          const rtData = rtMap.get(key)
          rtData.revenue += parseFloat(conversion.payout || 0)
          rtData.conversions += 1
        })
        
        // Converter para array e calcular métricas
        rtArray = Array.from(rtMap.values()).map(item => ({
          ...item,
          cpa: item.conversions > 0 ? item.spend / item.conversions : 0,
          roi: item.spend > 0 ? ((item.revenue - item.spend) / item.spend) * 100 : 0,
        })).sort((a, b) => b.conversions - a.conversions) // Ordenar por conversões
      }
      
      setUtmCreatives(rtArray)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading RT data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Novos estados para os blocos de performance
  const [bestCampaigns, setBestCampaigns] = useState<any[]>([])
  const [bestAds, setBestAds] = useState<any[]>([])
  const [bestOffers, setBestOffers] = useState<any[]>([])
  const [performanceLoading, setPerformanceLoading] = useState(false)

  // Função para buscar dados de performance baseados em conversões
  const fetchPerformanceData = async (forceRefresh = false) => {
    if (!apiKey) return;
    
    setPerformanceLoading(true)
    
    const { getDateRange } = await import('../lib/utils')
    const dateRange = getDateRange(selectedPeriod, customRange)
    
    if (!dateRange.startDate || !dateRange.endDate) {
      console.error('Datas não definidas para buscar performance');
      setPerformanceLoading(false)
      return;
    }
    
    try {
      console.log('🔍 [CAMPAIGNS] Buscando dados de performance...');
      console.log(`📅 Período: ${dateRange.startDate} até ${dateRange.endDate}`);
      
      // Adicionar timestamp para forçar refresh se necessário
      const params: any = {
      date_from: dateRange.startDate,
        date_to: dateRange.endDate
      }
      
      if (forceRefresh) {
        params._t = Date.now(); // Força refresh ignorando cache
        console.log('🔄 [CAMPAIGNS] Forçando refresh dos dados...');
      }
      
      const api = new RedTrackAPI(apiKey)
      const data = await api.getPerformanceData(params)
      
      if (data && data.campaigns) {
        setBestCampaigns(data.campaigns.slice(0, 3))
      }
      if (data && data.ads) {
        setBestAds(data.ads.slice(0, 3))
      }
      if (data && data.offers) {
        setBestOffers(data.offers.slice(0, 3))
      }
      
      console.log('✅ [CAMPAIGNS] Dados de performance carregados:', data);
    } catch (error) {
      console.error('❌ [CAMPAIGNS] Erro ao buscar dados de performance:', error);
      setBestCampaigns([])
      setBestAds([])
      setBestOffers([])
    } finally {
      setPerformanceLoading(false)
    }
  }

  // useEffect unificado para carregar dados sincronizados
  useEffect(() => {
    if (apiKey) {
      console.log('🔄 [CAMPAIGNS] Carregando dados sincronizados...')
      
      // Função para carregar todos os dados de forma sincronizada
      const loadAllData = async () => {
        try {
          // Carregar dados de campanhas/UTM primeiro
      if (activeTab === 'campaigns') {
            await loadCampaigns()
      } else if (activeTab === 'utm') {
            await loadUTMCreatives()
          }
          
          // Aguardar um pouco para garantir que os dados foram processados
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Carregar dados de performance com as mesmas datas
          await fetchPerformanceData(true) // Forçar refresh para garantir sincronização
          
          console.log('✅ [CAMPAIGNS] Todos os dados carregados com sucesso')
        } catch (error) {
          console.error('❌ [CAMPAIGNS] Erro ao carregar dados:', error)
        }
      }
      
      loadAllData()
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
        return 'bg-vmetrics-success/20 text-vmetrics-success'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-vmetrics-danger/20 text-vmetrics-danger'
      default:
                  return 'bg-vmetrics-muted/20 text-vmetrics-muted'
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

    return matchesSearch && matchesStatus && matchesSource
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
    const matchesMinConversions = !filters.minConversions || creative.conversions >= parseFloat(filters.minConversions)
    const matchesMinRevenue = !filters.minRevenue || creative.revenue >= parseFloat(filters.minRevenue)

    return matchesSearch && matchesUTMSource && matchesUTMMedium && matchesUTMCampaign && 
           matchesUTMTerm && matchesUTMContent && matchesMinConversions && matchesMinRevenue
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
      {/* Tabs */}
        <div className="flex space-x-1 bg-vmetrics-background rounded-lg p-1 w-full sm:w-auto">
        <button
          onClick={() => setActiveTab('campaigns')}
            className={`flex items-center px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
            activeTab === 'campaigns'
              ? 'bg-white text-vmetrics-primary shadow-sm'
              : 'text-vmetrics-muted hover:text-vmetrics-primary'
          }`}
        >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Campanhas</span>
            <span className="xs:hidden">Camp.</span>
        </button>
        <button
          onClick={() => setActiveTab('utm')}
            className={`flex items-center px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
            activeTab === 'utm'
              ? 'bg-white text-vmetrics-primary shadow-sm'
              : 'text-vmetrics-muted hover:text-vmetrics-primary'
          }`}
        >
            <Link className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">RT Campaign/Ad</span>
            <span className="xs:hidden">RT</span>
        </button>
      </div>

          {/* Botões de controle alinhados à direita */}
          <div className="flex gap-2">
            {activeTab === 'campaigns' && (
              <>
                <ColumnsSelector />
                <ColumnsOrder />
              </>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 sm:px-4 py-2 rounded-xl border border-gray-400 text-gray-700 font-semibold bg-white shadow-lg hover:bg-gray-100 transition text-xs sm:text-sm"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
              <span className="hidden xs:inline">Filtros</span>
              <span className="xs:hidden">Filt.</span>
            </Button>
          </div>
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
          className="bg-white rounded-xl p-6 shadow-sm border border-vmetrics-accent"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-vmetrics-primary">Filtros Avançados</h3>
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
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    Status
                  </label>
                  <select 
                    value={tempFilters.status}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-vmetrics-text"
                  >
                    <option value="">Todos</option>
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    Fonte
                  </label>
                  <select 
                    value={tempFilters.source}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-vmetrics-text"
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
                {/* Filtros RT Campaign/Ad */}
                <div>
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    RT Source
                  </label>
                  <select
                    value={tempFilters.utm_source}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-vmetrics-text"
                  >
                    <option value="">Todos</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    RT Medium
                  </label>
                  <select
                    value={tempFilters.utm_medium}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_medium: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-vmetrics-text"
                  >
                    <option value="">Todos</option>
                    <option value="cpc">CPC</option>
                    <option value="cpm">CPM</option>
                    <option value="social">Social</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    RT Campaign
                  </label>
                  <Input 
                    placeholder="Ex: black_friday_2024"
                    value={tempFilters.utm_campaign}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_campaign: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    RT Adgroup
                  </label>
                  <Input 
                    placeholder="Ex: desconto"
                    value={tempFilters.utm_term}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_term: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    RT Ad
                  </label>
                  <Input
                    placeholder="Ex: banner_principal"
                    value={tempFilters.utm_content}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, utm_content: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                {/* Filtros adicionais para RT Campaign/Ad */}
                <div>
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    Conversões Mínimas
                  </label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={tempFilters.minConversions}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, minConversions: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-vmetrics-text mb-2">
                    Receita Mínima
                  </label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={tempFilters.minRevenue}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, minRevenue: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </>
            )}
            

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vmetrics-muted w-4 h-4" />
          <Input
            placeholder={activeTab === 'campaigns' ? "Buscar campanhas..." : "Buscar RT Campaign/Ad..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Período Dropdown */}
        {/* This div is now handled by PeriodDropdown component */}
      </div>

      {/* Performance Blocks - Layout Responsivo - Apenas na aba Campanhas */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Best performing campaigns */}
        <div className="bg-gradient-to-br from-[#3cd48f]/10 to-[#3cd48f]/20 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-[#3cd48f]/20">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
                          <h3 className="font-bold text-[#1f1f1f] text-sm lg:text-lg">🏆 Top Campanhas</h3>
            <div className="flex items-center space-x-1 lg:space-x-2">
                              <div className="bg-[#3cd48f]/30 rounded-full px-2 lg:px-3 py-1 text-xs font-semibold text-[#3cd48f]">
                {bestCampaigns.length} encontradas
              </div>
              <button
                onClick={() => fetchPerformanceData(true)}
                disabled={performanceLoading}
                                  className="p-1 hover:bg-[#3cd48f]/30 rounded-full transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                {performanceLoading ? (
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-[#3cd48f] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-[#3cd48f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2 lg:space-y-3">
            {performanceLoading ? (
              <div className="text-center text-gray-500 py-3 lg:py-4">
                <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-b-2 border-[#3cd48f] mx-auto mb-2"></div>
                <div className="text-xs lg:text-sm">Carregando dados...</div>
              </div>
            ) : bestCampaigns.length === 0 ? (
              <div className="text-center text-gray-500 py-3 lg:py-4">
                <div className="text-xl lg:text-2xl mb-2">📊</div>
                <div className="text-xs lg:text-sm">Nenhuma campanha encontrada</div>
              </div>
              ) : bestCampaigns.map((item, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-[#3cd48f]/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                      <div className="font-semibold text-[#1f1f1f] text-xs lg:text-sm truncate">
                        {item.name || 'Campanha sem nome'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <div className="text-sm lg:text-lg font-bold text-green-600">
                      {formatCurrency(item.revenue || 0)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Conversões:</span>
                                            <span className="font-semibold text-[#3cd48f]">{item.conversions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPA:</span>
                                            <span className="font-semibold text-[#3cd48f]">
                      {item.conversions > 0 ? formatCurrency((item.cost || 0) / item.conversions) : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI:</span>
                    <span className={`font-semibold ${item.cost > 0 ? ((item.revenue - item.cost) / item.cost) * 100 >= 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-600'}`}>
                      {item.cost > 0 ? `${((item.revenue - item.cost) / item.cost * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        </div>

        {/* Best performing ads */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-green-200">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h3 className="font-bold text-green-800 text-sm lg:text-lg">🎯 Top Anúncios</h3>
            <div className="flex items-center space-x-1 lg:space-x-2">
              <div className="bg-green-200 rounded-full px-2 lg:px-3 py-1 text-xs font-semibold text-green-800">
                {bestAds.length} encontrados
              </div>
              <button
                onClick={() => fetchPerformanceData(true)}
                disabled={performanceLoading}
                className="p-1 hover:bg-green-200 rounded-full transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                {performanceLoading ? (
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-green-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2 lg:space-y-3">
            {performanceLoading ? (
              <div className="text-center text-gray-500 py-3 lg:py-4">
                <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                <div className="text-xs lg:text-sm">Carregando dados...</div>
              </div>
            ) : bestAds.length === 0 ? (
              <div className="text-center text-gray-500 py-3 lg:py-4">
                <div className="text-xl lg:text-2xl mb-2">📊</div>
                <div className="text-xs lg:text-sm">Nenhum anúncio encontrado</div>
              </div>
              ) : bestAds.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                      <div className="font-semibold text-green-900 text-xs lg:text-sm truncate">
                        {item.name || 'Anúncio sem nome'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <div className="text-sm lg:text-lg font-bold text-green-600">
                      {formatCurrency(item.revenue || 0)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Conversões:</span>
                    <span className="font-semibold text-green-600">{item.conversions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPA:</span>
                    <span className="font-semibold text-green-600">
                      {item.conversions > 0 ? formatCurrency((item.cost || 0) / item.conversions) : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI:</span>
                    <span className={`font-semibold ${item.cost > 0 ? ((item.revenue - item.cost) / item.cost) * 100 >= 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-600'}`}>
                      {item.cost > 0 ? `${((item.revenue - item.cost) / item.cost * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        </div>

        {/* Best offers */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-purple-800 text-lg">💎 Top Ofertas</h3>
            <div className="flex items-center space-x-2">
              <div className="bg-purple-200 rounded-full px-3 py-1 text-xs font-semibold text-purple-800">
                {bestOffers.length} encontradas
              </div>
              <button
                onClick={() => fetchPerformanceData(true)}
                disabled={performanceLoading}
                className="p-1 hover:bg-purple-200 rounded-full transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                {performanceLoading ? (
                  <svg className="w-4 h-4 text-purple-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {performanceLoading ? (
              <div className="text-center text-gray-500 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <div className="text-sm">Carregando dados...</div>
              </div>
            ) : bestOffers.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm">Nenhuma oferta encontrada</div>
              </div>
              ) : bestOffers.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="ml-2 lg:ml-3 min-w-0 flex-1">
                      <div className="font-semibold text-purple-900 text-xs lg:text-sm truncate">
                        {item.name || 'Oferta sem nome'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <div className="text-sm lg:text-lg font-bold text-purple-600">
                      #{idx + 1}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Conversões:</span>
                    <span className="font-semibold text-purple-600">{item.conversions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency(item.revenue || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-vmetrics-accent overflow-hidden"
      >
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vmetrics-primary"></div>
                <span className="text-vmetrics-text">{loadingMessage}</span>
              </div>
              <p className="text-sm text-vmetrics-muted mt-2">
                Isso pode levar alguns segundos na primeira vez...
              </p>
            </div>
          ) : activeTab === 'campaigns' ? (
            <table className="w-full min-w-[1400px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  {getVisibleColumns().map((column) => (
                    <th 
                      key={column?.id} 
                      className={`px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap ${
                        column?.id === 'name' ? 'sticky left-0 z-20 bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] w-[200px]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{column?.label}</span>
                        {column?.category === 'funnel' && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={getVisibleColumns().length} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-lg font-medium text-gray-700">
                          {searchTerm || Object.values(filters).some(v => v) ? 
                            'Nenhuma campanha encontrada com os filtros aplicados.' :
                            'Nenhuma campanha encontrada para o período selecionado.'
                          }
                        </p>
                        <p className="text-sm text-gray-500">Tente ajustar os filtros ou período</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign, index) => (
                    <motion.tr 
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-50 group"
                    >
                      {getVisibleColumns().map((column) => (
                        <td 
                          key={column?.id} 
                          className={`px-6 py-4 whitespace-nowrap ${
                            column?.id === 'name' ? 'sticky left-0 z-10 bg-white group-hover:bg-[#3cd48f]/5 border-r border-gray-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] w-[200px]' : ''
                          }`}
                        >
                          {renderCell(campaign, column)}
                        </td>
                      ))}
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
                  Nenhum dado de RT Campaign/Ad encontrado para o período ou filtros selecionados.<br/>
                  Tente ampliar o período ou revisar os filtros.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-vmetrics-background">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT Medium</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT Adgroup</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT Ad</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-vmetrics-background">
                    {filteredUTMCreatives.map((creative, index) => (
                      <motion.tr 
                        key={creative.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-vmetrics-background"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_source}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_medium}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_campaign}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_term}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.utm_content}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{creative.conversions.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatCurrency(creative.revenue)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {creative.conversions > 0 ? formatCurrency(creative.revenue / creative.conversions) : formatCurrency(0)}
                        </td>
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
