import fetch from 'node-fetch';

// Configurações de teste
const API_KEY = 'kXlmMfpINGQqv4btkwRL'; // Chave de teste
const BASE_URL = 'https://api.redtrack.io';

// Função para testar endpoint /report
async function testReportEndpoint() {
  console.log('🔍 Testando endpoint /report...');
  
  const params = {
    api_key: API_KEY,
    date_from: '2025-08-01',
    date_to: '2025-08-16',
    group_by: 'source',
    metrics: 'cost,clicks,conversions,revenue'
  };
  
  const url = `${BASE_URL}/report?${new URLSearchParams(params)}`;
  console.log('📡 URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      console.log('✅ Tipo:', typeof data);
      console.log('✅ É array?', Array.isArray(data));
      console.log('✅ Tamanho:', Array.isArray(data) ? data.length : 'N/A');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Primeiro item:', data[0]);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

// Função para testar endpoint /campaigns
async function testCampaignsEndpoint() {
  console.log('\n🔍 Testando endpoint /campaigns...');
  
  const params = {
    api_key: API_KEY,
    date_from: '2025-08-01',
    date_to: '2025-08-16',
    group_by: 'campaign'
  };
  
  const url = `${BASE_URL}/campaigns?${new URLSearchParams(params)}`;
  console.log('📡 URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      console.log('✅ Tipo:', typeof data);
      console.log('✅ É array?', Array.isArray(data));
      console.log('✅ Tamanho:', Array.isArray(data) ? data.length : 'N/A');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Primeira campanha:', data[0]);
        console.log('✅ Campos disponíveis:', Object.keys(data[0]));
      } else if (data && typeof data === 'object') {
        console.log('✅ Estrutura:', Object.keys(data));
        if (data.data && Array.isArray(data.data)) {
          console.log('✅ data.data:', data.data.length, 'itens');
          if (data.data.length > 0) {
            console.log('✅ Primeira campanha em data.data:', data.data[0]);
          }
        }
        if (data.campaigns && Array.isArray(data.campaigns)) {
          console.log('✅ data.campaigns:', data.campaigns.length, 'itens');
          if (data.campaigns.length > 0) {
            console.log('✅ Primeira campanha em data.campaigns:', data.campaigns[0]);
          }
        }
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

// Função para testar endpoint /dashboard
async function testDashboardEndpoint() {
  console.log('\n🔍 Testando endpoint /dashboard...');
  
  const params = {
    api_key: API_KEY,
    date_from: '2025-08-01',
    date_to: '2025-08-16'
  };
  
  const url = `${BASE_URL}/dashboard?${new URLSearchParams(params)}`;
  console.log('📡 URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      console.log('✅ Tipo:', typeof data);
      console.log('✅ Campos disponíveis:', Object.keys(data));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

// Função para testar diferentes períodos
async function testDifferentPeriods() {
  console.log('\n🔍 Testando diferentes períodos...');
  
  const periods = [
    { name: 'Hoje', date_from: '2025-08-16', date_to: '2025-08-16' },
    { name: 'Este mês', date_from: '2025-08-01', date_to: '2025-08-16' },
    { name: 'Mês passado', date_from: '2025-07-01', date_to: '2025-07-31' },
    { name: 'Últimos 7 dias', date_from: '2025-08-10', date_to: '2025-08-16' }
  ];
  
  for (const period of periods) {
    console.log(`\n📅 Testando período: ${period.name}`);
    
    const params = {
      api_key: API_KEY,
      date_from: period.date_from,
      date_to: period.date_to,
      group_by: 'source',
      metrics: 'cost,clicks,conversions,revenue'
    };
    
    const url = `${BASE_URL}/report?${new URLSearchParams(params)}`;
    console.log('📡 URL:', url);
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${period.name}: ${Array.isArray(data) ? data.length : 'N/A'} itens`);
      } else {
        console.log(`❌ ${period.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${period.name}: ${error.message}`);
    }
  }
}

// Função principal
async function runTests() {
  console.log('🚀 Iniciando testes da API do RedTrack...\n');
  
  try {
    await testReportEndpoint();
    await testCampaignsEndpoint();
    await testDashboardEndpoint();
    await testDifferentPeriods();
    
    console.log('\n✅ Todos os testes concluídos!');
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error);
  }
}

// Executar testes
runTests();
