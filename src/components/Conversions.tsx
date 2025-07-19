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
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, periodPresets } from '../lib/utils'

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
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [filters, setFilters] = useState({
    campaign: '',
    type: '',
    country: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)
  const [totalConversions, setTotalConversions] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)


  const loadConversions = async (isRefresh = false) => {
    if (!apiKey) return
    
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const api = new RedTrackAPI(apiKey)
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      console.log('Conversões - Parâmetros enviados:', {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        ...filters
      })
      
      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        ...filters
      }
      
      const response = await api.getConversions(params)
      console.log('Conversões - Resposta da API:', response)
      
      // Processar diferentes formatos de resposta
      let conversionsData = []
      let totalCount = 0
      
      if (response) {
        // Se response é um array direto
        if (Array.isArray(response)) {
          conversionsData = response
          totalCount = response.length
        }
        // Se response tem propriedade items (formato RedTrack)
        else if (response.items && Array.isArray(response.items)) {
          conversionsData = response.items
          totalCount = response.total || response.items.length
        }
        // Se response tem propriedade data
        else if (response.data && Array.isArray(response.data)) {
          conversionsData = response.data
          totalCount = response.total || response.data.length
        }
        // Se response é um objeto com dados diretos
        else if (typeof response === 'object' && !Array.isArray(response)) {
          // Tentar extrair dados de diferentes propriedades possíveis
          if (response.conversions) {
            conversionsData = Array.isArray(response.conversions) ? response.conversions : [response.conversions]
          } else if (response.conversion) {
            conversionsData = Array.isArray(response.conversion) ? response.conversion : [response.conversion]
      } else {
            // Se não encontrar estrutura específica, usar o próprio response
            conversionsData = [response]
          }
          totalCount = conversionsData.length
        }
      }
      
      console.log('Conversões - Dados processados:', {
        conversionsData,
        totalCount,
        originalResponse: response
      })
      
      // Mapear dados para o formato esperado
      const mappedConversions = conversionsData.map((item: any, index: number) => ({
        id: item.id || item.conversion_id || `conv_${index}`,
        click_id: item.click_id || item.clickid || '',
        date: item.date || item.created_at || item.timestamp || new Date().toISOString().split('T')[0],
        campaign: item.campaign || item.campaign_name || item.name || 'Campanha sem nome',
        payout: item.payout || item.revenue || item.amount || 0,
        type: item.type || item.conversion_type || 'sale',
        country: item.country || item.geo || 'N/A',
        source: item.source || item.traffic_source || 'N/A',
        status: item.status || item.approval_status || 'approved',
        revenue: item.revenue || item.payout || item.amount || 0
      }))
      
      console.log('Conversões - Dados mapeados:', mappedConversions)
      
      setConversions(mappedConversions)
      setTotalConversions(totalCount)
      
      // Calcular receita total
      const revenue = mappedConversions.reduce((sum: number, conv: Conversion) => 
        sum + (conv.revenue || conv.payout || 0), 0)
      setTotalRevenue(revenue)
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading conversions:', error)
      // NÃO usar dados mock - mostrar dados reais vazios
      setConversions([])
      setTotalConversions(0)
      setTotalRevenue(0)
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

  const handleApplyFilters = () => {
    setFilters(tempFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      campaign: '',
      type: '',
      country: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(resetFilters)
    setTempFilters(resetFilters)
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
      {/* Nav Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-2xl border border-white/20">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Conversões
          </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Campanha
              </label>
              <Input 
                type="text"
                placeholder="Todas as campanhas"
                value={tempFilters.campaign}
                onChange={(e) => setTempFilters(prev => ({ ...prev, campaign: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo
              </label>
              <select
                value={tempFilters.type}
                onChange={(e) => setTempFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="lead">Lead</option>
                <option value="sale">Venda</option>
                <option value="upsell">Upsell</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                País
              </label>
              <Input 
                type="text"
                placeholder="Todos os países"
                value={tempFilters.country}
                onChange={(e) => setTempFilters(prev => ({ ...prev, country: e.target.value }))}
                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <select
                value={tempFilters.status}
                onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">Todos os status</option>
                <option value="approved">Aprovado</option>
                <option value="pending">Pendente</option>
                <option value="declined">Rejeitado</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handleApplyFilters}
              className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600"
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

      {/* Filtro de período padronizado */}
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
              <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {totalConversions > 0 ? formatCurrency(totalRevenue / totalConversions) : formatCurrency(0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Conversions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lista de Conversões</h2>
        </div>

        {conversions.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">✅ API conectada com sucesso!</p>
            <p className="text-gray-400 text-sm mt-2">Sua conta trial ainda não possui conversões registradas.</p>
            <p className="text-gray-400 text-sm mt-1">Crie campanhas e comece a rastrear conversões para ver dados aqui.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campanha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    País
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversions.map((conversion) => (
                  <tr key={conversion.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(conversion.date)}
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {conversion.campaign}
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conversion.type === 'sale' ? 'bg-green-100 text-green-800' :
                        conversion.type === 'lead' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {conversion.type}
                    </span>
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {conversion.country}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {conversion.source}
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conversion.status === 'approved' ? 'bg-green-100 text-green-800' :
                        conversion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {conversion.status || 'N/A'}
                    </span>
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
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