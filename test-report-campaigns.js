// Teste do endpoint /report para verificar dados agregados por campanha
const API_KEY = 'sua_api_key_aqui'; // Substitua pela sua API key
const DATE_FROM = '2025-07-22';
const DATE_TO = '2025-07-30';

async function testReportCampaigns() {
  console.log('=== TESTE DO ENDPOINT /REPORT PARA CAMPANHAS ===');
  
  const reportUrl = new URL('https://api.redtrack.io/report');
  reportUrl.searchParams.set('api_key', API_KEY);
  reportUrl.searchParams.set('date_from', DATE_FROM);
  reportUrl.searchParams.set('date_to', DATE_TO);
  reportUrl.searchParams.set('group_by', 'campaign');
  reportUrl.searchParams.set('metrics', 'clicks,conversions,cost,revenue');
  reportUrl.searchParams.set('per', '1000');
  
  console.log('URL do report:', reportUrl.toString());
  
  try {
    const response = await fetch(reportUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Test/1.0'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Erro HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Detalhes do erro:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Resposta do /report:');
    console.log(JSON.stringify(data, null, 2));
    
    // Verificar estrutura dos dados
    if (data.data && Array.isArray(data.data)) {
      console.log('\n📊 Análise dos dados:');
      data.data.forEach((item, index) => {
        console.log(`\nCampanha ${index + 1}:`);
        console.log(`  - Campaign ID: ${item.campaign_id}`);
        console.log(`  - Campaign Name: ${item.campaign}`);
        console.log(`  - Clicks: ${item.clicks}`);
        console.log(`  - Conversions: ${item.conversions}`);
        console.log(`  - Cost: ${item.cost}`);
        console.log(`  - Revenue: ${item.revenue}`);
        
        // Calcular CPC
        const cpc = item.clicks > 0 ? item.cost / item.clicks : 0;
        console.log(`  - CPC Calculado: ${cpc.toFixed(4)}`);
      });
    } else {
      console.log('⚠️ Estrutura de dados inesperada:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executar teste
testReportCampaigns(); 