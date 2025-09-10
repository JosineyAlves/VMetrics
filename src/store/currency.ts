import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CurrencyState {
  currency: string
  currencySymbol: string
  isDetecting: boolean
  setCurrency: (currency: string) => void
  detectCurrency: (apiKey: string) => Promise<void>
  resetCurrency: () => void
}

// Mapeamento de códigos de moeda para símbolos
const currencySymbols: Record<string, string> = {
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

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD', // Padrão
      currencySymbol: '$', // Padrão
      isDetecting: false,
      
      setCurrency: (currency: string) => {
        const symbol = currencySymbols[currency] || currency
        set({ currency, currencySymbol: symbol })
        console.log(`💰 [CURRENCY] Moeda definida: ${currency} (${symbol})`)
      },
      
      detectCurrency: async (apiKey: string) => {
        // Função removida - detecção automática de moeda não é possível
        // A moeda deve ser configurada manualmente pelo usuário
        console.log('⚠️ [CURRENCY] Detecção automática de moeda removida - configure manualmente')
      },
      
      resetCurrency: () => {
        set({ currency: 'USD', currencySymbol: '$', isDetecting: false })
        console.log('🔄 [CURRENCY] Moeda resetada para padrão')
      },
      
             // Função de debug removida - não é mais necessária
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({ 
        currency: state.currency, 
        currencySymbol: state.currencySymbol 
      })
    }
  )
) 