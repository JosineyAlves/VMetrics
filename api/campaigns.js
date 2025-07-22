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
    
    // Buscar conversões para a data específica
    const conversionsUrl = new URL('https://api.redtrack.io/conversions');
    conversionsUrl.searchParams.set('api_key', apiKey);
    conversionsUrl.searchParams.set('per', '1000');
    conversionsUrl.searchParams.set('date_from', dateFrom);
    conversionsUrl.searchParams.set('date_to', dateTo);
    
    console.log('Campaigns API - URL para conversões:', conversionsUrl.toString());
    
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
      console.error('Campaigns API - Erro ao buscar conversões:', errorData);
      return res.status(conversionsResponse.status).json({
        error: errorData.error || 'Erro ao buscar conversões do RedTrack',
        status: conversionsResponse.status,
        endpoint: '/conversions'
      });
    }

    const conversionsData = await conversionsResponse.json();
    console.log('Campaigns API - Dados de conversões BRUTOS:', JSON.stringify(conversionsData, null, 2));
    
    // Buscar tracks (cliques) para a data específica
    const tracksUrl = new URL('https://api.redtrack.io/tracks');
    tracksUrl.searchParams.set('api_key', apiKey);
    tracksUrl.searchParams.set('per', '1000');
    tracksUrl.searchParams.set('date_from', dateFrom);
    tracksUrl.searchParams.set('date_to', dateTo);
    
    console.log('Campaigns API - URL para tracks:', tracksUrl.toString());
    
    const tracksResponse = await fetch(tracksUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });

    const tracksData = await tracksResponse.json();
    console.log('Campaigns API - Dados de tracks BRUTOS:', JSON.stringify(tracksData, null, 2));
    
    // Buscar relatório agregado por campanha para obter informações mais detalhadas
    const reportUrl = new URL('https://api.redtrack.io/report');
    reportUrl.searchParams.set('api_key', apiKey);
    reportUrl.searchParams.set('date_from', dateFrom);
    reportUrl.searchParams.set('date_to', dateTo);
    reportUrl.searchParams.set('group_by', 'campaign');
    reportUrl.searchParams.set('per', '1000');
    
    console.log('Campaigns API - URL para relatório:', reportUrl.toString());
    
    let reportData = null;
    try {
      const reportResponse = await fetch(reportUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0'
        }
      });
      
      if (reportResponse.ok) {
        reportData = await reportResponse.json();
        console.log('Campaigns API - Dados do relatório:', JSON.stringify(reportData, null, 2));
      } else {
        console.log('Campaigns API - Relatório não disponível, continuando com dados de tracks/conversões');
      }
    } catch (error) {
      console.log('Campaigns API - Erro ao buscar relatório:', error.message);
    }
    
    // Combinar dados de conversões e tracks para métricas completas
    // Usar nome da campanha como chave única para evitar problemas de ID
    const campaignMap = new Map();
    
    // Set para rastrear cliques únicos (evitar duplicatas)
    const uniqueClicks = new Set();
    
    console.log('=== PROCESSANDO TRACKS ===');
    // Processar tracks primeiro para obter cliques base
    if (tracksData && tracksData.items && Array.isArray(tracksData.items)) {
      console.log(`Campaigns API - Total de tracks encontrados: ${tracksData.items.length}`);
      
      tracksData.items.forEach((track, index) => {
        console.log(`\n--- Track ${index + 1} ---`);
        console.log('Track completo:', JSON.stringify(track, null, 2));
        
        const campaignName = track.campaign || track.campaign_name || track.title || 'Campanha sem nome';
        const campaignId = track.campaign_id || track.id || Math.random().toString(36).slice(2);
        
        console.log('Campaign name extraído:', campaignName);
        console.log('Campaign ID extraído:', campaignId);
        
        // FILTROS MAIS SUAVES (SIMILAR AO REDTRACK DASHBOARD)
        // 1. Remover apenas cliques com fraud.is_ok = 0 (fraud detectado)
        if (track.fraud && track.fraud.is_ok === 0) {
          console.log(`❌ Clique com fraud ignorado: ${campaignName} - fraud.is_ok: ${track.fraud.is_ok}`);
          return;
        }
        
        // 2. Remover apenas cliques duplicados exatos (mesmo ID)
        const clickKey = `${campaignName.toLowerCase().trim()}_${track.ip}_${track.track_time}_${track.user_agent}`;
        
        // Verificar se este clique já foi contabilizado (evitar duplicatas exatas)
        if (uniqueClicks.has(clickKey)) {
          console.log(`❌ Clique duplicado exato ignorado: ${campaignName} - IP: ${track.ip} - Time: ${track.track_time}`);
          return;
        }
        
        // Adicionar à lista de cliques únicos
        uniqueClicks.add(clickKey);
        
        if (!campaignMap.has(campaignName.toLowerCase().trim())) {
          console.log(`🆕 Criando nova campanha: ${campaignName}`);
          campaignMap.set(campaignName.toLowerCase().trim(), {
            id: campaignId,
            name: campaignName,
            source: track.source || track.traffic_source || '',
            status: 'active', // Status padrão, será atualizado se encontrado
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
        
        // Acumular métricas de tracks (cliques)
        const campaign = campaignMap.get(campaignName.toLowerCase().trim());
        campaign.clicks += 1; // Cada track é um clique
        campaign.unique_clicks += 1; // Cliques únicos (sem duplicatas)
        campaign.cost += track.cost || 0; // Cost dos cliques
        console.log(`✅ Track válido: ${campaignName} - Cliques: ${campaign.clicks}, Cliques Únicos: ${campaign.unique_clicks}, Cost: ${campaign.cost}`);
      });
    } else {
      console.log('❌ Nenhum track encontrado ou dados inválidos');
    }
    
    console.log('\n=== PROCESSANDO CONVERSÕES ===');
    // Processar conversões para adicionar revenue e conversões
    if (conversionsData && conversionsData.items && Array.isArray(conversionsData.items)) {
      console.log(`Campaigns API - Total de conversões encontradas: ${conversionsData.items.length}`);
      
      conversionsData.items.forEach((conversion, index) => {
        console.log(`\n--- Conversão ${index + 1} ---`);
        console.log('Conversão completa:', JSON.stringify(conversion, null, 2));
        
        const campaignName = conversion.campaign || conversion.campaign_name || conversion.title || 'Campanha sem nome';
        const campaignId = conversion.campaign_id || conversion.id || Math.random().toString(36).slice(2);
        
        console.log('Campaign name extraído:', campaignName);
        console.log('Campaign ID extraído:', campaignId);
        
        // Usar nome da campanha como chave única
        const campaignKey = campaignName.toLowerCase().trim();
        
        if (!campaignMap.has(campaignKey)) {
          console.log(`🆕 Criando nova campanha: ${campaignName}`);
          campaignMap.set(campaignKey, {
            id: campaignId,
            name: campaignName,
            source: conversion.source || conversion.traffic_source || '',
            status: 'active', // Status padrão, será atualizado se encontrado
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
        
        // Acumular métricas de conversões (sem duplicar cliques)
        const campaign = campaignMap.get(campaignKey);
        campaign.all_conversions += 1; // Todas as conversões
        campaign.conversions += 1; // Conversões aprovadas (assumindo que são aprovadas)
        campaign.revenue += conversion.payout || conversion.revenue || 0; // Revenue das conversões
        
        // Classificar conversões por status
        const status = conversion.status || conversion.conversion_status || 'approved';
        if (status === 'approved' || status === 'approved') {
          campaign.approved += 1;
        } else if (status === 'pending' || status === 'pending') {
          campaign.pending += 1;
        } else if (status === 'declined' || status === 'declined') {
          campaign.declined += 1;
        }
        
        // NÃO somar cost das conversões para evitar duplicação
        console.log(`✅ Conversão: ${campaignName} - Todas Conversões: ${campaign.all_conversions}, Aprovadas: ${campaign.approved}, Revenue: ${campaign.revenue}`);
      });
    } else {
      console.log('❌ Nenhuma conversão encontrada ou dados inválidos');
    }
    
    console.log('\n=== RESULTADO FINAL ===');
    console.log('Campaigns API - Campanhas combinadas:', Array.from(campaignMap.values()));
    
    // Usar dados do relatório se disponíveis para melhorar a precisão
    if (reportData && reportData.data && Array.isArray(reportData.data)) {
      console.log('Campaigns API - Usando dados do relatório para melhorar precisão');
      reportData.data.forEach(reportItem => {
        const campaignName = reportItem.campaign || reportItem.campaign_name || reportItem.title || 'Campanha sem nome';
        const campaignKey = campaignName.toLowerCase().trim();
        
        if (campaignMap.has(campaignKey)) {
          const campaign = campaignMap.get(campaignKey);
          // Atualizar métricas com dados do relatório (mais precisos)
          campaign.clicks = reportItem.clicks || campaign.clicks;
          campaign.conversions = reportItem.conversions || campaign.conversions;
          campaign.cost = reportItem.cost || campaign.cost;
          campaign.revenue = reportItem.revenue || campaign.revenue;
          campaign.impressions = reportItem.impressions || campaign.impressions;
          
          console.log(`📊 [REPORT] Atualizando campanha: ${campaignName} com dados do relatório`);
        }
      });
    }
    
    // Converter para array e mapear
    const processedData = Array.from(campaignMap.values()).map(campaign => {
      // Calcular métricas derivadas
      const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
      const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
      
      // Determinar status baseado em atividade recente e dados disponíveis
      let status = 'active';
      
      // Verificar se há dados de atividade
      const hasActivity = campaign.clicks > 0 || campaign.conversions > 0;
      const hasConversions = campaign.conversions > 0;
      const hasClicks = campaign.clicks > 0;
      
      // Lógica de determinação de status:
      // - Se não há atividade: inactive (deleted/canceled)
      // - Se há cliques mas não conversões: paused (pausada temporariamente)
      // - Se há conversões: active (funcionando)
      // - Se há apenas conversões antigas: inactive (deleted)
      
      if (!hasActivity) {
        status = 'inactive'; // Deleted ou cancelada
      } else if (hasClicks && !hasConversions) {
        status = 'paused'; // Pausada temporariamente
      } else if (hasConversions) {
        // Verificar se as conversões são recentes (últimos 7 dias)
        const recentActivity = campaign.conversions > 0;
        if (recentActivity) {
          status = 'active'; // Funcionando normalmente
        } else {
          status = 'inactive'; // Deleted (apenas conversões antigas)
        }
      }
      
      console.log(`🔍 [STATUS] Campanha: ${campaign.name} - Cliques: ${campaign.clicks}, Conversões: ${campaign.conversions}, Status: ${status}`);
      
      return {
        id: campaign.id,
        title: campaign.name,
        source_title: campaign.source,
        status: status,
        stat: {
          clicks: campaign.clicks,
          unique_clicks: campaign.unique_clicks,
          conversions: campaign.conversions,
          all_conversions: campaign.all_conversions,
          approved: campaign.approved,
          pending: campaign.pending,
          declined: campaign.declined,
          revenue: campaign.revenue,
          cost: campaign.cost,
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