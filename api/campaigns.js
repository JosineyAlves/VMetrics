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

  try {
    console.log('Campaigns API - Buscando dados de campanhas com performance...');
    
    // Usar endpoint /report com group_by=campaign para obter dados completos
    const reportUrl = new URL('https://api.redtrack.io/report');
    reportUrl.searchParams.set('api_key', apiKey);
    reportUrl.searchParams.set('group_by', 'campaign');
    
    // Adicionar parâmetros de data se fornecidos
    if (params.date_from) reportUrl.searchParams.set('date_from', params.date_from);
    if (params.date_to) reportUrl.searchParams.set('date_to', params.date_to);
    
    console.log('Campaigns API - URL para report:', reportUrl.toString());
    
    const reportResponse = await fetch(reportUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });

    if (!reportResponse.ok) {
      const errorData = await reportResponse.json().catch(() => ({}));
      console.error('Campaigns API - Erro ao buscar performance:', errorData);
      return res.status(reportResponse.status).json({
        error: errorData.error || 'Erro ao buscar performance do RedTrack',
        status: reportResponse.status,
        endpoint: '/report'
      });
    }

    const reportData = await reportResponse.json();
    console.log('Campaigns API - Dados de performance:', reportData);
    
    // Processar dados do report
    const processedData = [];
    
    if (reportData && Array.isArray(reportData)) {
      reportData.forEach(item => {
        // Extrair nome da campanha do campo correto
        const campaignName = item.campaign || item.campaign_name || item.title || item.name || 'Campanha sem nome';
        const campaignId = item.campaign_id || item.id || Math.random().toString(36).slice(2);
        
        // Extrair métricas do objeto stat ou diretamente
        const stat = item.stat || {};
        const metrics = {
          clicks: stat.clicks || item.clicks || 0,
          conversions: stat.conversions || item.conversions || 0,
          revenue: stat.revenue || item.revenue || 0,
          cost: stat.cost || item.cost || 0,
          impressions: stat.impressions || item.impressions || 0
        };
        
        processedData.push({
          id: campaignId,
          title: campaignName,
          source_title: item.source || item.traffic_source || '',
          status: item.status || 'active',
          stat: metrics
        });
      });
    } else if (reportData && typeof reportData === 'object' && !Array.isArray(reportData)) {
      // Se for um objeto único (dados agregados), criar uma entrada
      const campaignName = reportData.campaign || reportData.campaign_name || reportData.title || 'Campanha sem nome';
      const campaignId = reportData.campaign_id || reportData.id || 'aggregated';
      
      const stat = reportData.stat || {};
      const metrics = {
        clicks: stat.clicks || reportData.clicks || 0,
        conversions: stat.conversions || reportData.conversions || 0,
        revenue: stat.revenue || reportData.revenue || 0,
        cost: stat.cost || reportData.cost || 0,
        impressions: stat.impressions || reportData.impressions || 0
      };
      
      processedData.push({
        id: campaignId,
        title: campaignName,
        source_title: reportData.source || reportData.traffic_source || '',
        status: reportData.status || 'active',
        stat: metrics
      });
    }
    
    console.log('Campaigns API - Dados processados:', processedData);
    res.status(200).json(processedData);

  } catch (error) {
    console.error('Campaigns API - Erro de conexão:', error);
    res.status(500).json({
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/report'
    });
  }
} 