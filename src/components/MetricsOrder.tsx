import React, { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { GripVertical, X } from 'lucide-react'

interface Metric {
  id: string
  label: string
  key: string
  visible: boolean
  order: number
}

interface MetricsOrderProps {
  metrics: Metric[]
  onMetricsChange: (metrics: Metric[]) => void
  className?: string
}

const MetricsOrder: React.FC<MetricsOrderProps> = ({ 
  metrics, 
  onMetricsChange, 
  className = '' 
}) => {
  const [localMetrics, setLocalMetrics] = useState<Metric[]>(metrics)

  useEffect(() => {
    setLocalMetrics(metrics)
  }, [metrics])

  const handleReorder = (newOrder: Metric[]) => {
    setLocalMetrics(newOrder)
    onMetricsChange(newOrder)
  }

  const toggleMetricVisibility = (metricId: string) => {
    const updatedMetrics = localMetrics.map(metric => 
      metric.id === metricId 
        ? { ...metric, visible: !metric.visible }
        : metric
    )
    setLocalMetrics(updatedMetrics)
    onMetricsChange(updatedMetrics)
  }

  const removeMetric = (metricId: string) => {
    const updatedMetrics = localMetrics.filter(metric => metric.id !== metricId)
    setLocalMetrics(updatedMetrics)
    onMetricsChange(updatedMetrics)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Ordem das Métricas
        </h3>
        <p className="text-sm text-gray-500">
          Arraste para reordenar • Clique para mostrar/ocultar
        </p>
      </div>
      
      <Reorder.Group 
        axis="y" 
        values={localMetrics} 
        onReorder={handleReorder}
        className="space-y-2"
      >
        {localMetrics.map((metric) => (
          <Reorder.Item
            key={metric.id}
            value={metric}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleMetricVisibility(metric.id)}
                  className={`w-4 h-4 rounded border-2 transition-colors ${
                    metric.visible 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <span className={`font-medium ${
                  metric.visible ? 'text-gray-900' : 'text-gray-500 line-through'
                }`}>
                  {metric.label}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => removeMetric(metric.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Remover métrica"
            >
              <X className="w-4 h-4" />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      
      {localMetrics.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma métrica configurada</p>
          <p className="text-sm">Adicione métricas para personalizar a visualização</p>
        </div>
      )}
    </div>
  )
}

export default MetricsOrder 