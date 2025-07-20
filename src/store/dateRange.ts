import { create } from 'zustand'

interface DateRangeState {
  selectedPeriod: string
  customRange: { from: string; to: string }
  setSelectedPeriod: (period: string) => void
  setCustomRange: (range: { from: string; to: string }) => void
}

export const useDateRangeStore = create<DateRangeState>((set) => ({
  selectedPeriod: 'today',
  customRange: { from: '', to: '' },
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  setCustomRange: (range) => set({ customRange: range }),
})) 