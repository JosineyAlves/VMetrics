export default async function handler(req, res) {
  console.log('🔍 [DICTIONARIES] Requisição recebida:', req.method, req.url)
  console.log('🔍 [DICTIONARIES] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [DICTIONARIES] Authorization header:', req.headers['authorization'])
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
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' })
  }

  const { type } = req.query

  if (!type) {
    return res.status(400).json({ error: 'Type parameter required (countries, devices, browsers, etc.)' })
  }

  try {
    console.log('🔍 [DICTIONARIES] Fazendo requisição para RedTrack /' + type + '...')
    console.log('🔍 [DICTIONARIES] URL:', `https://api.redtrack.io/${type}`)
    console.log('🔍 [DICTIONARIES] API Key sendo testada:', apiKey)
    // Buscar dicionários do RedTrack
    const response = await fetch(`https://api.redtrack.io/${type}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    console.log('🔍 [DICTIONARIES] Status da resposta:', response.status)
    console.log('🔍 [DICTIONARIES] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()
      console.log(`📊 Dicionário ${type} carregado do RedTrack`)
      res.status(200).json(data)
    } else {
      // Fallback para dados vazios
      console.log(`⚠️ Usando dados vazios para dicionário ${type}`)
      const emptyData = {
        data: [],
        total: 0
      }
      res.status(200).json(emptyData)
    }
    
  } catch (error) {
    console.error(`Erro ao buscar dicionário ${type}:`, error)
    // Fallback para dados vazios
    const emptyData = {
      data: [],
      total: 0
    }
    res.status(200).json(emptyData)
  }
} 