import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer, 
  ShoppingCart, 
  Target,
  BarChart3,
  SplitSquareVertical,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Activity
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import { useDateRangeStore } from '../store/dateRange'
import { getDateRange } from '../lib/utils'
import PeriodDropdown from './ui/PeriodDropdown'

interface FunnelStage {
  name: string
  value: number
  percentage: number
  icon: React.ReactNode
  color: string
  gradient: string
  description: string
}

interface FunnelData {
  campaignId: string
  campaignName: string
  stages: FunnelStage[]
  totalConversionRate: number
  totalVolume: number
}

interface FunnelComparison {
  campaign1: FunnelData | null
  campaign2: FunnelData | null
}

const Funnel: React.FC = () => {
  const { apiKey } = useAuthStore()
  const { selectedPeriod, customRange } = useDateRangeStore()
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
  const [comparisonMode, setComparisonMode] = useState(false)
  const [comparison, setComparison] = useState<FunnelComparison>({
    campaign1: null,
    campaign2: null
  })
  const [selectedCampaign1, setSelectedCampaign1] = useState<string>('')
  const [selectedCampaign2, setSelectedCampaign2] = useState<string>('')
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'APPROVED',
    type: 'conversion'
  })

  // Buscar campanhas disponíveis
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!apiKey) return
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      try {
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
        
        const response = await fetch(url.toString())
        const data = await response.json()
        let items = Array.isArray(data) ? data : []
        
        // Filtrar campanhas com atividade
        const activeCampaigns = items.filter((item: any) => {
          const hasClicks = item.clicks > 0 || (item.stat && item.stat.clicks > 0)
          const hasConversions = item.conversions > 0 || (item.stat && item.stat.conversions > 0)
          return hasClicks || hasConversions
        })
        
        setCampaigns(activeCampaigns.map((item: any) => ({
          id: item.id,
          name: item.title || item.campaign || item.campaign_name || item.name || 'Campanha sem nome',
        })))
      } catch (err) {
        console.error('Erro ao buscar campanhas:', err)
        setCampaigns([])
      }
    }
    fetchCampaigns()
  }, [apiKey, selectedPeriod, customRange])



  // Carregar dados do funil
  const loadFunnelData = async (campaignId: string = 'all') => {
    if (!apiKey) return null
    
    setLoading(true)
    const dateRange = getDateRange(selectedPeriod, customRange)
    
    try {
      // Usar a nova API de funil
      const funnelParams = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        per: 1000,
        ...filters
      }
      if (campaignId !== 'all') {
        funnelParams.campaign_id = campaignId
      }
      
      const funnelUrl = new URL('/api/funnel', window.location.origin)
      Object.entries(funnelParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          funnelUrl.searchParams.set(key, value.toString())
        }
      })
      
      const funnelResponse = await fetch(funnelUrl.toString())
      const funnelData = await funnelResponse.json()
      
      if (!funnelData.stages || funnelData.stages.length === 0) {
        return null
      }

      // Mapear dados da API para o formato do componente
      const stages = funnelData.stages.map((stage: any) => ({
        name: stage.name,
        value: stage.value,
        percentage: stage.percentage,
        icon: getStageIcon(stage.name),
        color: getStageColor(stage.name),
        gradient: getStageGradient(stage.name),
        description: stage.description
      }))

      const campaignName = campaignId === 'all' 
        ? 'Todas as Campanhas' 
        : campaigns.find(c => c.id === campaignId)?.name || 'Campanha'

      return {
        campaignId,
        campaignName,
        stages,
        totalConversionRate: funnelData.totalConversionRate,
        totalVolume: funnelData.totalVolume
      }
    } catch (error) {
      console.error('Erro ao carregar dados do funil:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Funções auxiliares para mapear ícones e cores
  const getStageIcon = (stageName: string) => {
    switch (stageName) {
      case 'Cliques':
        return <MousePointer className="w-4 h-4" />
      case 'Pre-LP':
        return <Eye className="w-4 h-4" />
      case 'LP':
        return <Activity className="w-4 h-4" />
      case 'Offer':
        return <ShoppingCart className="w-4 h-4" />
      case 'InitiateCheckout':
        return <Zap className="w-4 h-4" />
      case 'Conversão':
        return <Target className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getStageColor = (stageName: string) => {
    switch (stageName) {
      case 'Cliques':
        return 'bg-blue-500'
      case 'Pre-LP':
        return 'bg-green-500'
      case 'LP':
        return 'bg-purple-500'
      case 'Offer':
        return 'bg-orange-500'
      case 'InitiateCheckout':
        return 'bg-yellow-500'
      case 'Conversão':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStageGradient = (stageName: string) => {
    switch (stageName) {
      case 'Cliques':
        return 'from-blue-500 to-blue-600'
      case 'Pre-LP':
        return 'from-green-500 to-green-600'
      case 'LP':
        return 'from-purple-500 to-purple-600'
      case 'Offer':
        return 'from-orange-500 to-orange-600'
      case 'InitiateCheckout':
        return 'from-yellow-500 to-yellow-600'
      case 'Conversão':
        return 'from-red-500 to-red-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  // Carregar dados quando mudar campanha selecionada
  useEffect(() => {
    if (!comparisonMode) {
      loadFunnelData(selectedCampaign).then(setFunnelData)
    }
  }, [apiKey, selectedPeriod, customRange, selectedCampaign, filters, comparisonMode])

  // Carregar dados para comparação
  const loadComparisonData = async () => {
    if (!selectedCampaign1 || !selectedCampaign2) return
    
    setLoading(true)
    
    const campaign1Data = await loadFunnelData(selectedCampaign1)
    const campaign2Data = await loadFunnelData(selectedCampaign2)
    
    setComparison({
      campaign1: campaign1Data,
      campaign2: campaign2Data
    })
    
    setLoading(false)
  }

  useEffect(() => {
    if (comparisonMode && selectedCampaign1 && selectedCampaign2) {
      loadComparisonData()
    }
  }, [comparisonMode, selectedCampaign1, selectedCampaign2, selectedPeriod, customRange, filters])

  const handleRefresh = () => {
    setRefreshing(true)
    if (comparisonMode) {
      loadComparisonData().finally(() => setRefreshing(false))
    } else {
      loadFunnelData(selectedCampaign).then(setFunnelData).finally(() => setRefreshing(false))
    }
  }

  // Componente de visualização 3D do funil
  const Funnel3DVisualization: React.FC<{ stages: FunnelStage[] }> = ({ stages }) => {
    return (
      <div className="relative w-full h-80 bg-gradient-to-b from-gray-50 to-white rounded-3xl p-6 overflow-hidden">
        {/* Background 3D effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Seta para próxima etapa */}
              {index > 0 && (
                <div className="flex justify-center mb-2">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-gray-300 to-transparent relative">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-gray-400 rotate-45"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Estágio do funil */}
              <div className={`
                relative group cursor-pointer transform transition-all duration-300 hover:scale-105
                ${stage.gradient} bg-gradient-to-r text-white rounded-2xl p-4 shadow-2xl
                border border-white/20 backdrop-blur-sm
                ${index === 0 ? 'w-80' : index === 1 ? 'w-72' : index === 2 ? 'w-64' : index === 3 ? 'w-56' : 'w-48'}
              `}>
                {/* Efeito 3D */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      {stage.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{stage.name}</h4>
                      <p className="text-sm opacity-90">{stage.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {stage.value.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm opacity-90">
                      {stage.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Barra de progresso */}
                <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Componente de comparação
  const ComparisonView: React.FC = () => {
    if (!comparison.campaign1 || !comparison.campaign2) {
      return (
        <div className="text-center py-12">
                        <SplitSquareVertical className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Selecione duas campanhas</h3>
          <p className="text-gray-500">Escolha duas campanhas para comparar seus funis</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campanha 1 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {comparison.campaign1.campaignName}
          </h3>
          <Funnel3DVisualization stages={comparison.campaign1.stages} />
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {comparison.campaign1.totalConversionRate.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Taxa de conversão total</div>
          </div>
        </div>

        {/* Campanha 2 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {comparison.campaign2.campaignName}
          </h3>
          <Funnel3DVisualization stages={comparison.campaign2.stages} />
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {comparison.campaign2.totalConversionRate.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Taxa de conversão total</div>
          </div>
        </div>

        {/* Comparação de métricas */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparação de Métricas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comparison.campaign1.stages.map((stage1, index) => {
              const stage2 = comparison.campaign2.stages[index]
              if (!stage2) return null
              
              const difference = stage1.percentage - stage2.percentage
              const isBetter = difference > 0
              
              return (
                <div key={stage1.name} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">{stage1.name}</h4>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <div className="text-blue-600 font-semibold">{stage1.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{comparison.campaign1.campaignName}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-purple-600 font-semibold">{stage2.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{comparison.campaign2.campaignName}</div>
                    </div>
                  </div>
                  <div className={`mt-2 text-xs font-semibold ${isBetter ? 'text-green-600' : 'text-red-600'}`}>
                    {isBetter ? '+' : ''}{difference.toFixed(1)}% diferença
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Funil de Conversão</h1>
            <p className="text-gray-600">Análise completa do funil de marketing com detecção automática de estágios</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <PeriodDropdown />
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </Button>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
            
            <Button
              onClick={() => setComparisonMode(!comparisonMode)}
              variant={comparisonMode ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <SplitSquareVertical className="w-4 h-4" />
              <span>{comparisonMode ? 'Modo Simples' : 'Comparar'}</span>
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 mb-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="APPROVED">Aprovadas</option>
                  <option value="PENDING">Pendentes</option>
                  <option value="DECLINED">Recusadas</option>
                  <option value="">Todas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="conversion">Conversão</option>
                  <option value="initiatecheckout">InitiateCheckout</option>
                  <option value="">Todos</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Seleção de campanhas */}
        {comparisonMode ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Campanhas para Comparação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Campanha 1</label>
                <select
                  value={selectedCampaign1}
                  onChange={(e) => setSelectedCampaign1(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma campanha</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Campanha 2</label>
                <select
                  value={selectedCampaign2}
                  onChange={(e) => setSelectedCampaign2(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma campanha</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Campanha</h3>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Campanhas</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Conteúdo */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : comparisonMode ? (
          <ComparisonView />
        ) : funnelData ? (
          <div className="space-y-6">
            {/* Visualização 3D */}
            <Funnel3DVisualization stages={funnelData.stages} />
            
            {/* Métricas resumidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {funnelData.totalVolume.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-600">Volume Total</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {funnelData.stages.length}
                </div>
                <div className="text-sm text-gray-600">Estágios Detectados</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {funnelData.totalConversionRate.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Conversão Total</div>
              </div>
            </div>
            
            {/* Tabela detalhada */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhamento por Estágio</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Estágio</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Volume</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Taxa de Conversão</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Perda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funnelData.stages.map((stage, index) => {
                      const previousStage = index > 0 ? funnelData.stages[index - 1] : null
                      const loss = previousStage ? previousStage.value - stage.value : 0
                      const lossPercentage = previousStage ? ((loss / previousStage.value) * 100) : 0
                      
                      return (
                        <tr key={stage.name} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${stage.color} text-white`}>
                                {stage.icon}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{stage.name}</div>
                                <div className="text-sm text-gray-500">{stage.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-gray-900">
                            {stage.value.toLocaleString('pt-BR')}
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-semibold text-green-600">
                              {stage.percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            {index > 0 ? (
                              <span className="font-semibold text-red-600">
                                -{loss.toLocaleString('pt-BR')} ({lossPercentage.toFixed(1)}%)
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum dado encontrado</h3>
            <p className="text-gray-500">Não foram encontrados dados de funil para os filtros selecionados</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Funnel 