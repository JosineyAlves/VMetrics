const apiKey = 'K0Y6dcsgEqmjQp0CKD49';
const dateFrom = '2025-07-30';
const dateTo = '2025-07-30';

async function testReportStructure() {
  console.log('🔍 Testando estrutura do endpoint /report com diferentes group_by...');
  
  // Teste 1: group_by=campaign
  console.log('\n📊 Teste 1: group_by=campaign');
  const campaignUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&group_by=campaign&metrics=clicks,conversions,cost,revenue,impressions&per=1000`;
  
  try {
    const response = await fetch(campaignUrl);
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
  
  // Teste 2: group_by=source
  console.log('\n📊 Teste 2: group_by=source');
  const sourceUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&group_by=source&metrics=clicks,conversions,cost,revenue,impressions&per=1000`;
  
  try {
    const response = await fetch(sourceUrl);
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
  
  // Teste 3: sem group_by (dados agregados)
  console.log('\n📊 Teste 3: sem group_by (dados agregados)');
  const aggregatedUrl = `https://api.redtrack.io/report?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&metrics=clicks,conversions,cost,revenue,impressions&per=1000`;
  
  try {
    const response = await fetch(aggregatedUrl);
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
    console.error('❌ Erro no teste 3:', error);
  }
}

testReportStructure().catch(console.error); 