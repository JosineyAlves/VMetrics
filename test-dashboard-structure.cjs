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

// Função para testar a estrutura dos dados
async function testDashboardStructure() {
  console.log('🔍 [TESTE] Testando estrutura dos dados do Dashboard...\n');
  
  try {
    const apiKey = 'K0Y6dcsgEqmjQp0CKD49';
    const dateFrom = '2025-07-01';
    const dateTo = '2025-07-31';
    
    // Testar endpoint de campanhas
    console.log('📊 [CAMPANHAS] Testando estrutura da resposta...');
    const campaignsUrl = `https://my-dash-two.vercel.app/api/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&with_clicks=true&total=true`;
    
    const campaignsData = await makeRequest(campaignsUrl);
    
    console.log('✅ [CAMPANHAS] Estrutura da resposta:', {
      hasData: !!campaignsData,
      hasCampaigns: !!campaignsData.campaigns,
      hasDataProperty: !!campaignsData.data,
      campaignsCount: campaignsData.campaigns ? campaignsData.campaigns.length : 0,
      dataCount: campaignsData.data ? campaignsData.data.length : 0,
      totalProperty: !!campaignsData.total,
      keys: Object.keys(campaignsData)
    });
    
    // Verificar estrutura das campanhas
    if (campaignsData.campaigns && campaignsData.campaigns.length > 0) {
      const firstCampaign = campaignsData.campaigns[0];
      console.log('📊 [CAMPANHA] Primeira campanha:', {
        title: firstCampaign.title,
        hasStat: !!firstCampaign.stat,
        statKeys: firstCampaign.stat ? Object.keys(firstCampaign.stat) : [],
        clicks: firstCampaign.stat?.clicks,
        cost: firstCampaign.stat?.cost,
        revenue: firstCampaign.stat?.revenue,
        conversions: firstCampaign.stat?.conversions
      });
    }
    
    // Verificar estrutura do data (se existir)
    if (campaignsData.data && campaignsData.data.length > 0) {
      const firstDataItem = campaignsData.data[0];
      console.log('📊 [DATA] Primeiro item de data:', {
        title: firstDataItem.title,
        hasStat: !!firstDataItem.stat,
        statKeys: firstDataItem.stat ? Object.keys(firstDataItem.stat) : [],
        clicks: firstDataItem.stat?.clicks,
        cost: firstDataItem.stat?.cost,
        revenue: firstDataItem.stat?.revenue,
        conversions: firstDataItem.stat?.conversions
      });
    }
    
    // Simular o processamento do Dashboard
    console.log('\n🔍 [SIMULAÇÃO] Simulando processamento do Dashboard...');
    
    let summary = {};
    let daily = [];
    
    // Verificar qual estrutura usar
    const campaignsArray = campaignsData.data || campaignsData.campaigns || [];
    
    if (Array.isArray(campaignsArray) && campaignsArray.length > 0) {
      console.log(`📊 [SIMULAÇÃO] Processando ${campaignsArray.length} campanhas...`);
      
      // Filtrar campanhas com atividade
      const filteredData = campaignsArray.filter((item) => {
        const hasClicks = item.stat && item.stat.clicks > 0;
        const hasConversions = item.stat && item.stat.conversions > 0;
        return hasClicks || hasConversions;
      });
      
      console.log(`📊 [SIMULAÇÃO] ${filteredData.length} campanhas com atividade`);
      
      // Agregar dados
      summary = filteredData.reduce((acc, item) => {
        if (item.stat && typeof item.stat === 'object') {
          Object.keys(item.stat).forEach(key => {
            if (typeof item.stat[key] === 'number') {
              acc[key] = (acc[key] || 0) + item.stat[key];
            }
          });
        }
        return acc;
      }, {});
      
      // Adicionar initiate_checkout
      summary.initiate_checkout = filteredData.reduce((total, item) => {
        return total + (item.stat?.convtype1 || 0);
      }, 0);
      
      console.log('📊 [SIMULAÇÃO] Resumo calculado:', {
        clicks: summary.clicks,
        cost: summary.cost,
        revenue: summary.revenue,
        conversions: summary.conversions,
        initiate_checkout: summary.initiate_checkout
      });
      
      // Calcular métricas
      const cpc = summary.clicks > 0 ? summary.cost / summary.clicks : 0;
      const cpa = summary.conversions > 0 ? summary.cost / summary.conversions : 0;
      const epc = summary.clicks > 0 ? summary.revenue / summary.clicks : 0;
      
      console.log('📊 [SIMULAÇÃO] Métricas calculadas:', {
        cpc,
        cpa,
        epc
      });
    } else {
      console.log('❌ [SIMULAÇÃO] Nenhuma campanha encontrada para processar');
    }
    
    console.log('\n✅ [TESTE] Teste de estrutura concluído!');
    
  } catch (error) {
    console.error('❌ [ERRO] Erro durante o teste:', error.message);
  }
}

// Executar teste
testDashboardStructure(); 