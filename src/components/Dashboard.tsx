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
import CustomSelect from './ui/CustomSelect'

const metricOptions = [
  { value: 'cost_revenue', label: 'Custo x Receita', left: 'cost', right: 'revenue' },
  { value: 'revenue_profit', label: 'Receita x Lucro', left: 'revenue', right: 'profit' },
  { value: 'cost_profit', label: 'Custo x Lucro', left: 'cost', right: 'profit' },
]

const Dashboard: React.FC = () => {
  const { apiKey, user } = useAuthStore()
  const { selectedMetrics, availableMetrics, metricsOrder } = useMetricsStore()
  const { currency } = useCurrencyStore()
  
  // Verificar se usuário tem plano ativo
  const hasActivePlan = user?.plan && user?.plan !== 'inactive'
  
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
  // REMOVER: showFilters não é mais necessário
  // const [showFilters, setShowFilters] = useState(false)
  // REMOVER: estados de filtros
  // const [filters, setFilters] = useState({
  //   dateFrom: '',
  //   dateTo: '',
  //   utm_source: '',
  //   traffic_channel: '',
  //   country: '',
  //   device: '',
  //   browser: '',
  //   os: ''
  // })
  // const [tempFilters, setTempFilters] = useState(filters)

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Remover estados locais de datas
  const { selectedPeriod, customRange } = useDateRangeStore()

  // Remover periodOptions, getPeriodLabel, getDateRange antigos se não forem mais usados

  // Atualizar label do período para customizado
  // Função para calcular datas reais baseadas no período (não utilizada)
  // Função para calcular datas reais baseadas no período (não utilizada)


  const [dashboardData, setDashboardData] = useState<any>({})

  // Novo estado para armazenar dados diários para o gráfico
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [sourceStats, setSourceStats] = useState<any[]>([])

  // Estado para métricas cruzadas
  const [crossMetric, setCrossMetric] = useState(metricOptions[0].value)
  const selectedOption = metricOptions.find(opt => opt.value === crossMetric) || metricOptions[0]
  
  // Debug: monitorar mudanças no sourceStats
  useEffect(() => {
    console.log('🔍 [SOURCE STATS DEBUG] sourceStats atualizado:', sourceStats)
  }, [sourceStats])
  const [campaigns, setCampaigns] = useState<{
    id: string
    name: string
    source_title?: string
    source?: string
    traffic_source?: string
    media_source?: string
    stat?: any
    cost?: number
    spend?: number
    ad_spend?: number
    status?: string
  }[]>([])
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
        console.log('🔍 [CAMPAIGNS] Dados brutos da API:', data)
        
        // A API retorna { campaigns: [...], performance: {...} }
        let items = []
        if (data && data.campaigns && Array.isArray(data.campaigns)) {
          items = data.campaigns
          console.log('🔍 [CAMPAIGNS] ✅ Usando data.campaigns:', items.length, 'campanhas')
        } else if (Array.isArray(data)) {
          items = data
          console.log('🔍 [CAMPAIGNS] ✅ Usando data direto:', items.length, 'campanhas')
        } else {
          console.log('🔍 [CAMPAIGNS] ❌ Estrutura de dados inesperada:', data)
          items = []
        }
        
        // Armazenar dados completos das campanhas (incluindo source_title e cost)
        const campaignsWithFullData = items.map((item: any) => {
          console.log('🔍 [CAMPAIGNS] Processando item:', item)
          return {
            id: item.id,
            name: item.title || item.campaign || item.campaign_name || item.name || 'Campanha sem nome',
            source_title: item.source_title,
            source: item.source,
            traffic_source: item.traffic_source,
            media_source: item.media_source,
            stat: item.stat,
            cost: item.cost,
            spend: item.spend,
            ad_spend: item.ad_spend,
            status: item.status
          }
        })
        
        console.log('🔍 [CAMPAIGNS] Campanhas carregadas com dados completos:', campaignsWithFullData)
        console.log('🔍 [CAMPAIGNS] Número de campanhas:', campaignsWithFullData.length)
        if (campaignsWithFullData.length > 0) {
          console.log('🔍 [CAMPAIGNS] Primeira campanha:', campaignsWithFullData[0])
        }
        setCampaigns(campaignsWithFullData)
      } catch (err) {
        console.error('❌ [CAMPAIGNS] Erro ao carregar campanhas:', err)
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
        // ✅ ADICIONADO: Campos necessários para calcular EPC
        fields: 'clicks,conversions,revenue,income,total_revenue,cost,spend,campaign_cost,total_spend,epc,cpc,cpa,roi',
        // REMOVER: filters não são mais necessários
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
            revenue: item.revenue || item.income || item.total_revenue,
            clicks: item.clicks,
            campaign: item.campaign || item.campaign_name || item.title
          }))
        });
        
        // ✅ DEBUG ESPECÍFICO: Verificar campos EPC disponíveis
        console.log('🔍 [DASHBOARD DEBUG] Campos EPC disponíveis:', {
          summary_has_epc: 'epc' in summary,
          summary_epc_value: summary.epc,
          items_with_epc: filteredData.filter(item => item.epc !== undefined && item.epc !== null).length,
          items_with_revenue_clicks: filteredData.filter(item => 
            (item.revenue || item.income || item.total_revenue) && item.clicks
          ).length
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
          epc_in_realData: realData.epc,
          revenue_in_realData: realData.revenue || realData.income || realData.total_revenue,
          clicks_in_realData: realData.clicks
        });
        
        // ✅ DEBUG ESPECÍFICO: Verificar campos EPC em dados diretos
        console.log('🔍 [DASHBOARD DEBUG] Campos EPC em dados diretos:', {
          realData_has_epc: 'epc' in realData,
          realData_epc_value: realData.epc,
          realData_has_revenue: 'revenue' in realData || 'income' in realData || 'total_revenue' in realData,
          realData_has_clicks: 'clicks' in realData
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

  // REMOVER: useEffect que depende de filters
  // Carregar dados quando componente montar ou parâmetros mudarem
  useEffect(() => {
    if (apiKey) {
      loadDashboardData()
    }
  }, [apiKey, selectedPeriod, customRange])

  // Remover handlePeriodChange e qualquer uso de setSelectedPeriod

  // REMOVER: funções de filtros

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
    
    // Usar a ordem definida no store de métricas
    console.log('🔍 [METRICS ORDER] metricsOrder completo:', metricsOrder)
    console.log('🔍 [METRICS ORDER] selectedMetrics:', selectedMetrics)
    const orderedSelectedMetrics = metricsOrder.filter(metricId => selectedMetrics.includes(metricId))
    console.log('🔍 [METRICS ORDER] Métricas ordenadas para renderização:', orderedSelectedMetrics)
    
    const selectedMetricsData = orderedSelectedMetrics.map(metricId => {
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
        // ✅ CORRIGIDO: Calcular CPC como Cost / Clicks usando dados agregados
        let cost = 0;
        let clicks = 0;
        
        if (data.stat) {
          cost = data.stat.cost ?? data.stat.spend ?? data.stat.campaign_cost ?? 0;
          clicks = data.stat.clicks ?? 0;
        } else {
          cost = data.cost ?? data.spend ?? data.campaign_cost ?? data.total_spend ?? 0;
          clicks = data.clicks ?? 0;
        }
        
        value = clicks > 0 ? cost / clicks : 0;
        
        console.log('🔍 [METRICS DEBUG] CPC calculation:', {
          cost,
          clicks,
          cpc: value
        });
      } else if (metricId === 'epc') {
        // ✅ CORRIGIDO: Calcular EPC como Revenue / Clicks usando dados agregados
        let revenue = 0;
        let clicks = 0;
        
        if (data.stat) {
          revenue = data.stat.revenue ?? data.stat.income ?? data.stat.total_revenue ?? 0;
          clicks = data.stat.clicks ?? 0;
        } else {
          revenue = data.revenue ?? data.income ?? data.total_revenue ?? 0;
          clicks = data.clicks ?? 0;
        }
        
        value = clicks > 0 ? revenue / clicks : 0;
        
        console.log('🔍 [METRICS DEBUG] EPC calculation:', {
          revenue,
          clicks,
          epc: value
        });
      } else if (metricId === 'cpa') {
        // ✅ CORRIGIDO: Calcular CPA como Cost / Conversions usando dados agregados
        let cost = 0;
        let conversions = 0;
        
        if (data.stat) {
          cost = data.stat.cost ?? data.stat.spend ?? data.stat.campaign_cost ?? 0;
          conversions = data.stat.conversions ?? data.stat.approved ?? 0;
        } else {
          cost = data.cost ?? data.spend ?? data.campaign_cost ?? data.total_spend ?? 0;
          conversions = data.conversions ?? data.approved ?? 0;
        }
        
        value = conversions > 0 ? cost / conversions : 0;
        
        console.log('🔍 [METRICS DEBUG] CPA calculation:', {
          cost,
          conversions,
          cpa: value
        });
      } else if (metricId === 'roi') {
        // ✅ CORRIGIDO: Calcular ROI como (revenue - spend) / spend * 100
        let revenue = 0;
        let spend = 0;
        
        if (data.stat) {
          revenue = data.stat.revenue ?? data.stat.income ?? data.stat.total_revenue ?? 0;
          spend = data.stat.cost ?? data.stat.spend ?? data.stat.campaign_cost ?? 0;
        } else {
          revenue = data.revenue ?? data.income ?? data.total_revenue ?? 0;
          spend = data.spend ?? data.cost ?? data.campaign_cost ?? data.total_spend ?? 0;
        }
        
        value = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
        
        console.log('🔍 [METRICS DEBUG] ROI calculation:', {
          revenue,
          spend,
          roi: value
        });
      } else if (metricId === 'cpl') {
        // ✅ CORRIGIDO: Calcular CPL como spend / leads (conversões)
        let spend = 0;
        let leads = 0;
        
        if (data.stat) {
          spend = data.stat.cost ?? data.stat.spend ?? data.stat.campaign_cost ?? 0;
          leads = data.stat.conversions ?? data.stat.approved ?? 0;
        } else {
          spend = data.spend ?? data.cost ?? data.campaign_cost ?? data.total_spend ?? 0;
          leads = data.conversions ?? data.approved ?? 0;
        }
        
        value = leads > 0 ? spend / leads : 0;
        
        console.log('🔍 [METRICS DEBUG] CPL calculation:', {
          spend,
          leads,
          cpl: value
        });
      } else if (metricId === 'ctr') {
        // ✅ CORRIGIDO: Calcular CTR como (clicks / impressions) * 100
        let clicks = 0;
        let impressions = 0;
        
        if (data.stat) {
          clicks = data.stat.clicks ?? 0;
          impressions = data.stat.impressions ?? 0;
        } else {
          clicks = data.clicks ?? 0;
          impressions = data.impressions ?? 0;
        }
        
        value = impressions > 0 ? (clicks / impressions) * 100 : 0;
        
        console.log('🔍 [METRICS DEBUG] CTR calculation:', {
          clicks,
          impressions,
          ctr: value
        });
      } else if (metricId === 'conversion_rate') {
        // ✅ CORRIGIDO: Calcular Conversion Rate como (conversions / clicks) * 100
        let conversions = 0;
        let clicks = 0;
        
        if (data.stat) {
          conversions = data.stat.conversions ?? data.stat.approved ?? 0;
          clicks = data.stat.clicks ?? 0;
        } else {
          conversions = data.conversions ?? data.approved ?? 0;
          clicks = data.clicks ?? 0;
        }
        
        value = clicks > 0 ? (conversions / clicks) * 100 : 0;
        
        console.log('🔍 [METRICS DEBUG] Conversion Rate calculation:', {
          conversions,
          clicks,
          conversion_rate: value
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
        visible: true,
        isNegative: value < 0 // ✅ NOVO: Identificar valores negativos
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

  // Calcular lucro (profit) para cada dia
  const dailyDataWithProfit = dailyData.map((d: any) => ({
    ...d,
    cost: d.spend ?? d.cost ?? 0,
    revenue: d.revenue ?? 0,
    profit: (d.revenue ?? 0) - (d.spend ?? d.cost ?? 0)
  }))

  // Buscar distribuição por fonte (apenas custo por traffic_channel)
  useEffect(() => {
    const processSourceStatsFromExistingCampaigns = () => {
      if (!apiKey) return
      
      try {
        console.log('🔍 [SOURCE STATS] Processando dados de investimento por fonte de tráfego...')
        console.log('🔍 [SOURCE STATS] Período selecionado:', selectedPeriod)
        console.log('🔍 [SOURCE STATS] Range personalizado:', customRange)
        
        // SIMPLES: Usar as campanhas que já estão carregadas no estado campaigns
        console.log('🔍 [SOURCE STATS] Verificando campanhas existentes no estado...')
        console.log('🔍 [SOURCE STATS] Estado campaigns atual:', campaigns)
        
        if (campaigns && campaigns.length > 0) {
          console.log('🔍 [SOURCE STATS] ✅ Encontradas', campaigns.length, 'campanhas no estado')
          
          const sourceGroups: { [key: string]: number } = {}
          
          campaigns.forEach((campaign: any, index: number) => {
            console.log(`\n🔍 [SOURCE STATS] === CAMPANHA ${index + 1} ===`)
            console.log(`🔍 [SOURCE STATS] - title: "${campaign.name || 'N/A'}"`)
            console.log(`🔍 [SOURCE STATS] - source_title: "${campaign.source_title || 'N/A'}"`)
            console.log(`🔍 [SOURCE STATS] - stat:`, campaign.stat)
            console.log(`🔍 [SOURCE STATS] - stat.cost: ${campaign.stat?.cost || 'N/A'}`)
            console.log(`🔍 [SOURCE STATS] - cost direto: ${campaign.cost || 'N/A'}`)
            
            // Obter fonte de tráfego
            const sourceTitle = campaign.source_title || campaign.source || campaign.traffic_source || campaign.media_source || 'Indefinido'
            
            // Obter custo
            const cost = campaign.stat?.cost || campaign.cost || campaign.spend || campaign.ad_spend || 0
            
            console.log(`🔍 [SOURCE STATS] - sourceTitle final: "${sourceTitle}"`)
            console.log(`🔍 [SOURCE STATS] - cost final: ${cost}`)
            
            if (cost > 0) {
              if (!sourceGroups[sourceTitle]) {
                sourceGroups[sourceTitle] = 0
              }
              sourceGroups[sourceTitle] += cost
              console.log(`🔍 [SOURCE STATS] ✅ Adicionado: ${sourceTitle} = ${sourceGroups[sourceTitle]}`)
            } else {
              console.log(`🔍 [SOURCE STATS] ⚠️ Campanha sem custo: ${campaign.name}`)
            }
          })
          
          console.log('🔍 [SOURCE STATS] Agrupamento por fonte:', sourceGroups)
          
          if (Object.keys(sourceGroups).length > 0) {
            const mapped = Object.entries(sourceGroups).map(([sourceName, totalCost]) => ({
              key: sourceName,
              cost: totalCost,
            }))
            
            const sortedData = mapped.sort((a: { cost: number }, b: { cost: number }) => b.cost - a.cost)
            console.log('🔍 [SOURCE STATS] Dados processados:', sortedData)
            
            // Log final com resumo
            console.log('🔍 [SOURCE STATS] 📊 RESUMO FINAL:')
            sortedData.forEach((item, index) => {
              console.log(`🔍 [SOURCE STATS] ${index + 1}. ${item.key}: ${formatCurrency(item.cost)}`)
            })
            console.log(`🔍 [SOURCE STATS] Total de fontes: ${sortedData.length}`)
            console.log(`🔍 [SOURCE STATS] Total investido: ${formatCurrency(sortedData.reduce((sum, item) => sum + item.cost, 0))}`)
            
            setSourceStats(sortedData)
            console.log('🔍 [SOURCE STATS] ✅ Estado sourceStats atualizado com:', sortedData.length, 'itens')
            return
          } else {
            console.log('⚠️ [SOURCE STATS] Nenhuma campanha com custo encontrada')
          }
        } else {
          console.log('🔍 [SOURCE STATS] ❌ Nenhuma campanha encontrada no estado campaigns')
        }
        
        // Se não houver dados, mostrar array vazio
        console.log('🔍 [SOURCE STATS] Nenhum dado disponível')
        setSourceStats([])
        
      } catch (err) {
        console.error('❌ [SOURCE STATS] Erro ao processar dados de fontes:', err)
        setSourceStats([])
      }
    }
    
    processSourceStatsFromExistingCampaigns()
  }, [apiKey, selectedPeriod, customRange, campaigns]) // Adicionar campaigns como dependência


  // Verificar se usuário tem plano ativo
  if (!hasActivePlan) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você precisa de um plano ativo para acessar o dashboard.</p>
          <p className="text-sm text-gray-500">Entre em contato com o suporte para ativar seu plano.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vmetrics-primary"></div>
      </div>
    )
  }

  const metrics = getMetricsFromData(dashboardData)

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header com ações */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <MetricsSelector />
          <MetricsOrder />
        </div>
      </div>

      {/* REMOVER: Seção de filtros avançados */}
      {/* <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200"
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
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Canal de Tráfego
              </label>
              <CustomSelect
                value={tempFilters.traffic_channel}
                onChange={(value) => setTempFilters(prev => ({ ...prev, traffic_channel: value }))}
                options={trafficChannelOptions}
                placeholder="Selecione um canal"
                className="w-full"
              />
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
        </motion.div> */}

      {/* Período Dropdown */}
      {/* Removido: PeriodDropdown duplicado do Dashboard */}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getMetricsFromData(dashboardData).map((metric) => {
          return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-4 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-600 truncate">{metric.label}</p>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 hover:text-[#3cd48f] cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {metric.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${
                  metric.isNegative 
                    ? 'text-red-500' // ✅ Valor negativo em vermelho
                    : 'bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 bg-clip-text text-transparent' // ✅ Valor positivo no gradiente verde
                }`}>
                  {metric.value}
                </p>
              </div>
            </div>
          </motion.div>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversões por Dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="w-6 h-6 text-[#3cd48f]" />
            <h3 className="text-xl font-semibold text-gray-800">Conversões por Dia</h3>
          </div>
          
          {dailyData && dailyData.length > 0 ? (
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
          )}
        </motion.div>

        {/* Cruzamento Diário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Shuffle className="w-6 h-6 text-[#3cd48f]" />
              <h3 className="text-xl font-semibold text-gray-800">Cruzamento Diário</h3>
            </div>
            
            <div className="flex items-center gap-2 bg-[#3cd48f]/10 border border-[#3cd48f]/20 rounded-xl px-4 py-2 shadow-sm">
              <TrendingUp className="w-4 h-4 text-[#3cd48f]" />
              <select
                value={crossMetric}
                onChange={e => setCrossMetric(e.target.value)}
                className="rounded-xl border-0 bg-transparent text-base font-semibold text-[#3cd48f] focus:outline-none focus:ring-2 focus:ring-[#3cd48f]/40"
              >
                {metricOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {dailyDataWithProfit && dailyDataWithProfit.length > 0 ? (
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
          )}
        </motion.div>

        {/* Investimento por Fonte de Tráfego */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">💰 Investimento por Fonte de Tráfego</h3>
            {sourceStats.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Investido</p>
                <p className="text-lg font-bold text-[#3cd48f]">
                  {formatCurrency(sourceStats.reduce((sum, item) => sum + item.cost, 0))}
                </p>
              </div>
            )}
          </div>
          {sourceStats.length > 0 ? (
            <div className="w-full h-[320px] flex flex-col justify-center">
              {/* Aviso se são dados históricos */}
              {sourceStats.some((item: any) => item.isHistorical) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center text-yellow-800">
                    <span className="text-sm">⚠️</span>
                    <span className="text-sm ml-2">
                      Dados históricos (últimos 30 dias) - período atual sem dados
                    </span>
                  </div>
                </div>
              )}
              
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
                  <Tooltip 
                    formatter={(v: any, name: any) => [
                      formatCurrency(v), 
                      name === 'cost' ? 'Investimento Total' : name
                    ]}
                    labelFormatter={(label) => `Fonte: ${label}`}
                    contentStyle={{ 
                      borderRadius: 12, 
                      background: '#fff', 
                      boxShadow: '0 4px 24px #0001',
                      border: '1px solid #3cd48f20'
                    }} 
                  />
                  <Bar dataKey="cost" name="Investimento" fill="#3cd48f" radius={[0, 12, 12, 0]} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-12">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-lg font-semibold mb-2">Investimento por Fonte</p>
              <p className="text-sm">Sem dados de custo por fonte de tráfego para o período selecionado</p>
              <p className="text-xs mt-2 text-gray-500">Verifique se suas campanhas têm dados de custo configurados</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard 