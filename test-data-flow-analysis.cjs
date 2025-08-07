const https = require('https');

// Função para fazer requisição HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Erro ao parsear JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Simular o processamento do Dashboard
function simulateDashboardProcessing(data) {
  console.log('\n🔍 [DASHBOARD] Simulando processamento do Dashboard...');
  
  if (Array.isArray(data)) {
    console.log(`📊 [DASHBOARD] Processando ${data.length} itens...`);
    
    // Simular filtro de campanhas com atividade
    const filteredData = data.filter((item) => {
      const hasClicks = item.clicks > 0 || (item.stat && item.stat.clicks > 0);
      const hasConversions = item.conversions > 0 || (item.stat && item.stat.conversions > 0);
      return hasClicks || hasConversions;
    });
    
    console.log(`📊 [DASHBOARD] ${filteredData.length} itens com atividade após filtro`);
    
    // Simular agregação de dados
    const summary = filteredData.reduce((acc, item) => {
      // Processar campos diretos
      Object.keys(item).forEach(key => {
        if (key !== 'stat' && typeof item[key] === 'number') {
          acc[key] = (acc[key] || 0) + item[key];
        }
      });
      
      // Processar estrutura stat se existir
      if (item.stat && typeof item.stat === 'object') {
        Object.keys(item.stat).forEach(key => {
          if (typeof item.stat[key] === 'number') {
            acc[key] = (acc[key] || 0) + item.stat[key];
          }
        });
      }
      
      return acc;
    }, {});
    
    // Mapear cost para spend se necessário
    if (!summary.spend && summary.cost) {
      summary.spend = summary.cost;
    }
    
    // Adicionar initiate_checkout
    summary.initiate_checkout = filteredData.reduce((total, item) => {
      return total + (item.convtype1 || 0);
    }, 0);
    
    console.log('📊 [DASHBOARD] Dados agregados:', {
      clicks: summary.clicks,
      conversions: summary.conversions,
      spend: summary.spend,
      cost: summary.cost,
      revenue: summary.revenue,
      lp_clicks: summary.lp_clicks,
      lp_views: summary.lp_views,
      initiate_checkout: summary.initiate_checkout,
      epc: summary.epc,
      cpc: summary.cpc,
      cpa: summary.cpa
    });
    
    return summary;
  } else {
    console.log('📊 [DASHBOARD] Dados diretos (não array):', data);
    return data;
  }
}

// Simular o processamento do Campaigns
function simulateCampaignsProcessing(data) {
  console.log('\n🔍 [CAMPAIGNS] Simulando processamento do Campaigns...');
  
  if (data && data.campaigns && Array.isArray(data.campaigns)) {
    console.log(`📊 [CAMPAIGNS] Processando ${data.campaigns.length} campanhas...`);
    
    const processedCampaigns = data.campaigns.map((campaign, index) => {
      console.log(`\n📊 [CAMPAIGNS] Campanha ${index + 1}: ${campaign.title}`);
      
      if (campaign.stat) {
        const stat = campaign.stat;
        console.log('📊 [CAMPAIGNS] Dados da campanha:', {
          clicks: stat.clicks,
          conversions: stat.conversions,
          cost: stat.cost,
          revenue: stat.revenue,
          lp_clicks: stat.lp_clicks,
          lp_views: stat.lp_views,
          convtype1: stat.convtype1,
          epc: stat.epc,
          cpc: stat.cpc,
          cpa: stat.cpa
        });
        
        // Simular mapRedTrackCampaign
        const mappedCampaign = {
          id: campaign.id,
          name: campaign.title,
          source: campaign.source_title || '',
          status: campaign.status,
          spend: stat.cost || stat.spend || 0,
          revenue: stat.revenue || 0,
          clicks: stat.clicks || 0,
          conversions: stat.conversions || 0,
          lp_clicks: stat.lp_clicks || 0,
          lp_views: stat.lp_views || 0,
          initiatecheckout: stat.convtype1 || 0,
          epc: stat.epc || 0,
          cpc: stat.cpc || 0,
          cpa: stat.cpa || 0
        };
        
        console.log('📊 [CAMPAIGNS] Campanha mapeada:', mappedCampaign);
        return mappedCampaign;
      } else {
        console.log('⚠️ [CAMPAIGNS] Campanha sem dados stat');
        return null;
      }
    }).filter(Boolean);
    
    console.log(`📊 [CAMPAIGNS] ${processedCampaigns.length} campanhas processadas`);
    return processedCampaigns;
  }
  
  return [];
}

