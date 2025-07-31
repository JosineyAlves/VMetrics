import React, { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { GripVertical, Settings, X } from 'lucide-react'
import { Button } from './ui/button'

interface Metric {
  id: string
  label: string
  key: string
  visible: boolean
}

interface MetricsOrderProps {
  metrics: Metric[]
  onOrderChange: (metrics: Metric[]) => void
  onClose: () => void
}

const MetricsOrder: React.FC<MetricsOrderProps> = ({ metrics, onOrderChange, onClose }) => {
  const [orderedMetrics, setOrderedMetrics] = useState<Metric[]>(metrics)

  useEffect(() => {
    setOrderedMetrics(metrics)
  }, [metrics])

  const handleReorder = (newOrder: Metric[]) => {
    setOrderedMetrics(newOrder)
    onOrderChange(newOrder)
  }

  const toggleMetricVisibility = (metricId: string) => {
    const updatedMetrics = orderedMetrics.map(metric =>
      metric.id === metricId ? { ...metric, visible: !metric.visible } : metric
    )
    setOrderedMetrics(updatedMetrics)
    onOrderChange(updatedMetrics)
  }

  const resetToDefault = () => {
    const defaultOrder = [
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
    ]
    setOrderedMetrics(defaultOrder)
    onOrderChange(defaultOrder)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Personalizar Colunas</h2>
            <p className="text-sm text-gray-500 mt-1">
              Arraste para reordenar e clique para mostrar/ocultar colunas
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {orderedMetrics.filter(m => m.visible).length} de {orderedMetrics.length} colunas visíveis
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="text-xs"
            >
              Restaurar Padrão
            </Button>
          </div>

          <Reorder.Group
            axis="y"
            values={orderedMetrics}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {orderedMetrics.map((metric) => (
              <Reorder.Item
                key={metric.id}
                value={metric}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                  <span className="text-sm font-medium text-gray-700">
                    {metric.label}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={metric.visible ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMetricVisibility(metric.id)}
                    className={`text-xs ${metric.visible ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {metric.visible ? 'Visível' : 'Oculta'}
                  </Button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onClose}>
            Aplicar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MetricsOrder 