import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Metric {
  id: string
  label: string
  description: string
  category: 'basic' | 'performance' | 'conversion' | 'revenue' | 'earnings' | 'approval'
  unit: 'number' | 'currency' | 'percentage'
  format?: 'decimal' | 'integer' | 'currency' | 'percentage'
  icon?: string
  color?: string
}

export interface MetricsState {
  availableMetrics: Metric[]
  selectedMetrics: string[]
  metricsOrder: string[] // Nova propriedade para ordem das métricas
  addMetric: (metricId: string) => void
  removeMetric: (metricId: string) => void
  setSelectedMetrics: (metrics: string[]) => void
  setMetricsOrder: (order: string[]) => void // Nova função
  moveMetric: (fromIndex: number, toIndex: number) => void // Nova função
  resetToDefault: () => void
  isMetricSelected: (metricId: string) => boolean
}

// Todas as métricas disponíveis do RedTrack
const allMetrics: Metric[] = [
  // Métricas Básicas
  {
    id: 'clicks',
    label: 'Cliques',
    description: 'Total de cliques nas campanhas',
    category: 'basic',
    unit: 'number',
    format: 'integer',
    icon: 'MousePointer',
    color: 'blue'
  },
  {
    id: 'conversions',
    label: 'Conversões',
    description: 'Total de conversões aprovadas',
    category: 'basic',
    unit: 'number',
    format: 'integer',
    icon: 'Target',
    color: 'green'
  },
  {
    id: 'spend',
    label: 'Gasto',
    description: 'Total gasto em campanhas',
    category: 'basic',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'red'
  },
  {
    id: 'revenue',
    label: 'Receita',
    description: 'Receita total das campanhas',
    category: 'basic',
    unit: 'currency',
    format: 'currency',
    icon: 'TrendingUp',
    color: 'green'
  },
  {
    id: 'profit',
    label: 'Lucro',
    description: 'Lucro (receita - gasto)',
    category: 'basic',
    unit: 'currency',
    format: 'currency',
    icon: 'TrendingUp',
    color: 'green'
  },

  // Métricas de Performance
  {
    id: 'roi',
    label: 'ROI',
    description: 'Return on Investment (%)',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'purple'
  },
  {
    id: 'cpa',
    label: 'CPA',
    description: 'Cost per Acquisition',
    category: 'performance',
    unit: 'currency',
    format: 'currency',
    icon: 'Calculator',
    color: 'orange'
  },
  {
    id: 'cpc',
    label: 'CPC',
    description: 'Cost per Click',
    category: 'performance',
    unit: 'currency',
    format: 'currency',
    icon: 'MousePointer',
    color: 'blue'
  },
  {
    id: 'ctr',
    label: 'CTR',
    description: 'Click Through Rate (%)',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'blue'
  },
  {
    id: 'conversion_rate',
    label: 'Taxa de Conversão',
    description: 'Taxa de conversão (%)',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'Target',
    color: 'green'
  },

  // Métricas de Conversão
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
    id: 'transactions',
    label: 'Transações',
    description: 'Número de transações',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'ShoppingCart',
    color: 'green'
  },
  {
    id: 'prelp_views',
    label: 'Pre-LP Views',
    description: 'Visualizações da pré-landing page',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'Eye',
    color: 'blue'
  },
  {
    id: 'prelp_clicks',
    label: 'Pre-LP Clicks',
    description: 'Cliques na pré-landing page',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'MousePointer',
    color: 'blue'
  },
  {
    id: 'prelp_click_ctr',
    label: 'Pre-LP CTR',
    description: 'CTR da pré-landing page (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'blue'
  },

  // Métricas de Receita
  {
    id: 'conversion_revenue',
    label: 'Receita por Conversão',
    description: 'Receita média por conversão',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    id: 'publisher_revenue',
    label: 'Receita Publisher',
    description: 'Receita do publisher',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    id: 'total_aov',
    label: 'AOV Total',
    description: 'Average Order Value total',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'ShoppingCart',
    color: 'green'
  },
  {
    id: 'conversion_aov',
    label: 'AOV Conversão',
    description: 'AOV por conversão',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'ShoppingCart',
    color: 'green'
  },

  // Métricas de Earnings
  {
    id: 'epv',
    label: 'EPV',
    description: 'Earnings per View',
    category: 'earnings',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    id: 'eplpc',
    label: 'EPLPC',
    description: 'Earnings per Landing Page Click',
    category: 'earnings',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    id: 'epuc',
    label: 'EPUC',
    description: 'Earnings per Unique Click',
    category: 'earnings',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    id: 'listicle_epv',
    label: 'Listicle EPV',
    description: 'Earnings per View para listicles',
    category: 'earnings',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },

  // Métricas de Aprovação
  {
    id: 'approved',
    label: 'Aprovadas',
    description: 'Conversões aprovadas',
    category: 'approval',
    unit: 'number',
    format: 'integer',
    icon: 'CheckCircle',
    color: 'green'
  },
  {
    id: 'ar',
    label: 'Taxa Aprovação',
    description: 'Taxa de aprovação (%)',
    category: 'approval',
    unit: 'percentage',
    format: 'percentage',
    icon: 'CheckCircle',
    color: 'green'
  },
  {
    id: 'pending',
    label: 'Pendentes',
    description: 'Conversões pendentes',
    category: 'approval',
    unit: 'number',
    format: 'integer',
    icon: 'Clock',
    color: 'yellow'
  },
  {
    id: 'pr',
    label: 'Taxa Pendente',
    description: 'Taxa de conversões pendentes (%)',
    category: 'approval',
    unit: 'percentage',
    format: 'percentage',
    icon: 'Clock',
    color: 'yellow'
  },
  {
    id: 'declined',
    label: 'Recusadas',
    description: 'Conversões recusadas',
    category: 'approval',
    unit: 'number',
    format: 'integer',
    icon: 'XCircle',
    color: 'red'
  },
  {
    id: 'dr',
    label: 'Taxa Recusa',
    description: 'Taxa de recusa (%)',
    category: 'approval',
    unit: 'percentage',
    format: 'percentage',
    icon: 'XCircle',
    color: 'red'
  },

  // Métricas Avançadas
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
  {
    id: 'visible_impressions',
    label: 'Impressões Visíveis',
    description: 'Impressões realmente vistas',
    category: 'basic',
    unit: 'number',
    format: 'integer',
    icon: 'Eye',
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
    id: 'lp_ctr',
    label: 'LP CTR',
    description: 'CTR da landing page (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'blue'
  },
  {
    id: 'lp_click_ctr',
    label: 'LP Click CTR',
    description: 'CTR para cliques da landing page (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'blue'
  },
  {
    id: 'conversion_cr',
    label: 'Taxa Conversão CR',
    description: 'Taxa de conversão específica',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'Target',
    color: 'green'
  },
  {
    id: 'all_conversions_cr',
    label: 'Taxa Todas Conversões',
    description: 'Taxa de todas as conversões (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'Target',
    color: 'green'
  },
  {
    id: 'other',
    label: 'Outras',
    description: 'Outras conversões',
    category: 'approval',
    unit: 'number',
    format: 'integer',
    icon: 'HelpCircle',
    color: 'gray'
  },
  {
    id: 'or',
    label: 'Taxa Outras',
    description: 'Taxa de outras conversões (%)',
    category: 'approval',
    unit: 'percentage',
    format: 'percentage',
    icon: 'HelpCircle',
    color: 'gray'
  },
  {
    id: 'tr',
    label: 'Taxa Transação',
    description: 'Taxa de transação (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'ShoppingCart',
    color: 'green'
  },
  {
    id: 'conversion_roi',
    label: 'ROI Conversão',
    description: 'ROI específico para conversões',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'purple'
  },
  {
    id: 'conversion_cpa',
    label: 'CPA Conversão',
    description: 'CPA específico para conversões',
    category: 'performance',
    unit: 'currency',
    format: 'currency',
    icon: 'Calculator',
    color: 'orange'
  },
  {
    id: 'total_cpa',
    label: 'CPA Total',
    description: 'CPA geral',
    category: 'performance',
    unit: 'currency',
    format: 'currency',
    icon: 'Calculator',
    color: 'orange'
  },
  {
    id: 'cpt',
    label: 'CPT',
    description: 'Cost per Transaction',
    category: 'performance',
    unit: 'currency',
    format: 'currency',
    icon: 'Calculator',
    color: 'orange'
  },
  {
    id: 'roas_percentage',
    label: 'ROAS %',
    description: 'ROAS em percentual',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'purple'
  },
  {
    id: 'conversion_roas',
    label: 'ROAS Conversão',
    description: 'ROAS por conversão',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'purple'
  },
  {
    id: 'conversion_roas_percentage',
    label: 'ROAS Conversão %',
    description: 'ROAS percentual por conversão',
    category: 'performance',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'purple'
  },
  {
    id: 'conversion_profit',
    label: 'Lucro Conversão',
    description: 'Lucro por conversão',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'TrendingUp',
    color: 'green'
  },
  {
    id: 'epc_roi',
    label: 'EPC ROI',
    description: 'Earnings per Click ROI',
    category: 'earnings',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  {
    id: 'publisher_revenue_legacy',
    label: 'Receita Publisher Legacy',
    description: 'Receita legacy do publisher',
    category: 'revenue',
    unit: 'currency',
    format: 'currency',
    icon: 'DollarSign',
    color: 'green'
  },
  // Métricas de Landing Page
  {
    id: 'lp_views',
    label: 'LP Views',
    description: 'Visualizações da landing page',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'Eye',
    color: 'blue'
  },
  {
    id: 'lp_clicks',
    label: 'LP Clicks',
    description: 'Cliques na landing page',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'MousePointer',
    color: 'blue'
  },
  {
    id: 'lp_ctr',
    label: 'LP CTR',
    description: 'CTR da landing page (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'blue'
  },
  {
    id: 'lp_click_ctr',
    label: 'LP Click CTR',
    description: 'CTR para cliques da landing page (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'blue'
  },
  {
    id: 'offer_views',
    label: 'Offer Views',
    description: 'Visualizações da oferta',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'Eye',
    color: 'green'
  },
  {
    id: 'offer_clicks',
    label: 'Offer Clicks',
    description: 'Cliques na oferta',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'MousePointer',
    color: 'green'
  },
  {
    id: 'offer_ctr',
    label: 'Offer CTR',
    description: 'CTR da oferta (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'green'
  },
  {
    id: 'offer_click_ctr',
    label: 'Offer Click CTR',
    description: 'CTR para cliques da oferta (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'BarChart3',
    color: 'green'
  },
  {
    id: 'prelp_to_lp_rate',
    label: 'Pre-LP → LP Rate',
    description: 'Taxa de conversão Pre-LP para LP (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'ArrowRight',
    color: 'purple'
  },
  {
    id: 'lp_to_offer_rate',
    label: 'LP → Offer Rate',
    description: 'Taxa de conversão LP para Offer (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'ArrowRight',
    color: 'purple'
  },
  {
    id: 'offer_to_conversion_rate',
    label: 'Offer → Conversion Rate',
    description: 'Taxa de conversão Offer para Conversão (%)',
    category: 'conversion',
    unit: 'percentage',
    format: 'percentage',
    icon: 'ArrowRight',
    color: 'purple'
  },
  {
    id: 'initiate_checkout',
    label: 'Initiate Checkout',
    description: 'Inícios de checkout (eventos de início de compra)',
    category: 'conversion',
    unit: 'number',
    format: 'integer',
    icon: 'ShoppingCart',
    color: 'orange'
  }
]

