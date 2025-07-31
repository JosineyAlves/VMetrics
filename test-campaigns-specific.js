const apiKey = 'K0Y6dcsgEqmjQp0CKD49';

async function testCampaignSpecificData() {
  console.log('🧪 Testando dados específicos por campanha...');
  
  // Teste 1: Buscar dados de uma campanha específica
  console.log('\n📊 Teste 1: Dados de uma campanha específica');
  const campaignId = '687f029939180ad2db89cdb7'; // Facebook - Morango Lucrativo - Teste
  
  // Buscar cliques da campanha
  console.log('🔍 Buscando cliques da campanha...');
  const tracksUrl = `https://api.redtrack.io/tracks?api_key=${apiKey}&date_from=2025-07-30&date_to=2025-07-30&campaign_id=${campaignId}&per=1000`;
  
  try {
    const tracksResponse = await fetch(tracksUrl);
    const tracksData = await tracksResponse.json();
    
    console.log('✅ Cliques encontrados:', Array.isArray(tracksData) ? tracksData.length : 0);
    if (Array.isArray(tracksData) && tracksData.length > 0) {
      console.log('📊 Primeiro clique:', JSON.stringify(tracksData[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao buscar cliques:', error);
  }
  
  // Buscar conversões da campanha
  console.log('\n🔍 Buscando conversões da campanha...');
  const conversionsUrl = `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=2025-07-30&date_to=2025-07-30&campaign_id=${campaignId}&per=1000`;
  
  try {
    const conversionsResponse = await fetch(conversionsUrl);
    const conversionsData = await conversionsResponse.json();
    
    console.log('✅ Conversões encontradas:', Array.isArray(conversionsData) ? conversionsData.length : 0);
    if (Array.isArray(conversionsData) && conversionsData.length > 0) {
      console.log('📊 Primeira conversão:', JSON.stringify(conversionsData[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Erro ao buscar conversões:', error);
  }
  
  // Teste 2: Comparar com dados agregados
  console.log('\n📊 Teste 2: Comparação com dados agregados');
  const reportUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=2025-07-30&date_to=2025-07-30&group_by=campaign&metrics=clicks,conversions,cost,revenue,impressions&per=1000`;
  
  try {
    const reportResponse = await fetch(reportUrl);
    const reportData = await reportResponse.json();
    
    console.log('✅ Dados agregados:', JSON.stringify(reportData, null, 2));
  } catch (error) {
    console.error('❌ Erro ao buscar dados agregados:', error);
  }
}

testCampaignSpecificData().catch(console.error); 