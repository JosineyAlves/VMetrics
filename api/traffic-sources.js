export default async function handler(req, res) {
  console.log('🔍 [TRAFFIC-SOURCES] Requisição recebida:', req.method, req.url)
  console.log('🔍 [TRAFFIC-SOURCES] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [TRAFFIC-SOURCES] Authorization header:', req.headers['authorization'])

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  let apiKey = req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ', '') : null;

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

  console.log('🔍 [TRAFFIC-SOURCES] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [TRAFFIC-SOURCES] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }

  // Validar parâmetros obrigatórios de data
  const { date_from, date_to } = req.query || {};
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date_from || !date_to || !dateRegex.test(date_from) || !dateRegex.test(date_to)) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: date_from e date_to no formato YYYY-MM-DD' });
  }

  try {
    console.log('🔍 [TRAFFIC-SOURCES] Fazendo requisição para RedTrack /report...')
    console.log('🔍 [TRAFFIC-SOURCES] URL:', `https://api.redtrack.io/report?group_by=rt_source&date_from=${date_from}&date_to=${date_to}`)
    
    // Buscar dados agrupados por fonte de tráfego
    const url = `https://api.redtrack.io/report?api_key=${apiKey}&group_by=rt_source&date_from=${date_from}&date_to=${date_to}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    console.log('🔍 [TRAFFIC-SOURCES] Status da resposta:', response.status)
    console.log('🔍 [TRAFFIC-SOURCES] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()
      console.log('📊 [TRAFFIC-SOURCES] Dados recebidos:', data)

      // Processar dados para formato de gráfico
      let trafficSources = []
      if (Array.isArray(data)) {
        trafficSources = data.map((item, index) => ({
          name: item.rt_source || `Fonte ${index + 1}`,
          value: item.clicks || 0,
          clicks: item.clicks || 0,
          conversions: item.conversions || 0,
          revenue: item.revenue || 0,
          spend: item.spend || 0
        }))
      } else if (data && typeof data === 'object') {
        // Se for um objeto único, criar array
        trafficSources = [{
          name: data.rt_source || 'Fonte Principal',
          value: data.clicks || 0,
          clicks: data.clicks || 0,
          conversions: data.conversions || 0,
          revenue: data.revenue || 0,
          spend: data.spend || 0
        }]
      }

      // Ordenar por valor (cliques) decrescente
      trafficSources.sort((a, b) => b.value - a.value)

      console.log('📊 [TRAFFIC-SOURCES] Dados processados:', trafficSources)
      res.status(200).json(trafficSources)
    } else {
      console.log('❌ [TRAFFIC-SOURCES] Erro na resposta:', response.status)
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ [TRAFFIC-SOURCES] Detalhes do erro:', errorData)
      
      // Retornar dados vazios em caso de erro
      res.status(200).json([])
    }
  } catch (error) {
    console.error('❌ [TRAFFIC-SOURCES] Erro na requisição:', error)
    // Retornar dados vazios em caso de erro
    res.status(200).json([])
  }
} 