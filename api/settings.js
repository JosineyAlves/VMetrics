export default async function handler(req, res) {
  console.log('🔍 [SETTINGS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [SETTINGS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [SETTINGS] Authorization header:', req.headers['authorization'])

  // Extrair API key dos query params
  let apiKey = req.query.api_key
  
  // Fallback: tentar extrair do header Authorization
  if (!apiKey && req.headers.authorization) {
    const authHeader = req.headers.authorization
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7)
    }
  }

  // Fallback: tentar extrair da query string manualmente
  if (!apiKey) {
    const url = new URL(req.url, `http://${req.headers.host}`)
    apiKey = url.searchParams.get('api_key')
  }

  console.log('🔍 [SETTINGS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [SETTINGS] API Key não encontrada')
    return res.status(401).json({ error: 'API Key não fornecida' })
  }

  try {
    console.log('🔍 [SETTINGS] Fazendo requisição para RedTrack /me/settings...')
    console.log('🔍 [SETTINGS] URL:', 'https://api.redtrack.io/me/settings')
    console.log('🔍 [SETTINGS] API Key sendo testada:', apiKey)

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

    console.log('🔍 [SETTINGS] Status da resposta:', response.status)
    console.log('🔍 [SETTINGS] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ [SETTINGS] Erro na resposta:', errorData)
      return res.status(response.status).json(errorData)
    }

    const data = await response.json()
    console.log('✅ [SETTINGS] Dados recebidos com sucesso')
    console.log('🔍 [SETTINGS] Estrutura dos dados:', JSON.stringify(data, null, 2))
    
    // Se o parâmetro debug=true estiver presente, adicionar análise de moeda
    if (req.query.debug === 'true') {
      console.log('🔍 [SETTINGS] Modo debug ativado - analisando moeda...')
      
      const currencyAnalysis = {
        timestamp: new Date().toISOString(),
        fields_count: Object.keys(data).length,
        fields_available: Object.keys(data),
        currency_detected: null,
        analysis_details: {}
      }

      // 1. Verificar campos diretos
      if (data.currency) {
        currencyAnalysis.currency_detected = data.currency
        currencyAnalysis.analysis_details.direct_field = 'currency'
      } else if (data.default_currency) {
        currencyAnalysis.currency_detected = data.default_currency
        currencyAnalysis.analysis_details.direct_field = 'default_currency'
      }

      // 2. Verificar campos aninhados
      if (!currencyAnalysis.currency_detected) {
        const nestedFields = ['account', 'user', 'settings', 'preferences']
        for (const field of nestedFields) {
          if (data[field]?.currency) {
            currencyAnalysis.currency_detected = data[field].currency
            currencyAnalysis.analysis_details.nested_field = `${field}.currency`
            break
          }
        }
      }

      // 3. Procurar por padrões em todos os campos
      if (!currencyAnalysis.currency_detected) {
        currencyAnalysis.analysis_details.pattern_search = []
        for (const [field, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            if (value.includes('BRL')) {
              currencyAnalysis.currency_detected = 'BRL'
              currencyAnalysis.analysis_details.pattern_search.push(`${field}: BRL encontrado`)
              break
            } else if (value.includes('USD')) {
              currencyAnalysis.currency_detected = 'USD'
              currencyAnalysis.analysis_details.pattern_search.push(`${field}: USD encontrado`)
              break
            } else if (value.includes('EUR')) {
              currencyAnalysis.currency_detected = 'EUR'
              currencyAnalysis.analysis_details.pattern_search.push(`${field}: EUR encontrado`)
              break
            }
          }
        }
      }

      // 4. Se não encontrou, usar USD como padrão
      if (!currencyAnalysis.currency_detected) {
        currencyAnalysis.currency_detected = 'USD'
        currencyAnalysis.analysis_details.fallback = 'Nenhuma moeda detectada, usando USD como padrão'
      }

      console.log('✅ [SETTINGS] Análise de moeda concluída:', currencyAnalysis.currency_detected)
      
      return res.status(200).json({
        settings: data,
        currency_analysis: currencyAnalysis
      })
    }
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('❌ [SETTINGS] Erro na requisição:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 