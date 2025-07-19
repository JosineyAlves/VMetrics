import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para obter data no timezone do RedTrack (UTC)
export const getRedTrackDate = (date: Date = new Date()) => {
  // RedTrack usa UTC, então convertemos para UTC
  const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
  return utcDate
}

// Função para formatar data no formato YYYY-MM-DD para RedTrack
export const formatDateForRedTrack = (date: Date) => {
  return date.toISOString().split('T')[0]
}

// Base padronizada de datas para todas as telas - Sincronizada com RedTrack
export const getDateRange = (period: string, customRange?: { from: string; to: string }) => {
  if (period === 'custom' && customRange?.from && customRange?.to) {
    return {
      startDate: customRange.from,
      endDate: customRange.to
    }
  }

  // Usar timezone do RedTrack (UTC)
  const today = getRedTrackDate(new Date())
  let startDate = new Date(today)
  let endDate = new Date(today)

  switch (period) {
    case 'today':
      // já está correto - usa data atual no timezone do RedTrack
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
    startDate: formatDateForRedTrack(startDate),
    endDate: formatDateForRedTrack(endDate)
  }
}

// Função para obter data atual no timezone do RedTrack
export const getCurrentRedTrackDate = () => {
  return formatDateForRedTrack(getRedTrackDate())
}

// Função para converter data local para timezone do RedTrack
export const convertToRedTrackTimezone = (localDate: Date) => {
  return getRedTrackDate(localDate)
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