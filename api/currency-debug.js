export default async function handler(req, res) {
  console.log('🔍 [CURRENCY DEBUG] Requisição recebida:', req.method, req.url)

  // Extrair API key dos query params
  let apiKey = req.query.api_key
  
  // Fallback: tentar extrair do header Authorization
  if (!apiKey && req.headers.authorization) {
    const authHeader = req.headers.authorization
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7)
    }
  }

  console.log('🔍 [CURRENCY DEBUG] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [CURRENCY DEBUG] API Key não encontrada')
    return res.status(401).json({ 
      error: 'API Key não fornecida',
      usage: 'Use: /api/currency-debug?api_key=SUA_API_KEY'
    })
  }

  try {
    console.log('🔍 [CURRENCY DEBUG] Fazendo requisição para RedTrack /me/settings...')

    const response = await fetch(`https://api.redtrack.io/me/settings?api_key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0 (https://my-dash-two.vercel.app)',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    console.log('🔍 [CURRENCY DEBUG] Status da resposta:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ [CURRENCY DEBUG] Erro na resposta:', errorData)
      return res.status(response.status).json({
        error: 'Erro na API RedTrack',
        details: errorData,
        timestamp: new Date().toISOString()
      })
    }

    const settingsData = await response.json()
    console.log('✅ [CURRENCY DEBUG] Dados recebidos com sucesso')
    
    // Analisar dados para detectar moeda
    const analysis = {
      timestamp: new Date().toISOString(),
      api_key_provided: !!apiKey,
      settings_status: response.status,
      fields_count: Object.keys(settingsData).length,
      fields_available: Object.keys(settingsData),
      currency_detected: null,
      analysis_details: {}
    }

    // 1. Verificar campos diretos
    if (settingsData.currency) {
      analysis.currency_detected = settingsData.currency
      analysis.analysis_details.direct_field = 'currency'
    } else if (settingsData.default_currency) {
      analysis.currency_detected = settingsData.default_currency
      analysis.analysis_details.direct_field = 'default_currency'
    }

    // 2. Verificar campos aninhados
    if (!analysis.currency_detected) {
      const nestedFields = ['account', 'user', 'settings', 'preferences']
      for (const field of nestedFields) {
        if (settingsData[field]?.currency) {
          analysis.currency_detected = settingsData[field].currency
          analysis.analysis_details.nested_field = `${field}.currency`
          break
        }
      }
    }

    // 3. Procurar por padrões em todos os campos
    if (!analysis.currency_detected) {
      analysis.analysis_details.pattern_search = []
      for (const [field, value] of Object.entries(settingsData)) {
        if (typeof value === 'string') {
          if (value.includes('BRL')) {
            analysis.currency_detected = 'BRL'
            analysis.analysis_details.pattern_search.push(`${field}: BRL encontrado`)
            break
          } else if (value.includes('USD')) {
            analysis.currency_detected = 'USD'
            analysis.analysis_details.pattern_search.push(`${field}: USD encontrado`)
            break
          } else if (value.includes('EUR')) {
            analysis.currency_detected = 'EUR'
            analysis.analysis_details.pattern_search.push(`${field}: EUR encontrado`)
            break
          }
        }
      }
    }

    // 4. Se não encontrou, usar USD como padrão
    if (!analysis.currency_detected) {
      analysis.currency_detected = 'USD'
      analysis.analysis_details.fallback = 'Nenhuma moeda detectada, usando USD como padrão'
    }

    console.log('✅ [CURRENCY DEBUG] Análise concluída:', analysis.currency_detected)
    return res.status(200).json(analysis)

  } catch (error) {
    console.error('❌ [CURRENCY DEBUG] Erro na requisição:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
} 