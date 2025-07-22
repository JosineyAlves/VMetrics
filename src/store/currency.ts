import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CurrencyState {
  currency: string
  currencySymbol: string
  isDetecting: boolean
  setCurrency: (currency: string) => void
  detectCurrency: (apiKey: string) => Promise<void>
  resetCurrency: () => void
  debugCurrencyDetection: (apiKey: string) => Promise<any>
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
          const response = await fetch(`/api/settings?api_key=${encodeURIComponent(apiKey)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
                     if (response.ok) {
             const settings = await response.json()
             console.log('🔍 [CURRENCY] Configurações da conta:', settings)
             
             // Tentar extrair a moeda das configurações
             let detectedCurrency = 'USD' // Padrão
             
                          // Verificar diferentes possíveis campos onde a moeda pode estar
             // Baseado na documentação da API RedTrack
             if (settings.currency) {
               detectedCurrency = settings.currency
               console.log('🔍 [CURRENCY] Moeda encontrada em settings.currency:', detectedCurrency)
             } else if (settings.account?.currency) {
               detectedCurrency = settings.account.currency
               console.log('🔍 [CURRENCY] Moeda encontrada em settings.account.currency:', detectedCurrency)
             } else if (settings.user?.currency) {
               detectedCurrency = settings.user.currency
               console.log('🔍 [CURRENCY] Moeda encontrada em settings.user.currency:', detectedCurrency)
             } else if (settings.settings?.currency) {
               detectedCurrency = settings.settings.currency
               console.log('🔍 [CURRENCY] Moeda encontrada em settings.settings.currency:', detectedCurrency)
             } else if (settings.preferences?.currency) {
               detectedCurrency = settings.preferences.currency
               console.log('🔍 [CURRENCY] Moeda encontrada em settings.preferences.currency:', detectedCurrency)
             } else if (settings.default_currency) {
               detectedCurrency = settings.default_currency
               console.log('🔍 [CURRENCY] Moeda encontrada em settings.default_currency:', detectedCurrency)
             } else if (settings.user_settings?.currency) {
               detectedCurrency = settings.user_settings.currency
               console.log('🔍 [CURRENCY] Moeda encontrada em settings.user_settings.currency:', detectedCurrency)
             } else if (settings.account_settings?.currency) {
               detectedCurrency = settings.account_settings.currency
               console.log('🔍 [CURRENCY] Moeda encontrada em settings.account_settings.currency:', detectedCurrency)
             } else {
               console.log('⚠️ [CURRENCY] Nenhuma moeda encontrada nas configurações, tentando inferir do país...')
               
               // Tentar inferir moeda baseada no país da conta
               if (settings.country) {
                 const countryCurrencyMap: Record<string, string> = {
                   'BR': 'BRL',
                   'US': 'USD',
                   'CA': 'CAD',
                   'MX': 'MXN',
                   'AR': 'ARS',
                   'CL': 'CLP',
                   'CO': 'COP',
                   'PE': 'PEN',
                   'UY': 'UYU',
                   'VE': 'VES',
                   'BO': 'BOB',
                   'PY': 'PYG',
                   'GT': 'GTQ',
                   'HN': 'HNL',
                   'NI': 'NIO',
                   'CR': 'CRC',
                   'PA': 'PAB',
                   'DO': 'DOP',
                   'HT': 'HTG',
                   'JM': 'JMD',
                   'TT': 'TTD',
                   'BB': 'BBD',
                   'EC': 'USD', // Equador usa USD
                   'AW': 'AWG',
                   'SR': 'SRD',
                   'GY': 'GYD',
                   'SB': 'SBD',
                   'FJ': 'FJD',
                   'NZ': 'NZD',
                   'AU': 'AUD',
                   'SG': 'SGD',
                   'HK': 'HKD',
                   'TW': 'TWD',
                   'JP': 'JPY',
                   'CN': 'CNY',
                   'KR': 'KRW',
                   'TH': 'THB',
                   'MY': 'MYR',
                   'ID': 'IDR',
                   'PH': 'PHP',
                   'VN': 'VND',
                   'KH': 'KHR',
                   'LA': 'LAK',
                   'MM': 'MMK',
                   'BD': 'BDT',
                   'LK': 'LKR',
                   'NP': 'NPR',
                   'PK': 'PKR',
                   'AF': 'AFN',
                   'IR': 'IRR',
                   'IQ': 'IQD',
                   'JO': 'JOD',
                   'KW': 'KWD',
                   'LB': 'LBP',
                   'OM': 'OMR',
                   'QA': 'QAR',
                   'SA': 'SAR',
                   'SY': 'SYP',
                   'AE': 'AED',
                   'YE': 'YER',
                   'EG': 'EGP',
                   'DZ': 'DZD',
                   'MA': 'MAD',
                   'TN': 'TND',
                   'LY': 'LYD',
                   'SD': 'SDG',
                   'ET': 'ETB',
                   'KE': 'KES',
                   'TZ': 'TZS',
                   'UG': 'UGX',
                   'NG': 'NGN',
                   'GH': 'GHS',
                   'ZA': 'ZAR',
                   'BW': 'BWP',
                   'NA': 'NAD',
                   'ZM': 'ZMW',
                   'MW': 'MWK',
                   'ZW': 'ZWL',
                   'MU': 'MUR',
                   'SC': 'SCR',
                   'SZ': 'SZL',
                   'LS': 'LSL',
                   'MZ': 'MZN',
                   'CV': 'CVE',
                   'ST': 'STD',
                   'BF': 'XOF',
                   'CM': 'XAF',
                   'PF': 'XPF',
                   'GM': 'GMD',
                   'GN': 'GNF',
                   'SL': 'SLL',
                   'LR': 'LRD',
                   'SH': 'SHP',
                   'GI': 'GIP',
                   'FK': 'FKP',
                   'IM': 'IMP',
                   'JE': 'JEP',
                   'GG': 'GGP',
                   'AO': 'AOA',
                   'CD': 'CDF'
                 }
                 
                 const countryCode = settings.country.toUpperCase()
                 if (countryCurrencyMap[countryCode]) {
                   detectedCurrency = countryCurrencyMap[countryCode]
                   console.log(`🔍 [CURRENCY] Moeda inferida do país ${countryCode}: ${detectedCurrency}`)
                 } else {
                   console.log(`⚠️ [CURRENCY] País ${countryCode} não encontrado no mapeamento`)
                 }
               }
             }
             
                          // Se ainda não encontrou moeda, tentar buscar através do endpoint /conversions
             // que sabemos que retorna o campo currency na documentação
             if (detectedCurrency === 'USD') {
               console.log('🔍 [CURRENCY] Tentando buscar moeda através do endpoint /conversions...')
               try {
                 const conversionsResponse = await fetch(`/api/conversions?api_key=${encodeURIComponent(apiKey)}&date_from=2024-01-01&date_to=2024-01-31&per=1`, {
                   method: 'GET',
                   headers: {
                     'Content-Type': 'application/json'
                   }
                 })
                 
                 if (conversionsResponse.ok) {
                   const conversionsData = await conversionsResponse.json()
                   console.log('🔍 [CURRENCY] Dados de conversões para inferir moeda:', conversionsData)
                   
                   // Verificar se há conversões e se elas têm campo currency
                   if (conversionsData.items && conversionsData.items.length > 0) {
                     const firstConversion = conversionsData.items[0]
                     if (firstConversion.currency) {
                       detectedCurrency = firstConversion.currency
                       console.log('🔍 [CURRENCY] Moeda encontrada em conversão:', detectedCurrency)
                     } else {
                       console.log('⚠️ [CURRENCY] Conversão encontrada mas sem campo currency')
                     }
                   } else {
                     console.log('⚠️ [CURRENCY] Nenhuma conversão encontrada para inferir moeda')
                   }
                 }
               } catch (error) {
                 console.log('⚠️ [CURRENCY] Erro ao buscar conversões para inferir moeda:', error)
               }
             }
             
             // Se ainda não encontrou moeda, tentar buscar através do endpoint /report
             if (detectedCurrency === 'USD') {
               console.log('🔍 [CURRENCY] Tentando buscar moeda através do endpoint /report...')
               try {
                 const reportResponse = await fetch(`/api/report?api_key=${encodeURIComponent(apiKey)}&group_by=date&date_from=2024-01-01&date_to=2024-01-31`, {
                   method: 'GET',
                   headers: {
                     'Content-Type': 'application/json'
                   }
                 })
                 
                 if (reportResponse.ok) {
                   const reportData = await reportResponse.json()
                   console.log('🔍 [CURRENCY] Dados do relatório para inferir moeda:', reportData)
                   
                   // Verificar se há dados de receita e tentar inferir moeda
                   // Por enquanto, manteremos USD como padrão
                 }
               } catch (error) {
                 console.log('⚠️ [CURRENCY] Erro ao buscar dados do relatório para inferir moeda:', error)
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
      },
      
             // Função de debug para testar a detecção
       debugCurrencyDetection: async (apiKey: string) => {
         console.log('🔍 [CURRENCY DEBUG] Iniciando debug da detecção de moeda...')
         console.log('🔍 [CURRENCY DEBUG] API Key:', apiKey ? 'Fornecida' : 'Não fornecida')
         
         try {
           // Testar endpoint /me/settings
           console.log('🔍 [CURRENCY DEBUG] Testando endpoint /me/settings...')
           const settingsResponse = await fetch(`/api/settings?api_key=${encodeURIComponent(apiKey)}`, {
             method: 'GET',
             headers: {
               'Content-Type': 'application/json'
             }
           })
           
           console.log('🔍 [CURRENCY DEBUG] Status da resposta /settings:', settingsResponse.status)
           console.log('🔍 [CURRENCY DEBUG] Headers da resposta /settings:', Object.fromEntries(settingsResponse.headers.entries()))
           
           if (settingsResponse.ok) {
             const settingsData = await settingsResponse.json()
             console.log('🔍 [CURRENCY DEBUG] Dados completos /settings:', settingsData)
             console.log('🔍 [CURRENCY DEBUG] Campos disponíveis /settings:', Object.keys(settingsData))
             
             // Verificar campos específicos
             if (settingsData.currency) console.log('🔍 [CURRENCY DEBUG] settingsData.currency:', settingsData.currency)
             if (settingsData.account) console.log('🔍 [CURRENCY DEBUG] settingsData.account:', settingsData.account)
             if (settingsData.user) console.log('🔍 [CURRENCY DEBUG] settingsData.user:', settingsData.user)
             if (settingsData.settings) console.log('🔍 [CURRENCY DEBUG] settingsData.settings:', settingsData.settings)
             if (settingsData.preferences) console.log('🔍 [CURRENCY DEBUG] settingsData.preferences:', settingsData.preferences)
             if (settingsData.country) console.log('🔍 [CURRENCY DEBUG] settingsData.country:', settingsData.country)
             if (settingsData.default_currency) console.log('🔍 [CURRENCY DEBUG] settingsData.default_currency:', settingsData.default_currency)
             if (settingsData.user_settings) console.log('🔍 [CURRENCY DEBUG] settingsData.user_settings:', settingsData.user_settings)
             if (settingsData.account_settings) console.log('🔍 [CURRENCY DEBUG] settingsData.account_settings:', settingsData.account_settings)
           } else {
             const errorData = await settingsResponse.json().catch(() => ({}))
             console.log('❌ [CURRENCY DEBUG] Erro na resposta /settings:', errorData)
           }
           
           // Testar endpoint /conversions
           console.log('🔍 [CURRENCY DEBUG] Testando endpoint /conversions...')
           const conversionsResponse = await fetch(`/api/conversions?api_key=${encodeURIComponent(apiKey)}&date_from=2024-01-01&date_to=2024-01-31&per=1`, {
             method: 'GET',
             headers: {
               'Content-Type': 'application/json'
             }
           })
           
           console.log('🔍 [CURRENCY DEBUG] Status da resposta /conversions:', conversionsResponse.status)
           
           if (conversionsResponse.ok) {
             const conversionsData = await conversionsResponse.json()
             console.log('🔍 [CURRENCY DEBUG] Dados completos /conversions:', conversionsData)
             
             if (conversionsData.items && conversionsData.items.length > 0) {
               const firstConversion = conversionsData.items[0]
               console.log('🔍 [CURRENCY DEBUG] Primeira conversão:', firstConversion)
               console.log('🔍 [CURRENCY DEBUG] Campos da conversão:', Object.keys(firstConversion))
               
               if (firstConversion.currency) {
                 console.log('🔍 [CURRENCY DEBUG] Moeda na conversão:', firstConversion.currency)
               }
             }
           } else {
             const errorData = await conversionsResponse.json().catch(() => ({}))
             console.log('❌ [CURRENCY DEBUG] Erro na resposta /conversions:', errorData)
           }
           
           return { settings: settingsResponse.ok ? await settingsResponse.json() : null, conversions: conversionsResponse.ok ? await conversionsResponse.json() : null }
         } catch (error) {
           console.error('❌ [CURRENCY DEBUG] Erro na requisição:', error)
           return null
         }
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