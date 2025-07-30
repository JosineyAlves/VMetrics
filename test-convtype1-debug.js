async function testCampaignsAPI() {
  console.log('🔍 Testando API de campanhas para debug do convtype1...');
  
  try {
    const apiKey = 'K0Y6dcsgEqmjQp0CKD49';
    const dateFrom = '2025-07-15';
    const dateTo = '2025-07-25';
    const timestamp = Date.now(); // Cache busting
    
    const url = `https://my-dash-two.vercel.app/api/campaigns?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&_t=${timestamp}`;
    
    console.log('📡 Fazendo requisição para:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\n📊 Resposta da API:');
    console.log(JSON.stringify(data, null, 2));
    
    // Verificar se convtype1 está presente
    if (data && data.length > 0) {
      console.log('\n🔍 Análise do convtype1:');
      data.forEach((campaign, index) => {
        console.log(`\nCampanha ${index + 1}: ${campaign.title}`);
        console.log(`  - stat.convtype1: ${campaign.stat?.convtype1}`);
        console.log(`  - stat object completo:`, JSON.stringify(campaign.stat, null, 2));
      });
    } else {
      console.log('\n⚠️ Nenhuma campanha encontrada para o período especificado');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testCampaignsAPI(); 