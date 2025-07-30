// Script para testar a estrutura de resposta da API RedTrack
// Execute com: node test-redtrack-structure.js

const fetch = require('node-fetch');

async function testRedTrackStructure() {
  console.log('🧪 Testando estrutura da API RedTrack...\n');
  
  // Configurações
  const API_KEY = process.env.REDTRACK_API_KEY || 'K0Y6dcsgEqmjQp0CKD49';
  const today = new Date().toISOString().split('T')[0];
  
  console.log('📅 Data de teste:', today);
  console.log('🔑 API Key:', API_KEY.substring(0, 10) + '...');
  
  // Teste 1: Endpoint /report com group_by=campaign
  console.log('\n🔍 Teste 1: Endpoint /report com group_by=campaign');
  try {
    const reportUrl = new URL('https://api.redtrack.io/report');
    reportUrl.searchParams.set('api_key', API_KEY);
    reportUrl.searchParams.set('date_from', today);
    reportUrl.searchParams.set('date_to', today);
    reportUrl.searchParams.set('group_by', 'campaign');
    reportUrl.searchParams.set('metrics', 'clicks,conversions,cost,revenue,impressions');
    
    console.log('🌐 URL:', reportUrl.toString());
    
    const response = await fetch(reportUrl.toString());
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📊 Tipo de resposta:', typeof data);
    console.log('📊 É array?', Array.isArray(data));
    console.log('📊 Tem propriedade data?', data && data.data ? 'SIM' : 'NÃO');
    
    if (Array.isArray(data)) {
      console.log('📊 Tamanho do array:', data.length);
      if (data.length > 0) {
        console.log('📋 Primeiro item:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    } else if (data && data.data && Array.isArray(data.data)) {
      console.log('📊 Tamanho do array data:', data.data.length);
      if (data.data.length > 0) {
        console.log('📋 Primeiro item:');
        console.log(JSON.stringify(data.data[0], null, 2));
      }
    } else {
      console.log('📋 Estrutura completa:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 2: Endpoint /report sem group_by (para ver estrutura padrão)
  console.log('🔍 Teste 2: Endpoint /report sem group_by');
  try {
    const reportUrl2 = new URL('https://api.redtrack.io/report');
    reportUrl2.searchParams.set('api_key', API_KEY);
    reportUrl2.searchParams.set('date_from', today);
    reportUrl2.searchParams.set('date_to', today);
    reportUrl2.searchParams.set('metrics', 'clicks,conversions,cost,revenue');
    
    console.log('🌐 URL:', reportUrl2.toString());
    
    const response2 = await fetch(reportUrl2.toString());
    const data2 = await response2.json();
    
    console.log('✅ Status:', response2.status);
    console.log('📊 Tipo de resposta:', typeof data2);
    console.log('📊 É array?', Array.isArray(data2));
    console.log('📊 Tem propriedade data?', data2 && data2.data ? 'SIM' : 'NÃO');
    
    if (Array.isArray(data2)) {
      console.log('📊 Tamanho do array:', data2.length);
      if (data2.length > 0) {
        console.log('📋 Primeiro item:');
        console.log(JSON.stringify(data2[0], null, 2));
      }
    } else if (data2 && data2.data && Array.isArray(data2.data)) {
      console.log('📊 Tamanho do array data:', data2.data.length);
      if (data2.data.length > 0) {
        console.log('📋 Primeiro item:');
        console.log(JSON.stringify(data2.data[0], null, 2));
      }
    } else {
      console.log('📋 Estrutura completa:');
      console.log(JSON.stringify(data2, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 3: Endpoint /report com group_by=source
  console.log('🔍 Teste 3: Endpoint /report com group_by=source');
  try {
    const reportUrl3 = new URL('https://api.redtrack.io/report');
    reportUrl3.searchParams.set('api_key', API_KEY);
    reportUrl3.searchParams.set('date_from', today);
    reportUrl3.searchParams.set('date_to', today);
    reportUrl3.searchParams.set('group_by', 'source');
    reportUrl3.searchParams.set('metrics', 'clicks,conversions,cost,revenue');
    
    console.log('🌐 URL:', reportUrl3.toString());
    
    const response3 = await fetch(reportUrl3.toString());
    const data3 = await response3.json();
    
    console.log('✅ Status:', response3.status);
    console.log('📊 Tipo de resposta:', typeof data3);
    console.log('📊 É array?', Array.isArray(data3));
    console.log('📊 Tem propriedade data?', data3 && data3.data ? 'SIM' : 'NÃO');
    
    if (Array.isArray(data3)) {
      console.log('📊 Tamanho do array:', data3.length);
      if (data3.length > 0) {
        console.log('📋 Primeiro item:');
        console.log(JSON.stringify(data3[0], null, 2));
      }
    } else if (data3 && data3.data && Array.isArray(data3.data)) {
      console.log('📊 Tamanho do array data:', data3.data.length);
      if (data3.data.length > 0) {
        console.log('📋 Primeiro item:');
        console.log(JSON.stringify(data3.data[0], null, 2));
      }
    } else {
      console.log('📋 Estrutura completa:');
      console.log(JSON.stringify(data3, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🏁 Testes de estrutura concluídos!');
}

// Executar testes
if (require.main === module) {
  testRedTrackStructure().catch(console.error);
}

module.exports = { testRedTrackStructure }; 