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

// Função para testar o Dashboard
async function testDashboard() {
  console.log('🔍 [TESTE] Testando Dashboard...\n');
  
  try {
    const apiKey = 'K0Y6dcsgEqmjQp0CKD49';
    const dateFrom = '2025-07-01';
    const dateTo = '2025-07-31';
    
    // 1. Testar endpoint de campanhas (que o Dashboard deveria usar)
    console.log('📊 [CAMPANHAS] Testando endpoint de campanhas...');
    const campaignsUrl = `https://my-dash-two.vercel.app/api/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&with_clicks=true&total=true`;
    
    const campaignsData = await makeRequest(campaignsUrl);
    console.log('✅ [CAMPANHAS] Dados recebidos:', {
      hasData: !!campaignsData,
      hasCampaigns: !!campaignsData.campaigns,
      campaignsCount: campaignsData.campaigns ? campaignsData.campaigns.length : 0,
      firstCampaign: campaignsData.campaigns && campaignsData.campaigns.length > 0 ? {
        title: campaignsData.campaigns[0].title,
        hasStat: !!campaignsData.campaigns[0].stat,
        clicks: campaignsData.campaigns[0].stat?.clicks,
        cost: campaignsData.campaigns[0].stat?.cost,
        revenue: campaignsData.campaigns[0].stat?.revenue
      } : null
    });
    
    // 2. Testar endpoint de report (que o Dashboard NÃO deveria usar)
    console.log('\n📊 [REPORT] Testando endpoint de report...');
    const reportUrl = `https://my-dash-two.vercel.app/api/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&group_by=date`;
    
    const reportData = await makeRequest(reportUrl);
    console.log('✅ [REPORT] Dados recebidos:', {
      hasData: !!reportData,
      isArray: Array.isArray(reportData),
      dataLength: Array.isArray(reportData) ? reportData.length : 0,
      firstItem: Array.isArray(reportData) && reportData.length > 0 ? {
        clicks: reportData[0].clicks,
        cost: reportData[0].cost,
        revenue: reportData[0].revenue,
        cpc: reportData[0].cpc,
        epc: reportData[0].epc
      } : null
    });
    
    // 3. Comparar os dados
    console.log('\n🔍 [COMPARAÇÃO] Comparando dados...');
    
    if (campaignsData.campaigns && campaignsData.campaigns.length > 0) {
      // Calcular totais das campanhas
      let totalClicks = 0;
      let totalCost = 0;
      let totalRevenue = 0;
      
      campaignsData.campaigns.forEach(campaign => {
        if (campaign.stat) {
          totalClicks += campaign.stat.clicks || 0;
          totalCost += campaign.stat.cost || 0;
          totalRevenue += campaign.stat.revenue || 0;
        }
      });
      
      const calculatedCPC = totalClicks > 0 ? totalCost / totalClicks : 0;
      const calculatedEPC = totalClicks > 0 ? totalRevenue / totalClicks : 0;
      
      console.log('📊 [CAMPANHAS] Totais calculados:', {
        totalClicks,
        totalCost,
        totalRevenue,
        calculatedCPC,
        calculatedEPC
      });
    }
    
    if (Array.isArray(reportData) && reportData.length > 0) {
      // Calcular totais do report
      let totalClicks = 0;
      let totalCost = 0;
      let totalRevenue = 0;
      
      reportData.forEach(item => {
        totalClicks += item.clicks || 0;
        totalCost += item.cost || 0;
        totalRevenue += item.revenue || 0;
      });
      
      const calculatedCPC = totalClicks > 0 ? totalCost / totalClicks : 0;
      const calculatedEPC = totalClicks > 0 ? totalRevenue / totalClicks : 0;
      
      console.log('📊 [REPORT] Totais calculados:', {
        totalClicks,
        totalCost,
        totalRevenue,
        calculatedCPC,
        calculatedEPC
      });
    }
    
    console.log('\n✅ [TESTE] Teste concluído!');
    
  } catch (error) {
    console.error('❌ [ERRO] Erro durante o teste:', error.message);
  }
}

// Executar teste
testDashboard(); 