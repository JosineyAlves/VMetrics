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

// Função para testar API do RedTrack diretamente
async function testRedTrackDirect() {
  console.log('🔍 [REDTRACK] Testando API do RedTrack diretamente...\n');
  
  try {
    const apiKey = 'K0Y6dcsgEqmjQp0CKD49';
    const dateFrom = '2025-07-01';
    const dateTo = '2025-07-31';
    
    // 1. Testar endpoint /report diretamente
    console.log('📊 [REDTRACK] Testando /report endpoint...');
    const reportUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&group_by=rt_source`;
    
    const reportData = await makeRequest(reportUrl);
    console.log('✅ [REDTRACK] Dados do /report recebidos:');
    console.log(JSON.stringify(reportData, null, 2));
    
    // 2. Testar endpoint /campaigns diretamente
    console.log('\n📊 [REDTRACK] Testando /campaigns endpoint...');
    const campaignsUrl = `https://api.redtrack.io/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&with_clicks=true&total=true`;
    
    const campaignsData = await makeRequest(campaignsUrl);
    console.log('✅ [REDTRACK] Dados do /campaigns recebidos:');
    console.log(JSON.stringify(campaignsData, null, 2));
    
    // 3. Analisar campos disponíveis
    console.log('\n🔍 [ANÁLISE] Analisando campos disponíveis...');
    
    if (reportData && Array.isArray(reportData)) {
      console.log('\n📊 [REPORT] Campos disponíveis no primeiro item:');
      const firstItem = reportData[0];
      if (firstItem) {
        console.log('Chaves disponíveis:', Object.keys(firstItem));
        console.log('Campos de custo/gasto:', {
          spend: firstItem.spend,
          cost: firstItem.cost,
          campaign_cost: firstItem.campaign_cost,
          total_spend: firstItem.total_spend,
          ad_spend: firstItem.ad_spend
        });
        console.log('Campos de receita:', {
          revenue: firstItem.revenue,
          income: firstItem.income,
          total_revenue: firstItem.total_revenue,
          earnings: firstItem.earnings
        });
        console.log('Campos de métricas:', {
          cpc: firstItem.cpc,
          cpa: firstItem.cpa,
          epc: firstItem.epc,
          clicks: firstItem.clicks,
          conversions: firstItem.conversions
        });
      }
    }
    
    if (campaignsData && Array.isArray(campaignsData)) {
      console.log('\n📊 [CAMPAIGNS] Campos disponíveis no primeiro item:');
      const firstCampaign = campaignsData[0];
      if (firstCampaign) {
        console.log('Chaves disponíveis:', Object.keys(firstCampaign));
        if (firstCampaign.stat) {
          console.log('Campos em stat:', Object.keys(firstCampaign.stat));
          console.log('Campos de custo em stat:', {
            cost: firstCampaign.stat.cost,
            spend: firstCampaign.stat.spend,
            campaign_cost: firstCampaign.stat.campaign_cost
          });
          console.log('Campos de receita em stat:', {
            revenue: firstCampaign.stat.revenue,
            income: firstCampaign.stat.income,
            total_revenue: firstCampaign.stat.total_revenue
          });
        }
      }
    }
    
    console.log('\n✅ [REDTRACK] Teste concluído!');
    
  } catch (error) {
    console.error('❌ [ERRO] Erro durante o teste:', error.message);
  }
}

// Executar teste
testRedTrackDirect(); 