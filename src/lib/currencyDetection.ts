/**
 * Função especializada para detectar a moeda da conta RedTrack
 * Baseada na estrutura real retornada pela API
 */

export interface RedTrackSettings {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  table_campaigns?: any
  table_sources?: any
  table_offers?: any
  table_networks?: any
  table_landings?: any
  table_campaigns_report?: any
  table_sources_report?: any
  table_offers_report?: any
  table_networks_report?: any
  table_clicks?: any
  table_costs?: any
  table_postbacks?: any
  table_postbacks_int?: any
  table_conversions?: any
  table_conversions_report?: any
  table_auto_optimization_report?: any
  table_publishers?: any
  table_publishers_statistics?: any
  table_acquisition?: any
  table_adverts?: any
  table_ip_report?: any
  table_click_forwarding?: any
  table_product_report?: any
  [key: string]: any
}

/**
 * Detecta a moeda baseada nas configurações da conta
 * @param settings - Configurações retornadas pelo endpoint /me/settings
 * @returns Código da moeda detectada ou 'USD' como padrão
 */
export function detectCurrencyFromSettings(settings: RedTrackSettings): string {
  console.log('🔍 [CURRENCY DETECTION] Analisando configurações da conta...')
  
  // 1. Verificar campos diretos de moeda
  if (settings.currency) {
    console.log('🔍 [CURRENCY DETECTION] Moeda encontrada em settings.currency:', settings.currency)
    return settings.currency
  }
  
  if (settings.default_currency) {
    console.log('🔍 [CURRENCY DETECTION] Moeda encontrada em settings.default_currency:', settings.default_currency)
    return settings.default_currency
  }
  
  // 2. Verificar campos aninhados
  const nestedFields = ['account', 'user', 'settings', 'preferences', 'user_settings', 'account_settings']
  for (const field of nestedFields) {
    const nestedValue = settings[field]
    if (nestedValue && typeof nestedValue === 'object' && nestedValue.currency) {
      console.log(`🔍 [CURRENCY DETECTION] Moeda encontrada em settings.${field}.currency:`, nestedValue.currency)
      return nestedValue.currency
    }
  }
  
  // 3. Verificar todos os campos por padrões de moeda
  console.log('🔍 [CURRENCY DETECTION] Verificando todos os campos por padrões de moeda...')
  const allFields = Object.keys(settings)
  
  for (const field of allFields) {
    const value = settings[field]
    
    // Verificar se é string e contém código de moeda
    if (typeof value === 'string') {
      const currencyMatch = value.match(/\b(BRL|USD|EUR|GBP|CAD|AUD|JPY|CNY|INR|MXN|ARS|CLP|COP|PEN|UYU|VEF|VES|BOB|PYG|GTQ|HNL|NIO|CRC|PAB|DOP|HTG|JMD|TTD|BBD|XCD|ANG|AWG|SRD|GYD|SBD|FJD|NZD|SGD|HKD|TWD|KRW|THB|MYR|IDR|PHP|VND|KHR|LAK|MMK|BDT|LKR|NPR|PKR|AFN|IRR|IQD|JOD|KWD|LBP|OMR|QAR|SAR|SYP|AED|YER|EGP|DZD|MAD|TND|LYD|SDG|ETB|KES|TZS|UGX|NGN|GHS|ZAR|BWP|NAD|ZMW|MWK|ZWL|MUR|SCR|SZL|LSL|MZN|CVE|STD|XOF|XAF|XPF|GMD|GNF|SLL|LRD|SLE|GIP|FKP|SHP|IMP|JEP|GGP|AOA|CDF)\b/i)
      if (currencyMatch) {
        const detectedCurrency = currencyMatch[1].toUpperCase()
        console.log(`🔍 [CURRENCY DETECTION] Moeda encontrada no campo ${field}:`, detectedCurrency)
        return detectedCurrency
      }
    }
    
    // Verificar se é objeto e tem propriedade currency
    if (typeof value === 'object' && value !== null) {
      if (value.currency) {
        console.log(`🔍 [CURRENCY DETECTION] Moeda encontrada em ${field}.currency:`, value.currency)
        return value.currency
      }
      
      // Verificar propriedades aninhadas
      for (const prop of Object.keys(value)) {
        if (prop.toLowerCase().includes('currency') && typeof value[prop] === 'string') {
          const currencyMatch = value[prop].match(/\b(BRL|USD|EUR|GBP|CAD|AUD|JPY|CNY|INR|MXN|ARS|CLP|COP|PEN|UYU|VEF|VES|BOB|PYG|GTQ|HNL|NIO|CRC|PAB|DOP|HTG|JMD|TTD|BBD|XCD|ANG|AWG|SRD|GYD|SBD|FJD|NZD|SGD|HKD|TWD|KRW|THB|MYR|IDR|PHP|VND|KHR|LAK|MMK|BDT|LKR|NPR|PKR|AFN|IRR|IQD|JOD|KWD|LBP|OMR|QAR|SAR|SYP|AED|YER|EGP|DZD|MAD|TND|LYD|SDG|ETB|KES|TZS|UGX|NGN|GHS|ZAR|BWP|NAD|ZMW|MWK|ZWL|MUR|SCR|SZL|LSL|MZN|CVE|STD|XOF|XAF|XPF|GMD|GNF|SLL|LRD|SLE|GIP|FKP|SHP|IMP|JEP|GGP|AOA|CDF)\b/i)
          if (currencyMatch) {
            const detectedCurrency = currencyMatch[1].toUpperCase()
            console.log(`🔍 [CURRENCY DETECTION] Moeda encontrada em ${field}.${prop}:`, detectedCurrency)
            return detectedCurrency
          }
        }
      }
    }
  }
  
  // 4. Se não encontrou, usar detecção por país (se disponível)
  if (settings.country) {
    console.log('🔍 [CURRENCY DETECTION] Tentando inferir moeda do país:', settings.country)
    return detectCurrencyByCountry(settings.country)
  }
  
  // 5. Fallback para USD
  console.log('⚠️ [CURRENCY DETECTION] Nenhuma moeda detectada, usando USD como padrão')
  return 'USD'
}

/**
 * Detecta moeda baseada no código do país
 * @param countryCode - Código do país (ex: 'BR', 'US')
 * @returns Código da moeda
 */
function detectCurrencyByCountry(countryCode: string): string {
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
  
  const upperCountryCode = countryCode.toUpperCase()
  const detectedCurrency = countryCurrencyMap[upperCountryCode]
  
  if (detectedCurrency) {
    console.log(`🔍 [CURRENCY DETECTION] Moeda inferida do país ${upperCountryCode}:`, detectedCurrency)
    return detectedCurrency
  } else {
    console.log(`⚠️ [CURRENCY DETECTION] País ${upperCountryCode} não encontrado no mapeamento`)
    return 'USD'
  }
} 