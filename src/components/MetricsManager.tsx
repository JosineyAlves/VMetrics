import React, { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Settings, 
  X, 
  Check, 
  Plus,
  GripVertical,
  RotateCcw
} from 'lucide-react'
import { Button } from './ui/button'
import { useMetricsStore, type Metric } from '../store/metrics'

const MetricsManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'select' | 'order'>('select')
  const { 
    availableMetrics, 
    selectedMetrics, 
    addMetric, 
    removeMetric, 
    resetToDefault,
    isMetricSelected,
    metricsOrder,
    setMetricsOrder
  } = useMetricsStore()

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'basic': 'Básicas',
      'performance': 'Performance',
      'conversion': 'Conversão',
      'revenue': 'Receita',
      'earnings': 'Earnings',
      'approval': 'Aprovação'
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'basic': 'bg-[#3cd48f]/20 text-[#3cd48f]',
      'performance': 'bg-[#3cd48f]/20 text-[#3cd48f]',
      'conversion': 'bg-green-100 text-green-800',
      'revenue': 'bg-green-100 text-green-800',
      'earnings': 'bg-yellow-100 text-yellow-800',
      'approval': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const groupedMetrics = availableMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = []
    }
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, Metric[]>)

  const getSelectedMetricsInOrder = () => {
    const orderedMetrics = metricsOrder
      .filter(metricId => selectedMetrics.includes(metricId))
      .map(metricId => availableMetrics.find(m => m.id === metricId))
      .filter(Boolean)
    
    return orderedMetrics
  }

  const handleReorder = (newOrder: any[]) => {
    const newOrderIds = newOrder.map(item => item.id)
    setMetricsOrder(newOrderIds)
  }

  const handleSelectAll = () => {
    availableMetrics.forEach(metric => {
      if (!isMetricSelected(metric.id)) {
        addMetric(metric.id)
      }
    })
  }

  const handleDeselectAll = () => {
    selectedMetrics.forEach(metricId => {
      if (isMetricSelected(metricId)) {
        removeMetric(metricId)
      }
    })
  }

  if (selectedMetrics.length === 0) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#3cd48f]/30 text-[#3cd48f] hover:bg-[#3cd48f]/10 transition-all duration-200"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Gerenciar Métricas</span>
        <span className="sm:hidden">Métricas</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#3cd48f]/10 rounded-lg">
                    <Settings className="w-5 h-5 text-[#3cd48f]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Gerenciar Métricas</h2>
                    <p className="text-sm text-gray-600">
                      Selecione e organize as métricas do dashboard
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('select')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'select'
                      ? 'text-[#3cd48f] border-b-2 border-[#3cd48f] bg-[#3cd48f]/5'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Selecionar Métricas</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('order')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'order'
                      ? 'text-[#3cd48f] border-b-2 border-[#3cd48f] bg-[#3cd48f]/5'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <GripVertical className="w-4 h-4" />
                    <span>Organizar Ordem</span>
                  </div>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'select' ? (
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Selecionar Métricas</h3>
                        <p className="text-sm text-gray-600">
                          Escolha quais métricas exibir no dashboard
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          className="text-xs"
                        >
                          Selecionar Todas
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeselectAll}
                          className="text-xs"
                        >
                          Desmarcar Todas
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetToDefault}
                          className="text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Padrão
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {Object.entries(groupedMetrics).map(([category, metrics]) => (
                        <div key={category}>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                              {getCategoryLabel(category)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {metrics.filter(m => isMetricSelected(m.id)).length} de {metrics.length} selecionadas
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {metrics.map((metric) => (
                              <motion.button
                                key={metric.id}
                                onClick={() => isMetricSelected(metric.id) ? removeMetric(metric.id) : addMetric(metric.id)}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                  isMetricSelected(metric.id)
                                    ? 'border-[#3cd48f] bg-[#3cd48f]/5'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isMetricSelected(metric.id)
                                      ? 'border-[#3cd48f] bg-[#3cd48f]'
                                      : 'border-gray-300'
                                  }`}>
                                    {isMetricSelected(metric.id) && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{metric.label}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">{metric.description}</p>
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Organizar Ordem</h3>
                      <p className="text-sm text-gray-600">
                        Arraste as métricas para reordenar. A ordem será aplicada no dashboard.
                      </p>
                    </div>

                    <Reorder.Group
                      axis="y"
                      values={getSelectedMetricsInOrder()}
                      onReorder={handleReorder}
                      className="space-y-2"
                    >
                      {getSelectedMetricsInOrder().map((metric) => (
                        <Reorder.Item
                          key={metric?.id}
                          value={metric}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-move hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{metric?.label}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2">{metric?.description}</p>
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    if (activeTab === 'select') {
                      setActiveTab('order')
                    } else {
                      setIsOpen(false)
                    }
                  }}
                  className="bg-[#3cd48f] hover:bg-[#3cd48f]/90"
                >
                  {activeTab === 'select' ? 'Organizar Ordem' : 'Concluir'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MetricsManager
