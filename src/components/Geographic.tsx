import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ChevronDown,
  MapPin,
  Globe,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, periodPresets } from '../lib/utils'
import { useDateRangeStore } from '../store/dateRange'


interface GeographicData {
  id: string
  country: string
  region: string
  city: string
  visitors: number
  conversions: number
  revenue: number
  spend: number
  roi: number
  conversion_rate: number
  cpa: number
}

const Geographic: React.FC = () => {
  const { apiKey } = useAuthStore()
  const [geographicData, setGeographicData] = useState<GeographicData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    minVisitors: '',
    maxVisitors: '',
    minRevenue: '',
    maxRevenue: '',
    minRoi: '',
    maxRoi: '',
    dateFrom: '',
    dateTo: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)
  const { selectedPeriod, customRange } = useDateRangeStore()

  // Remover periodOptions, getPeriodLabel, getDateRange antigos

  const loadGeographicData = async () => {
    if (!apiKey) return
    setLoading(true)
    try {
      const api = new RedTrackAPI(apiKey)
      const dateRange = getDateRange(selectedPeriod, customRange)
      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        group_by: 'country,region,city',
        ...filters
      }
      const response = await api.getReport(params)
      console.log('Geografia - Resposta da API:', response)
      // Corrigir para aceitar array direto ou objeto com .items
      if (!response) {
        setGeographicData([])
      } else if (Array.isArray(response)) {
        setGeographicData(response)
      } else if (response.items && Array.isArray(response.items)) {
        setGeographicData(response.items)
      } else {
        setGeographicData([])
      }
    } catch (error) {
      console.error('Error loading geographic data:', error)
      setGeographicData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (apiKey) {
      loadGeographicData()
    }
  }, [apiKey, selectedPeriod, filters])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.period-dropdown')) {
        // setShowPeriodDropdown(false) // This state is removed
      }
    }

    // if (showPeriodDropdown) { // This state is removed
    //   document.addEventListener('mousedown', handleClickOutside)
    // }

    return () => {
      // document.removeEventListener('mousedown', handleClickOutside) // This state is removed
    }
  }, []) // This state is removed

  // const handlePeriodChange = (period: string) => { // This function is removed
  //   setSelectedPeriod(period)
  //   setShowPeriodDropdown(false)
  // }

  const handleApplyFilters = () => {
    setFilters(tempFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      country: '',
      region: '',
      minVisitors: '',
      maxVisitors: '',
      minRevenue: '',
      maxRevenue: '',
      minRoi: '',
      maxRoi: '',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(resetFilters)
    setTempFilters(resetFilters)
  }

  const filteredData = geographicData.filter(data => {
    const matchesSearch = 
      data.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCountry = !filters.country || data.country === filters.country
    const matchesRegion = !filters.region || data.region === filters.region
    const matchesMinVisitors = !filters.minVisitors || data.visitors >= parseFloat(filters.minVisitors)
    const matchesMaxVisitors = !filters.maxVisitors || data.visitors <= parseFloat(filters.maxVisitors)
    const matchesMinRevenue = !filters.minRevenue || data.revenue >= parseFloat(filters.minRevenue)
    const matchesMaxRevenue = !filters.maxRevenue || data.revenue <= parseFloat(filters.maxRevenue)
    const matchesMinRoi = !filters.minRoi || data.roi >= parseFloat(filters.minRoi)
    const matchesMaxRoi = !filters.maxRoi || data.roi <= parseFloat(filters.maxRoi)

    return matchesSearch && matchesCountry && matchesRegion && 
           matchesMinVisitors && matchesMaxVisitors && matchesMinRevenue && 
           matchesMaxRevenue && matchesMinRoi && matchesMaxRoi
  })

  // Calcular métricas
  const totalVisitors = filteredData.reduce((sum, d) => sum + d.visitors, 0)
  const totalConversions = filteredData.reduce((sum, d) => sum + d.conversions, 0)
  const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0)
  const totalSpend = filteredData.reduce((sum, d) => sum + d.spend, 0)
  const averageRoi = filteredData.length > 0 
    ? filteredData.reduce((sum, d) => sum + d.roi, 0) / filteredData.length 
    : 0
  const averageConversionRate = filteredData.length > 0
    ? filteredData.reduce((sum, d) => sum + d.conversion_rate, 0) / filteredData.length
    : 0

  // Ranking de países por conversão
  const topCountries = [...geographicData]
    .filter(d => d.country)
    .reduce((acc, curr) => {
      const found = acc.find(a => a.country === curr.country)
      if (found) {
        found.conversions += curr.conversions
        found.revenue += curr.revenue
      } else {
        acc.push({ country: curr.country, conversions: curr.conversions, revenue: curr.revenue })
      }
      return acc
    }, [] as { country: string, conversions: number, revenue: number }[])
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5)

  // Ranking de estados/regiões por conversão
  const topRegions = [...geographicData]
    .filter(d => d.region)
    .reduce((acc, curr) => {
      const found = acc.find(a => a.region === curr.region)
      if (found) {
        found.conversions += curr.conversions
        found.revenue += curr.revenue
      } else {
        acc.push({ region: curr.region, conversions: curr.conversions, revenue: curr.revenue })
      }
      return acc
    }, [] as { region: string, conversions: number, revenue: number }[])
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5)

  // Painel detalhado de vendas por país
  const countryStats = [...geographicData]
    .filter(d => d.country)
    .reduce((acc, curr) => {
      const found = acc.find(a => a.country === curr.country)
      if (found) {
        found.conversions += curr.conversions
        found.clicks += curr.visitors
        found.spend += curr.spend
        found.revenue += curr.revenue
        found.cpa = found.spend / (found.conversions || 1)
        found.roi = found.revenue && found.spend ? ((found.revenue - found.spend) / found.spend) * 100 : 0
        found.conversion_rate = found.clicks ? (found.conversions / found.clicks) * 100 : 0
      } else {
        acc.push({
          country: curr.country,
          conversions: curr.conversions,
          clicks: curr.visitors,
          spend: curr.spend,
          revenue: curr.revenue,
          cpa: curr.cpa,
          roi: curr.roi,
          conversion_rate: curr.conversion_rate
        })
      }
      return acc
    }, [] as { country: string, conversions: number, clicks: number, spend: number, revenue: number, cpa: number, roi: number, conversion_rate: number }[])
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 10)

  // Painel detalhado de vendas por estado/região
  const regionStats = [...geographicData]
    .filter(d => d.region)
    .reduce((acc, curr) => {
      const found = acc.find(a => a.region === curr.region)
      if (found) {
        found.conversions += curr.conversions
        found.clicks += curr.visitors
        found.spend += curr.spend
        found.revenue += curr.revenue
        found.cpa = found.spend / (found.conversions || 1)
        found.roi = found.revenue && found.spend ? ((found.revenue - found.spend) / found.spend) * 100 : 0
        found.conversion_rate = found.clicks ? (found.conversions / found.clicks) * 100 : 0
      } else {
        acc.push({
          region: curr.region,
          conversions: curr.conversions,
          clicks: curr.visitors,
          spend: curr.spend,
          revenue: curr.revenue,
          cpa: curr.cpa,
          roi: curr.roi,
          conversion_rate: curr.conversion_rate
        })
      }
      return acc
    }, [] as { region: string, conversions: number, clicks: number, spend: number, revenue: number, cpa: number, roi: number, conversion_rate: number }[])
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 10)

  // Mensagem amigável e loading agora são exibidos dentro do fluxo principal, mantendo o filtro de período sempre visível

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-trackview-muted w-4 h-4" />
          <Input
            placeholder="Buscar localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
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

      {/* Filtro de período padronizado */}
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
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                País
              </label>
              <select 
                value={tempFilters.country}
                onChange={(e) => setTempFilters(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
              >
                <option value="">Todos</option>
                <option value="Brasil">Brasil</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="México">México</option>
                <option value="Argentina">Argentina</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Região
              </label>
              <select 
                value={tempFilters.region}
                onChange={(e) => setTempFilters(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
              >
                <option value="">Todas</option>
                <option value="Sudeste">Sudeste</option>
                <option value="Sul">Sul</option>
                <option value="Nordeste">Nordeste</option>
                <option value="Centro-Oeste">Centro-Oeste</option>
                <option value="Norte">Norte</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Visitantes Mínimos
              </label>
              <Input 
                type="number"
                placeholder="0"
                value={tempFilters.minVisitors}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minVisitors: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Visitantes Máximos
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxVisitors}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxVisitors: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
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
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Receita Máxima
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxRevenue}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxRevenue: e.target.value }))}
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

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-trackview-accent overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-trackview-background">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitantes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversões
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa de Conversão
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gasto
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
              {filteredData.map((data, index) => (
                <motion.tr 
                  key={data.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-trackview-background"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-trackview-muted mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {data.city}
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.region}, {data.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {data.visitors.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {data.conversions.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {data.conversion_rate}%
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-green-600">
                      ${data.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-red-600">
                      ${data.spend.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {data.roi > 100 ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${data.roi > 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.roi}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${data.cpa}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-trackview-muted">Total Visitantes</p>
              <p className="text-2xl font-bold text-trackview-primary">
                {totalVisitors.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-trackview-background rounded-lg">
              <Users className="w-6 h-6 text-trackview-secondary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-trackview-muted">Total Conversões</p>
              <p className="text-2xl font-bold text-trackview-success">
                {totalConversions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-trackview-background rounded-lg">
              <Globe className="w-6 h-6 text-trackview-success" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-trackview-muted">Receita Total</p>
              <p className="text-2xl font-bold text-trackview-success">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-trackview-background rounded-lg">
              <DollarSign className="w-6 h-6 text-trackview-success" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-trackview-muted">ROI Médio</p>
              <p className="text-2xl font-bold text-trackview-success">
                {Math.round(averageRoi)}%
              </p>
            </div>
            <div className="p-3 bg-trackview-background rounded-lg">
              <BarChart3 className="w-6 h-6 text-trackview-success" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Painel Países */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Vendas por País</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">País</th>
                <th className="px-4 py-2 text-right">Vendas</th>
                <th className="px-4 py-2 text-right">Cliques</th>
                <th className="px-4 py-2 text-right">Custo</th>
                <th className="px-4 py-2 text-right">Receita</th>
                <th className="px-4 py-2 text-right">Taxa de Conversão</th>
                <th className="px-4 py-2 text-right">CPA</th>
                <th className="px-4 py-2 text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {countryStats.map((item) => (
                <tr key={item.country} className="border-t">
                  <td className="px-4 py-2 font-medium">{item.country}</td>
                  <td className="px-4 py-2 text-right">{item.conversions}</td>
                  <td className="px-4 py-2 text-right">{item.clicks}</td>
                  <td className="px-4 py-2 text-right">${item.spend.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">${item.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">{item.conversion_rate.toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right">${item.cpa.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">{item.roi.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Painel Estados/Regiões */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Vendas por Estado/Região</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Estado/Região</th>
                <th className="px-4 py-2 text-right">Vendas</th>
                <th className="px-4 py-2 text-right">Cliques</th>
                <th className="px-4 py-2 text-right">Custo</th>
                <th className="px-4 py-2 text-right">Receita</th>
                <th className="px-4 py-2 text-right">Taxa de Conversão</th>
                <th className="px-4 py-2 text-right">CPA</th>
                <th className="px-4 py-2 text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {regionStats.map((item) => (
                <tr key={item.region} className="border-t">
                  <td className="px-4 py-2 font-medium">{item.region}</td>
                  <td className="px-4 py-2 text-right">{item.conversions}</td>
                  <td className="px-4 py-2 text-right">{item.clicks}</td>
                  <td className="px-4 py-2 text-right">${item.spend.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">${item.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">{item.conversion_rate.toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right">${item.cpa.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">{item.roi.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Geographic 