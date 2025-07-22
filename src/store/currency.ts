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
        if (!apiKey) {
          console.log('⚠️ [CURRENCY] API Key não fornecida para detecção de moeda')
          return
        }
        
        set({ isDetecting: true })
        console.log('🔍 [CURRENCY] Detectando moeda da conta RedTrack...')
        
        try {
          // Fazer requisição para /me/settings para obter configurações da conta
          const response = await fetch('/api/settings', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const settings = await response.json()
            console.log('🔍 [CURRENCY] Configurações da conta:', settings)
            
            // Tentar extrair a moeda das configurações
            let detectedCurrency = 'USD' // Padrão
            
            // Verificar diferentes possíveis campos onde a moeda pode estar
            if (settings.currency) {
              detectedCurrency = settings.currency
            } else if (settings.account?.currency) {
              detectedCurrency = settings.account.currency
            } else if (settings.user?.currency) {
              detectedCurrency = settings.user.currency
            } else if (settings.settings?.currency) {
              detectedCurrency = settings.settings.currency
            } else if (settings.preferences?.currency) {
              detectedCurrency = settings.preferences.currency
            }
            
            // Se não encontrou moeda nas configurações, tentar inferir dos dados
            if (detectedCurrency === 'USD') {
              // Tentar fazer uma requisição de relatório para ver se há dados com moeda
              try {
                const reportResponse = await fetch('/api/report?group_by=date&date_from=2024-01-01&date_to=2024-01-31', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                  }
                })
                
                if (reportResponse.ok) {
                  const reportData = await reportResponse.json()
                  console.log('🔍 [CURRENCY] Dados do relatório para inferir moeda:', reportData)
                  
                  // Se há dados de receita, podemos tentar inferir a moeda
                  // Por enquanto, manteremos USD como padrão
                }
              } catch (error) {
                console.log('⚠️ [CURRENCY] Erro ao buscar dados para inferir moeda:', error)
              }
            }
            
            console.log(`✅ [CURRENCY] Moeda detectada: ${detectedCurrency}`)
            get().setCurrency(detectedCurrency)
          } else {
            console.log('⚠️ [CURRENCY] Erro ao buscar configurações da conta')
            // Manter moeda padrão
            get().setCurrency('USD')
          }
        } catch (error) {
          console.error('❌ [CURRENCY] Erro ao detectar moeda:', error)
          // Em caso de erro, manter moeda padrão
          get().setCurrency('USD')
        } finally {
          set({ isDetecting: false })
        }
      },
      
      resetCurrency: () => {
        set({ currency: 'USD', currencySymbol: '$', isDetecting: false })
        console.log('🔄 [CURRENCY] Moeda resetada para padrão')
      }
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