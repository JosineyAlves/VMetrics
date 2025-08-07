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

// Função para analisar o problema do CPC
async function analyzeCPCIssue() {
  console.log('🔍 [ANÁLISE] Analisando problema do CPC...\n');
  
  try {
    // Buscar dados das campanhas
    const apiKey = 'K0Y6dcsgEqmjQp0CKD49';
    const dateFrom = '2025-07-01';
    const dateTo = '2025-07-31';
    
    const campaignsUrl = `https://api.redtrack.io/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&with_clicks=true&total=true`;
    const campaignsData = await makeRequest(campaignsUrl);
    
    console.log('📊 [CAMPANHAS] Dados recebidos');
    
    if (campaignsData && campaignsData.campaigns && Array.isArray(campaignsData.campaigns)) {
      console.log(`📊 [CAMPANHAS] ${campaignsData.campaigns.length} campanhas encontradas\n`);
      
      // Analisar cada campanha individualmente
      let totalCost = 0;
      let totalClicks = 0;
      let totalRevenue = 0;
      let totalConversions = 0;
      
      campaignsData.campaigns.forEach((campaign, index) => {
        if (campaign.stat) {
          const stat = campaign.stat;
          console.log(`📊 [CAMPANHA ${index + 1}] ${campaign.title}`);
          console.log(`  - Clicks: ${stat.clicks}`);
          console.log(`  - Cost: ${stat.cost}`);
          console.log(`  - CPC individual: ${stat.cpc}`);
          console.log(`  - Revenue: ${stat.revenue}`);
          console.log(`  - EPC individual: ${stat.epc}`);
          console.log(`  - Conversions: ${stat.conversions}`);
          console.log(`  - CPA individual: ${stat.cpa}`);
          console.log('');
          
          totalCost += stat.cost || 0;
          totalClicks += stat.clicks || 0;
          totalRevenue += stat.revenue || 0;
          totalConversions += stat.conversions || 0;
        }
      });
      
      // Calcular métricas agregadas corretas
      const correctCPC = totalClicks > 0 ? totalCost / totalClicks : 0;
      const correctEPC = totalClicks > 0 ? totalRevenue / totalClicks : 0;
      const correctCPA = totalConversions > 0 ? totalCost / totalConversions : 0;
      
      console.log('📊 [CÁLCULOS CORRETOS]');
      console.log(`  - Total Cost: ${totalCost}`);
      console.log(`  - Total Clicks: ${totalClicks}`);
      console.log(`  - Total Revenue: ${totalRevenue}`);
      console.log(`  - Total Conversions: ${totalConversions}`);
      console.log('');
      console.log(`  - CPC Agregado Correto: ${correctCPC.toFixed(4)}`);
      console.log(`  - EPC Agregado Correto: ${correctEPC.toFixed(4)}`);
      console.log(`  - CPA Agregado Correto: ${correctCPA.toFixed(4)}`);
      console.log('');
      
      // Buscar dados do Dashboard para comparação
      console.log('📊 [DASHBOARD] Buscando dados do Dashboard...');
      const dashboardUrl = `https://my-dash-two.vercel.app/api/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&group_by=rt_source`;
      const dashboardData = await makeRequest(dashboardUrl);
      
      if (Array.isArray(dashboardData) && dashboardData.length > 0) {
        // Simular agregação do Dashboard
        const dashboardSummary = dashboardData.reduce((acc, item) => {
          Object.keys(item).forEach(key => {
            if (key !== 'stat' && typeof item[key] === 'number') {
              acc[key] = (acc[key] || 0) + item[key];
            }
          });
          
          if (item.stat && typeof item.stat === 'object') {
            Object.keys(item.stat).forEach(key => {
              if (typeof item.stat[key] === 'number') {
                acc[key] = (acc[key] || 0) + item.stat[key];
              }
            });
          }
          
          return acc;
        }, {});
        
        console.log('📊 [DASHBOARD] Dados agregados:');
        console.log(`  - Total Cost: ${dashboardSummary.cost}`);
        console.log(`  - Total Clicks: ${dashboardSummary.clicks}`);
        console.log(`  - Total Revenue: ${dashboardSummary.revenue}`);
        console.log(`  - CPC do Dashboard: ${dashboardSummary.cpc}`);
        console.log(`  - EPC do Dashboard: ${dashboardSummary.epc}`);
        console.log(`  - CPA do Dashboard: ${dashboardSummary.cpa}`);
        console.log('');
        
        // Calcular CPC do Dashboard
        const dashboardCPC = dashboardSummary.clicks > 0 ? dashboardSummary.cost / dashboardSummary.clicks : 0;
        const dashboardEPC = dashboardSummary.clicks > 0 ? dashboardSummary.revenue / dashboardSummary.clicks : 0;
        const dashboardCPA = dashboardSummary.conversions > 0 ? dashboardSummary.cost / dashboardSummary.conversions : 0;
        
        console.log('📊 [COMPARAÇÃO]');
        console.log(`  - CPC Correto: ${correctCPC.toFixed(4)}`);
        console.log(`  - CPC Dashboard (calculado): ${dashboardCPC.toFixed(4)}`);
        console.log(`  - CPC Dashboard (API): ${dashboardSummary.cpc}`);
        console.log('');
        console.log(`  - EPC Correto: ${correctEPC.toFixed(4)}`);
        console.log(`  - EPC Dashboard (calculado): ${dashboardEPC.toFixed(4)}`);
        console.log(`  - EPC Dashboard (API): ${dashboardSummary.epc}`);
        console.log('');
        console.log(`  - CPA Correto: ${correctCPA.toFixed(4)}`);
        console.log(`  - CPA Dashboard (calculado): ${dashboardCPA.toFixed(4)}`);
        console.log(`  - CPA Dashboard (API): ${dashboardSummary.cpa}`);
        console.log('');
        
        // Identificar o problema
        console.log('🔍 [PROBLEMA IDENTIFICADO]');
        console.log('O Dashboard está usando os valores de CPC, EPC e CPA que vêm diretamente da API do RedTrack.');
        console.log('Esses valores são calculados pelo RedTrack como médias ponderadas, não como valores agregados simples.');
        console.log('');
        console.log('SOLUÇÃO: O Dashboard deve calcular CPC, EPC e CPA manualmente usando:');
        console.log('  - CPC = Total Cost / Total Clicks');
        console.log('  - EPC = Total Revenue / Total Clicks');
        console.log('  - CPA = Total Cost / Total Conversions');
        console.log('');
        console.log('Isso garantirá que as métricas sejam consistentes e corretas.');
      }
    }
    
  } catch (error) {
    console.error('❌ [ERRO] Erro durante a análise:', error.message);
  }
}

// Executar análise
analyzeCPCIssue(); 