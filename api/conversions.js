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

  // Validar parâmetros obrigatórios de data
  const { date_from, date_to } = req.query || {};
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date_from || !date_to || !dateRegex.test(date_from) || !dateRegex.test(date_to)) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: date_from e date_to no formato YYYY-MM-DD' });
  }

  // Montar query string para repassar todos os parâmetros
  const urlObj = new URL(req.url, 'http://localhost');
  const params = new URLSearchParams(urlObj.search);
  // NÃO remover api_key!
  const redtrackUrl = `https://api.redtrack.io/conversions?${params.toString()}`;

  try {
    console.log('🔍 [CONVERSIONS] Fazendo requisição para RedTrack /conversions...')
    console.log('🔍 [CONVERSIONS] URL:', `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=${date_from}&date_to=${date_to}`)
    console.log('🔍 [CONVERSIONS] API Key sendo testada:', apiKey)

    // Retry logic para lidar com rate limiting
    let response
    let retries = 3
    let delay = 1000 // 1 segundo

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        response = await fetch(`https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=${date_from}&date_to=${date_to}`, {
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

        console.log(`🔍 [CONVERSIONS] Tentativa ${attempt}/${retries} - Status:`, response.status)

        if (response.status === 429) {
          // Rate limit - aguardar e tentar novamente
          console.log(`🔍 [CONVERSIONS] Rate limit detectado, aguardando ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2 // Exponential backoff
          continue
        }

        // Se não for rate limit, sair do loop
        break
      } catch (error) {
        console.log(`🔍 [CONVERSIONS] Erro na tentativa ${attempt}:`, error.message)
        if (attempt === retries) throw error
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2
      }
    }

    console.log('🔍 [CONVERSIONS] Status da resposta:', response.status)
    console.log('🔍 [CONVERSIONS] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    const data = await response.json().catch(() => ({}));
    // Se resposta vazia, retornar mensagem amigável
    if (Array.isArray(data) && data.length === 0) {
      return res.status(200).json({ items: [], total: 0, message: 'Nenhuma conversão encontrada para o período.' });
    }
    if (data && data.items && data.items.length === 0) {
      data.message = 'Nenhuma conversão encontrada para o período.';
    }
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ [CONVERSIONS] Erro ao conectar com RedTrack:', error)
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/conversions'
    })
  }
} 