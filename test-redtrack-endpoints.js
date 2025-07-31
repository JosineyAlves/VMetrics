const apiKey = 'K0Y6dcsgEqmjQp0CKD49';

async function testRedTrackEndpoints() {
  console.log('🧪 Testando endpoints RedTrack para dados específicos...');
  
  const campaignId = '687f029939180ad2db89cdb7'; // Facebook - Morango Lucrativo - Teste
  const dateFrom = '2025-07-30';
  const dateTo = '2025-07-30';
  
  // Teste 1: Endpoint /tracks
  console.log('\n📊 Teste 1: Endpoint /tracks');
  const tracksUrl = `https://api.redtrack.io/tracks?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&campaign_id=${campaignId}&per=1000`;
  
  try {
    console.log('🔍 URL:', tracksUrl);
    const tracksResponse = await fetch(tracksUrl);
    console.log('📊 Status:', tracksResponse.status);
    
    if (!tracksResponse.ok) {
      const errorData = await tracksResponse.text();
      console.error('❌ Erro:', errorData);
    } else {
      const tracksData = await tracksResponse.json();
      console.log('✅ Estrutura dos dados:', JSON.stringify(tracksData, null, 2));
      console.log('✅ Tipo de dados:', typeof tracksData);
      console.log('✅ Chaves do objeto:', Object.keys(tracksData));
      
      if (tracksData.data && Array.isArray(tracksData.data)) {
        console.log('✅ Dados encontrados:', tracksData.data.length);
        if (tracksData.data.length > 0) {
          console.log('📊 Primeiro item:', JSON.stringify(tracksData.data[0], null, 2));
        }
      } else if (Array.isArray(tracksData)) {
        console.log('✅ Array direto encontrado:', tracksData.length);
        if (tracksData.length > 0) {
          console.log('📊 Primeiro item:', JSON.stringify(tracksData[0], null, 2));
        }
      } else {
        console.log('📊 Estrutura inesperada');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar tracks:', error);
  }
  
  // Aguardar 3 segundos para evitar rate limiting
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Teste 2: Endpoint /conversions
  console.log('\n📊 Teste 2: Endpoint /conversions');
  const conversionsUrl = `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&campaign_id=${campaignId}&per=1000`;
  
  try {
    console.log('🔍 URL:', conversionsUrl);
    const conversionsResponse = await fetch(conversionsUrl);
    console.log('📊 Status:', conversionsResponse.status);
    
    if (!conversionsResponse.ok) {
      const errorData = await conversionsResponse.text();
      console.error('❌ Erro:', errorData);
    } else {
      const conversionsData = await conversionsResponse.json();
      console.log('✅ Estrutura dos dados:', JSON.stringify(conversionsData, null, 2));
      console.log('✅ Tipo de dados:', typeof conversionsData);
      console.log('✅ Chaves do objeto:', Object.keys(conversionsData));
      
      if (conversionsData.data && Array.isArray(conversionsData.data)) {
        console.log('✅ Dados encontrados:', conversionsData.data.length);
        if (conversionsData.data.length > 0) {
          console.log('📊 Primeiro item:', JSON.stringify(conversionsData.data[0], null, 2));
        }
      } else if (Array.isArray(conversionsData)) {
        console.log('✅ Array direto encontrado:', conversionsData.length);
        if (conversionsData.length > 0) {
          console.log('📊 Primeiro item:', JSON.stringify(conversionsData[0], null, 2));
        }
      } else {
        console.log('📊 Estrutura inesperada');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar conversions:', error);
  }
  
  // Teste 3: Verificar se há dados sem filtro de campanha
  console.log('\n📊 Teste 3: Verificar dados sem filtro de campanha');
  const tracksNoFilterUrl = `https://api.redtrack.io/tracks?api_key=${apiKey}&date_from=${dateFrom}&date_to=${dateTo}&per=10`;
  
  try {
    console.log('🔍 URL:', tracksNoFilterUrl);
    const response = await fetch(tracksNoFilterUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Estrutura dos dados (sem filtro):', JSON.stringify(data, null, 2));
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log('📊 Primeiro item (sem filtro):', JSON.stringify(data.data[0], null, 2));
        console.log('📊 Campaign ID no primeiro item:', data.data[0].campaign_id);
      } else if (Array.isArray(data) && data.length > 0) {
        console.log('📊 Primeiro item (sem filtro):', JSON.stringify(data[0], null, 2));
        console.log('📊 Campaign ID no primeiro item:', data[0].campaign_id);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar dados sem filtro:', error);
  }
}

testRedTrackEndpoints().catch(console.error); 