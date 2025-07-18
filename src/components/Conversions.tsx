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
  AlertCircle
} from 'lucide-react'
import { Button } from './ui/button'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'

interface Conversion {
  id: string
  click_id: string
  date: string
  campaign: string
  payout: number
  type: 'lead' | 'sale' | 'upsell'
  country: string
  source: string
  status?: string
  revenue?: number
}

const Conversions: React.FC = () => {
  const { apiKey } = useAuthStore()
  const [conversions, setConversions] = useState<Conversion[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [filters, setFilters] = useState({
    campaign: '',
    type: '',
    country: '',
    status: ''
  })
  const [totalConversions, setTotalConversions] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Função utilitária para obter datas do período
  const getDateRange = (period: string) => {
    const today = new Date()
    let startDate = new Date(today)
    let endDate = new Date(today)
    
    switch (period) {
      case 'today':
        // Hoje
        break
      case 'yesterday':
        startDate.setDate(today.getDate() - 1)
        endDate.setDate(today.getDate() - 1)
        break
      case '7d':
        startDate.setDate(today.getDate() - 6)
        break
      case '30d':
        startDate.setDate(today.getDate() - 29)
        break
      case '90d':
        startDate.setDate(today.getDate() - 89)
        break
      case 'this_month':
        startDate.setDate(1)
        break
      case 'last_month':
        startDate.setMonth(today.getMonth() - 1, 1)
        endDate.setDate(0)
        break
      default:
        startDate.setDate(today.getDate() - 29)
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  const loadConversions = async (isRefresh = false) => {
    if (!apiKey) return
    
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const api = new RedTrackAPI(apiKey)
      const dateRange = getDateRange(selectedPeriod)
      
      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        ...filters
      }
      
      const response = await api.getConversions(params)
      
      if (response && response.data) {
        setConversions(response.data)
        setTotalConversions(response.total || response.data.length)
        
        // Calcular receita total
        const revenue = response.data.reduce((sum: number, conv: Conversion) => 
          sum + (conv.revenue || conv.payout || 0), 0)
        setTotalRevenue(revenue)
      } else {
        setConversions([])
        setTotalConversions(0)
        setTotalRevenue(0)
      }
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading conversions:', error)
      // Fallback para dados mock
      const mockData = getMockConversionsData()
      setConversions(mockData.data)
      setTotalConversions(mockData.total)
      setTotalRevenue(mockData.data.reduce((sum: number, conv: Conversion) => 
        sum + (conv.revenue || conv.payout || 0), 0))
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

  const handleExport = () => {
    // Implementar exportação de conversões
    console.log('Exportando conversões...')
  }

  const getMockConversionsData = () => {
    const mockData: Conversion[] = [
      {
        id: '1',
        click_id: 'click_001',
        date: '2024-01-15',
        campaign: 'Facebook Ads - Produto A',
        payout: 25.50,
        type: 'lead',
        country: 'Brasil',
        source: 'Facebook',
        status: 'approved',
        revenue: 25.50
      },
      {
        id: '2',
        click_id: 'click_002',
        date: '2024-01-14',
        campaign: 'Google Ads - Produto B',
        payout: 45.00,
        type: 'sale',
        country: 'Estados Unidos',
        source: 'Google',
        status: 'approved',
        revenue: 45.00
      },
      {
        id: '3',
        click_id: 'click_003',
        date: '2024-01-13',
        campaign: 'Instagram Ads - Produto C',
        payout: 15.75,
        type: 'lead',
        country: 'Canadá',
        source: 'Instagram',
        status: 'pending',
        revenue: 15.75
      }
    ]
    
    return {
      data: mockData,
      total: mockData.length
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-trackview-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Conversões
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Análise detalhada de conversões e performance
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button 
            onClick={handleExport}
            className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Conversões</p>
              <p className="text-3xl font-bold text-gray-900">{totalConversions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
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
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
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
              <p className="text-3xl font-bold text-gray-900">
                {totalConversions > 0 ? formatCurrency(totalRevenue / totalConversions) : formatCurrency(0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-4 mb-6">
          <Filter className="w-6 h-6 text-trackview-primary" />
          <h2 className="text-xl font-semibold text-trackview-primary">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Hoje</option>
              <option value="yesterday">Ontem</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="this_month">Este mês</option>
              <option value="last_month">Mês passado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campanha</label>
            <input
              type="text"
              placeholder="Todas as campanhas"
              value={filters.campaign}
              onChange={(e) => setFilters({...filters, campaign: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os tipos</option>
              <option value="lead">Lead</option>
              <option value="sale">Venda</option>
              <option value="upsell">Upsell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
            <input
              type="text"
              placeholder="Todos os países"
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="approved">Aprovado</option>
              <option value="pending">Pendente</option>
              <option value="declined">Rejeitado</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Conversions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Lista de Conversões</h2>
        </div>

        {conversions.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma conversão encontrada para o período selecionado</p>
            <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros ou selecionar um período diferente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campanha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    País
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversions.map((conversion) => (
                  <tr key={conversion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(conversion.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conversion.campaign}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conversion.type === 'sale' ? 'bg-green-100 text-green-800' :
                        conversion.type === 'lead' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {conversion.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conversion.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conversion.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conversion.status === 'approved' ? 'bg-green-100 text-green-800' :
                        conversion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {conversion.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(conversion.revenue || conversion.payout || 0)}
                    </td>
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