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

// Função para analisar discrepâncias de métricas
async function analyzeMetricDiscrepancies() {
  console.log('🔍 [ANÁLISE] Iniciando análise de discrepâncias de métricas...\n');
  
  try {
    // 1. Buscar dados do endpoint /report (usado pelo Dashboard)
    console.log('📊 [REPORT] Buscando dados do endpoint /report...');
    const reportUrl = 'https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2025-07-01&date_to=2025-07-31&group_by=rt_source';
    
    const reportData = await makeRequest(reportUrl);
    console.log('✅ [REPORT] Dados recebidos:', JSON.stringify(reportData, null, 2));
    
    // 2. Buscar dados do endpoint /campaigns (usado pela tela Campaigns)
    console.log('\n📊 [CAMPAIGNS] Buscando dados do endpoint /campaigns...');
    const campaignsUrl = 'https://my-dash-two.vercel.app/api/campaigns?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2025-07-01&date_to=2025-07-31';
    
    const campaignsData = await makeRequest(campaignsUrl);
    console.log('✅ [CAMPAIGNS] Dados recebidos:', JSON.stringify(campaignsData, null, 2));
    
    // 3. Analisar métricas específicas
    console.log('\n🔍 [ANÁLISE] Analisando métricas CPC, CPA, EPC...');
    
    // Dados do Report
    if (reportData && Array.isArray(reportData)) {
      console.log('\n📊 [REPORT] Métricas encontradas:');
      reportData.forEach((item, index) => {
        console.log(`\nItem ${index + 1}:`);
        console.log(`  - CPC: ${item.cpc || 'N/A'}`);
        console.log(`  - CPA: ${item.cpa || 'N/A'}`);
        console.log(`  - EPC: ${item.epc || 'N/A'}`);
        console.log(`  - Clicks: ${item.clicks || 'N/A'}`);
        console.log(`  - Conversions: ${item.conversions || 'N/A'}`);
        console.log(`  - Spend: ${item.spend || 'N/A'}`);
        console.log(`  - Revenue: ${item.revenue || 'N/A'}`);
        
        // Calcular métricas manualmente para comparação
        const calculatedCPC = item.clicks > 0 ? item.spend / item.clicks : 0;
        const calculatedCPA = item.conversions > 0 ? item.spend / item.conversions : 0;
        const calculatedEPC = item.clicks > 0 ? item.revenue / item.clicks : 0;
        
        console.log(`  - CPC Calculado: ${calculatedCPC.toFixed(4)}`);
        console.log(`  - CPA Calculado: ${calculatedCPA.toFixed(4)}`);
        console.log(`  - EPC Calculado: ${calculatedEPC.toFixed(4)}`);
        
        // Verificar discrepâncias
        if (item.cpc && Math.abs(item.cpc - calculatedCPC) > 0.01) {
          console.log(`  ⚠️  CPC discrepante: API=${item.cpc}, Calculado=${calculatedCPC.toFixed(4)}`);
        }
        if (item.cpa && Math.abs(item.cpa - calculatedCPA) > 0.01) {
          console.log(`  ⚠️  CPA discrepante: API=${item.cpa}, Calculado=${calculatedCPA.toFixed(4)}`);
        }
        if (item.epc && Math.abs(item.epc - calculatedEPC) > 0.01) {
          console.log(`  ⚠️  EPC discrepante: API=${item.epc}, Calculado=${calculatedEPC.toFixed(4)}`);
        }
      });
    }
    
    // Dados do Campaigns
    if (campaignsData && campaignsData.campaigns && Array.isArray(campaignsData.campaigns)) {
      console.log('\n📊 [CAMPAIGNS] Métricas encontradas:');
      campaignsData.campaigns.forEach((campaign, index) => {
        console.log(`\nCampanha ${index + 1}: ${campaign.title || 'Sem nome'}`);
        
        if (campaign.stat) {
          const stat = campaign.stat;
          console.log(`  - CPC: ${stat.cpc || 'N/A'}`);
          console.log(`  - CPA: ${stat.cpa || 'N/A'}`);
          console.log(`  - EPC: ${stat.epc || 'N/A'}`);
          console.log(`  - Clicks: ${stat.clicks || 'N/A'}`);
          console.log(`  - Conversions: ${stat.conversions || 'N/A'}`);
          console.log(`  - Cost: ${stat.cost || 'N/A'}`);
          console.log(`  - Revenue: ${stat.revenue || 'N/A'}`);
          
          // Calcular métricas manualmente para comparação
          const calculatedCPC = stat.clicks > 0 ? stat.cost / stat.clicks : 0;
          const calculatedCPA = stat.conversions > 0 ? stat.cost / stat.conversions : 0;
          const calculatedEPC = stat.clicks > 0 ? stat.revenue / stat.clicks : 0;
          
          console.log(`  - CPC Calculado: ${calculatedCPC.toFixed(4)}`);
          console.log(`  - CPA Calculado: ${calculatedCPA.toFixed(4)}`);
          console.log(`  - EPC Calculado: ${calculatedEPC.toFixed(4)}`);
          
          // Verificar discrepâncias
          if (stat.cpc && Math.abs(stat.cpc - calculatedCPC) > 0.01) {
            console.log(`  ⚠️  CPC discrepante: API=${stat.cpc}, Calculado=${calculatedCPC.toFixed(4)}`);
          }
          if (stat.cpa && Math.abs(stat.cpa - calculatedCPA) > 0.01) {
            console.log(`  ⚠️  CPA discrepante: API=${stat.cpa}, Calculado=${calculatedCPA.toFixed(4)}`);
          }
          if (stat.epc && Math.abs(stat.epc - calculatedEPC) > 0.01) {
            console.log(`  ⚠️  EPC discrepante: API=${stat.epc}, Calculado=${calculatedEPC.toFixed(4)}`);
          }
        } else {
          console.log('  - Nenhum dado stat encontrado');
        }
      });
    }
    
    // 4. Comparar processamento do frontend
    console.log('\n🔍 [FRONTEND] Analisando processamento do frontend...');
    
    // Simular processamento do Dashboard
    console.log('\n📊 [DASHBOARD] Processamento simulado:');
    if (reportData && Array.isArray(reportData)) {
      reportData.forEach((item, index) => {
        console.log(`\nItem ${index + 1} - Processamento Dashboard:`);
        
        // Simular getMetricsFromData do Dashboard
        const spend = item.spend || item.cost || 0;
        const clicks = item.clicks || 0;
        const conversions = item.conversions || 0;
        const revenue = item.revenue || 0;
        
        const dashboardCPC = clicks > 0 ? spend / clicks : 0;
        const dashboardCPA = conversions > 0 ? spend / conversions : 0;
        const dashboardEPC = clicks > 0 ? revenue / clicks : 0;
        
        console.log(`  - CPC Dashboard: ${dashboardCPC.toFixed(4)}`);
        console.log(`  - CPA Dashboard: ${dashboardCPA.toFixed(4)}`);
        console.log(`  - EPC Dashboard: ${dashboardEPC.toFixed(4)}`);
      });
    }
    
    // Simular processamento do Campaigns
    console.log('\n📊 [CAMPAIGNS] Processamento simulado:');
    if (campaignsData && campaignsData.campaigns && Array.isArray(campaignsData.campaigns)) {
      campaignsData.campaigns.forEach((campaign, index) => {
        console.log(`\nCampanha ${index + 1} - Processamento Campaigns:`);
        
        if (campaign.stat) {
          const stat = campaign.stat;
          
          // Simular mapRedTrackCampaign do Campaigns
          const spend = stat.cost || stat.spend || 0;
          const clicks = stat.clicks || 0;
          const conversions = stat.conversions || 0;
          const revenue = stat.revenue || 0;
          
          const campaignsCPC = stat.cpc || 0;
          const campaignsCPA = stat.cpa || 0;
          const campaignsEPC = stat.epc || 0;
          
          console.log(`  - CPC Campaigns: ${campaignsCPC.toFixed(4)}`);
          console.log(`  - CPA Campaigns: ${campaignsCPA.toFixed(4)}`);
          console.log(`  - EPC Campaigns: ${campaignsEPC.toFixed(4)}`);
          
          // Comparar com valores calculados
          const calculatedCPC = clicks > 0 ? spend / clicks : 0;
          const calculatedCPA = conversions > 0 ? spend / conversions : 0;
          const calculatedEPC = clicks > 0 ? revenue / clicks : 0;
          
          console.log(`  - CPC Calculado: ${calculatedCPC.toFixed(4)}`);
          console.log(`  - CPA Calculado: ${calculatedCPA.toFixed(4)}`);
          console.log(`  - EPC Calculado: ${calculatedEPC.toFixed(4)}`);
          
          // Verificar se há discrepâncias
          if (Math.abs(campaignsCPC - calculatedCPC) > 0.01) {
            console.log(`  ⚠️  CPC discrepante no Campaigns`);
          }
          if (Math.abs(campaignsCPA - calculatedCPA) > 0.01) {
            console.log(`  ⚠️  CPA discrepante no Campaigns`);
          }
          if (Math.abs(campaignsEPC - calculatedEPC) > 0.01) {
            console.log(`  ⚠️  EPC discrepante no Campaigns`);
          }
        }
      });
    }
    
    console.log('\n✅ [ANÁLISE] Análise concluída!');
    
  } catch (error) {
    console.error('❌ [ERRO] Erro durante a análise:', error.message);
  }
}

// Executar análise
analyzeMetricDiscrepancies(); 