import React, { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Settings, X, GripVertical } from 'lucide-react'
import { Button } from './ui/button'
import { useMetricsStore } from '../store/metrics'

const MetricsOrder: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedMetrics, metricsOrder, setMetricsOrder, availableMetrics } = useMetricsStore()

  const getSelectedMetricsInOrder = () => {
    return metricsOrder
      .filter(metricId => selectedMetrics.includes(metricId))
      .map(metricId => availableMetrics.find(m => m.id === metricId))
      .filter(Boolean)
  }

  const handleReorder = (newOrder: any[]) => {
    const newOrderIds = newOrder.map(item => item.id)
    setMetricsOrder(newOrderIds)
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
        className="px-4 py-2 rounded-xl border border-gray-400 text-gray-700 font-semibold bg-white shadow-lg hover:bg-gray-100 transition"
      >
        <Settings className="w-4 h-4 mr-2" />
        Ordenar Métricas
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Ordenar Métricas</h2>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2 bg-transparent hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="p-6 pb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Arraste as métricas para reordenar. A ordem será aplicada no dashboard.
                </p>
              </div>

              <div className="px-6 pb-4 overflow-y-auto max-h-[50vh]">
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
            </div>

            {/* Footer com botões sempre visíveis */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Salvar Ordem
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export default MetricsOrder 