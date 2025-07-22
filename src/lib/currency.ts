import { useCurrencyStore } from '../store/currency'

/**
 * Formata um valor monetário usando a moeda detectada automaticamente
 * @param value - Valor a ser formatado
 * @param currency - Código da moeda (opcional, usa a detectada se não fornecida)
 * @returns String formatada da moeda
 */
export const formatCurrency = (value: number, currency?: string): string => {
  const { currency: detectedCurrency } = useCurrencyStore.getState()
  const currencyToUse = currency || detectedCurrency || 'USD'
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencyToUse
  }).format(value)
}

/**
 * Formata um valor monetário com símbolo personalizado
 * @param value - Valor a ser formatado
 * @param symbol - Símbolo da moeda
 * @returns String formatada da moeda
 */
export const formatCurrencyWithSymbol = (value: number, symbol: string): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD' // Usar USD como base para formatação
  }).format(value).replace('$', symbol)
}

/**
 * Obtém o símbolo da moeda baseado no código
 * @param currencyCode - Código da moeda (ex: 'BRL', 'USD')
 * @returns Símbolo da moeda
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    'BRL': 'R$',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥',
    'INR': '₹',
    'MXN': '$',
    'ARS': '$',
    'CLP': '$',
    'COP': '$',
    'PEN': 'S/',
    'UYU': '$',
    'VEF': 'Bs',
    'VES': 'Bs',
    'BOL': 'Bs',
    'PYG': '₲',
    'BOB': 'Bs',
    'GTQ': 'Q',
    'HNL': 'L',
    'NIO': 'C$',
    'CRC': '₡',
    'PAB': 'B/.',
    'DOP': 'RD$',
    'HTG': 'G',
    'JMD': 'J$',
    'TTD': 'TT$',
    'BBD': 'Bds$',
    'XCD': 'EC$',
    'ANG': 'ƒ',
    'AWG': 'ƒ',
    'SRD': '$',
    'GYD': '$',
    'SBD': '$',
    'FJD': '$',
    'NZD': '$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'TWD': 'NT$',
    'KRW': '₩',
    'THB': '฿',
    'MYR': 'RM',
    'IDR': 'Rp',
    'PHP': '₱',
    'VND': '₫',
    'KHR': '៛',
    'LAK': '₭',
    'MMK': 'K',
    'BDT': '৳',
    'LKR': 'Rs',
    'NPR': '₨',
    'PKR': '₨',
    'AFN': '؋',
    'IRR': '﷼',
    'IQD': 'ع.د',
    'JOD': 'د.ا',
    'KWD': 'د.ك',
    'LBP': 'ل.ل',
    'OMR': 'ر.ع.',
    'QAR': 'ر.ق',
    'SAR': 'ر.س',
    'SYP': 'ل.س',
    'AED': 'د.إ',
    'YER': '﷼',
    'EGP': 'ج.م',
    'DZD': 'د.ج',
    'MAD': 'د.م.',
    'TND': 'د.ت',
    'LYD': 'ل.د',
    'SDG': 'ج.س.',
    'ETB': 'ብር',
    'KES': 'KSh',
    'TZS': 'TSh',
    'UGX': 'USh',
    'NGN': '₦',
    'GHS': 'GH₵',
    'ZAR': 'R',
    'BWP': 'P',
    'NAD': 'N$',
    'ZMW': 'ZK',
    'MWK': 'MK',
    'ZWL': '$',
    'MUR': '₨',
    'SCR': '₨',
    'SZL': 'L',
    'LSL': 'L',
    'MZN': 'MT',
    'CVE': '$',
    'STD': 'Db',
    'XOF': 'CFA',
    'XAF': 'FCFA',
    'XPF': 'CFP',
    'GMD': 'D',
    'GNF': 'FG',
    'SLL': 'Le',
    'LRD': 'L$',
    'SLE': 'Le',
    'GIP': '£',
    'FKP': '£',
    'SHP': '£',
    'IMP': '£',
    'JEP': '£',
    'GGP': '£',
    'AOA': 'Kz',
    'CDF': 'FC'
  }
  
  return symbols[currencyCode] || currencyCode
} 