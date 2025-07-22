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
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('❌ [SETTINGS] Erro na requisição:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 