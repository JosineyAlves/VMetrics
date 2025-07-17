export default async function handler(req, res) {
  console.log('🔍 [CONVERSIONS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [CONVERSIONS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [CONVERSIONS] Authorization header:', req.headers['authorization'])

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [CONVERSIONS] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  let apiKey = authHeader ? authHeader.replace('Bearer ', '') : null

  // Permitir também via query string
  if (!apiKey) {
    if (req.query && req.query.api_key) {
      apiKey = req.query.api_key
    } else if (req.url && req.url.includes('api_key=')) {
      const match = req.url.match(/[?&]api_key=([^&]+)/)
      if (match) {
        apiKey = decodeURIComponent(match[1])
      }
    }
  }

  console.log('🔍 [CONVERSIONS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [CONVERSIONS] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }

  // Montar query string para repassar todos os parâmetros
  const urlObj = new URL(req.url, 'http://localhost')
  const params = new URLSearchParams(urlObj.search)
  params.delete('api_key') // Não repassar api_key na query, vai no header
  const redtrackUrl = `https://api.redtrack.io/conversions?${params.toString()}`

  try {
    console.log('🔍 [CONVERSIONS] Fazendo requisição para RedTrack /conversions...')
    console.log('🔍 [CONVERSIONS] URL:', redtrackUrl)
    console.log('🔍 [CONVERSIONS] API Key sendo testada:', apiKey)

    const response = await fetch(redtrackUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    console.log('🔍 [CONVERSIONS] Status da resposta:', response.status)
    console.log('🔍 [CONVERSIONS] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    const data = await response.json().catch(() => ({}))
    res.status(response.status).json(data)
  } catch (error) {
    console.error('❌ [CONVERSIONS] Erro ao conectar com RedTrack:', error)
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/conversions'
    })
  }
} 