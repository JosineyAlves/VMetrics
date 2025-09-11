import React, { useState, useEffect } from 'react'
import { 
  TrendingDown, 
  Filter, 
  RefreshCw, 
  SplitSquareVertical,
  ChevronDown,
  BarChart3,
  Users,
  Target,
  ShoppingCart,
  CheckCircle,
  Eye,
  MousePointer,
  ArrowRight,
  Percent,
  Activity,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'
import { useDateRangeStore } from '../store/dateRange'
import { Button } from './ui/button'
import { Input } from './ui/input'
import PeriodDropdown from './ui/PeriodDropdown'
import CustomSelect from './ui/CustomSelect'

interface FunnelStage {
  name: string
  value: number
  percentage: number
  icon: React.ReactNode
  color: string
  gradient: string
  description: string
  conversionRate: number
  dropoffRate: number
}

interface Campaign {
  id: string
  name: string
  source: string
  status: string
  spend: number
  revenue: number
  conversions: number
  clicks: number
  prelp_views: number
  prelp_clicks: number
  lp_views: number
  lp_clicks: number
  initiatecheckout: number
  all_conversions: number
}

interface FunnelData {
  stages: FunnelStage[]
  totalVolume: number
  totalConversionRate: number
  totalStages: number
  summary: {
    totalClicks: number
    totalConversions: number
    totalConversionRate: string
    totalRevenue: number
    totalSpend: number
    roi: number
  }
  campaign: Campaign
}

const Funnel: React.FC = () => {
  const { apiKey } = useAuthStore()
  const { selectedPeriod, customRange } = useDateRangeStore()
  
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [selectedCampaign2, setSelectedCampaign2] = useState<string>('')
  const [comparisonMode, setComparisonMode] = useState(false)
  const [funnelData2, setFunnelData2] = useState<FunnelData | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'comparison'>('3d')
  const [filters, setFilters] = useState({
    status: 'APPROVED',
    type: 'conversion'
  })

  // Função auxiliar para calcular taxa de conversão de forma segura
  const calculateConversionRate = (numerator: number, denominator: number): number => {
    if (denominator === 0 || !isFinite(denominator)) return 0
    const rate = (numerator / denominator) * 100
    return isFinite(rate) ? rate : 0
  }

  // Carregar campanhas disponíveis
  const loadCampaigns = async () => {
    if (!apiKey) return
    
    try {
      const { getDateRange } = await import('../lib/utils')
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      if (!dateRange.startDate || !dateRange.endDate) return
      
      const params = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate
      }
      
      const url = new URL('/api/campaigns', window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString())
        }
      })
      
      const response = await fetch(url.toString())
      const data = await response.json()
      
      if (data && data.campaigns && Array.isArray(data.campaigns)) {
        const campaignsArray = data.campaigns.map((item: any) => ({
          id: item.id,
          name: item.title || item.name || 'Campanha sem nome',
          source: item.source_title || item.source || '',
          status: item.status || 'active',
          spend: item.stat?.cost || 0,
          revenue: item.stat?.revenue || 0,
          conversions: item.stat?.conversions || 0,
          clicks: item.stat?.clicks || 0,
          prelp_views: item.stat?.prelp_views || 0,
          prelp_clicks: item.stat?.prelp_clicks || 0,
          lp_views: item.stat?.lp_views || 0,
          lp_clicks: item.stat?.lp_clicks || 0,
          initiatecheckout: item.stat?.convtype1 || 0,
          all_conversions: item.stat?.total_conversions || 0
        }))
        
        setCampaigns(campaignsArray)
        
        // Selecionar primeira campanha automaticamente
        if (campaignsArray.length > 0 && !selectedCampaign) {
          setSelectedCampaign(campaignsArray[0].id)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
    }
  }

  // Carregar dados do funil para uma campanha específica
  const loadFunnelData = async (campaignId?: string) => {
    if (!apiKey || !campaignId) return
    
    setLoading(true)
    setLoadingMessage('Analisando funil de conversão...')
    
    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return
      
      // Criar estágios do funil baseados nos dados da campanha
      const stages: FunnelStage[] = []
      
      // Estágio 1: Cliques
      if (campaign.clicks > 0) {
        stages.push({
          name: 'Cliques',
          value: campaign.clicks,
          percentage: 100,
          icon: <MousePointer className="w-4 h-4" />,
          color: '#3cd48f',
          gradient: 'from-[#3cd48f] to-[#3cd48f]/80',
          description: 'Total de cliques recebidos',
          conversionRate: 100,
          dropoffRate: 0
        })
      }
      
      // Estágio 2: Pre-LP Views
      if (campaign.prelp_views > 0) {
        const conversionRate = calculateConversionRate(campaign.prelp_views, campaign.clicks)
        stages.push({
          name: 'Pre-LP Views',
          value: campaign.prelp_views,
          percentage: conversionRate,
          icon: <Eye className="w-4 h-4" />,
          color: 'cyan',
          gradient: 'from-cyan-500 to-cyan-600',
          description: 'Visualizações da pré-landing page',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 3: Pre-LP Clicks
      if (campaign.prelp_clicks > 0) {
        const conversionRate = calculateConversionRate(campaign.prelp_clicks, campaign.clicks)
        stages.push({
          name: 'Pre-LP Clicks',
          value: campaign.prelp_clicks,
          percentage: conversionRate,
          icon: <MousePointer className="w-4 h-4" />,
          color: 'indigo',
          gradient: 'from-indigo-500 to-indigo-600',
          description: 'Cliques na pré-landing page',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 4: LP Views
      if (campaign.lp_views > 0) {
        const conversionRate = calculateConversionRate(campaign.lp_views, campaign.clicks)
        stages.push({
          name: 'LP Views',
          value: campaign.lp_views,
          percentage: conversionRate,
          icon: <Eye className="w-4 h-4" />,
          color: 'green',
          gradient: 'from-green-500 to-green-600',
          description: 'Visualizações da landing page',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 5: LP Clicks
      if (campaign.lp_clicks > 0) {
        const conversionRate = calculateConversionRate(campaign.lp_clicks, campaign.clicks)
        stages.push({
          name: 'LP Clicks',
          value: campaign.lp_clicks,
          percentage: conversionRate,
          icon: <MousePointer className="w-4 h-4" />,
          color: 'emerald',
          gradient: 'from-emerald-500 to-emerald-600',
          description: 'Cliques na landing page',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 6: Initiate Checkout
      if (campaign.initiatecheckout > 0) {
        const conversionRate = calculateConversionRate(campaign.initiatecheckout, campaign.clicks)
        stages.push({
          name: 'Initiate Checkout',
          value: campaign.initiatecheckout,
          percentage: conversionRate,
          icon: <ShoppingCart className="w-4 h-4" />,
          color: 'orange',
          gradient: 'from-orange-500 to-orange-600',
          description: 'Inícios de checkout',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 7: Conversões
      if (campaign.conversions > 0) {
        const conversionRate = calculateConversionRate(campaign.conversions, campaign.clicks)
        stages.push({
          name: 'Conversões',
          value: campaign.conversions,
          percentage: conversionRate,
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'red',
          gradient: 'from-red-500 to-red-600',
          description: 'Conversões finais',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Calcular métricas totais
      const totalConversionRate = calculateConversionRate(campaign.conversions, campaign.clicks)
      const roi = campaign.spend > 0 ? ((campaign.revenue - campaign.spend) / campaign.spend) * 100 : 0
      
      const funnelData: FunnelData = {
        stages,
        totalVolume: campaign.clicks,
        totalConversionRate,
        totalStages: stages.length,
        summary: {
          totalClicks: campaign.clicks,
          totalConversions: campaign.conversions,
          totalConversionRate: `${totalConversionRate.toFixed(2)}%`,
          totalRevenue: campaign.revenue,
          totalSpend: campaign.spend,
          roi
        },
        campaign
      }
      
      setFunnelData(funnelData)
      
    } catch (error) {
      console.error('Erro ao carregar dados do funil:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados quando campanha é selecionada
  const handleCampaignSelect = async (campaignId: string) => {
    setSelectedCampaign(campaignId)
    await loadFunnelData(campaignId)
  }

  const handleCampaign2Select = async (campaignId: string) => {
    setSelectedCampaign2(campaignId)
    // Carregar dados da segunda campanha para comparação
    if (campaignId) {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return
      
      // Criar estágios do funil para a segunda campanha
      const stages: FunnelStage[] = []
      
      // Estágio 1: Cliques
      if (campaign.clicks > 0) {
        stages.push({
          name: 'Cliques',
          value: campaign.clicks,
          percentage: 100,
          icon: <MousePointer className="w-4 h-4" />,
          color: '#3cd48f',
          gradient: 'from-[#3cd48f] to-[#3cd48f]/80',
          description: 'Total de cliques recebidos',
          conversionRate: 100,
          dropoffRate: 0
        })
      }
      
      // Estágio 2: Pre-LP Views
      if (campaign.prelp_views > 0) {
        const conversionRate = calculateConversionRate(campaign.prelp_views, campaign.clicks)
        stages.push({
          name: 'Pre-LP Views',
          value: campaign.prelp_views,
          percentage: conversionRate,
          icon: <Eye className="w-4 h-4" />,
          color: 'cyan',
          gradient: 'from-cyan-500 to-cyan-600',
          description: 'Visualizações da pré-landing page',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 3: Pre-LP Clicks
      if (campaign.prelp_clicks > 0) {
        const conversionRate = calculateConversionRate(campaign.prelp_clicks, campaign.clicks)
        stages.push({
          name: 'Pre-LP Clicks',
          value: campaign.prelp_clicks,
          percentage: conversionRate,
          icon: <MousePointer className="w-4 h-4" />,
          color: 'indigo',
          gradient: 'from-indigo-500 to-indigo-600',
          description: 'Cliques na pré-landing page',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 4: LP Views
      if (campaign.lp_views > 0) {
        const conversionRate = calculateConversionRate(campaign.lp_views, campaign.clicks)
        stages.push({
          name: 'LP Views',
          value: campaign.lp_views,
          percentage: conversionRate,
          icon: <Eye className="w-4 h-4" />,
          color: 'green',
          gradient: 'from-green-500 to-green-600',
          description: 'Visualizações da landing page',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 5: LP Clicks
      if (campaign.lp_clicks > 0) {
        const conversionRate = calculateConversionRate(campaign.lp_clicks, campaign.clicks)
        stages.push({
          name: 'LP Clicks',
          value: campaign.lp_clicks,
          percentage: conversionRate,
          icon: <MousePointer className="w-4 h-4" />,
          color: 'emerald',
          gradient: 'from-emerald-500 to-emerald-600',
          description: 'Cliques na landing page',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 6: Initiate Checkout
      if (campaign.initiatecheckout > 0) {
        const conversionRate = calculateConversionRate(campaign.initiatecheckout, campaign.clicks)
        stages.push({
          name: 'Initiate Checkout',
          value: campaign.initiatecheckout,
          percentage: conversionRate,
          icon: <ShoppingCart className="w-4 h-4" />,
          color: 'orange',
          gradient: 'from-orange-500 to-orange-600',
          description: 'Inícios de checkout',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Estágio 7: Conversões
      if (campaign.conversions > 0) {
        const conversionRate = calculateConversionRate(campaign.conversions, campaign.clicks)
        stages.push({
          name: 'Conversões',
          value: campaign.conversions,
          percentage: conversionRate,
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'red',
          gradient: 'from-red-500 to-red-600',
          description: 'Conversões finais',
          conversionRate: conversionRate,
          dropoffRate: 100 - conversionRate
        })
      }
      
      // Calcular métricas totais
      const totalConversionRate = calculateConversionRate(campaign.conversions, campaign.clicks)
      const roi = campaign.spend > 0 ? ((campaign.revenue - campaign.spend) / campaign.spend) * 100 : 0
      
      const funnelData2: FunnelData = {
        stages,
        totalVolume: campaign.clicks,
        totalConversionRate,
        totalStages: stages.length,
        summary: {
          totalClicks: campaign.clicks,
          totalConversions: campaign.conversions,
          totalConversionRate: `${totalConversionRate.toFixed(2)}%`,
          totalRevenue: campaign.revenue,
          totalSpend: campaign.spend,
          roi
        },
        campaign
      }
      
      setFunnelData2(funnelData2)
    } else {
      setFunnelData2(null)
    }
  }

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode)
    if (!comparisonMode) {
      setViewMode('comparison')
    } else {
      setViewMode('3d')
    }
  }

  const refreshData = async () => {
    await loadCampaigns()
    if (selectedCampaign) {
      await loadFunnelData(selectedCampaign)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [apiKey, selectedPeriod, customRange])

  useEffect(() => {
    if (selectedCampaign) {
      loadFunnelData(selectedCampaign)
    }
  }, [selectedCampaign])

  // Componente de visualização 3D do funil
  const Funnel3DVisualization: React.FC<{ data: FunnelData }> = ({ data }) => {
    // Cores para gradientes dos estágios
    const stageColors = [
      { from: '#3cd48f', to: '#2bb876' }, // Cliques - Verde principal
      { from: '#60a5fa', to: '#3b82f6' }, // Pre-LP Views - Azul
      { from: '#a78bfa', to: '#8b5cf6' }, // Pre-LP Clicks - Roxo
      { from: '#34d399', to: '#10b981' }, // LP Views - Verde esmeralda
      { from: '#fbbf24', to: '#f59e0b' }, // LP Clicks - Amarelo
      { from: '#fb923c', to: '#ea580c' }, // Initiate Checkout - Laranja
      { from: '#ef4444', to: '#dc2626' }  // Conversões - Vermelho
    ]

    return (
      <div className="relative w-full min-h-[400px] bg-white rounded-2xl p-4 overflow-visible shadow-lg">
        
        <div className="flex flex-col items-center py-2">
          {/* Header do funil */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Funil de Conversão - {data.campaign.name}
            </h3>
          </div>
          
          {/* Funil 3D ultra compacto com gradientes */}
          <div className="flex flex-col items-center space-y-0 w-full max-w-2xl">
            {data.stages.map((stage, index) => {
              // Calcular largura progressiva mais agressiva
              const baseWidth = 85 - (index * 12) // Começa em 85% e diminui 12% a cada estágio
              const width = Math.max(baseWidth, 35) // Mínimo de 35%
              const colors = stageColors[index] || stageColors[0]
              
              return (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                  className="flex flex-col items-center relative w-full"
                >
                  {/* Estágio do funil com gradiente personalizado */}
                  <div 
                    className="relative rounded-lg shadow-md flex items-center justify-center mb-0.5"
                    style={{
                      width: `${width}%`,
                      height: '40px',
                      minWidth: '200px',
                      background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`
                    }}
                  >
                    {/* Efeito 3D sutil */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-lg"></div>
                    
                    {/* Conteúdo do estágio */}
                    <div className="relative z-10 flex items-center justify-between w-full px-3 text-white">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs bg-white/20 rounded-full p-1">
                          {stage.icon}
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold">
                            {stage.value.toLocaleString()}
                          </div>
                          <div className="text-xs opacity-90">
                            {stage.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold">
                          {isFinite(stage.percentage) ? stage.percentage.toFixed(1) : '0.0'}%
                        </div>
                        <div className="text-xs opacity-75">
                          conv.
                        </div>
                      </div>
                    </div>
                    
                    {/* Sombra sutil */}
                    <div className="absolute -bottom-0.5 left-1 right-1 h-0.5 bg-black/10 rounded-b-lg blur-sm"></div>
                  </div>
                  
                  {/* Seta de conexão ultra compacta */}
                  {index < data.stages.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.08 + 0.15 }}
                      className="flex items-center justify-center w-4 h-4 my-0.5"
                    >
                      <div className="relative">
                        {/* Linha principal */}
                        <div className="w-0.5 h-3 bg-gradient-to-b from-gray-400 to-gray-500"></div>
                        {/* Seta */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-500"></div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
          
          {/* Resumo do funil ultra compacto */}
          <div className="mt-4 text-center w-full">
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-[#3cd48f]/10 to-[#3cd48f]/20 rounded-lg p-3 shadow-md border border-[#3cd48f]/20">
              <div className="text-center">
                <div className="text-sm font-bold text-[#3cd48f]">
                  {data.summary.totalClicks.toLocaleString()}
                </div>
                <div className="text-xs text-[#3cd48f] font-medium">Cliques</div>
              </div>
              <div className="w-px h-4 bg-[#3cd48f]/30"></div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-600">
                  {data.summary.totalConversions.toLocaleString()}
                </div>
                <div className="text-xs text-green-600 font-medium">Conversões</div>
              </div>
              <div className="w-px h-4 bg-[#3cd48f]/30"></div>
              <div className="text-center">
                <div className="text-sm font-bold text-[#3cd48f]">
                  {data.summary.totalConversionRate}
                </div>
                <div className="text-xs text-[#3cd48f] font-medium">Taxa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Componente de visualização 2D do funil
  const Funnel2DVisualization: React.FC<{ data: FunnelData }> = ({ data }) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Análise Detalhada do Funil
        </h3>
        
        <div className="space-y-4">
          {data.stages.map((stage, index) => (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stage.gradient} text-white`}>
                  {stage.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{stage.name}</h4>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-gray-800">
                  {stage.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {isFinite(stage.percentage) ? stage.percentage.toFixed(1) : '0.0'}% de conversão
                </div>
                {stage.dropoffRate > 0 && (
                  <div className="text-xs text-red-500">
                    -{isFinite(stage.dropoffRate) ? stage.dropoffRate.toFixed(1) : '0.0'}% perda
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Componente de comparação entre campanhas
  const ComparisonView: React.FC = () => {
    return (
      <div className="space-y-6">
        {/* Bloco unificado de comparação */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-[#3cd48f]" />
              Análise Comparativa de Campanhas
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Métricas lado a lado para análise de performance
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Métrica: Taxa de Conversão */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-[#3cd48f] rounded-full mx-auto mb-3">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Taxa de Conversão</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-lg font-bold text-[#3cd48f] mb-1">
                        {funnelData?.summary.totalConversionRate || '0%'}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {funnelData?.campaign.name || 'Campanha 1'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-lg font-bold text-green-600 mb-1">
                        {funnelData2?.summary.totalConversionRate || '0%'}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {funnelData2?.campaign.name || 'Campanha 2'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Métrica: ROI */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Retorno sobre Investimento</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-lg font-bold text-[#3cd48f] mb-1">
                        {funnelData?.summary.roi.toFixed(2) || '0.00'}%
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {funnelData?.campaign.name || 'Campanha 1'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-lg font-bold text-green-600 mb-1">
                        {funnelData2?.summary.roi.toFixed(2) || '0.00'}%
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {funnelData2?.campaign.name || 'Campanha 2'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Métrica: Conversões */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Conversões Aprovadas</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-lg font-bold text-[#3cd48f] mb-1">
                        {funnelData?.summary.totalConversions.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {funnelData?.campaign.name || 'Campanha 1'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="text-lg font-bold text-green-600 mb-1">
                        {funnelData2?.summary.totalConversions.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {funnelData2?.campaign.name || 'Campanha 2'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visualizações lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-3 h-3 bg-[#3cd48f] rounded-full mr-2"></div>
              {funnelData?.campaign.name || 'Campanha 1'}
            </h3>
            {funnelData && <Funnel2DVisualization data={funnelData} />}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              {funnelData2?.campaign.name || 'Campanha 2'}
            </h3>
            {funnelData2 ? (
              <Funnel2DVisualization data={funnelData2} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📈</div>
                <p>Selecione uma segunda campanha para comparar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        
        {/* Controles */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Seletor de Campanha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campanha Principal
              </label>
              <CustomSelect
                value={selectedCampaign}
                onChange={(value) => handleCampaignSelect(value)}
                options={[
                  { value: '', label: 'Selecione uma campanha' },
                  ...campaigns.map((campaign) => ({
                    value: campaign.id,
                    label: campaign.name
                  }))
                ]}
                placeholder="Selecione uma campanha"
                className="w-full"
              />
            </div>
            
            {/* Seletor de Campanha 2 (para comparação) */}
            {comparisonMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campanha para Comparar
                </label>
                <CustomSelect
                  value={selectedCampaign2}
                  onChange={(value) => handleCampaign2Select(value)}
                  options={[
                    { value: '', label: 'Selecione uma campanha' },
                    ...campaigns.map((campaign) => ({
                      value: campaign.id,
                      label: campaign.name
                    }))
                  ]}
                  placeholder="Selecione uma campanha"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Modo de Visualização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de Visualização
              </label>
              <CustomSelect
                value={viewMode}
                onChange={(value) => setViewMode(value as '3d' | '2d' | 'comparison')}
                options={[
                  { value: '3d', label: 'Visualização 3D' },
                  { value: '2d', label: 'Análise Detalhada' },
                  { value: 'comparison', label: 'Comparação' }
                ]}
                placeholder="Selecione o modo"
                className="w-full"
              />
            </div>
            
            {/* Botão Comparar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ações
              </label>
              <Button
                onClick={toggleComparisonMode}
                variant={comparisonMode ? "primary" : "outline"}
                className="w-full flex items-center justify-center space-x-2"
              >
                <SplitSquareVertical className="w-4 h-4" />
                <span>Comparar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3cd48f]"></div>
            <span className="text-gray-600">{loadingMessage}</span>
          </div>
        </div>
      )}
      
      {/* Content */}
      {!loading && (
        <AnimatePresence mode="wait">
          {viewMode === '3d' && funnelData && (
            <motion.div
              key="3d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Funnel3DVisualization data={funnelData} />
            </motion.div>
          )}
          
          {viewMode === '2d' && funnelData && (
            <motion.div
              key="2d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Funnel2DVisualization data={funnelData} />
            </motion.div>
          )}
          
          {viewMode === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ComparisonView />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {/* Empty State */}
      {!loading && !funnelData && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Selecione uma campanha
          </h3>
          <p className="text-gray-600">
            Escolha uma campanha para visualizar seu funil de conversão
          </p>
        </div>
      )}
    </div>
  )
}

export default Funnel
