const apiKey = 'K0Y6dcsgEqmjQp0CKD49';

async function testUniqueClicksAndStatus() {
  console.log('🧪 Testando cálculo de unique_clicks e status...');

  const dateFrom = '2025-07-30';
  const dateTo = '2025-07-30';

  // Teste 1: Buscar tracks para campanha Taboola (que sabemos que tem cliques)
  console.log('\n📊 Teste 1: Analisando tracks para campanha Taboola');
  const tracksUrl = `https://api.redtrack.io/tracks?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&campaign_id=688187ef41332f6562846fa9&per=100`;

  try {
    const response = await fetch(tracksUrl);
    const data = await response.json();
    console.log('✅ Total de tracks:', data.total);
    console.log('✅ Tracks encontrados:', data.items.length);
    
    if (data.items.length > 0) {
      // Analisar unique_clicks baseado em clickid
      const clickIds = data.items.map(track => track.clickid);
      const uniqueClickIds = new Set(clickIds);
      
      console.log('📊 Análise de unique_clicks:');
      console.log(`   - Total de cliques: ${data.items.length}`);
      console.log(`   - Unique clickids: ${uniqueClickIds.size}`);
      
      // Mostrar alguns exemplos de clickids
      console.log('📊 Exemplos de clickids:');
      Array.from(uniqueClickIds).slice(0, 5).forEach((clickId, index) => {
        console.log(`   ${index + 1}. ${clickId}`);
      });
      
      // Verificar se há clickids duplicados
      const clickIdCounts = {};
      clickIds.forEach(clickId => {
        clickIdCounts[clickId] = (clickIdCounts[clickId] || 0) + 1;
      });
      
      const duplicates = Object.entries(clickIdCounts).filter(([clickId, count]) => count > 1);
      console.log(`📊 Clickids duplicados: ${duplicates.length}`);
      if (duplicates.length > 0) {
        console.log('📊 Exemplos de duplicatas:');
        duplicates.slice(0, 3).forEach(([clickId, count]) => {
          console.log(`   - ${clickId}: ${count} vezes`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar tracks:', error);
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Teste 2: Buscar conversões para analisar status
  console.log('\n📊 Teste 2: Analisando status das conversões');
  const conversionsUrl = `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&per=50`;

  try {
    const response = await fetch(conversionsUrl);
    const data = await response.json();
    console.log('✅ Total de conversões:', data.total);
    console.log('✅ Conversões encontradas:', data.items.length);
    
    if (data.items.length > 0) {
      // Analisar status das conversões
      const statusCounts = {};
      data.items.forEach(conv => {
        const status = conv.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      console.log('📊 Distribuição de status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} conversões`);
      });
      
      // Mostrar exemplos de conversões com diferentes status
      console.log('📊 Exemplos de conversões por status:');
      const statusExamples = {};
      data.items.forEach(conv => {
        const status = conv.status || 'unknown';
        if (!statusExamples[status] || statusExamples[status].length < 2) {
          if (!statusExamples[status]) statusExamples[status] = [];
          statusExamples[status].push({
            id: conv.id,
            campaign_id: conv.campaign_id,
            campaign: conv.campaign,
            status: conv.status,
            payout: conv.payout,
            created_at: conv.created_at
          });
        }
      });
      
      Object.entries(statusExamples).forEach(([status, examples]) => {
        console.log(`\n   Status: ${status}`);
        examples.forEach(example => {
          console.log(`     - ID: ${example.id}, Campanha: ${example.campaign}, Payout: $${example.payout}`);
        });
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar conversões:', error);
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Teste 3: Comparar com dados do report para verificar unique_clicks
  console.log('\n📊 Teste 3: Comparando com dados do report');
  const reportUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&group_by=campaign&per=50`;

  try {
    const response = await fetch(reportUrl);
    const data = await response.json();
    console.log('✅ Dados do report obtidos');
    
    if (data.data && data.data.length > 0) {
      console.log('📊 Dados do report por campanha:');
      data.data.forEach(campaign => {
        console.log(`   - Campanha: ${campaign.campaign || campaign.campaign_id}`);
        console.log(`     Cliques: ${campaign.clicks || 0}`);
        console.log(`     Unique clicks: ${campaign.unique_clicks || 0}`);
        console.log(`     Conversões: ${campaign.conversions || 0}`);
        console.log(`     Revenue: $${campaign.revenue || 0}`);
        console.log(`     Cost: $${campaign.cost || 0}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar report:', error);
  }
}

testUniqueClicksAndStatus().catch(console.error); 