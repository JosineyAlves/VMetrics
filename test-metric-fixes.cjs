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

// Simular o processamento do frontend com as correções
function simulateFrontendProcessing(data) {
  console.log('🔍 [FRONTEND] Simulando processamento com correções...');
  
  if (data && Array.isArray(data)) {
    data.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      
      // Simular getMetricsFromData do Dashboard (com correções)
      const cost = item.cost || item.spend || item.campaign_cost || 0;
      const revenue = item.revenue || item.total_revenue || item.income || 0;
      const clicks = item.clicks || 0;
      const conversions = item.conversions || 0;
      
      // Calcular métricas manualmente
      const calculatedCPC = clicks > 0 ? cost / clicks : 0;
      const calculatedCPA = conversions > 0 ? cost / conversions : 0;
      const calculatedEPC = clicks > 0 ? revenue / clicks : 0;
      const calculatedProfit = revenue - cost;
      
      console.log(`  - Cost: ${cost}`);
      console.log(`  - Revenue: ${revenue}`);
      console.log(`  - Clicks: ${clicks}`);
      console.log(`  - Conversions: ${conversions}`);
      console.log(`  - CPC Calculado: ${calculatedCPC.toFixed(4)}`);
      console.log(`  - CPA Calculado: ${calculatedCPA.toFixed(4)}`);
      console.log(`  - EPC Calculado: ${calculatedEPC.toFixed(4)}`);
      console.log(`  - Profit Calculado: ${calculatedProfit.toFixed(4)}`);
      
      // Comparar com valores da API
      console.log(`  - CPC API: ${item.cpc || 'N/A'}`);
      console.log(`  - CPA API: ${item.cpa || 'N/A'}`);
      console.log(`  - EPC API: ${item.epc || 'N/A'}`);
      
      // Verificar se há discrepâncias
      if (item.cpc && Math.abs(item.cpc - calculatedCPC) > 0.01) {
        console.log(`  ⚠️  CPC discrepante: API=${item.cpc}, Calculado=${calculatedCPC.toFixed(4)}`);
      } else if (item.cpc) {
        console.log(`  ✅ CPC correto`);
      }
      
      if (item.cpa && Math.abs(item.cpa - calculatedCPA) > 0.01) {
        console.log(`  ⚠️  CPA discrepante: API=${item.cpa}, Calculado=${calculatedCPA.toFixed(4)}`);
      } else if (item.cpa) {
        console.log(`  ✅ CPA correto`);
      }
      
      if (item.epc && Math.abs(item.epc - calculatedEPC) > 0.01) {
        console.log(`  ⚠️  EPC discrepante: API=${item.epc}, Calculado=${calculatedEPC.toFixed(4)}`);
      } else if (item.epc) {
        console.log(`  ✅ EPC correto`);
      }
    });
  }
}

// Função para testar as correções
async function testMetricFixes() {
  console.log('🔍 [TESTE] Testando correções de métricas...\n');
  
  try {
    // 1. Testar endpoint /report através do proxy
    console.log('📊 [REPORT] Testando endpoint /report...');
    const reportUrl = 'https://my-dash-two.vercel.app/api/report?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2025-07-01&date_to=2025-07-31&group_by=rt_source';
    
    const reportData = await makeRequest(reportUrl);
    console.log('✅ [REPORT] Dados recebidos do proxy');
    
    // 2. Simular processamento do frontend
    simulateFrontendProcessing(reportData);
    
    // 3. Testar endpoint /campaigns através do proxy
    console.log('\n📊 [CAMPAIGNS] Testando endpoint /campaigns...');
    const campaignsUrl = 'https://my-dash-two.vercel.app/api/campaigns?api_key=K0Y6dcsgEqmjQp0CKD49&date_from=2025-07-01&date_to=2025-07-31';
    
    const campaignsData = await makeRequest(campaignsUrl);
    console.log('✅ [CAMPAIGNS] Dados recebidos do proxy');
    
    // 4. Simular processamento do Campaigns
    if (campaignsData && campaignsData.campaigns && Array.isArray(campaignsData.campaigns)) {
      console.log('\n📊 [CAMPAIGNS] Processamento simulado:');
      campaignsData.campaigns.forEach((campaign, index) => {
        console.log(`\nCampanha ${index + 1}: ${campaign.title || 'Sem nome'}`);
        
        if (campaign.stat) {
          const stat = campaign.stat;
          
          // Simular mapRedTrackCampaign do Campaigns
          const cost = stat.cost || stat.spend || 0;
          const revenue = stat.revenue || stat.total_revenue || 0;
          const clicks = stat.clicks || 0;
          const conversions = stat.conversions || 0;
          
          const calculatedCPC = clicks > 0 ? cost / clicks : 0;
          const calculatedCPA = conversions > 0 ? cost / conversions : 0;
          const calculatedEPC = clicks > 0 ? revenue / clicks : 0;
          
          console.log(`  - Cost: ${cost}`);
          console.log(`  - Revenue: ${revenue}`);
          console.log(`  - Clicks: ${clicks}`);
          console.log(`  - Conversions: ${conversions}`);
          console.log(`  - CPC Calculado: ${calculatedCPC.toFixed(4)}`);
          console.log(`  - CPA Calculado: ${calculatedCPA.toFixed(4)}`);
          console.log(`  - EPC Calculado: ${calculatedEPC.toFixed(4)}`);
          
          console.log(`  - CPC API: ${stat.cpc || 'N/A'}`);
          console.log(`  - CPA API: ${stat.cpa || 'N/A'}`);
          console.log(`  - EPC API: ${stat.epc || 'N/A'}`);
          
          // Verificar se há discrepâncias
          if (stat.cpc && Math.abs(stat.cpc - calculatedCPC) > 0.01) {
            console.log(`  ⚠️  CPC discrepante no Campaigns`);
          } else if (stat.cpc) {
            console.log(`  ✅ CPC correto no Campaigns`);
          }
          
          if (stat.cpa && Math.abs(stat.cpa - calculatedCPA) > 0.01) {
            console.log(`  ⚠️  CPA discrepante no Campaigns`);
          } else if (stat.cpa) {
            console.log(`  ✅ CPA correto no Campaigns`);
          }
          
          if (stat.epc && Math.abs(stat.epc - calculatedEPC) > 0.01) {
            console.log(`  ⚠️  EPC discrepante no Campaigns`);
          } else if (stat.epc) {
            console.log(`  ✅ EPC correto no Campaigns`);
          }
        }
      });
    }
    
    console.log('\n✅ [TESTE] Teste das correções concluído!');
    
  } catch (error) {
    console.error('❌ [ERRO] Erro durante o teste:', error.message);
  }
}

// Executar teste
testMetricFixes(); 