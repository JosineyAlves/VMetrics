import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  X, 
  Check, 
  Plus
} from 'lucide-react'
import { Button } from './ui/button'
import { useColumnsStore, type Column } from '../store/columns'

const ColumnsSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    availableColumns, 
    selectedColumns, 
    addColumn, 
    removeColumn, 
    resetToDefault,
    isColumnSelected 
  } = useColumnsStore()

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'basic': 'Básicas',
      'performance': 'Performance',
      'conversion': 'Conversão',
      'revenue': 'Receita',
      'funnel': 'Funil'
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'basic': 'bg-blue-100 text-blue-800',
      'performance': 'bg-purple-100 text-purple-800',
      'conversion': 'bg-green-100 text-green-800',
      'revenue': 'bg-green-100 text-green-800',
      'funnel': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const groupedColumns = availableColumns.reduce((acc, column) => {
    if (!acc[column.category]) {
      acc[column.category] = []
    }
    acc[column.category].push(column)
    return acc
  }, {} as Record<string, Column[]>)

  const handleSelectAll = () => {
    availableColumns.forEach(column => {
      if (!isColumnSelected(column.id)) {
        addColumn(column.id)
      }
    })
  }

  const handleDeselectAll = () => {
    selectedColumns.forEach(columnId => {
      if (isColumnSelected(columnId)) {
        removeColumn(columnId)
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Colunas
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-4xl mx-auto shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Selecionar Colunas</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Escolha quais colunas você quer ver na tabela de campanhas
                  </p>
                </div>
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
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
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedColumns.length} de {availableColumns.length} selecionadas
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4 overflow-y-auto max-h-[50vh]">
                  {Object.entries(groupedColumns).map(([category, columns]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {getCategoryLabel(category)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {columns.map((column) => {
                          const isSelected = isColumnSelected(column.id)
                          return (
                            <div
                              key={column.id}
                              className={`
                                relative p-3 rounded-lg border cursor-pointer transition-all duration-200
                                ${isSelected 
                                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }
                              `}
                              onClick={() => {
                                if (isSelected) {
                                  removeColumn(column.id)
                                } else {
                                  addColumn(column.id)
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{column.label}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{column.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {isSelected ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Plus className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
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
                  Salvar Seleção
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ColumnsSelector 