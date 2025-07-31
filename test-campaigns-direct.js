const apiKey = 'K0Y6dcsgEqmjQp0CKD49';

async function testCampaignsDirect() {
  console.log('🔍 Testando endpoint /campaigns diretamente...');
  
  // Teste 1: Endpoint /campaigns
  console.log('\n📊 Teste 1: GET /campaigns');
  const campaignsUrl = `https://api.redtrack.io/campaigns?api_key=${apiKey}`;
  
  try {
    const response = await fetch(campaignsUrl);
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
  
  // Teste 2: Endpoint /report com group_by=offer
  console.log('\n📊 Teste 2: group_by=offer');
  const offerUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=2025-07-30&date_to=2025-07-30&group_by=offer&metrics=clicks,conversions,cost,revenue,impressions&per=1000`;
  
  try {
    const response = await fetch(offerUrl);
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
    console.error('❌ Erro no teste 2:', error);
  }
}

testCampaignsDirect().catch(console.error); 