import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Column {
  id: string
  label: string
  description: string
  category: 'basic' | 'performance' | 'conversion' | 'revenue' | 'funnel'
  unit: 'number' | 'currency' | 'percentage'
  format?: 'decimal' | 'integer' | 'currency' | 'percentage'
  icon?: string
  color?: string
}

export interface ColumnsState {
  availableColumns: Column[]
  selectedColumns: string[]
  columnsOrder: string[]
  addColumn: (columnId: string) => void
  removeColumn: (columnId: string) => void
  setSelectedColumns: (columns: string[]) => void
  setColumnsOrder: (order: string[]) => void
  moveColumn: (fromIndex: number, toIndex: number) => void
  resetToDefault: () => void
  isColumnSelected: (columnId: string) => boolean
}

// Todas as colunas disponíveis para a tabela de campanhas
const allColumns: Column[] = [
  // Colunas Básicas
  {
    id: 'name',
    label: 'Campanha',
    description: 'Nome da campanha',
    category: 'basic',
    unit: 'text',
    format: 'text',
    icon: 'BarChart3',
    color: 'blue'
  },
  {
    id: 'source',
    label: 'Fonte',
    description: 'Fonte de tráfego',
    category: 'basic',
    unit: 'text',
    format: 'text',
    icon: 'Link',
    color: 'gray'
  },
  {
    id: 'status',
    label: 'Status',
    description: 'Status da campanha',
    category: 'basic',
    unit: 'text',
    format: 'text',
    icon: 'Activity',
    color: 'green'
  },
  {
    id: 'clicks',
    label: 'Cliques',
    description: 'Total de cliques',
    category: 'basic',
    unit: 'number',
    format: 'integer',
    icon: 'MousePointer',
    color: 'blue'
  },
  {
    id: 'unique_clicks',
    label: 'Cliques Únicos',
    description: 'Cliques únicos',
    category: 'basic',
    unit: 'number',
    format: 'integer',
    icon: 'MousePointer',
    color: 'blue'
  },
  {
    id: 'impressions',
    label: 'Impressões',
    description: 'Total de impressões',
    category: 'basic',
    unit: 'number',
    format: 'integer',
    icon: 'Eye',
    color: 'blue'
  },

  // Colunas de Conversão
  {
    id: 'conversions',
    label: 'Conversões',
    description: 'Conversões aprovadas',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'Target',
    color: 'green'
  },
  {
    id: 'all_conversions',
    label: 'Todas Conversões',
    description: 'Total de todas as conversões',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'Target',
    color: 'green'
  },
  {
    id: 'approved',
    label: 'Aprovadas',
    description: 'Conversões aprovadas',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'CheckCircle',
    color: 'green'
  },
  {
    id: 'pending',
    label: 'Pendentes',
    description: 'Conversões pendentes',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'Clock',
    color: 'yellow'
  },
  {
    id: 'declined',
    label: 'Recusadas',
    description: 'Conversões recusadas',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'XCircle',
    color: 'red'
  },

  // Colunas de Performance
  {
    id: 'ctr',
    label: 'CTR',
    description: 'Click-through rate (%)',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'blue'
  },
  {
    id: 'conversion_rate',
    label: 'Taxa Conv.',
    description: 'Taxa de conversão (%)',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'Target',
    color: 'green'
  },

  // Colunas de Receita
  {
    id: 'spend',
    label: 'Gasto',
    description: 'Custo total',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'red'
  },
  {
    id: 'revenue',
    label: 'Receita',
    description: 'Receita total',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'TrendingUp',
    color: 'green'
  },
  {
    id: 'roi',
    label: 'ROI',
    description: 'Return on investment (%)',
    category: 'revenue',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'purple'
  },
  {
    id: 'cpa',
    label: 'CPA',
    description: 'Cost per acquisition',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'Calculator',
    color: 'orange'
  },
  {
    id: 'cpc',
    label: 'CPC',
    description: 'Cost per click',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'MousePointer',
    color: 'blue'
  },
  {
    id: 'epc',
    label: 'EPC',
    description: 'Earnings per click',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    id: 'epl',
    label: 'EPL',
    description: 'Earnings per lead',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    id: 'roas',
    label: 'ROAS',
    description: 'Return on ad spend',
    category: 'revenue',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'purple'
  },

  // Colunas de Funil
  {
    id: 'prelp_views',
    label: 'Pre-LP Views',
    description: 'Visualizações do pre-landing',
    category: 'funnel',
    unit: 'number',
    format: 'integer',
    icon: 'Eye',
    color: 'blue'
  },
  {
    id: 'prelp_clicks',
    label: 'Pre-LP Clicks',
    description: 'Cliques no pre-landing',
    category: 'funnel',
    unit: 'number',
    format: 'integer',
    icon: 'MousePointer',
    color: 'blue'
  },
  {
    id: 'lp_views',
    label: 'LP Views',
    description: 'Visualizações do landing',
    category: 'funnel',
    unit: 'number',
    format: 'integer',
    icon: 'Eye',
    color: 'green'
  },
  {
    id: 'lp_clicks',
    label: 'LP Clicks',
    description: 'Cliques no landing',
    category: 'funnel',
    unit: 'number',
    format: 'integer',
    icon: 'MousePointer',
    color: 'green'
  },
  {
    id: 'initiatecheckout',
    label: 'InitiateCheckout',
    description: 'Inícios de checkout',
    category: 'funnel',
    unit: 'number',
    format: 'integer',
    icon: 'ShoppingCart',
    color: 'orange'
  }
]