// Simular getMetricsFromData do Dashboard
function simulateGetMetricsFromData(data) {
  console.log('\n🔍 [METRICS] Simulando getMetricsFromData...');
  
  const metrics = {};
  
  // Simular processamento de métricas específicas
  const spend = data.cost ?? data.spend ?? data.campaign_cost ?? data.total_spend ?? 0;
  const revenue = data.revenue ?? data.total_revenue ?? data.income ?? 0;
  const clicks = data.clicks || 0;
  const conversions = data.conversions || 0;
  const lp_clicks = data.lp_clicks || 0;
  const lp_views = data.lp_views || 0;
  const initiate_checkout = data.convtype1 ?? data.initiate_checkout ?? 0;
  
  // Calcular métricas derivadas
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpa = conversions > 0 ? spend / conversions : 0;
  const epc = clicks > 0 ? revenue / clicks : 0;
  const profit = revenue - spend;
  
  console.log('📊 [METRICS] Métricas calculadas:', {
    spend,
    revenue,
    clicks,
    conversions,
    lp_clicks,
    lp_views,
    initiate_checkout,
    cpc,
    cpa,
    epc,
    profit
  });
  
  return {
    spend,
    revenue,
    clicks,
    conversions,
    lp_clicks,
    lp_views,
    initiate_checkout,
    cpc,
    cpa,
    epc,
    profit
  };
}

