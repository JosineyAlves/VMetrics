export default async function handler(req, res) {
  console.log('🔍 [TRACKS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [TRACKS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [TRACKS] Authorization header:', req.headers['authorization'])
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : null
  
  console.log('🔍 [TRACKS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' })
  }

  try {
    console.log('🔍 [TRACKS] Fazendo requisição para RedTrack /tracks...')
    console.log('🔍 [TRACKS] URL:', 'https://api.redtrack.io/tracks')
    console.log('🔍 [TRACKS] API Key sendo testada:', apiKey)
    // Buscar tracks (cliques) reais do RedTrack
    const response = await fetch('https://api.redtrack.io/tracks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    console.log('🔍 [TRACKS] Status da resposta:', response.status)
    console.log('🔍 [TRACKS] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const tracksData = await response.json()
      console.log('📊 Tracks reais carregados do RedTrack')
      res.status(200).json(tracksData)
    } else {
      // Fallback para dados zerados
      console.log('⚠️ Usando dados zerados para tracks')
      const emptyData = {
        data: [],
        total: 0
      }
      res.status(200).json(emptyData)
    }
    
  } catch (error) {
    console.error('Erro ao buscar tracks:', error)
    // Fallback para dados zerados
    const emptyData = {
      data: [],
      total: 0
    }
    res.status(200).json(emptyData)
  }
} 