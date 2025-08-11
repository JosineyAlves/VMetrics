/**
 * Endpoint de teste simples para verificar se funciona
 * Acesse: https://my-dash-two.vercel.app/api/test-currency?api_key=K0Y6dcsgEqmjQp0CKD49
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
      usage: 'Use: /api/test-currency?api_key=SUA_API_KEY',
      timestamp: new Date().toISOString()
    })
  }

  try {
    console.log('🔍 [TEST CURRENCY] Iniciando teste...')
    
    // Testar endpoint /me/settings
    const settingsResponse = await fetch(`https://api.redtrack.io/me/settings?api_key=${encodeURIComponent(api_key)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = {
      timestamp: new Date().toISOString(),
      api_key_provided: !!api_key,
      settings_status: settingsResponse.status,
      settings_ok: settingsResponse.ok
    }

    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json()
      result.settings_data = settingsData
      result.fields_count = Object.keys(settingsData).length
      result.fields_available = Object.keys(settingsData)
      
      // Procurar por moeda
      let currencyFound = null
      
      // Verificar campos diretos
      if (settingsData.currency) currencyFound = settingsData.currency
      else if (settingsData.default_currency) currencyFound = settingsData.default_currency
      
      // Verificar campos aninhados
      if (!currencyFound) {
        const nestedFields = ['account', 'user', 'settings', 'preferences']
        for (const field of nestedFields) {
          if (settingsData[field]?.currency) {
            currencyFound = settingsData[field].currency
            break
          }
        }
      }
      
      // Procurar por padrões em todos os campos
      if (!currencyFound) {
        for (const [field, value] of Object.entries(settingsData)) {
          if (typeof value === 'string' && (value.includes('BRL') || value.includes('USD') || value.includes('EUR'))) {
            if (value.includes('BRL')) currencyFound = 'BRL'
            else if (value.includes('USD')) currencyFound = 'USD'
            else if (value.includes('EUR')) currencyFound = 'EUR'
            break
          }
        }
      }
      
      result.currency_detected = currencyFound || 'Nenhuma moeda encontrada'
    } else {
      const errorText = await settingsResponse.text()
      result.error = errorText
    }

    console.log('✅ [TEST CURRENCY] Teste concluído:', result)
    return res.status(200).json(result)

  } catch (error) {
    console.error('❌ [TEST CURRENCY] Erro:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
} 