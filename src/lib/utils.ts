import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Base padronizada de datas para todas as telas
export const getDateRange = (period: string, customRange?: { from: string; to: string }) => {
  if (period === 'custom' && customRange?.from && customRange?.to) {
    return {
      startDate: customRange.from,
      endDate: customRange.to
    }
  }

  const today = new Date()
  let startDate = new Date(today)
  let endDate = new Date(today)

  switch (period) {
    case 'today':
      // já está correto
      break
    case 'last_60_minutes':
      startDate = new Date(today.getTime() - 60 * 60 * 1000)
      endDate = today
      break
    case 'yesterday':
      startDate.setDate(today.getDate() - 1)
      endDate.setDate(today.getDate() - 1)
      break
    case 'this_week': {
      const day = today.getDay() || 7
      startDate.setDate(today.getDate() - day + 1)
      break
    }
    case 'last_7_days':
      startDate.setDate(today.getDate() - 6)
      break
    case 'last_week': {
      const day = today.getDay() || 7
      endDate.setDate(today.getDate() - day)
      startDate.setDate(endDate.getDate() - 6)
      break
    }
    case 'this_month':
      startDate.setDate(1)
      break
    case 'last_30_days':
      startDate.setDate(today.getDate() - 29)
      break
    case 'last_month':
      startDate.setMonth(today.getMonth() - 1, 1)
      endDate = new Date(today.getFullYear(), today.getMonth(), 0)
      break
    default:
      break
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

// Presets padronizados com tradução
export const periodPresets = [
  { value: 'today', label: 'Hoje' },
  { value: 'last_60_minutes', label: 'Últimos 60 minutos' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_7_days', label: 'Últimos 7 dias' },
  { value: 'last_week', label: 'Semana passada' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_30_days', label: 'Últimos 30 dias' },
  { value: 'last_month', label: 'Mês passado' },
  { value: 'custom', label: 'Personalizado' },
] 