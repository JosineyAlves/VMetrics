/**
 * Endpoint de debug para testar a detecção de moeda
 * Acesse: https://my-dash-two.vercel.app/api/debug-currency?api_key=K0Y6dcsgEqmjQp0CKD49
 */

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { api_key } = req.query

  if (!api_key) {
    return res.status(400).json({
      error: 'API Key é obrigatória',
      usage: 'Use: /api/debug-currency?api_key=SUA_API_KEY'
    })
  }

  console.log('🔍 [DEBUG CURRENCY] Iniciando debug de moeda...')
  console.log('🔍 [DEBUG CURRENCY] API Key:', api_key ? 'Fornecida' : 'Não fornecida')

  try {
    const results = {
      timestamp: new Date().toISOString(),
      api_key_provided: !!api_key,
      endpoints_tested: [],
      currency_detected: null,
      raw_responses: {}
    }

    // 1. Testar endpoint /me/settings
    console.log('🔍 [DEBUG CURRENCY] Testando endpoint /me/settings...')
    try {
      const settingsResponse = await fetch(`https://api.redtrack.io/me/settings?api_key=${encodeURIComponent(api_key)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const settingsStatus = settingsResponse.status
      console.log('🔍 [DEBUG CURRENCY] Status da resposta /settings:', settingsStatus)

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        results.raw_responses.settings = settingsData
        results.endpoints_tested.push({
          endpoint: '/me/settings',
          status: settingsStatus,
          success: true,
          fields_count: Object.keys(settingsData).length,
          fields_available: Object.keys(settingsData)
        })

        // Analisar campos para detectar moeda
        console.log('🔍 [DEBUG CURRENCY] Analisando campos das configurações...')
        const currencyAnalysis = analyzeSettingsForCurrency(settingsData)
        results.currency_analysis = currencyAnalysis

        if (currencyAnalysis.currency_found) {
          results.currency_detected = currencyAnalysis.detected_currency
          console.log('✅ [DEBUG CURRENCY] Moeda detectada:', currencyAnalysis.detected_currency)
        }
      } else {
        const errorData = await settingsResponse.text()
        results.endpoints_tested.push({
          endpoint: '/me/settings',
          status: settingsStatus,
          success: false,
          error: errorData
        })
        console.log('❌ [DEBUG CURRENCY] Erro na resposta /settings:', errorData)
      }
    } catch (error) {
      console.log('❌ [DEBUG CURRENCY] Erro ao testar /me/settings:', error.message)
      results.endpoints_tested.push({
        endpoint: '/me/settings',
        status: 'ERROR',
        success: false,
        error: error.message
      })
    }

    // 2. Testar endpoint /conversions (se não encontrou moeda nas configurações)
    if (!results.currency_detected) {
      console.log('🔍 [DEBUG CURRENCY] Testando endpoint /conversions...')
      try {
        const conversionsResponse = await fetch(`https://api.redtrack.io/conversions?api_key=${encodeURIComponent(api_key)}&date_from=2024-01-01&date_to=2024-12-31&per=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const conversionsStatus = conversionsResponse.status
        console.log('🔍 [DEBUG CURRENCY] Status da resposta /conversions:', conversionsStatus)

        if (conversionsResponse.ok) {
          const conversionsData = await conversionsResponse.json()
          results.raw_responses.conversions = conversionsData
          results.endpoints_tested.push({
            endpoint: '/conversions',
            status: conversionsStatus,
            success: true,
            items_count: conversionsData.items?.length || 0,
            total: conversionsData.total || 0
          })

          // Verificar se há conversões com campo currency
          if (conversionsData.items && conversionsData.items.length > 0) {
            const firstConversion = conversionsData.items[0]
            if (firstConversion.currency) {
              results.currency_detected = firstConversion.currency
              console.log('✅ [DEBUG CURRENCY] Moeda encontrada em conversão:', firstConversion.currency)
            }
          }
        } else {
          const errorData = await conversionsResponse.text()
          results.endpoints_tested.push({
            endpoint: '/conversions',
            status: conversionsStatus,
            success: false,
            error: errorData
          })
          console.log('❌ [DEBUG CURRENCY] Erro na resposta /conversions:', errorData)
        }
      } catch (error) {
        console.log('❌ [DEBUG CURRENCY] Erro ao testar /conversions:', error.message)
        results.endpoints_tested.push({
          endpoint: '/conversions',
          status: 'ERROR',
          success: false,
          error: error.message
        })
      }
    }

    // 3. Resumo final
    results.summary = {
      currency_detected: results.currency_detected || 'Nenhuma moeda detectada',
      endpoints_successful: results.endpoints_tested.filter(e => e.success).length,
      endpoints_failed: results.endpoints_tested.filter(e => !e.success).length,
      recommendation: results.currency_detected 
        ? `Moeda detectada: ${results.currency_detected}` 
        : 'Nenhuma moeda encontrada. Verifique se a API Key está correta.'
    }

    console.log('✅ [DEBUG CURRENCY] Debug concluído:', results.summary)
    return res.status(200).json(results)

  } catch (error) {
    console.error('❌ [DEBUG CURRENCY] Erro geral:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Analisa as configurações para detectar moeda
 */
function analyzeSettingsForCurrency(settings) {
  const analysis = {
    currency_found: false,
    detected_currency: null,
    fields_checked: [],
    patterns_found: []
  }

  // 1. Verificar campos diretos
  const directFields = ['currency', 'default_currency']
  for (const field of directFields) {
    if (settings[field]) {
      analysis.currency_found = true
      analysis.detected_currency = settings[field]
      analysis.fields_checked.push(`${field}: ${settings[field]}`)
      return analysis
    }
  }

  // 2. Verificar campos aninhados
  const nestedFields = ['account', 'user', 'settings', 'preferences', 'user_settings', 'account_settings']
  for (const field of nestedFields) {
    const nestedValue = settings[field]
    if (nestedValue && typeof nestedValue === 'object' && nestedValue.currency) {
      analysis.currency_found = true
      analysis.detected_currency = nestedValue.currency
      analysis.fields_checked.push(`${field}.currency: ${nestedValue.currency}`)
      return analysis
    }
  }

  // 3. Verificar todos os campos por padrões de moeda
  const allFields = Object.keys(settings)
  for (const field of allFields) {
    const value = settings[field]
    
    // Verificar se é string e contém código de moeda
    if (typeof value === 'string') {
      const currencyMatch = value.match(/\b(BRL|USD|EUR|GBP|CAD|AUD|JPY|CNY|INR|MXN|ARS|CLP|COP|PEN|UYU|VEF|VES|BOB|PYG|GTQ|HNL|NIO|CRC|PAB|DOP|HTG|JMD|TTD|BBD|XCD|ANG|AWG|SRD|GYD|SBD|FJD|NZD|SGD|HKD|TWD|KRW|THB|MYR|IDR|PHP|VND|KHR|LAK|MMK|BDT|LKR|NPR|PKR|AFN|IRR|IQD|JOD|KWD|LBP|OMR|QAR|SAR|SYP|AED|YER|EGP|DZD|MAD|TND|LYD|SDG|ETB|KES|TZS|UGX|NGN|GHS|ZAR|BWP|NAD|ZMW|MWK|ZWL|MUR|SCR|SZL|LSL|MZN|CVE|STD|XOF|XAF|XPF|GMD|GNF|SLL|LRD|SLE|GIP|FKP|SHP|IMP|JEP|GGP|AOA|CDF)\b/i)
      if (currencyMatch) {
        analysis.currency_found = true
        analysis.detected_currency = currencyMatch[1].toUpperCase()
        analysis.fields_checked.push(`${field}: ${value}`)
        analysis.patterns_found.push(`Padrão encontrado em ${field}: ${currencyMatch[1]}`)
        return analysis
      }
    }
    
    // Verificar se é objeto e tem propriedade currency
    if (typeof value === 'object' && value !== null) {
      if (value.currency) {
        analysis.currency_found = true
        analysis.detected_currency = value.currency
        analysis.fields_checked.push(`${field}.currency: ${value.currency}`)
        return analysis
      }
      
      // Verificar propriedades aninhadas
      for (const prop of Object.keys(value)) {
        if (prop.toLowerCase().includes('currency') && typeof value[prop] === 'string') {
          const currencyMatch = value[prop].match(/\b(BRL|USD|EUR|GBP|CAD|AUD|JPY|CNY|INR|MXN|ARS|CLP|COP|PEN|UYU|VEF|VES|BOB|PYG|GTQ|HNL|NIO|CRC|PAB|DOP|HTG|JMD|TTD|BBD|XCD|ANG|AWG|SRD|GYD|SBD|FJD|NZD|SGD|HKD|TWD|KRW|THB|MYR|IDR|PHP|VND|KHR|LAK|MMK|BDT|LKR|NPR|PKR|AFN|IRR|IQD|JOD|KWD|LBP|OMR|QAR|SAR|SYP|AED|YER|EGP|DZD|MAD|TND|LYD|SDG|ETB|KES|TZS|UGX|NGN|GHS|ZAR|BWP|NAD|ZMW|MWK|ZWL|MUR|SCR|SZL|LSL|MZN|CVE|STD|XOF|XAF|XPF|GMD|GNF|SLL|LRD|SLE|GIP|FKP|SHP|IMP|JEP|GGP|AOA|CDF)\b/i)
          if (currencyMatch) {
            analysis.currency_found = true
            analysis.detected_currency = currencyMatch[1].toUpperCase()
            analysis.fields_checked.push(`${field}.${prop}: ${value[prop]}`)
            analysis.patterns_found.push(`Padrão encontrado em ${field}.${prop}: ${currencyMatch[1]}`)
            return analysis
          }
        }
      }
    }
  }

  // 4. Se não encontrou, tentar inferir do país
  if (settings.country) {
    const countryCurrencyMap = {
      'BR': 'BRL', 'US': 'USD', 'CA': 'CAD', 'MX': 'MXN', 'AR': 'ARS',
      'CL': 'CLP', 'CO': 'COP', 'PE': 'PEN', 'UY': 'UYU', 'VE': 'VES',
      'BO': 'BOB', 'PY': 'PYG', 'GT': 'GTQ', 'HN': 'HNL', 'NI': 'NIO',
      'CR': 'CRC', 'PA': 'PAB', 'DO': 'DOP', 'HT': 'HTG', 'JM': 'JMD',
      'TT': 'TTD', 'BB': 'BBD', 'EC': 'USD', 'AW': 'AWG', 'SR': 'SRD',
      'GY': 'GYD', 'SB': 'SBD', 'FJ': 'FJD', 'NZ': 'NZD', 'AU': 'AUD',
      'SG': 'SGD', 'HK': 'HKD', 'TW': 'TWD', 'JP': 'JPY', 'CN': 'CNY',
      'KR': 'KRW', 'TH': 'THB', 'MY': 'MYR', 'ID': 'IDR', 'PH': 'PHP',
      'VN': 'VND', 'KH': 'KHR', 'LA': 'LAK', 'MM': 'MMK', 'BD': 'BDT',
      'LK': 'LKR', 'NP': 'NPR', 'PK': 'PKR', 'AF': 'AFN', 'IR': 'IRR',
      'IQ': 'IQD', 'JO': 'JOD', 'KW': 'KWD', 'LB': 'LBP', 'OM': 'OMR',
      'QA': 'QAR', 'SA': 'SAR', 'SY': 'SYP', 'AE': 'AED', 'YE': 'YER',
      'EG': 'EGP', 'DZ': 'DZD', 'MA': 'MAD', 'TN': 'TND', 'LY': 'LYD',
      'SD': 'SDG', 'ET': 'ETB', 'KE': 'KES', 'TZ': 'TZS', 'UG': 'UGX',
      'NG': 'NGN', 'GH': 'GHS', 'ZA': 'ZAR', 'BW': 'BWP', 'NA': 'NAD',
      'ZM': 'ZMW', 'MW': 'MWK', 'ZW': 'ZWL', 'MU': 'MUR', 'SC': 'SCR',
      'SZ': 'SZL', 'LS': 'LSL', 'MZ': 'MZN', 'CV': 'CVE', 'ST': 'STD',
      'BF': 'XOF', 'CM': 'XAF', 'PF': 'XPF', 'GM': 'GMD', 'GN': 'GNF',
      'SL': 'SLL', 'LR': 'LRD', 'SH': 'SHP', 'GI': 'GIP', 'FK': 'FKP',
      'IM': 'IMP', 'JE': 'JEP', 'GG': 'GGP', 'AO': 'AOA', 'CD': 'CDF'
    }
    
    const upperCountryCode = settings.country.toUpperCase()
    if (countryCurrencyMap[upperCountryCode]) {
      analysis.currency_found = true
      analysis.detected_currency = countryCurrencyMap[upperCountryCode]
      analysis.fields_checked.push(`country: ${settings.country} -> ${countryCurrencyMap[upperCountryCode]}`)
      return analysis
    }
  }

  return analysis
} 