// Métricas padrão selecionadas
const defaultSelectedMetrics = [
  'clicks',
  'conversions', 
  'spend',
  'revenue',
  'profit',
  'roi',
  'cpa',
  'ctr'
]

export const useMetricsStore = create<MetricsState>()(
  persist(
    (set, get) => ({
      availableMetrics: allMetrics,
      selectedMetrics: defaultSelectedMetrics,
      metricsOrder: allMetrics.map(metric => metric.id), // Inicializa a ordem com todas as métricas disponíveis

      addMetric: (metricId: string) => {
        const { selectedMetrics, metricsOrder } = get()
        if (!selectedMetrics.includes(metricId)) {
          const newSelectedMetrics = [...selectedMetrics, metricId]
          // Adicionar à ordem se não estiver lá
          const newMetricsOrder = metricsOrder.includes(metricId) 
            ? metricsOrder 
            : [...metricsOrder, metricId]
          set({ 
            selectedMetrics: newSelectedMetrics,
            metricsOrder: newMetricsOrder
          })
        }
      },

      removeMetric: (metricId: string) => {
        const { selectedMetrics } = get()
        set({ selectedMetrics: selectedMetrics.filter(id => id !== metricId) })
      },

      setSelectedMetrics: (metrics: string[]) => {
        const { metricsOrder } = get()
        // Manter apenas métricas que estão na ordem
        const validMetrics = metrics.filter(id => metricsOrder.includes(id))
        set({ selectedMetrics: validMetrics })
      },

      setMetricsOrder: (order: string[]) => {
        set({ metricsOrder: order })
      },

      moveMetric: (fromIndex: number, toIndex: number) => {
        const { metricsOrder } = get()
        const newOrder = [...metricsOrder]
        const [movedMetric] = newOrder.splice(fromIndex, 1)
        newOrder.splice(toIndex, 0, movedMetric)
        set({ metricsOrder: newOrder })
      },

      resetToDefault: () => {
        set({ 
          selectedMetrics: defaultSelectedMetrics,
          metricsOrder: allMetrics.map(metric => metric.id)
        })
      },

      isMetricSelected: (metricId: string) => {
        const { selectedMetrics } = get()
        return selectedMetrics.includes(metricId)
      }
    }),
    {
      name: 'metrics-storage',
      partialize: (state) => ({
        selectedMetrics: state.selectedMetrics,
        metricsOrder: state.metricsOrder
      })
    }
  )
) 