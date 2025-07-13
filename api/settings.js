export default async function handler(req, res) {
  console.log('🔍 [SETTINGS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [SETTINGS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [SETTINGS] Authorization header:', req.headers['authorization'])
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [SETTINGS] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : null
  
  console.log('🔍 [SETTINGS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')
  
  if (!apiKey) {
    console.log('❌ [SETTINGS] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }

  try {
    console.log('🔍 [SETTINGS] Fazendo requisição para RedTrack...')
    console.log('🔍 [SETTINGS] URL:', 'https://api.redtrack.io/me/settings')
    console.log('🔍 [SETTINGS] Headers enviados:', {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'TrackView-Dashboard/1.0'
    })
    
    const response = await fetch('https://api.redtrack.io/me/settings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    console.log('🔍 [SETTINGS] Status da resposta:', response.status)
    console.log('🔍 [SETTINGS] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ [SETTINGS] Erro na resposta:', errorData)
      return res.status(response.status).json({ 
        error: 'API Key inválida ou erro na API do RedTrack',
        details: errorData
      })
    }

    const data = await response.json()
    console.log('✅ [SETTINGS] Dados recebidos com sucesso:', data)
    res.status(200).json(data)
    
  } catch (error) {
    console.error('❌ [SETTINGS] Erro ao conectar com RedTrack:', error)
    console.error('❌ [SETTINGS] Tipo do erro:', typeof error)
    console.error('❌ [SETTINGS] Mensagem do erro:', error.message)
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message 
    })
  }
} 