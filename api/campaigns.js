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
    console.log('=== CAMPAIGNS API DEBUG START ===');
    console.log('Campaigns API - Buscando dados de campanhas para data específica...');
    
    // Usar apenas a data específica solicitada pelo usuário
    const dateFrom = params.date_from || new Date().toISOString().split('T')[0];
    const dateTo = params.date_to || dateFrom;
    
    console.log('Campaigns API - Data solicitada:', { dateFrom, dateTo });
    
    // Buscar dados de HOJE (data específica)
    const todayConversionsUrl = new URL('https://api.redtrack.io/conversions');
    todayConversionsUrl.searchParams.set('api_key', apiKey);
    todayConversionsUrl.searchParams.set('per', '1000');
    todayConversionsUrl.searchParams.set('date_from', dateFrom);
    todayConversionsUrl.searchParams.set('date_to', dateTo);
    
    console.log('Campaigns API - URL para conversões de HOJE:', todayConversionsUrl.toString());
    
    const todayConversionsResponse = await fetch(todayConversionsUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });

    if (!todayConversionsResponse.ok) {
      const errorData = await todayConversionsResponse.json().catch(() => ({}));
      console.error('Campaigns API - Erro ao buscar conversões de HOJE:', errorData);
      return res.status(todayConversionsResponse.status).json({
        error: errorData.error || 'Erro ao buscar conversões do RedTrack',
        status: todayConversionsResponse.status,
        endpoint: '/conversions'
      });
    }

    const todayConversionsData = await todayConversionsResponse.json();
    console.log('Campaigns API - Dados de conversões de HOJE:', JSON.stringify(todayConversionsData, null, 2));
    
    // Delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Buscar dados de HOJE (tracks)
    const todayTracksUrl = new URL('https://api.redtrack.io/tracks');
    todayTracksUrl.searchParams.set('api_key', apiKey);
    todayTracksUrl.searchParams.set('per', '1000');
    todayTracksUrl.searchParams.set('date_from', dateFrom);
    todayTracksUrl.searchParams.set('date_to', dateTo);
    
    console.log('Campaigns API - URL para tracks de HOJE:', todayTracksUrl.toString());
    
    const todayTracksResponse = await fetch(todayTracksUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });

    const todayTracksData = await todayTracksResponse.json();
    console.log('Campaigns API - Dados de tracks de HOJE:', JSON.stringify(todayTracksData, null, 2));
    
    // Delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Buscar dados dos ÚLTIMOS 3 DIAS para detectar campanhas deletadas
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
    
    const recentTracksUrl = new URL('https://api.redtrack.io/tracks');
    recentTracksUrl.searchParams.set('api_key', apiKey);
    recentTracksUrl.searchParams.set('per', '1000');
    recentTracksUrl.searchParams.set('date_from', threeDaysAgoStr);
    recentTracksUrl.searchParams.set('date_to', dateTo);
    
    console.log('Campaigns API - URL para tracks dos últimos 3 dias:', recentTracksUrl.toString());
    
    const recentTracksResponse = await fetch(recentTracksUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });

    const recentTracksData = await recentTracksResponse.json();
    console.log('Campaigns API - Dados de tracks dos últimos 3 dias:', JSON.stringify(recentTracksData, null, 2));
    
    // Combinar dados para determinar status real das campanhas
    const campaignMap = new Map();
    const uniqueClicks = new Set();
    
    console.log('=== PROCESSANDO DADOS DE HOJE ===');
    // Processar dados de HOJE primeiro
    if (todayTracksData && todayTracksData.items && Array.isArray(todayTracksData.items)) {
      console.log(`Campaigns API - Total de tracks de HOJE: ${todayTracksData.items.length}`);
      
      todayTracksData.items.forEach((track, index) => {
        const campaignName = track.campaign || track.campaign_name || track.title || 'Campanha sem nome';
        const campaignId = track.campaign_id || track.id || Math.random().toString(36).slice(2);
        
        // Filtrar cliques duplicados
        const clickKey = `${campaignName.toLowerCase().trim()}_${track.ip}_${track.track_time}_${track.user_agent}`;
        if (uniqueClicks.has(clickKey)) {
          return;
        }
        uniqueClicks.add(clickKey);
        
        if (!campaignMap.has(campaignName.toLowerCase().trim())) {
          console.log(`🆕 Criando nova campanha: ${campaignName}`);
          campaignMap.set(campaignName.toLowerCase().trim(), {
            id: campaignId,
            name: campaignName,
            source: track.source || track.traffic_source || '',
            status: 'active', // Será determinado depois
            clicks_today: 0,
            conversions_today: 0,
            cost_today: 0,
            revenue_today: 0,
            clicks_recent: 0,
            conversions_recent: 0,
            cost_recent: 0,
            revenue_recent: 0,
            impressions: 0,
            ctr: 0,
            conversion_rate: 0
          });
        }
        
        const campaign = campaignMap.get(campaignName.toLowerCase().trim());
        campaign.clicks_today += 1;
        campaign.cost_today += track.cost || 0;
        console.log(`✅ Track de HOJE: ${campaignName} - Cliques: ${campaign.clicks_today}, Cost: ${campaign.cost_today}`);
      });
    }
    
    // Processar conversões de HOJE
    if (todayConversionsData && todayConversionsData.items && Array.isArray(todayConversionsData.items)) {
      console.log(`Campaigns API - Total de conversões de HOJE: ${todayConversionsData.items.length}`);
      
      todayConversionsData.items.forEach((conversion, index) => {
        const campaignName = conversion.campaign || conversion.campaign_name || conversion.title || 'Campanha sem nome';
        const campaignKey = campaignName.toLowerCase().trim();
        
        if (!campaignMap.has(campaignKey)) {
          console.log(`🆕 Criando nova campanha: ${campaignName}`);
          campaignMap.set(campaignKey, {
            id: conversion.campaign_id || conversion.id || Math.random().toString(36).slice(2),
            name: campaignName,
            source: conversion.source || conversion.traffic_source || '',
            status: 'active',
            clicks_today: 0,
            conversions_today: 0,
            cost_today: 0,
            revenue_today: 0,
            clicks_recent: 0,
            conversions_recent: 0,
            cost_recent: 0,
            revenue_recent: 0,
            impressions: 0,
            ctr: 0,
            conversion_rate: 0
          });
        }
        
        const campaign = campaignMap.get(campaignKey);
        campaign.conversions_today += 1;
        campaign.revenue_today += conversion.payout || conversion.revenue || 0;
        console.log(`✅ Conversão de HOJE: ${campaignName} - Conversões: ${campaign.conversions_today}, Revenue: ${campaign.revenue_today}`);
      });
    }
    
    console.log('=== PROCESSANDO DADOS RECENTES (3 DIAS) ===');
    // Processar dados dos últimos 3 dias para detectar campanhas deletadas
    if (recentTracksData && recentTracksData.items && Array.isArray(recentTracksData.items)) {
      console.log(`Campaigns API - Total de tracks dos últimos 3 dias: ${recentTracksData.items.length}`);
      
      recentTracksData.items.forEach((track, index) => {
        const campaignName = track.campaign || track.campaign_name || track.title || 'Campanha sem nome';
        const campaignKey = campaignName.toLowerCase().trim();
        
        if (!campaignMap.has(campaignKey)) {
          console.log(`🆕 Criando nova campanha: ${campaignName}`);
          campaignMap.set(campaignKey, {
            id: track.campaign_id || track.id || Math.random().toString(36).slice(2),
            name: campaignName,
            source: track.source || track.traffic_source || '',
            status: 'active',
            clicks_today: 0,
            conversions_today: 0,
            cost_today: 0,
            revenue_today: 0,
            clicks_recent: 0,
            conversions_recent: 0,
            cost_recent: 0,
            revenue_recent: 0,
            impressions: 0,
            ctr: 0,
            conversion_rate: 0
          });
        }
        
        const campaign = campaignMap.get(campaignKey);
        campaign.clicks_recent += 1;
        campaign.cost_recent += track.cost || 0;
        console.log(`✅ Track RECENTE: ${campaignName} - Cliques: ${campaign.clicks_recent}, Cost: ${campaign.cost_recent}`);
      });
    }
    
    console.log('\n=== DETERMINANDO STATUS REAL ===');
    // Determinar status real baseado na atividade
    const processedData = Array.from(campaignMap.values()).map(campaign => {
      // Lógica de status baseada em tráfego vs conversões:
      // - Se tem tráfego HOJE mas não tem conversões HOJE: pode ser deletada
      // - Se tem conversões HOJE: active (funcionando)
      // - Se não tem atividade HOJE mas tem atividade recente: paused
      // - Se não tem atividade recente: inactive (deletada)
      
      const hasTrafficToday = campaign.clicks_today > 0;
      const hasConversionsToday = campaign.conversions_today > 0;
      const hasRecentActivity = campaign.clicks_recent > 0 || campaign.conversions_recent > 0;
      
      let status = 'inactive';
      
      if (hasConversionsToday) {
        // Se tem conversões hoje, está funcionando
        status = 'active';
      } else if (hasTrafficToday && !hasConversionsToday) {
        // Se tem tráfego mas não conversões, pode ser deletada
        // Verificar se o tráfego é consistente com conversões recentes
        const trafficToConversionRatio = campaign.clicks_recent > 0 ? campaign.conversions_recent / campaign.clicks_recent : 0;
        if (trafficToConversionRatio > 0.01) { // Se tinha conversões recentes
          status = 'paused'; // Pausada temporariamente
        } else {
          status = 'inactive'; // Provavelmente deletada
        }
      } else if (hasRecentActivity && !hasTrafficToday) {
        status = 'paused'; // Pausada temporariamente
      }
      
      console.log(`🔍 [STATUS] Campanha: ${campaign.name}`);
      console.log(`   - Tráfego HOJE: ${hasTrafficToday ? 'SIM' : 'NÃO'} (cliques: ${campaign.clicks_today})`);
      console.log(`   - Conversões HOJE: ${hasConversionsToday ? 'SIM' : 'NÃO'} (conversões: ${campaign.conversions_today})`);
      console.log(`   - Atividade RECENTE: ${hasRecentActivity ? 'SIM' : 'NÃO'} (cliques: ${campaign.clicks_recent}, conversões: ${campaign.conversions_recent})`);
      console.log(`   - Status determinado: ${status}`);
      
      // Calcular métricas finais
      const totalClicks = campaign.clicks_today;
      const totalConversions = campaign.conversions_today;
      const totalCost = campaign.cost_today;
      const totalRevenue = campaign.revenue_today;
      const ctr = campaign.impressions > 0 ? (totalClicks / campaign.impressions) * 100 : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      
      return {
        id: campaign.id,
        title: campaign.name,
        source_title: campaign.source,
        status: status,
        stat: {
          clicks: totalClicks,
          unique_clicks: totalClicks, // Simplificado
          conversions: totalConversions,
          all_conversions: totalConversions,
          approved: totalConversions,
          pending: 0,
          declined: 0,
          revenue: totalRevenue,
          cost: totalCost,
          impressions: campaign.impressions,
          ctr: ctr,
          conversion_rate: conversionRate
        }
      };
    });
    
    console.log('Campaigns API - Dados processados finais:', JSON.stringify(processedData, null, 2));
    console.log('=== CAMPAIGNS API DEBUG END ===');
    
    res.status(200).json(processedData);
  } catch (error) {
    console.error('Campaigns API - Erro geral:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
} 