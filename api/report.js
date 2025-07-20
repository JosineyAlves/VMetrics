export default async function handler(req, res) {
  console.log('🔍 [REPORT] Requisição recebida:', req.method, req.url)
  console.log('🔍 [REPORT] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [REPORT] Authorization header:', req.headers['authorization'])
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [REPORT] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  // Extrai todos os parâmetros da query
  const params = { ...req.query };

  // Garante que a API Key está presente
  let apiKey = params.api_key;
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' });
  }

  // Detecta se é agrupamento geográfico (não é só por date)
  const isGeoGroup = params.group_by && params.group_by !== 'date';

  // Monta a URL do RedTrack
  const url = new URL('https://api.redtrack.io/report');
  Object.entries(params).forEach(([key, value]) => {
    if ((!isGeoGroup || key !== 'api_key') && value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value.toString());
    }
  });

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TrackView-Dashboard/1.0'
  };
  if (isGeoGroup) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🔴 [REPORT] Erro da RedTrack:', {
        status: response.status,
        url: url.toString(),
        errorData
      });
      return res.status(response.status).json({ 
        error: errorData.error || 'Erro na API do RedTrack',
        status: response.status,
        endpoint: '/report',
        redtrack: errorData
      });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/report'
    });
  }
} 