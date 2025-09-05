import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { useAuthStore } from '../store/auth'
import { useMetricsStore } from '../store/metrics'
import { useCurrencyStore } from '../store/currency'
import { useDateRangeStore } from '../store/dateRange'

const DashboardSimple: React.FC = () => {
  // TODOS OS HOOKS PRIMEIRO
  const { apiKey } = useAuthStore()
  const { selectedMetrics, availableMetrics, metricsOrder } = useMetricsStore()
  const { currency } = useCurrencyStore()
  const navigate = useNavigate()
  const { selectedPeriod, customRange } = useDateRangeStore()
  
  // Estados locais
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>({})

  // Verificar se API Key está configurada - DEPOIS DE TODOS OS HOOKS
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            API Key não configurada
          </h2>
          <p className="text-gray-500 mb-4">
            Configure sua API Key do RedTrack em Configurações para acessar o dashboard.
          </p>
          <Button 
            onClick={() => navigate('/settings')}
            className="bg-[#3cd48f] hover:bg-[#3cd48f]/80"
          >
            <Settings className="w-4 h-4 mr-2" />
            Ir para Configurações
          </Button>
        </div>
      </div>
    )
  }

  // useEffect simples
  useEffect(() => {
    console.log('🔍 [DASHBOARD SIMPLE] useEffect executado')
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vmetrics-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Simplificado</h1>
      <p>API Key: {apiKey ? 'Configurada' : 'Não configurada'}</p>
      <p>Métricas selecionadas: {selectedMetrics.length}</p>
      <p>Moeda: {currency}</p>
      <p>Período: {selectedPeriod}</p>
    </div>
  )
}

export default DashboardSimple