// Colunas padrão selecionadas - Ordem do funil de conversão
const defaultSelectedColumns = [
  'name',
  'source',
  'status',
  'clicks',
  'prelp_views',
  'prelp_clicks',
  'lp_views',
  'lp_clicks',
  'initiatecheckout',
  'conversions'
]

export const useColumnsStore = create<ColumnsState>()(
  persist(
    (set, get) => ({
      availableColumns: allColumns,
      selectedColumns: defaultSelectedColumns,
      columnsOrder: allColumns.map(column => column.id),

      addColumn: (columnId: string) => {
        const { selectedColumns, columnsOrder } = get()
        if (!selectedColumns.includes(columnId)) {
          const newSelectedColumns = [...selectedColumns, columnId]
          const newColumnsOrder = columnsOrder.includes(columnId) 
            ? columnsOrder 
            : [...columnsOrder, columnId]
          set({ 
            selectedColumns: newSelectedColumns,
            columnsOrder: newColumnsOrder
          })
        }
      },

      removeColumn: (columnId: string) => {
        const { selectedColumns } = get()
        set({ selectedColumns: selectedColumns.filter(id => id !== columnId) })
      },

      setSelectedColumns: (columns: string[]) => {
        const { columnsOrder } = get()
        const validColumns = columns.filter(id => columnsOrder.includes(id))
        set({ selectedColumns: validColumns })
      },

      setColumnsOrder: (order: string[]) => {
        set({ columnsOrder: order })
      },

      moveColumn: (fromIndex: number, toIndex: number) => {
        const { columnsOrder } = get()
        const newOrder = [...columnsOrder]
        const [movedColumn] = newOrder.splice(fromIndex, 1)
        newOrder.splice(toIndex, 0, movedColumn)
        set({ columnsOrder: newOrder })
      },

      resetToDefault: () => {
        set({ 
          selectedColumns: defaultSelectedColumns,
          columnsOrder: allColumns.map(column => column.id)
        })
      },

      isColumnSelected: (columnId: string) => {
        const { selectedColumns } = get()
        return selectedColumns.includes(columnId)
      }
    }),
    {
      name: 'columns-storage',
      partialize: (state) => ({
        selectedColumns: state.selectedColumns,
        columnsOrder: state.columnsOrder
      })
    }
  )
) 