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
    console.log('=== DASHBOARD API DEBUG START ===');
    console.log('Dashboard API - Buscando dados para dashboard...');
    
    const dateFrom = params.date_from || new Date().toISOString().split('T')[0];
    const dateTo = params.date_to || dateFrom;
    
    console.log('Dashboard API - Data solicitada:', { dateFrom, dateTo });
    
    // Buscar conversões para a data específica
    const conversionsUrl = new URL('https://api.redtrack.io/conversions');
    conversionsUrl.searchParams.set('api_key', apiKey);
    conversionsUrl.searchParams.set('per', '1000');
    conversionsUrl.searchParams.set('date_from', dateFrom);
    conversionsUrl.searchParams.set('date_to', dateTo);
    
    console.log('Dashboard API - URL para conversões:', conversionsUrl.toString());
    
    const conversionsResponse = await fetch(conversionsUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });

    if (!conversionsResponse.ok) {
      const errorData = await conversionsResponse.json().catch(() => ({}));
      console.error('Dashboard API - Erro ao buscar conversões:', errorData);
      return res.status(conversionsResponse.status).json({
        error: errorData.error || 'Erro ao buscar conversões do RedTrack',
        status: conversionsResponse.status,
        endpoint: '/conversions'
      });
    }

    const conversionsData = await conversionsResponse.json();
    console.log('Dashboard API - Dados de conversões BRUTOS:', JSON.stringify(conversionsData, null, 2));
    
    // Buscar tracks (cliques) para a data específica
    const tracksUrl = new URL('https://api.redtrack.io/tracks');
    tracksUrl.searchParams.set('api_key', apiKey);
    tracksUrl.searchParams.set('per', '1000');
    tracksUrl.searchParams.set('date_from', dateFrom);
    tracksUrl.searchParams.set('date_to', dateTo);
    
    console.log('Dashboard API - URL para tracks:', tracksUrl.toString());
    
    const tracksResponse = await fetch(tracksUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });

    const tracksData = await tracksResponse.json();
    console.log('Dashboard API - Dados de tracks BRUTOS:', JSON.stringify(tracksData, null, 2));
    
    // Agrupar dados por data
    const dateMap = new Map();
    
    console.log('=== PROCESSANDO TRACKS ===');
    // Processar tracks primeiro para obter cliques base
    if (tracksData && tracksData.items && Array.isArray(tracksData.items)) {
      console.log(`Dashboard API - Total de tracks encontrados: ${tracksData.items.length}`);
      
      tracksData.items.forEach((track, index) => {
        console.log(`\n--- Track ${index + 1} ---`);
        console.log('Track completo:', JSON.stringify(track, null, 2));
        
        const dateKey = track.date || track.created_at?.split('T')[0] || dateFrom;
        
        if (!dateMap.has(dateKey)) {
          console.log(`🆕 Criando nova data: ${dateKey}`);
          dateMap.set(dateKey, {
            date: dateKey,
            clicks: 0,
            unique_clicks: 0,
            conversions: 0,
            all_conversions: 0,
            approved: 0,
            pending: 0,
            declined: 0,
            revenue: 0,
            cost: 0,
            impressions: 0,
            ctr: 0,
            conversion_rate: 0
          });
        }
        
        // Acumular métricas de tracks
        const dateData = dateMap.get(dateKey);
        dateData.clicks += 1;
        dateData.impressions += track.impressions || 0;
        
        // Rastrear cliques únicos
        const clickId = track.click_id || track.id || Math.random().toString(36).slice(2);
        if (!dateData.unique_clicks_set) {
          dateData.unique_clicks_set = new Set();
        }
        dateData.unique_clicks_set.add(clickId);
        
        // Acumular cost dos tracks (gasto)
        dateData.cost += track.cost || track.spend || track.campaign_cost || 0;
        
        console.log(`✅ Track: ${dateKey} - Cliques: ${dateData.clicks}, Cost: ${dateData.cost}`);
      });
    } else {
      console.log('❌ Nenhum track encontrado ou dados inválidos');
    }
    
    console.log('\n=== PROCESSANDO CONVERSÕES ===');
    // Processar conversões para adicionar revenue
    if (conversionsData && conversionsData.items && Array.isArray(conversionsData.items)) {
      console.log(`Dashboard API - Total de conversões encontradas: ${conversionsData.items.length}`);
      
      conversionsData.items.forEach((conversion, index) => {
        console.log(`\n--- Conversão ${index + 1} ---`);
        console.log('Conversão completa:', JSON.stringify(conversion, null, 2));
        
        const dateKey = conversion.date || conversion.created_at?.split('T')[0] || dateFrom;
        
        if (!dateMap.has(dateKey)) {
          console.log(`🆕 Criando nova data para conversão: ${dateKey}`);
          dateMap.set(dateKey, {
            date: dateKey,
            clicks: 0,
            unique_clicks: 0,
            conversions: 0,
            all_conversions: 0,
            approved: 0,
            pending: 0,
            declined: 0,
            revenue: 0,
            cost: 0,
            impressions: 0,
            ctr: 0,
            conversion_rate: 0
          });
        }
        
        // Acumular métricas de conversões
        const dateData = dateMap.get(dateKey);
        dateData.all_conversions += 1;
        dateData.conversions += 1; // Conversões aprovadas
        dateData.revenue += conversion.payout || conversion.revenue || 0;
        
        // Classificar conversões por status
        const status = conversion.status || conversion.conversion_status || 'approved';
        if (status === 'approved' || status === 'approved') {
          dateData.approved += 1;
        } else if (status === 'pending' || status === 'pending') {
          dateData.pending += 1;
        } else if (status === 'declined' || status === 'declined') {
          dateData.declined += 1;
        }
        
        console.log(`✅ Conversão: ${dateKey} - Conversões: ${dateData.conversions}, Revenue: ${dateData.revenue}`);
      });
    } else {
      console.log('❌ Nenhuma conversão encontrada ou dados inválidos');
    }
    
    console.log('\n=== RESULTADO FINAL ===');
    console.log('Dashboard API - Dados por data:', Array.from(dateMap.values()));
    
    // Converter para array e calcular métricas finais
    const processedData = Array.from(dateMap.values()).map(dateData => {
      // Calcular cliques únicos
      const uniqueClicks = dateData.unique_clicks_set ? dateData.unique_clicks_set.size : dateData.clicks;
      
      // Calcular métricas derivadas
      const ctr = dateData.impressions > 0 ? (dateData.clicks / dateData.impressions) * 100 : 0;
      const conversionRate = dateData.clicks > 0 ? (dateData.conversions / dateData.clicks) * 100 : 0;
      
      return {
        date: dateData.date,
        clicks: dateData.clicks,
        unique_clicks: uniqueClicks,
        conversions: dateData.conversions,
        all_conversions: dateData.all_conversions,
        approved: dateData.approved,
        pending: dateData.pending,
        declined: dateData.declined,
        revenue: dateData.revenue,
        cost: dateData.cost,
        spend: dateData.cost, // Alias para compatibilidade
        impressions: dateData.impressions,
        ctr: ctr,
        conversion_rate: conversionRate
      };
    });
    
    console.log('Dashboard API - Dados processados finais:', JSON.stringify(processedData, null, 2));
    console.log('=== DASHBOARD API DEBUG END ===');
    
    res.status(200).json(processedData);

  } catch (error) {
    console.error('Dashboard API - Erro de conexão:', error);
    res.status(500).json({
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/dashboard'
    });
  }
} 