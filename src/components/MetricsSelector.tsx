import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  X, 
  Check, 
  Plus,
  Target,
  DollarSign,
  TrendingUp,
  BarChart3,
  MousePointer,
  Eye,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  Calculator
} from 'lucide-react'
import { Button } from './ui/button'
import { useMetricsStore, type Metric } from '../store/metrics'

const MetricsSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    availableMetrics, 
    selectedMetrics, 
    addMetric, 
    removeMetric, 
    resetToDefault,
    isMetricSelected 
  } = useMetricsStore()

  const getIcon = (iconName?: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Target': <Target className="w-4 h-4" />,
      'DollarSign': <DollarSign className="w-4 h-4" />,
      'TrendingUp': <TrendingUp className="w-4 h-4" />,
      'BarChart3': <BarChart3 className="w-4 h-4" />,
      'MousePointer': <MousePointer className="w-4 h-4" />,
      'Eye': <Eye className="w-4 h-4" />,
      'ShoppingCart': <ShoppingCart className="w-4 h-4" />,
      'CheckCircle': <CheckCircle className="w-4 h-4" />,
      'Clock': <Clock className="w-4 h-4" />,
      'XCircle': <XCircle className="w-4 h-4" />,
      'HelpCircle': <HelpCircle className="w-4 h-4" />,
      'Calculator': <Calculator className="w-4 h-4" />
    }
    return icons[iconName || 'BarChart3'] || <BarChart3 className="w-4 h-4" />
  }

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
      'basic': 'bg-blue-100 text-blue-800',
      'performance': 'bg-purple-100 text-purple-800',
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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Métricas
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Personalizar Métricas</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Selecione quais métricas deseja ver no dashboard
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedMetrics.length} métricas selecionadas
                    </span>
                    <span className="text-xs text-gray-500">
                      de {availableMetrics.length} disponíveis
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefault}
                    className="text-xs"
                  >
                    Restaurar Padrão
                  </Button>
                </div>

                {/* Metrics by Category */}
                <div className="space-y-6">
                  {Object.entries(groupedMetrics).map(([category, metrics]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                          {getCategoryLabel(category)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {metrics.filter(m => isMetricSelected(m.id)).length} selecionadas
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {metrics.map((metric) => {
                          const isSelected = isMetricSelected(metric.id)
                          return (
                            <motion.div
                              key={metric.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`
                                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                ${isSelected 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                                }
                              `}
                              onClick={() => {
                                if (isSelected) {
                                  removeMetric(metric.id)
                                } else {
                                  addMetric(metric.id)
                                }
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`
                                    p-2 rounded-lg
                                    ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                                  `}>
                                    {getIcon(metric.icon)}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 text-sm">
                                      {metric.label}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {metric.description}
                                    </p>
                                  </div>
                                </div>
                                
                                {isSelected && (
                                  <div className="absolute top-2 right-2">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-3 flex items-center gap-2">
                                <span className={`
                                  px-2 py-1 rounded text-xs font-medium
                                  ${metric.unit === 'currency' ? 'bg-green-100 text-green-800' :
                                    metric.unit === 'percentage' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                `}>
                                  {metric.unit === 'currency' ? 'Moeda' :
                                   metric.unit === 'percentage' ? 'Percentual' :
                                   'Número'
                                  }
                                </span>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{selectedMetrics.length}</span> métricas selecionadas
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MetricsSelector 