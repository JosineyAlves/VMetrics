import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { detectCurrencyFromSettings, type RedTrackSettings } from '../lib/currencyDetection'

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
          let detectedCurrency = 'USD' // Fallback padrão
          
          // 1. TENTAR ENDPOINT /me/settings (Bearer token)
          console.log('🔍 [CURRENCY] Tentando endpoint /me/settings...')
          try {
            const settingsResponse = await fetch('https://api.redtrack.io/me/settings', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json()
              console.log('✅ [CURRENCY] Configurações obtidas via /me/settings:', settingsData)
              
              // Verificar campos possíveis para moeda
              const currency = settingsData.currency || settingsData.default_currency || settingsData.account_currency
              if (currency) {
                detectedCurrency = currency.toUpperCase()
                console.log(`✅ [CURRENCY] Moeda encontrada em /me/settings: ${detectedCurrency}`)
              }
            } else {
              console.log('⚠️ [CURRENCY] Endpoint /me/settings não disponível ou erro:', settingsResponse.status)
            }
          } catch (settingsError) {
            console.log('⚠️ [CURRENCY] Erro ao acessar /me/settings:', settingsError)
          }
          
          // 2. SE NÃO ENCONTROU, TENTAR ENDPOINT /conversions (fallback)
          if (detectedCurrency === 'USD') {
            console.log('🔍 [CURRENCY] Tentando detectar moeda via /conversions...')
            try {
              const conversionsResponse = await fetch(`https://api.redtrack.io/conversions?api_key=${encodeURIComponent(apiKey)}&date_from=2024-01-01&date_to=2024-01-31&per=5`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              
              if (conversionsResponse.ok) {
                const conversionsData = await conversionsResponse.json()
                console.log('✅ [CURRENCY] Conversões obtidas:', conversionsData)
                
                if (conversionsData.items && conversionsData.items.length > 0) {
                  const firstConversion = conversionsData.items[0]
                  if (firstConversion.currency) {
                    detectedCurrency = firstConversion.currency.toUpperCase()
                    console.log(`✅ [CURRENCY] Moeda encontrada em conversões: ${detectedCurrency}`)
                  }
                }
              } else {
                console.log('⚠️ [CURRENCY] Endpoint /conversions não disponível ou erro:', conversionsResponse.status)
              }
            } catch (conversionsError) {
              console.log('⚠️ [CURRENCY] Erro ao acessar /conversions:', conversionsError)
            }
          }
          
          // 3. SE AINDA NÃO ENCONTROU, USAR PROXY INTERNO (fallback final)
          if (detectedCurrency === 'USD') {
            console.log('🔍 [CURRENCY] Tentando via proxy interno /api/settings...')
            try {
              const proxyResponse = await fetch(`/api/settings?api_key=${encodeURIComponent(apiKey)}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              
              if (proxyResponse.ok) {
                const settings = await proxyResponse.json() as RedTrackSettings
                console.log('✅ [CURRENCY] Configurações via proxy:', settings)
                
                // Usar a função especializada para detectar moeda
                const proxyCurrency = detectCurrencyFromSettings(settings)
                if (proxyCurrency && proxyCurrency !== 'USD') {
                  detectedCurrency = proxyCurrency
                  console.log(`✅ [CURRENCY] Moeda detectada via proxy: ${detectedCurrency}`)
                }
              }
            } catch (proxyError) {
              console.log('⚠️ [CURRENCY] Erro no proxy interno:', proxyError)
            }
          }
          
          // Definir moeda detectada
          console.log(`✅ [CURRENCY] Moeda final detectada: ${detectedCurrency}`)
          get().setCurrency(detectedCurrency)
          
        } catch (error) {
          console.error('❌ [CURRENCY] Erro geral ao detectar moeda:', error)
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
         
         let settingsData = null
         let conversionsData = null
         
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
             settingsData = await settingsResponse.json()
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
             conversionsData = await conversionsResponse.json()
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
           
           return { 
             settings: settingsData, 
             conversions: conversionsData 
           }
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