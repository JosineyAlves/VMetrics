import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CampaignMetric {
  id: string
  label: string
  key: string
  visible: boolean
  order: number
}

interface CampaignMetricsStore {
  metrics: CampaignMetric[]
  setMetrics: (metrics: CampaignMetric[]) => void
  reorderMetrics: (newOrder: CampaignMetric[]) => void
  toggleMetricVisibility: (metricId: string) => void
  addMetric: (metric: CampaignMetric) => void
  removeMetric: (metricId: string) => void
  resetToDefault: () => void
}

const defaultMetrics: CampaignMetric[] = [
  { id: 'actions', label: 'Ações', key: 'actions', visible: true, order: 0 },
  { id: 'name', label: 'Campanha', key: 'name', visible: true, order: 1 },
  { id: 'source', label: 'Fonte', key: 'source', visible: true, order: 2 },
  { id: 'status', label: 'Status', key: 'status', visible: true, order: 3 },
  { id: 'clicks', label: 'Cliques', key: 'clicks', visible: true, order: 4 },
  { id: 'unique_clicks', label: 'Cliques Únicos', key: 'unique_clicks', visible: true, order: 5 },
  { id: 'impressions', label: 'Impressões', key: 'impressions', visible: true, order: 6 },
  { id: 'conversions', label: 'Conversões', key: 'conversions', visible: true, order: 7 },
  { id: 'all_conversions', label: 'Todas Conversões', key: 'all_conversions', visible: true, order: 8 },
  { id: 'approved', label: 'Aprovadas', key: 'approved', visible: true, order: 9 },
  { id: 'pending', label: 'Pendentes', key: 'pending', visible: true, order: 10 },
  { id: 'declined', label: 'Recusadas', key: 'declined', visible: true, order: 11 },
  { id: 'ctr', label: 'CTR', key: 'ctr', visible: true, order: 12 },
  { id: 'conversion_rate', label: 'Taxa Conv.', key: 'conversion_rate', visible: true, order: 13 },
  { id: 'spend', label: 'Gasto', key: 'spend', visible: true, order: 14 },
  { id: 'revenue', label: 'Receita', key: 'revenue', visible: true, order: 15 },
  { id: 'roi', label: 'ROI', key: 'roi', visible: true, order: 16 },
  { id: 'cpa', label: 'CPA', key: 'cpa', visible: true, order: 17 },
  { id: 'cpc', label: 'CPC', key: 'cpc', visible: true, order: 18 },
  { id: 'epc', label: 'EPC', key: 'epc', visible: true, order: 19 },
  { id: 'epl', label: 'EPL', key: 'epl', visible: true, order: 20 },
  { id: 'roas', label: 'ROAS', key: 'roas', visible: true, order: 21 }
]

export const useCampaignMetricsStore = create<CampaignMetricsStore>()(
  persist(
    (set, get) => ({
      metrics: defaultMetrics,
      
      setMetrics: (metrics) => set({ metrics }),
      
      reorderMetrics: (newOrder) => {
        const updatedMetrics = newOrder.map((metric, index) => ({
          ...metric,
          order: index
        }))
        set({ metrics: updatedMetrics })
      },
      
      toggleMetricVisibility: (metricId) => {
        const { metrics } = get()
        const updatedMetrics = metrics.map(metric =>
          metric.id === metricId
            ? { ...metric, visible: !metric.visible }
            : metric
        )
        set({ metrics: updatedMetrics })
      },
      
      addMetric: (metric) => {
        const { metrics } = get()
        const newOrder = Math.max(...metrics.map(m => m.order), -1) + 1
        const newMetric = { ...metric, order: newOrder }
        set({ metrics: [...metrics, newMetric] })
      },
      
      removeMetric: (metricId) => {
        const { metrics } = get()
        const updatedMetrics = metrics.filter(metric => metric.id !== metricId)
        set({ metrics: updatedMetrics })
      },
      
      resetToDefault: () => set({ metrics: defaultMetrics })
    }),
    {
      name: 'campaign-metrics-storage',
      version: 1
    }
  )
) 