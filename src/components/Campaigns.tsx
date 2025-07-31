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
  Trash2,
  Settings
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import { useCurrencyStore } from '../store/currency'
import { useDateRangeStore } from '../store/dateRange'
import MetricsOrder from './MetricsOrder'

interface Campaign {
  id: string
  name: string
  source: string
  status: string
  spend: number
  revenue: number
  cpa: number
  roi: number
  conversions: number
  clicks: number
  unique_clicks: number
  impressions: number
  all_conversions: number
  approved: number
  pending: number
  declined: number
  ctr: number
  conversion_rate: number
  cpc: number
  epc: number
  epl: number
  roas: number
  isUserDeleted: boolean
}

const Campaigns: React.FC = () => {
  const { apiKey } = useAuthStore()
  const { currency } = useCurrencyStore()
  const { selectedPeriod, customRange } = useDateRangeStore()
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showMetricsOrder, setShowMetricsOrder] = useState(false)
  const [deletedCampaigns, setDeletedCampaigns] = useState<Set<string>>(new Set())

  // Estado para ordem das métricas
  const [metricsOrder, setMetricsOrder] = useState([
    { id: 'actions', label: 'Ações', key: 'actions', visible: true },
    { id: 'name', label: 'Campanha', key: 'name', visible: true },
    { id: 'source', label: 'Fonte', key: 'source', visible: true },
    { id: 'status', label: 'Status', key: 'status', visible: true },
    { id: 'clicks', label: 'Cliques', key: 'clicks', visible: true },
    { id: 'unique_clicks', label: 'Cliques Únicos', key: 'unique_clicks', visible: true },
    { id: 'impressions', label: 'Impressões', key: 'impressions', visible: true },
    { id: 'conversions', label: 'Conversões', key: 'conversions', visible: true },
    { id: 'all_conversions', label: 'Todas Conversões', key: 'all_conversions', visible: true },
    { id: 'approved', label: 'Aprovadas', key: 'approved', visible: true },
    { id: 'pending', label: 'Pendentes', key: 'pending', visible: true },
    { id: 'declined', label: 'Recusadas', key: 'declined', visible: true },
    { id: 'ctr', label: 'CTR', key: 'ctr', visible: true },
    { id: 'conversion_rate', label: 'Taxa Conv.', key: 'conversion_rate', visible: true },
    { id: 'spend', label: 'Gasto', key: 'spend', visible: true },
    { id: 'revenue', label: 'Receita', key: 'revenue', visible: true },
    { id: 'roi', label: 'ROI', key: 'roi', visible: true },
    { id: 'cpa', label: 'CPA', key: 'cpa', visible: true },
    { id: 'cpc', label: 'CPC', key: 'cpc', visible: true },
    { id: 'epc', label: 'EPC', key: 'epc', visible: true },
    { id: 'epl', label: 'EPL', key: 'epl', visible: true },
    { id: 'roas', label: 'ROAS', key: 'roas', visible: true }
  ])

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value)
  }

  // Carregar campanhas deletadas do localStorage
  useEffect(() => {
    const savedDeletedCampaigns = localStorage.getItem('deletedCampaigns')
    if (savedDeletedCampaigns) {
      setDeletedCampaigns(new Set(JSON.parse(savedDeletedCampaigns)))
    }
  }, [])

  // Função para carregar campanhas
  const loadCampaigns = async () => {
    if (!apiKey) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns?api_key=' + apiKey)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        const campaignsArray = data.map((item: any) => {
          const stat = item.stat || {}
          const campaignName = item.title || 'Campanha sem nome'
          const isUserDeleted = deletedCampaigns.has(campaignName.toLowerCase().trim())
          
          return {
            id: item.id,
            name: campaignName,
            source: item.source_title || '',
            status: isUserDeleted ? 'inactive' : (item.status || 'active'),
            spend: stat.cost || 0,
            revenue: stat.revenue || 0,
            cpa: stat.cpa || 0,
            roi: stat.roi || 0,
            conversions: stat.conversions || 0,
            clicks: stat.clicks || 0,
            unique_clicks: stat.unique_clicks || 0,
            impressions: stat.impressions || 0,
            all_conversions: stat.all_conversions || 0,
            approved: stat.approved || 0,
            pending: stat.pending || 0,
            declined: stat.declined || 0,
            ctr: stat.ctr || 0,
            conversion_rate: stat.conversion_rate || 0,
            cpc: stat.cpc || 0,
            epc: stat.epc || 0,
            epl: stat.epl || 0,
            roas: stat.roas || 0,
            isUserDeleted: isUserDeleted
          }
        })
        
        setCampaigns(campaignsArray)
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar campanhas quando a API key mudar
  useEffect(() => {
    if (apiKey) {
      loadCampaigns()
    }
  }, [apiKey, deletedCampaigns])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />
      case 'paused':
        return <Pause className="w-4 h-4" />
      case 'deleted':
        return <Trash2 className="w-4 h-4" />
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
    
    return matchesSearch
  })

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-600 shadow-sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Campanhas
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowMetricsOrder(true)}
            className="px-4 py-2 rounded-xl border border-gray-400 text-gray-700 font-semibold bg-white shadow-lg hover:bg-gray-100 transition"
          >
            <Settings className="w-4 h-4 mr-2 inline" />
            Colunas
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

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-blue-600 font-medium">Carregando campanhas...</span>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {metricsOrder.filter(metric => metric.visible).map((metric) => (
                  <th key={metric.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {metric.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign, index) => (
                <motion.tr 
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  {metricsOrder.filter(metric => metric.visible).map((metric) => {
                    switch (metric.key) {
                      case 'actions':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                title="Marcar como deletada"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        )
                      case 'name':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          </td>
                        )
                      case 'source':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{campaign.source}</div>
                          </td>
                        )
                      case 'status':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {getStatusIcon(campaign.status)}
                              <span className="ml-1">{campaign.status}</span>
                            </span>
                          </td>
                        )
                      case 'clicks':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.clicks.toLocaleString()}</div>
                          </td>
                        )
                      case 'unique_clicks':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.unique_clicks.toLocaleString()}</div>
                          </td>
                        )
                      case 'impressions':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.impressions.toLocaleString()}</div>
                          </td>
                        )
                      case 'conversions':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.conversions.toLocaleString()}</div>
                          </td>
                        )
                      case 'all_conversions':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.all_conversions.toLocaleString()}</div>
                          </td>
                        )
                      case 'approved':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.approved.toLocaleString()}</div>
                          </td>
                        )
                      case 'pending':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.pending.toLocaleString()}</div>
                          </td>
                        )
                      case 'declined':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.declined.toLocaleString()}</div>
                          </td>
                        )
                      case 'ctr':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.ctr}%</div>
                          </td>
                        )
                      case 'conversion_rate':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.conversion_rate}%</div>
                          </td>
                        )
                      case 'spend':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(campaign.spend)}</div>
                          </td>
                        )
                      case 'revenue':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(campaign.revenue)}</div>
                          </td>
                        )
                      case 'roi':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.roi}%</div>
                          </td>
                        )
                      case 'cpa':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(campaign.cpa)}</div>
                          </td>
                        )
                      case 'cpc':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(campaign.cpc)}</div>
                          </td>
                        )
                      case 'epc':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(campaign.epc)}</div>
                          </td>
                        )
                      case 'epl':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(campaign.epl)}</div>
                          </td>
                        )
                      case 'roas':
                        return (
                          <td key={metric.id} className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.roas}%</div>
                          </td>
                        )
                      default:
                        return <td key={metric.id} className="px-4 py-3 whitespace-nowrap"></td>
                    }
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal de Reordenação de Métricas */}
      {showMetricsOrder && (
        <MetricsOrder
          metrics={metricsOrder}
          onOrderChange={setMetricsOrder}
          onClose={() => setShowMetricsOrder(false)}
        />
      )}
    </div>
  )
}

export default Campaigns 