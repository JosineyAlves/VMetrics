export default async function (req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Pega a API Key da query string
  const apiKey = req.query.api_key

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' })
  }

  try {
    console.log('🔍 [DASHBOARD] Requisição recebida:', req.method, req.url)
    console.log('🔍 [DASHBOARD] Headers recebidos:', Object.keys(req.headers))
    console.log('🔍 [DASHBOARD] API Key recebida:', apiKey ? 'SIM' : 'NÃO')

    // Extrair parâmetros da query
    const dateFrom = req.query.date_from || '2024-01-01'
    const dateTo = req.query.date_to || '2024-12-31'
    const groupBy = req.query.group_by || 'date'

    console.log('🔍 [DASHBOARD] Parâmetros:', { dateFrom, dateTo, groupBy })

    // Testar se a API key é válida
    console.log('🔍 [DASHBOARD] Fazendo requisição para RedTrack /me/settings...')
    console.log('🔍 [DASHBOARD] URL:', 'https://api.redtrack.io/me/settings')
    const testResponse = await fetch('https://api.redtrack.io/me/settings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    if (!testResponse.ok) {
      console.log('🔍 [DASHBOARD] Status da resposta /me/settings:', testResponse.status)
      console.log('🔍 [DASHBOARD] Headers da resposta /me/settings:', Object.fromEntries(testResponse.headers.entries()))
      const errorData = await testResponse.json().catch(() => ({}))
      return res.status(testResponse.status).json({
        error: 'API Key inválida ou erro na API do RedTrack',
        details: errorData
      })
    }

    console.log('🔍 [DASHBOARD] Status da resposta /me/settings:', testResponse.status)
    console.log('🔍 [DASHBOARD] Headers da resposta /me/settings:', Object.fromEntries(testResponse.headers.entries()))

    // Buscar dados reais do dashboard usando os parâmetros recebidos
    const reportUrl = `https://api.redtrack.io/report?group_by=${groupBy}&date_from=${dateFrom}&date_to=${dateTo}`
    console.log('🔍 [DASHBOARD] Fazendo requisição para RedTrack /report...')
    console.log('🔍 [DASHBOARD] URL:', reportUrl)
    
    const reportResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    if (reportResponse.ok) {
      console.log('🔍 [DASHBOARD] Status da resposta /report:', reportResponse.status)
      console.log('🔍 [DASHBOARD] Headers da resposta /report:', Object.fromEntries(reportResponse.headers.entries()))
      const reportData = await reportResponse.json()

      console.log('🔍 [DASHBOARD] Dados recebidos do RedTrack:', reportData)

      // Se temos dados reais, retornar como estão
      if (reportData && (Array.isArray(reportData) || Object.keys(reportData).length > 0)) {
        console.log('🔍 [DASHBOARD] Retornando dados reais do RedTrack')
        res.status(200).json(reportData)
      } else {
        console.log('🔍 [DASHBOARD] Nenhum dado encontrado - retornando objeto vazio')
        res.status(200).json({})
      }
    } else {
      console.log('🔍 [DASHBOARD] Status da resposta /report:', reportResponse.status)
      console.log('🔍 [DASHBOARD] Headers da resposta /report:', Object.fromEntries(reportResponse.headers.entries()))
      
      // Se há erro na API, retornar objeto vazio
      console.log('🔍 [DASHBOARD] Erro na API do RedTrack - retornando objeto vazio')
      res.status(200).json({})
    }
  } catch (error) {
    console.error('🔍 [DASHBOARD] Erro:', error)
    // Em caso de erro, retornar objeto vazio
    res.status(200).json({})
  }
} 