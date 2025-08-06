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
  MousePointer
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useDateRangeStore } from '../store/dateRange'
import { Button } from './ui/button'
import { Input } from './ui/input'
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

interface Campaign {
  id: string
  name: string
  source: string
  status: string
  spend: number
  revenue: number
  conversions: number
  clicks: number
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
  }
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
  const [filters, setFilters] = useState({
    status: 'APPROVED',
    type: 'conversion'
  })

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
          name: item.title || 'Campanha sem nome',
          source: item.source_title || '',
          status: item.status || 'active',
          spend: item.stat?.cost || 0,
          revenue: item.stat?.revenue || 0,
          conversions: item.stat?.conversions || 0,
          clicks: item.stat?.clicks || 0
        }))
        
        setCampaigns(campaignsArray)
        console.log('Campanhas carregadas:', campaignsArray.length)
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
    }
  }

  // Carregar dados do funil para uma campanha específica
  const loadFunnelData = async (campaignId?: string) => {
    if (!apiKey) return
    
    setLoading(true)
    setLoadingMessage('Carregando dados do funil...')
    
    try {
      const { getDateRange } = await import('../lib/utils')
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      if (!dateRange.startDate || !dateRange.endDate) return
      
      const params = {
        api_key: apiKey,
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        status: filters.status,
        type: filters.type,
        ...(campaignId && { campaign_id: campaignId })
      }
      
      const url = new URL('/api/funnel', window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString())
        }
      })
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Processar estágios do funil com ícones e cores
      const processedStages = data.stages.map((stage: any, index: number) => {
        const stageConfig = getStageConfig(stage.name, index)
        return {
          ...stage,
          icon: stageConfig.icon,
          color: stageConfig.color,
          gradient: stageConfig.gradient
        }
      })
      
      const processedData = {
        ...data,
        stages: processedStages
      }
      
      return processedData
    } catch (error) {
      console.error('Erro ao carregar dados do funil:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Configuração visual para cada estágio do funil
  const getStageConfig = (stageName: string, index: number) => {
    const configs = {
      'Cliques': {
        icon: <MousePointer className="w-6 h-6" />,
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-blue-600'
      },
      'Pre-LP': {
        icon: <Eye className="w-6 h-6" />,
        color: 'text-purple-600',
        gradient: 'from-purple-500 to-purple-600'
      },
      'LP': {
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'text-green-600',
        gradient: 'from-green-500 to-green-600'
      },
      'Offer': {
        icon: <Target className="w-6 h-6" />,
        color: 'text-orange-600',
        gradient: 'from-orange-500 to-orange-600'
      },
      'InitiateCheckout': {
        icon: <ShoppingCart className="w-6 h-6" />,
        color: 'text-yellow-600',
        gradient: 'from-yellow-500 to-yellow-600'
      },
      'Conversão': {
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'text-red-600',
        gradient: 'from-red-500 to-red-600'
      }
    }
    
    return configs[stageName as keyof typeof configs] || {
      icon: <Users className="w-6 h-6" />,
      color: 'text-gray-600',
      gradient: 'from-gray-500 to-gray-600'
    }
  }

  // Carregar dados quando campanha é selecionada
  const handleCampaignSelect = async (campaignId: string) => {
    setSelectedCampaign(campaignId)
    const data = await loadFunnelData(campaignId)
    setFunnelData(data)
  }

  // Carregar dados para comparação
  const handleCampaign2Select = async (campaignId: string) => {
    setSelectedCampaign2(campaignId)
    const data = await loadFunnelData(campaignId)
    setFunnelData2(data)
  }

  // Alternar modo de comparação
  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode)
    if (!comparisonMode) {
      setSelectedCampaign2('')
      setFunnelData2(null)
    }
  }

  // Atualizar dados
  const refreshData = async () => {
    if (selectedCampaign) {
      const data = await loadFunnelData(selectedCampaign)
      setFunnelData(data)
    }
    if (comparisonMode && selectedCampaign2) {
      const data2 = await loadFunnelData(selectedCampaign2)
      setFunnelData2(data2)
    }
  }

  // Carregar campanhas na inicialização
  useEffect(() => {
    loadCampaigns()
  }, [apiKey, selectedPeriod, customRange])

  // Componente de visualização 3D do funil
  const Funnel3DVisualization: React.FC<{ data: FunnelData }> = ({ data }) => {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Funil de Conversão</h3>
            <p className="text-gray-600">Taxa de conversão total: {data.summary.totalConversionRate}</p>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            {data.stages.map((stage, index) => (
              <div key={stage.name} className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stage.gradient} flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                  {stage.icon}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-semibold text-gray-800">{stage.name}</p>
                  <p className="text-xs text-gray-600">{stage.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stage.percentage.toFixed(1)}%</p>
                </div>
                {index < data.stages.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 mt-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Componente de comparação
  const ComparisonView: React.FC = () => {
    if (!funnelData || !funnelData2) return null

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {campaigns.find(c => c.id === selectedCampaign)?.name || 'Campanha 1'}
          </h4>
          <Funnel3DVisualization data={funnelData} />
        </div>
        
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {campaigns.find(c => c.id === selectedCampaign2)?.name || 'Campanha 2'}
          </h4>
          <Funnel3DVisualization data={funnelData2} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Comparação de Métricas</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-lg font-bold text-gray-800">{funnelData.summary.totalConversionRate}</p>
                <p className="text-lg font-bold text-gray-800">{funnelData2.summary.totalConversionRate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total de Cliques</p>
                <p className="text-lg font-bold text-gray-800">{funnelData.summary.totalClicks.toLocaleString()}</p>
                <p className="text-lg font-bold text-gray-800">{funnelData2.summary.totalClicks.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Conversões</p>
                <p className="text-lg font-bold text-gray-800">{funnelData.summary.totalConversions.toLocaleString()}</p>
                <p className="text-lg font-bold text-gray-800">{funnelData2.summary.totalConversions.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Estágios</p>
                <p className="text-lg font-bold text-gray-800">{funnelData.totalStages}</p>
                <p className="text-lg font-bold text-gray-800">{funnelData2.totalStages}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Funil de Conversão</h1>
          <p className="text-sm text-gray-600">Análise completa do funil de marketing</p>
        </div>
        
        <div className="flex gap-3">
          <PeriodDropdown
            value={selectedPeriod}
            customRange={customRange}
            onChange={(period, range) => {
              // O onChange será tratado pelo App.tsx globalmente
            }}
          />
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          
          <Button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={toggleComparisonMode}
            variant={comparisonMode ? "primary" : "outline"}
            className="flex items-center gap-2"
          >
            <SplitSquareVertical className="w-4 h-4" />
            Comparar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="APPROVED">Aprovado</option>
                <option value="PENDING">Pendente</option>
                <option value="DECLINED">Recusado</option>
                <option value="ALL">Todos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="conversion">Conversão</option>
                <option value="initiatecheckout">Início de Checkout</option>
                <option value="ALL">Todos</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Seleção de Campanhas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Campanha</h3>
        
        {comparisonMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campanha 1</label>
              <select
                value={selectedCampaign}
                onChange={(e) => handleCampaignSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma campanha</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campanha 2</label>
              <select
                value={selectedCampaign2}
                onChange={(e) => handleCampaign2Select(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma campanha</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campanha</label>
            <select
              value={selectedCampaign}
              onChange={(e) => handleCampaignSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione uma campanha</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Dados do Funil */}
      {!loading && (
        <>
          {comparisonMode ? (
            <ComparisonView />
          ) : (
            funnelData && (
              <div className="space-y-6">
                <Funnel3DVisualization data={funnelData} />
                
                {/* Tabela Detalhada */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes do Funil</h3>
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
                          const previousValue = index > 0 ? funnelData.stages[index - 1].value : stage.value
                          const loss = previousValue - stage.value
                          const lossPercentage = previousValue > 0 ? (loss / previousValue) * 100 : 0
                          
                          return (
                            <tr key={stage.name} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${stage.gradient} flex items-center justify-center text-white`}>
                                    {stage.icon}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">{stage.name}</p>
                                    <p className="text-sm text-gray-600">{stage.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-right py-3 px-4 font-medium text-gray-800">
                                {stage.value.toLocaleString()}
                              </td>
                              <td className="text-right py-3 px-4 font-medium text-gray-800">
                                {stage.percentage.toFixed(1)}%
                              </td>
                              <td className="text-right py-3 px-4">
                                {index > 0 && (
                                  <span className="text-red-600 font-medium">
                                    -{loss.toLocaleString()} ({lossPercentage.toFixed(1)}%)
                                  </span>
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
            )
          )}
        </>
      )}

      {/* Mensagem quando nenhuma campanha está selecionada */}
      {!loading && !funnelData && !comparisonMode && (
        <div className="text-center py-12">
          <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Selecione uma Campanha</h3>
          <p className="text-gray-500">Escolha uma campanha para visualizar o funil de conversão</p>
        </div>
      )}
    </div>
  )
}

export default Funnel 