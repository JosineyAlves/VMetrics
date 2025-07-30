// Script de teste para validar a API de campanhas corrigida
// Execute com: node test-campaigns-api.js

const fetch = require('node-fetch');

async function testCampaignsAPI() {
  console.log('🧪 Iniciando teste da API de campanhas...\n');
  
  // Configurações de teste
  const API_KEY = process.env.REDTRACK_API_KEY || 'sua_api_key_aqui';
  const BASE_URL = 'http://localhost:3000'; // Ajuste conforme necessário
  
  // Datas de teste
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  console.log('📅 Datas de teste:');
  console.log(`   - Hoje: ${today}`);
  console.log(`   - Ontem: ${yesterday}\n`);
  
  // Teste 1: Buscar campanhas de hoje
  console.log('🔍 Teste 1: Buscar campanhas de hoje');
  try {
    const response1 = await fetch(`${BASE_URL}/api/campaigns?api_key=${API_KEY}&date_from=${today}&date_to=${today}`);
    const data1 = await response1.json();
    
    console.log(`✅ Status: ${response1.status}`);
    console.log(`📊 Campanhas encontradas: ${Array.isArray(data1) ? data1.length : 'N/A'}`);
    
    if (Array.isArray(data1) && data1.length > 0) {
      console.log('📋 Primeira campanha:');
      console.log(JSON.stringify(data1[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Erro no teste 1:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 2: Buscar campanhas de ontem
  console.log('🔍 Teste 2: Buscar campanhas de ontem');
  try {
    const response2 = await fetch(`${BASE_URL}/api/campaigns?api_key=${API_KEY}&date_from=${yesterday}&date_to=${yesterday}`);
    const data2 = await response2.json();
    
    console.log(`✅ Status: ${response2.status}`);
    console.log(`📊 Campanhas encontradas: ${Array.isArray(data2) ? data2.length : 'N/A'}`);
    
    if (Array.isArray(data2) && data2.length > 0) {
      console.log('📋 Primeira campanha:');
      console.log(JSON.stringify(data2[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Erro no teste 2:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 3: Validar estrutura de dados
  console.log('🔍 Teste 3: Validar estrutura de dados');
  try {
    const response3 = await fetch(`${BASE_URL}/api/campaigns?api_key=${API_KEY}&date_from=${today}&date_to=${today}`);
    const data3 = await response3.json();
    
    if (Array.isArray(data3) && data3.length > 0) {
      const campaign = data3[0];
      
      console.log('✅ Estrutura da campanha:');
      console.log(`   - ID: ${campaign.id ? '✅' : '❌'}`);
      console.log(`   - Title: ${campaign.title ? '✅' : '❌'}`);
      console.log(`   - Source: ${campaign.source_title ? '✅' : '❌'}`);
      console.log(`   - Status: ${campaign.status ? '✅' : '❌'}`);
      
      if (campaign.stat) {
        console.log('📊 Métricas:');
        console.log(`   - Cliques: ${campaign.stat.clicks !== undefined ? '✅' : '❌'}`);
        console.log(`   - Conversões: ${campaign.stat.conversions !== undefined ? '✅' : '❌'}`);
        console.log(`   - Custo: ${campaign.stat.cost !== undefined ? '✅' : '❌'}`);
        console.log(`   - Receita: ${campaign.stat.revenue !== undefined ? '✅' : '❌'}`);
        console.log(`   - ROI: ${campaign.stat.roi !== undefined ? '✅' : '❌'}`);
        console.log(`   - CTR: ${campaign.stat.ctr !== undefined ? '✅' : '❌'}`);
      } else {
        console.log('❌ Campo "stat" não encontrado');
      }
    } else {
      console.log('⚠️ Nenhuma campanha encontrada para validação');
    }
  } catch (error) {
    console.error('❌ Erro no teste 3:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 4: Comparar com dados brutos da RedTrack
  console.log('🔍 Teste 4: Comparar com dados brutos da RedTrack');
  try {
    // Buscar dados do endpoint /report diretamente
    const redtrackUrl = new URL('https://api.redtrack.io/report');
    redtrackUrl.searchParams.set('api_key', API_KEY);
    redtrackUrl.searchParams.set('date_from', today);
    redtrackUrl.searchParams.set('date_to', today);
    redtrackUrl.searchParams.set('group_by', 'campaign');
    redtrackUrl.searchParams.set('metrics', 'clicks,conversions,cost,revenue,impressions');
    
    console.log('🌐 URL da RedTrack:', redtrackUrl.toString());
    
    const redtrackResponse = await fetch(redtrackUrl.toString());
    const redtrackData = await redtrackResponse.json();
    
    console.log(`✅ Status RedTrack: ${redtrackResponse.status}`);
    console.log(`📊 Campanhas RedTrack: ${redtrackData.data ? redtrackData.data.length : 'N/A'}`);
    
    if (redtrackData.data && redtrackData.data.length > 0) {
      console.log('📋 Primeira campanha RedTrack:');
      console.log(JSON.stringify(redtrackData.data[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Erro no teste 4:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Teste 5: Performance e cache
  console.log('🔍 Teste 5: Performance e cache');
  try {
    const startTime = Date.now();
    const response5 = await fetch(`${BASE_URL}/api/campaigns?api_key=${API_KEY}&date_from=${today}&date_to=${today}`);
    const data5 = await response5.json();
    const endTime = Date.now();
    
    console.log(`⏱️ Tempo de resposta: ${endTime - startTime}ms`);
    console.log(`📊 Dados retornados: ${Array.isArray(data5) ? data5.length : 'N/A'} campanhas`);
    
    // Teste de cache (segunda requisição)
    const startTime2 = Date.now();
    const response6 = await fetch(`${BASE_URL}/api/campaigns?api_key=${API_KEY}&date_from=${today}&date_to=${today}`);
    const data6 = await response6.json();
    const endTime2 = Date.now();
    
    console.log(`⏱️ Tempo de resposta (cache): ${endTime2 - startTime2}ms`);
    console.log(`📊 Dados retornados (cache): ${Array.isArray(data6) ? data6.length : 'N/A'} campanhas`);
    
    if (endTime2 - startTime2 < endTime - startTime) {
      console.log('✅ Cache funcionando corretamente');
    } else {
      console.log('⚠️ Cache pode não estar funcionando');
    }
  } catch (error) {
    console.error('❌ Erro no teste 5:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🏁 Testes concluídos!');
}

// Executar testes
if (require.main === module) {
  testCampaignsAPI().catch(console.error);
}

module.exports = { testCampaignsAPI }; 