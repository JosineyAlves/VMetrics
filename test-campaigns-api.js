const apiKey = 'K0Y6dcsgEqmjQp0CKD49';

async function testCampaignsAPI() {
  console.log('🧪 Testando API de campanhas...');
  
  // Teste 1: Buscar dados de hoje
  console.log('\n📊 Teste 1: Dados de hoje');
  const todayUrl = `http://localhost:3000/api/campaigns?api_key=${apiKey}&date_from=2025-07-30&date_to=2025-07-30`;
  
  try {
    const response = await fetch(todayUrl);
    const data = await response.json();
    
    console.log('✅ Resposta recebida:', typeof data, Array.isArray(data));
    console.log('📊 Estrutura dos dados:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('🔍 Campos disponíveis no primeiro item:');
      const firstItem = data[0];
      Object.keys(firstItem).forEach(key => {
        console.log(`   - ${key}: ${typeof firstItem[key]} = ${firstItem[key]}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro no teste 1:', error);
  }
  
  // Teste 2: Buscar dados de ontem
  console.log('\n📊 Teste 2: Dados de ontem');
  const yesterdayUrl = `http://localhost:3000/api/campaigns?api_key=${apiKey}&date_from=2025-07-29&date_to=2025-07-29`;
  
  try {
    const response = await fetch(yesterdayUrl);
    const data = await response.json();
    
    console.log('✅ Resposta recebida:', typeof data, Array.isArray(data));
    console.log('📊 Estrutura dos dados:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro no teste 2:', error);
  }
  
  // Teste 3: Comparar com RedTrack direto
  console.log('\n📊 Teste 3: Comparação com RedTrack direto');
  const redtrackUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=2025-07-30&date_to=2025-07-30&group_by=campaign&metrics=clicks,conversions,cost,revenue,impressions&per=1000`;
  
  try {
    const response = await fetch(redtrackUrl);
    const data = await response.json();
    
    console.log('✅ Resposta RedTrack direta:', typeof data, Array.isArray(data));
    console.log('📊 Estrutura dos dados RedTrack:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erro no teste 3:', error);
  }
}

testCampaignsAPI().catch(console.error); 