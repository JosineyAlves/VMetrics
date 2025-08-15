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
  Calculator,
  BarChart2,
  Shuffle,
  Info
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts'
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
import { useCurrencyStore } from '../store/currency'
import type { Metric } from '../store/metrics'

const metricOptions = [
  { value: 'cost_revenue', label: 'Custo x Receita', left: 'cost', right: 'revenue' },
  { value: 'revenue_profit', label: 'Receita x Lucro', left: 'revenue', right: 'profit' },
  { value: 'cost_profit', label: 'Custo x Lucro', left: 'cost', right: 'profit' },
]

const Dashboard: React.FC = () => {
  const { apiKey } = useAuthStore()
  const { selectedMetrics, availableMetrics } = useMetricsStore()
  const { currency } = useCurrencyStore()
  
  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value)
  }
  
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
  const [sourceStats, setSourceStats] = useState<any[]>([])
  
  // Debug: monitorar mudanças no sourceStats
  useEffect(() => {
    console.log('🔍 [SOURCE STATS DEBUG] sourceStats atualizado:', sourceStats)
  }, [sourceStats])
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
  const [funnelData, setFunnelData] = useState<any>({})

  // Buscar campanhas ao carregar
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!apiKey) return
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      // Carregar campanhas deletadas do localStorage
      const savedDeletedCampaigns = localStorage.getItem('deletedCampaigns')
      const deletedCampaigns = savedDeletedCampaigns ? new Set(JSON.parse(savedDeletedCampaigns)) : new Set()
      
      const params = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        group_by: 'campaign',
      }
      const url = new URL('/api/campaigns', window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString())
        }
      })
      try {
        const response = await fetch(url.toString())
        const data = await response.json()
        let items = Array.isArray(data) ? data : []
        setCampaigns(items.map((item: any) => ({
          id: item.id,
          name: item.title || item.campaign || item.campaign_name || item.name || 'Campanha sem nome',
        })))
      } catch (err) {
        setCampaigns([])
      }
    }
    fetchCampaigns()
  }, [apiKey, selectedPeriod, customRange])

  // Buscar dados do funil ao trocar campanha
  useEffect(() => {
    const fetchFunnel = async () => {
      if (!apiKey) return
      const dateRange = getDateRange(selectedPeriod, customRange)
      const params: any = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        group_by: 'date',
      }
      if (selectedCampaign !== 'all') params.campaign_id = selectedCampaign
      const url = new URL('/api/report', window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString())
        }
      })
      try {
        const response = await fetch(url.toString())
        const data = await response.json()
        let funnel = { prelp_views: 0, lp_views: 0, offer_views: 0, conversions: 0 }
        const arr = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []
        arr.forEach((d: any) => {
          funnel.prelp_views += d.prelp_views ?? 0
          funnel.lp_views += d.lp_views ?? 0
          funnel.offer_views += d.offer_views ?? 0
          funnel.conversions += d.conversions ?? 0
        })
        setFunnelData(funnel)
      } catch (err) {
        setFunnelData({})
      }
    }
    fetchFunnel()
  }, [apiKey, selectedPeriod, customRange, selectedCampaign])

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
      if (!apiKey) throw new Error('API Key não definida')
      const api = new RedTrackAPI(apiKey)
      
      // Usar a base padronizada de datas
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      console.log('🔍 [DASHBOARD] Timezone UTC - Data atual:', getCurrentRedTrackDate())
      console.log('🔍 [DASHBOARD] Timezone UTC - Parâmetros enviados:', {
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
      
      console.log('🔍 [DASHBOARD] Chamando API com parâmetros:', params)
      const realData = await api.getReport(params)
      console.log('🔍 [DASHBOARD] Resposta da API:', realData)
      console.log('🔍 [DASHBOARD] Tipo da resposta:', typeof realData)
      console.log('🔍 [DASHBOARD] É array?', Array.isArray(realData))
      

      
      // Carregar campanhas deletadas do localStorage para filtrar dados
      const savedDeletedCampaigns = localStorage.getItem('deletedCampaigns')
      const deletedCampaigns = savedDeletedCampaigns ? new Set(JSON.parse(savedDeletedCampaigns)) : new Set()
      console.log('🔍 [DASHBOARD] Campanhas deletadas carregadas:', Array.from(deletedCampaigns))
      
      // Debug: verificar campos específicos para gasto
      if (Array.isArray(realData) && realData.length > 0) {
        console.log('🔍 [DASHBOARD DEBUG] Primeiro item da resposta:', realData[0])
        console.log('🔍 [DASHBOARD DEBUG] Campos disponíveis no primeiro item:', Object.keys(realData[0]))
      } else if (realData && typeof realData === 'object') {
        console.log('🔍 [DASHBOARD DEBUG] Campos disponíveis na resposta:', Object.keys(realData))
      }
      
      let summary: any = {};
      let daily: any[] = [];
      if (Array.isArray(realData)) {
        // Filtrar dados de campanhas deletadas e apenas campanhas com atividade (cliques ou conversões)
        const filteredData = realData.filter((item: any) => {
          const campaignName = item.campaign || item.campaign_name || item.title || '';
          const isDeleted = deletedCampaigns.has(campaignName.toLowerCase().trim());
          
          // Verificar se a campanha tem atividade (cliques ou conversões)
          const hasClicks = item.clicks > 0 || (item.stat && item.stat.clicks > 0);
          const hasConversionsToday = item.conversions > 0 || (item.stat && item.stat.conversions > 0);
          const hasActivity = hasClicks || hasConversionsToday;
          
          return !isDeleted && hasActivity;
        });
        
        console.log('🔍 [DASHBOARD] Dados filtrados (apenas campanhas com atividade e não deletadas):', filteredData.length, 'de', realData.length, 'itens');
        
        // Log detalhado das campanhas filtradas
        realData.forEach((item: any) => {
          const campaignName = item.campaign || item.campaign_name || item.title || '';
          const isDeleted = deletedCampaigns.has(campaignName.toLowerCase().trim());
          const hasClicks = item.clicks > 0 || (item.stat && item.stat.clicks > 0);
          const hasConversionsToday = item.conversions > 0 || (item.stat && item.stat.conversions > 0);
          const hasActivity = hasClicks || hasConversionsToday;
          
          if (isDeleted) {
            console.log(`❌ [DASHBOARD] Campanha deletada ignorada: ${campaignName}`);
          } else if (!hasActivity) {
            console.log(`⏸️ [DASHBOARD] Campanha sem atividade ignorada: ${campaignName} (cliques: ${item.clicks || 0}, conversões: ${item.conversions || 0})`);
          } else {
            console.log(`✅ [DASHBOARD] Campanha com atividade incluída: ${campaignName} (cliques: ${item.clicks || 0}, conversões: ${item.conversions || 0})`);
          }
        });
        
        daily = filteredData;
        summary = filteredData.reduce((acc: any, item: any) => {
          // Processar campos diretos
          Object.keys(item).forEach(key => {
            if (key !== 'stat' && typeof item[key] === 'number') {
              acc[key] = (acc[key] || 0) + item[key];
            }
          });
          
          // Processar estrutura stat se existir
          if (item.stat && typeof item.stat === 'object') {
            Object.keys(item.stat).forEach(key => {
              if (typeof item.stat[key] === 'number') {
                acc[key] = (acc[key] || 0) + item.stat[key];
              }
            });
          }
          
          return acc;
        }, {});
        
        // Adicionar dados de InitiateCheckout do campo convtype1
        summary.initiate_checkout = filteredData.reduce((total: number, item: any) => {
          return total + (item.convtype1 || 0);
        }, 0);
        console.log('🔍 [DASHBOARD] InitiateCheckout (convtype1) adicionado ao summary:', summary.initiate_checkout);
        
        // Debug: verificar se EPC está sendo agregado
        console.log('🔍 [DASHBOARD DEBUG] EPC nos dados filtrados:', {
          epc_in_summary: summary.epc,
          epc_in_items: filteredData.map((item: any) => ({
            epc: item.epc,
            stat_epc: item.stat?.epc,
            campaign: item.campaign || item.campaign_name || item.title
          }))
        });
        
        // Garantir que o campo cost seja mapeado para spend se não existir
        if (!summary.spend && summary.cost) {
          summary.spend = summary.cost;
          console.log('🔍 [DASHBOARD] Campo cost mapeado para spend:', summary.spend);
        }
        console.log('🔍 [DASHBOARD] Dados agregados:', summary)
        
        // Debug: verificar campos específicos após agregação
        console.log('🔍 [DASHBOARD DEBUG] Campos após agregação:', {
          spend: summary.spend,
          cost: summary.cost,
          campaign_cost: summary.campaign_cost,
          total_spend: summary.total_spend,
          revenue: summary.revenue,
          income: summary.income,
          total_revenue: summary.total_revenue
        })
        
        // Debug: verificar se cost está sendo agregado
        console.log('🔍 [DASHBOARD DEBUG] Verificação específica do cost:', {
          summary_has_cost: 'cost' in summary,
          summary_cost_value: summary.cost,
          summary_spend_value: summary.spend,
          all_summary_keys: Object.keys(summary)
        });
      } else {
        summary = realData || {};
        console.log('🔍 [DASHBOARD] Dados diretos:', summary)
        
        // Debug: verificar campos específicos em dados diretos
        console.log('🔍 [DASHBOARD DEBUG] Campos em dados diretos:', {
          spend: summary.spend,
          cost: summary.cost,
          campaign_cost: summary.campaign_cost,
          total_spend: summary.total_spend,
          revenue: summary.revenue,
          income: summary.income,
          total_revenue: summary.total_revenue
        })
        
        // Adicionar dados de InitiateCheckout do campo convtype1 para dados diretos
        summary.initiate_checkout = realData.convtype1 || 0;
        console.log('🔍 [DASHBOARD] InitiateCheckout (convtype1) adicionado ao summary (dados diretos):', summary.initiate_checkout);
        
        // Debug: verificar se EPC está sendo processado em dados diretos
        console.log('🔍 [DASHBOARD DEBUG] EPC em dados diretos:', {
          epc_in_summary: summary.epc,
          epc_in_realData: realData.epc
        });
        
        // Garantir que o campo cost seja mapeado para spend se não existir (dados diretos)
        if (!summary.spend && summary.cost) {
          summary.spend = summary.cost;
          console.log('🔍 [DASHBOARD] Campo cost mapeado para spend (dados diretos):', summary.spend);
        }
      }
      setDailyData(daily);
      setDashboardData(summary);
      
      // Debug: verificar se initiate_checkout está no summary
      console.log('🔍 [DASHBOARD] Summary final com initiate_checkout:', {
        initiate_checkout: summary.initiate_checkout,
        total_fields: Object.keys(summary).length,
        all_fields: Object.keys(summary)
      });
      
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
          epc: 0,
          listicle_epv: 0,
          roas_percentage: 0,
          conversion_roas: 0,
          conversion_roas_percentage: 0,
          conversion_profit: 0,
          epc_roi: 0
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
        epc: 0,
        listicle_epv: 0,
        roas_percentage: 0,
        conversion_roas: 0,
        conversion_roas_percentage: 0,
        conversion_profit: 0,
        epc_roi: 0
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
          currency: currency
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
    console.log('🔍 [METRICS] Campo initiate_checkout nos dados:', data.initiate_checkout)
    
    const selectedMetricsData = selectedMetrics.map(metricId => {
      const metric = availableMetrics.find(m => m.id === metricId)
      if (!metric) {
        console.warn(`⚠️ [METRICS] Métrica não encontrada: ${metricId}`)
        return null
      }

      // Debug: verificar todos os campos disponíveis para spend
      if (metricId === 'spend') {
        console.log('🔍 [METRICS DEBUG] Campos disponíveis para spend:', {
          spend: data.spend,
          cost: data.cost,
          campaign_cost: data.campaign_cost,
          total_spend: data.total_spend
        })
        console.log('🔍 [METRICS DEBUG] Dados completos para debug:', data)
        console.log('🔍 [METRICS DEBUG] Chaves disponíveis:', Object.keys(data))
        
        // Verificar se há estrutura stat como na tela de Campanhas
        if (data.stat) {
          console.log('🔍 [METRICS DEBUG] Estrutura stat encontrada:', data.stat)
          console.log('🔍 [METRICS DEBUG] Campos em stat:', Object.keys(data.stat))
        }
      }
      
      let value = data[metricId] || 0
      
      // Mapeamento específico para campos que podem ter nomes diferentes
      if (metricId === 'spend') {
        // Verificar se há estrutura stat (como na tela de Campanhas)
        if (data.stat) {
          value = data.stat.cost ?? data.stat.spend ?? data.stat.campaign_cost ?? 0
        } else {
          value = data.spend ?? data.cost ?? data.campaign_cost ?? data.total_spend ?? 0
        }
        
        // Debug: verificar valores de gasto/cost
        console.log('🔍 [METRICS DEBUG] Spend/Cost mapping:', {
          metricId,
          data_spend: data.spend,
          data_cost: data.cost,
          data_campaign_cost: data.campaign_cost,
          data_total_spend: data.total_spend,
          final_value: value
        });
        
        // Garantir que o valor seja um número válido
        if (typeof value !== 'number' || isNaN(value)) {
          console.warn('⚠️ [METRICS DEBUG] Valor inválido para spend/cost:', value);
          value = 0;
        }
      } else if (metricId === 'revenue') {
        // Verificar se há estrutura stat (como na tela de Campanhas)
        if (data.stat) {
          value = data.stat.revenue ?? data.stat.income ?? data.stat.total_revenue ?? 0
        } else {
          value = data.revenue ?? data.income ?? data.total_revenue ?? 0
        }
      } else if (metricId === 'profit') {
        let revenue = 0
        let cost = 0
        
        // Verificar se há estrutura stat (como na tela de Campanhas)
        if (data.stat) {
          revenue = data.stat.revenue ?? data.stat.income ?? data.stat.total_revenue ?? 0
          cost = data.stat.cost ?? data.stat.spend ?? data.stat.campaign_cost ?? 0
        } else {
          revenue = data.revenue ?? data.income ?? data.total_revenue ?? 0
          cost = data.spend ?? data.cost ?? data.campaign_cost ?? data.total_spend ?? 0
        }
        value = revenue - cost
      } else if (metricId === 'initiate_checkout') {
        // Mapear para o campo convtype1 do RedTrack
        value = data.convtype1 ?? data.initiate_checkout ?? 0;
        
        // Debug: verificar se há dados de InitiateCheckout
        console.log('🔍 [METRICS DEBUG] InitiateCheckout (convtype1) value:', value);
        console.log('🔍 [METRICS DEBUG] InitiateCheckout data fields:', {
          convtype1: data.convtype1,
          initiate_checkout: data.initiate_checkout
        });
      } else if (metricId === 'cpc') {
        // Calcular CPC: spend / clicks
        let spend = 0
        let clicks = 0
        
        // Verificar se há estrutura stat (como na tela de Campanhas)
        if (data.stat) {
          spend = data.stat.cost ?? data.stat.spend ?? data.stat.campaign_cost ?? 0
          clicks = data.stat.clicks ?? 0
        } else {
          spend = data.spend ?? data.cost ?? data.campaign_cost ?? data.total_spend ?? 0
          clicks = data.clicks ?? 0
        }
        
        // Calcular CPC
        value = clicks > 0 ? spend / clicks : 0
        
        console.log('🔍 [METRICS DEBUG] CPC calculation:', {
          spend,
          clicks,
          cpc: value
        });
      } else if (metricId === 'epc') {
        // Debug: verificar dados de EPC
        console.log('🔍 [METRICS DEBUG] EPC data fields:', {
          epc: data.epc,
          stat_epc: data.stat?.epc,
          revenue: data.revenue,
          clicks: data.clicks
        });
        
        // Verificar se há estrutura stat (como na tela de Campanhas)
        if (data.stat) {
          value = data.stat.epc ?? 0
        } else {
          value = data.epc ?? 0
        }
        
        console.log('🔍 [METRICS DEBUG] EPC final value:', value);
      } else if (metricId === 'cpa') {
        // Calcular CPA: spend / conversions
        let spend = 0
        let conversions = 0
        
        // Verificar se há estrutura stat (como na tela de Campanhas)
        if (data.stat) {
          spend = data.stat.cost ?? data.stat.spend ?? data.stat.campaign_cost ?? 0
          conversions = data.stat.conversions ?? data.stat.approved ?? 0
        } else {
          spend = data.spend ?? data.cost ?? data.campaign_cost ?? data.total_spend ?? 0
          conversions = data.conversions ?? data.approved ?? 0
        }
        
        // Calcular CPA
        value = conversions > 0 ? spend / conversions : 0
        
        console.log('🔍 [METRICS DEBUG] CPA calculation:', {
          spend,
          conversions,
          cpa: value
        });
      }
      
      console.log(`🔍 [METRICS] ${metricId}: ${value} (${typeof value})`)
      
      let formattedValue = value

      // Formatar valor baseado no tipo
      if (metric.unit === 'currency') {
        formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: currency
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
    const metrics = metricsOrder
      .filter(metricId => selectedMetrics.includes(metricId))
      .map(metricId => availableMetrics.find(m => m.id === metricId))
      .filter((metric): metric is Metric => metric !== null)
    
    // Debug: verificar se InitiateCheckout está incluído
    console.log('🔍 [METRICS] Métricas selecionadas:', selectedMetrics);
    console.log('🔍 [METRICS] InitiateCheckout incluído:', selectedMetrics.includes('initiate_checkout'));
    console.log('🔍 [METRICS] Métricas finais:', metrics.map(m => m.id));
    
    return metrics
  }

  const [crossMetric, setCrossMetric] = useState(metricOptions[0].value)
  const [chartMode, setChartMode] = useState<'conversions' | 'cross'>('conversions')

  // Calcular lucro (profit) para cada dia
  const dailyDataWithProfit = dailyData.map((d: any) => ({
    ...d,
    cost: d.spend ?? d.cost ?? 0,
    revenue: d.revenue ?? 0,
    profit: (d.revenue ?? 0) - (d.spend ?? d.cost ?? 0)
  }))

  const selectedOption = metricOptions.find(opt => opt.value === crossMetric) || metricOptions[0]

  // (Removido: processamento antigo de sourceStats, agora é buscado via useEffect)

  // Buscar distribuição por fonte (apenas custo por traffic_channel)
  useEffect(() => {
    const fetchSourceStats = async () => {
      if (!apiKey) return
      const api = new RedTrackAPI(apiKey)
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      try {
        console.log('🔍 [SOURCE STATS] Buscando dados de campanhas para fontes de tráfego...')
        
        const params = {
          date_from: dateRange.startDate,
          date_to: dateRange.endDate,
          group_by: 'rt_source',
        }
        
        console.log('🔍 [SOURCE STATS] Parâmetros:', params)
        const data = await api.getCampaigns(params)
        console.log('🔍 [SOURCE STATS] Dados recebidos:', data)
        
        // Agrupar campanhas por source_title e somar os custos
        const sourceGroups: { [key: string]: number } = {}
        
        // Verificar se os dados vêm em data.data (estrutura do getCampaigns) ou data direto
        const campaigns = data?.data || data || []
        
        if (Array.isArray(campaigns)) {
          campaigns.forEach((campaign: any) => {
            const sourceTitle = campaign.source_title || 'Indefinido'
            const cost = campaign.stat?.cost || 0
            
            if (cost > 0) {
              sourceGroups[sourceTitle] = (sourceGroups[sourceTitle] || 0) + cost
              console.log(`🔍 [SOURCE STATS] Campanha: ${campaign.title}, Fonte: ${sourceTitle}, Custo: ${cost}`)
            }
          })
        }
        
        console.log('🔍 [SOURCE STATS] Agrupamento por fonte:', sourceGroups)
        
        // Converter para o formato esperado pelo gráfico
        const mapped = Object.entries(sourceGroups).map(([sourceName, totalCost]) => ({
          key: sourceName,
          cost: totalCost,
        }))
        
        console.log('🔍 [SOURCE STATS] Dados mapeados para o gráfico:', mapped)
        
        const sortedData = mapped.sort((a: { cost: number }, b: { cost: number }) => b.cost - a.cost)
        console.log('🔍 [SOURCE STATS] Dados ordenados:', sortedData)
        
        setSourceStats(sortedData)
        console.log('🔍 [SOURCE STATS] Estado sourceStats atualizado com:', sortedData.length, 'itens')
        
      } catch (err) {
        console.error('❌ [SOURCE STATS] Erro ao buscar dados de fontes:', err)
        setSourceStats([])
      }
    }
    fetchSourceStats()
  }, [apiKey, selectedPeriod, customRange])


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vmetrics-primary"></div>
      </div>
    )
  }

  const metrics = getMetricsFromData(dashboardData)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header com ações */}
              <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-3">
          <MetricsSelector />
          <MetricsOrder />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="px-0.5 py-0.5 rounded border border-[#3cd48f]/30 text-[#1f1f1f] font-semibold bg-white shadow-sm hover:bg-[#3cd48f]/5 transition"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3cd48f] focus:border-[#3cd48f] shadow-sm"
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
                className="w-full rounded-xl border-gray-200 focus:border-[#3cd48f] focus:ring-[#3cd48f] shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handleApplyFilters}
                              className="px-0.5 py-0.5 rounded shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getMetricsFromData(dashboardData).map((metric) => {
          return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
                          <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs font-semibold text-gray-600 truncate">{metric.label}</p>
                  <div className="group relative">
                    <Info className="w-3 h-3 text-gray-400 hover:text-[#3cd48f] cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {metric.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xl font-bold bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 bg-clip-text text-transparent">
                  {metric.value}
                </p>
              </div>
            </div>
          </motion.div>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance por Dia e Cruzamento de Métricas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
                         className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-[#3cd48f]/20 hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex gap-3">
              <button
                className={`flex items-center gap-1 px-0.5 py-0.5 rounded text-sm font-semibold transition-all duration-200 shadow-sm border-2 ${chartMode === 'conversions' ? 'bg-[#3cd48f] text-white border-[#3cd48f] scale-105' : 'bg-white text-[#3cd48f] border-[#3cd48f]/30 hover:bg-[#3cd48f]/5'} hover:shadow-md`}
                onClick={() => setChartMode('conversions')}
              >
                <BarChart2 className="w-5 h-5" /> Conversões por Dia
              </button>
              <button
                className={`flex items-center gap-1 px-0.5 py-0.5 rounded text-sm font-semibold transition-all duration-200 shadow-sm border-2 ${chartMode === 'cross' ? 'bg-[#3cd48f] text-white border-[#3cd48f] scale-105' : 'bg-white text-[#3cd48f] border-[#3cd48f]/30 hover:bg-[#3cd48f]/5'} hover:shadow-md`}
                onClick={() => setChartMode('cross')}
              >
                <Shuffle className="w-5 h-5" /> Cruzamento Diário
              </button>
            </div>
            {chartMode === 'cross' && (
              <div className="flex items-center gap-1 bg-[#3cd48f]/10 border border-[#3cd48f]/20 rounded px-0.5 py-0.5 shadow-sm">
                <TrendingUp className="w-4 h-4 text-[#3cd48f]" />
                <select
                  value={crossMetric}
                  onChange={e => setCrossMetric(e.target.value)}
                  className="rounded border-0 bg-transparent text-xs font-semibold text-[#3cd48f] focus:outline-none focus:ring-2 focus:ring-[#3cd48f]/40"
                >
                  {metricOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {chartMode === 'conversions' ? (
            dailyData && dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barCategoryGap={20}>
                <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fontWeight: 500, fill: '#3cd48f' }} />
                  <YAxis tick={{ fontSize: 13, fontWeight: 500, fill: '#3cd48f' }} allowDecimals={false} />
                  <Tooltip formatter={(value: any) => value?.toLocaleString?.('pt-BR') ?? value} contentStyle={{ borderRadius: 12, background: '#fff', boxShadow: '0 4px 24px #0001' }} />
                  <Bar dataKey="conversions" name="Conversões" fill="#3cd48f" radius={[12, 12, 0, 0]} />
                  <Legend verticalAlign="top" height={36} iconType="circle"/>
                </BarChart>
            </ResponsiveContainer>
          ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
                  <p className="text-lg font-semibold">Conversões por Dia</p>
                  <p className="text-sm">Dados reais serão exibidos quando disponíveis</p>
                </div>
              </div>
            )
          ) : (
            dailyDataWithProfit && dailyDataWithProfit.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dailyDataWithProfit} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barCategoryGap={20}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fontWeight: 500, fill: '#3cd48f' }} />
                  <YAxis tick={{ fontSize: 13, fontWeight: 500, fill: '#3cd48f' }} allowDecimals={false} />
                  <Tooltip formatter={(value: any) => value?.toLocaleString?.('pt-BR') ?? value} contentStyle={{ borderRadius: 12, background: '#fff', boxShadow: '0 4px 24px #0001' }} />
                  <Bar dataKey={selectedOption.left} name={selectedOption.left === 'cost' ? 'Custo' : 'Receita'} fill="#3cd48f" radius={[12, 12, 0, 0]} />
                  <Bar dataKey={selectedOption.right} name={selectedOption.right === 'revenue' ? 'Receita' : 'Lucro'} fill="#3cd48f/80" radius={[12, 12, 0, 0]} />
                  <Legend verticalAlign="top" height={36} iconType="circle"/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-lg font-semibold">Cruzamento Diário</p>
              <p className="text-sm">Dados reais serão exibidos quando disponíveis</p>
            </div>
          </div>
            )
          )}
        </motion.div>

        {/* Funil de Marketing com seletor de campanha embutido no header */}
        <FunnelChart 
          data={funnelData}
          campaignSelector={
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Campanha:</label>
              <select
                value={selectedCampaign}
                onChange={e => setSelectedCampaign(e.target.value)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-base font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3cd48f]"
              >
                <option value="all">Todas</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          }
        />
      </div>

      {/* Gráficos Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição por Fonte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between"
        >
                      <h3 className="text-base font-semibold text-gray-800 mb-4">Investimento por Fonte de Tráfego</h3>
          {sourceStats.length > 0 ? (
            <div className="w-full h-[320px] flex flex-col justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={sourceStats.slice(0, 8)}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  barCategoryGap={18}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis type="number" hide={false} tick={{ fontSize: 13 }} />
                  <YAxis dataKey="key" type="category" width={120} tick={{ fontSize: 14, fontWeight: 500 }} />
                  <Tooltip formatter={(v: any) => `Custo: ${formatCurrency(v)}`} />
                  <Bar dataKey="cost" name="Investimento" fill="#3cd48f" radius={[0, 12, 12, 0]} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-12">Sem dados de investimento por fonte para o período selecionado ou seu plano RedTrack não permite esse relatório.</div>
          )}
        </motion.div>

        {/* Métricas de Conversão */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500"
        >
                      <h3 className="text-base font-semibold text-gray-800 mb-4">Métricas de Conversão</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#3cd48f]/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#3cd48f] rounded-full"></div>
                <span className="font-medium">Taxa de Conversão</span>
              </div>
              <span className="text-xl font-bold text-[#3cd48f]">
                {dashboardData.conversion_rate ? `${dashboardData.conversion_rate.toFixed(2)}%` : '0.00%'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#3cd48f]/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#3cd48f] rounded-full"></div>
                <span className="font-medium">CTR</span>
              </div>
              <span className="text-xl font-bold text-[#3cd48f]">
                {dashboardData.ctr ? `${dashboardData.ctr.toFixed(2)}%` : '0.00%'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#3cd48f]/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#3cd48f] rounded-full"></div>
                <span className="font-medium">ROI</span>
              </div>
              <span className="text-xl font-bold text-[#3cd48f]">
                {dashboardData.roi ? `${dashboardData.roi.toFixed(2)}%` : '0.00%'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard 