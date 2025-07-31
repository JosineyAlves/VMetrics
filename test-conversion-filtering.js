const apiKey = 'K0Y6dcsgEqmjQp0CKD49';

async function testConversionFiltering() {
  console.log('🧪 Testando diferentes abordagens de filtragem de conversões...');
  
  const dateFrom = '2025-07-30';
  const dateTo = '2025-07-30';
  
  // Teste 1: Buscar todas as conversões sem filtro
  console.log('\n📊 Teste 1: Todas as conversões sem filtro');
  const allConversionsUrl = `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&per=10`;
  
  try {
    const response = await fetch(allConversionsUrl);
    const data = await response.json();
    
    console.log('✅ Total de conversões:', data.total);
    console.log('✅ Conversões encontradas:', data.items.length);
    
    if (data.items.length > 0) {
      console.log('📊 Primeira conversão:', {
        id: data.items[0].id,
        campaign_id: data.items[0].campaign_id,
        campaign: data.items[0].campaign,
        payout: data.items[0].payout,
        created_at: data.items[0].created_at
      });
      
      // Agrupar por campaign_id
      const groupedByCampaign = {};
      data.items.forEach(conv => {
        const campaignId = conv.campaign_id;
        if (!groupedByCampaign[campaignId]) {
          groupedByCampaign[campaignId] = [];
        }
        groupedByCampaign[campaignId].push(conv);
      });
      
      console.log('📊 Conversões por campanha:');
      Object.keys(groupedByCampaign).forEach(campaignId => {
        const conversions = groupedByCampaign[campaignId];
        const totalPayout = conversions.reduce((sum, conv) => sum + (conv.payout || 0), 0);
        console.log(`   - Campanha ${campaignId}: ${conversions.length} conversões, $${totalPayout.toFixed(2)} payout`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar conversões:', error);
  }
  
  // Aguardar 3 segundos
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Teste 2: Buscar conversões com filtro de campaign_id específico
  console.log('\n📊 Teste 2: Conversões com filtro campaign_id=687f029939180ad2db89cdb7');
  const filteredConversionsUrl = `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&campaign_id=687f029939180ad2db89cdb7&per=10`;
  
  try {
    const response = await fetch(filteredConversionsUrl);
    const data = await response.json();
    
    console.log('✅ Total de conversões filtradas:', data.total);
    console.log('✅ Conversões encontradas:', data.items.length);
    
    if (data.items.length > 0) {
      console.log('📊 Primeira conversão filtrada:', {
        id: data.items[0].id,
        campaign_id: data.items[0].campaign_id,
        campaign: data.items[0].campaign,
        payout: data.items[0].payout
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar conversões filtradas:', error);
  }
  
  // Aguardar 3 segundos
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Teste 3: Buscar conversões com filtro de campaign_id da Taboola
  console.log('\n📊 Teste 3: Conversões com filtro campaign_id=688187ef41332f6562846fa9');
  const taboolaConversionsUrl = `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&campaign_id=688187ef41332f6562846fa9&per=10`;
  
  try {
    const response = await fetch(taboolaConversionsUrl);
    const data = await response.json();
    
    console.log('✅ Total de conversões Taboola:', data.total);
    console.log('✅ Conversões encontradas:', data.items.length);
    
    if (data.items.length > 0) {
      console.log('📊 Primeira conversão Taboola:', {
        id: data.items[0].id,
        campaign_id: data.items[0].campaign_id,
        campaign: data.items[0].campaign,
        payout: data.items[0].payout
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar conversões Taboola:', error);
  }
}

testConversionFiltering().catch(console.error); 