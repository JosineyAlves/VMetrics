export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extrai todos os parâmetros da query
  const params = { ...req.query };
  let apiKey = params.api_key;
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' });
  }

  // Para obter dados de performance das campanhas, usar endpoint /report
  // com group_by=campaign em vez de /campaigns
  const url = new URL('https://api.redtrack.io/report');
  
  // Adicionar group_by=campaign para agrupar por campanha
  url.searchParams.set('group_by', 'campaign');
  
  // Adicionar todos os outros parâmetros
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && key !== 'group_by') {
      url.searchParams.set(key, value.toString());
    }
  });

  console.log('Campaigns API - URL do RedTrack:', url.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Campaigns API - Erro do RedTrack:', errorData);
      return res.status(response.status).json({
        error: errorData.error || 'Erro na API do RedTrack',
        status: response.status,
        endpoint: '/report'
      });
    }

    const data = await response.json();
    console.log('Campaigns API - Resposta do RedTrack:', data);
    res.status(200).json(data);

  } catch (error) {
    console.error('Campaigns API - Erro de conexão:', error);
    res.status(500).json({
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/report'
    });
  }
} 