// Função principal de análise
async function analyzeDataFlow() {
  console.log('🔍 [ANÁLISE] Analisando fluxo de dados...\n');
  
  try {
    // 1. Buscar dados do RedTrack diretamente
    console.log('📊 [REDTRACK] Buscando dados diretamente da API...');
    const apiKey = 'K0Y6dcsgEqmjQp0CKD49';
    const dateFrom = '2025-07-01';
    const dateTo = '2025-07-31';
    
    const reportUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&group_by=rt_source`;
    const campaignsUrl = `https://api.redtrack.io/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&with_clicks=true&total=true`;
    
    const reportData = await makeRequest(reportUrl);
    const campaignsData = await makeRequest(campaignsUrl);
    
    console.log('✅ [REDTRACK] Dados obtidos diretamente');
    
    // 2. Analisar dados que chegam corretamente
    console.log('\n🔍 [ANÁLISE] Analisando dados que chegam corretamente...');
    
    if (Array.isArray(reportData) && reportData.length > 0) {
      const firstItem = reportData[0];
      console.log('📊 [REPORT] Primeiro item da API:', {
        clicks: firstItem.clicks,
        conversions: firstItem.conversions,
        cost: firstItem.cost,
        revenue: firstItem.revenue,
        lp_clicks: firstItem.lp_clicks,
        lp_views: firstItem.lp_views,
        convtype1: firstItem.convtype1,
        epc: firstItem.epc,
        cpc: firstItem.cpc,
        cpa: firstItem.cpa
      });
      
      // Verificar quais campos estão presentes
      console.log('📊 [REPORT] Campos disponíveis:', Object.keys(firstItem));
    }
    
    if (campaignsData && Array.isArray(campaignsData) && campaignsData.length > 0) {
      const firstCampaign = campaignsData[0];
      console.log('📊 [CAMPAIGNS] Primeira campanha da API:', {
        title: firstCampaign.title,
        stat: firstCampaign.stat ? {
          clicks: firstCampaign.stat.clicks,
          conversions: firstCampaign.stat.conversions,
          cost: firstCampaign.stat.cost,
          revenue: firstCampaign.stat.revenue,
          lp_clicks: firstCampaign.stat.lp_clicks,
          lp_views: firstCampaign.stat.lp_views,
          convtype1: firstCampaign.stat.convtype1,
          epc: firstCampaign.stat.epc,
          cpc: firstCampaign.stat.cpc,
          cpa: firstCampaign.stat.cpa
        } : 'Sem dados stat'
      });
    }
    
    // 3. Simular processamento do Dashboard
    const dashboardSummary = simulateDashboardProcessing(reportData);
    
    // 4. Simular processamento do Campaigns
    const campaignsProcessed = simulateCampaignsProcessing(campaignsData);
    
    // 5. Simular getMetricsFromData
    const metricsCalculated = simulateGetMetricsFromData(dashboardSummary);
    
    // 6. Comparar resultados
    console.log('\n🔍 [COMPARAÇÃO] Comparando dados originais vs processados...');
    
    if (Array.isArray(reportData) && reportData.length > 0) {
      const originalItem = reportData[0];
      console.log('📊 [COMPARAÇÃO] Dados originais vs processados:');
      console.log('  Original - clicks:', originalItem.clicks);
      console.log('  Original - cost:', originalItem.cost);
      console.log('  Original - revenue:', originalItem.revenue);
      console.log('  Original - lp_clicks:', originalItem.lp_clicks);
      console.log('  Processado - clicks:', dashboardSummary.clicks);
      console.log('  Processado - spend:', dashboardSummary.spend);
      console.log('  Processado - revenue:', dashboardSummary.revenue);
      console.log('  Processado - lp_clicks:', dashboardSummary.lp_clicks);
    }
    
    // 7. Identificar problemas específicos
    console.log('\n🔍 [PROBLEMAS] Identificando problemas específicos...');
    
    // Verificar se EPC está sendo calculado corretamente
    if (Array.isArray(reportData) && reportData.length > 0) {
      const item = reportData[0];
      const calculatedEPC = item.clicks > 0 ? item.revenue / item.clicks : 0;
      console.log('📊 [EPC] Verificação:', {
        api_epc: item.epc,
        calculated_epc: calculatedEPC,
        revenue: item.revenue,
        clicks: item.clicks,
        match: Math.abs(item.epc - calculatedEPC) < 0.01
      });
    }
    
    // Verificar se CPC está sendo calculado corretamente
    if (Array.isArray(reportData) && reportData.length > 0) {
      const item = reportData[0];
      const calculatedCPC = item.clicks > 0 ? item.cost / item.clicks : 0;
      console.log('📊 [CPC] Verificação:', {
        api_cpc: item.cpc,
        calculated_cpc: calculatedCPC,
        cost: item.cost,
        clicks: item.clicks,
        match: Math.abs(item.cpc - calculatedCPC) < 0.01
      });
    }
    
    // Verificar se CPA está sendo calculado corretamente
    if (Array.isArray(reportData) && reportData.length > 0) {
      const item = reportData[0];
      const calculatedCPA = item.conversions > 0 ? item.cost / item.conversions : 0;
      console.log('📊 [CPA] Verificação:', {
        api_cpa: item.cpa,
        calculated_cpa: calculatedCPA,
        cost: item.cost,
        conversions: item.conversions,
        match: Math.abs(item.cpa - calculatedCPA) < 0.01
      });
    }
    
    console.log('\n✅ [ANÁLISE] Análise do fluxo de dados concluída!');
    
  } catch (error) {
    console.error('❌ [ERRO] Erro durante a análise:', error.message);
  }
}

// Executar análise
analyzeDataFlow(); 