// Cache em memória para evitar múltiplas requisições
const requestCache = new Map();
const CACHE_DURATION = 60000; // 60 segundos

// Controle de rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 segundos entre requisições
let requestQueue = [];
let isProcessingQueue = false;

// Função para processar fila de requisições
async function processRequestQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { resolve, reject, url, headers } = requestQueue.shift();
    
    try {
      // Aguardar intervalo mínimo entre requisições
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
      }
      
      console.log('⏳ [CAMPAIGNS] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [CAMPAIGNS] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [CAMPAIGNS] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [CAMPAIGNS] Rate limiting persistente - retornando dados vazios');
            resolve({ data: [], total: 0 });
            continue;
          }
          
          const retryData = await retryResponse.json();
          resolve(retryData);
        } else {
          reject(new Error(errorData.error || 'Erro na API do RedTrack'));
        }
      } else {
        const data = await response.json();
        resolve(data);
      }
    } catch (error) {
      console.error('❌ [CAMPAIGNS] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

// Função para buscar dados específicos de uma campanha
async function getCampaignData(apiKey, campaignId, dateFrom, dateTo) {
  console.log(`Campaigns API - Buscando dados específicos para campanha ${campaignId}...`);
  
  // Buscar cliques da campanha
  const tracksUrl = new URL('https://api.redtrack.io/tracks');
  tracksUrl.searchParams.set('api_key', apiKey);
  tracksUrl.searchParams.set('date_from', dateFrom);
  tracksUrl.searchParams.set('date_to', dateTo);
  tracksUrl.searchParams.set('campaign_id', campaignId);
  tracksUrl.searchParams.set('per', '1000');
  
  const tracksData = await new Promise((resolve, reject) => {
    requestQueue.push({ 
      resolve, 
      reject, 
      url: tracksUrl.toString(), 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });
    processRequestQueue();
  });
  
  // Buscar conversões da campanha
  const conversionsUrl = new URL('https://api.redtrack.io/conversions');
  conversionsUrl.searchParams.set('api_key', apiKey);
  conversionsUrl.searchParams.set('date_from', dateFrom);
  conversionsUrl.searchParams.set('date_to', dateTo);
  conversionsUrl.searchParams.set('campaign_id', campaignId);
  conversionsUrl.searchParams.set('per', '1000');
  
  const conversionsData = await new Promise((resolve, reject) => {
    requestQueue.push({ 
      resolve, 
      reject, 
      url: conversionsUrl.toString(), 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    });
    processRequestQueue();
  });
  
  // Calcular métricas baseadas nos dados brutos
  // Verificar se os dados estão em tracksData.data ou tracksData diretamente
  const tracksArray = tracksData.data || tracksData;
  const conversionsArray = conversionsData.data || conversionsData;
  
  const clicks = Array.isArray(tracksArray) ? tracksArray.length : 0;
  const uniqueClicks = Array.isArray(tracksArray) ? new Set(tracksArray.map(track => track.clickid)).size : 0;
  const conversions = Array.isArray(conversionsArray) ? conversionsArray.length : 0;
  
  // Calcular custo total (soma dos custos dos cliques)
  const totalCost = Array.isArray(tracksArray) ? 
    tracksArray.reduce((sum, track) => sum + (track.cost || 0), 0) : 0;
  
  // Calcular receita total (soma das receitas das conversões)
  const totalRevenue = Array.isArray(conversionsArray) ? 
    conversionsArray.reduce((sum, conv) => sum + (conv.payout || 0), 0) : 0;
  
  // Calcular métricas derivadas
  const profit = totalRevenue - totalCost;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const ctr = 0; // Não temos dados de impressões
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const cpc = clicks > 0 ? totalCost / clicks : 0;
  const cpa = conversions > 0 ? totalCost / conversions : 0;
  const epc = clicks > 0 ? totalRevenue / clicks : 0;
  
  console.log(`Campaigns API - Dados calculados para campanha ${campaignId}:`);
  console.log(`   - Estrutura tracksData:`, typeof tracksData, tracksData.data ? 'com .data' : 'sem .data');
  console.log(`   - Estrutura conversionsData:`, typeof conversionsData, conversionsData.data ? 'com .data' : 'sem .data');
  console.log(`   - tracksData keys:`, Object.keys(tracksData || {}));
  console.log(`   - conversionsData keys:`, Object.keys(conversionsData || {}));
  console.log(`   - tracksArray length:`, Array.isArray(tracksArray) ? tracksArray.length : 'não é array');
  console.log(`   - conversionsArray length:`, Array.isArray(conversionsArray) ? conversionsArray.length : 'não é array');
  console.log(`   - Cliques: ${clicks}, Únicos: ${uniqueClicks}`);
  console.log(`   - Conversões: ${conversions}`);
  console.log(`   - Custo: ${totalCost}, Receita: ${totalRevenue}`);
  console.log(`   - ROI: ${roi}%, Taxa de conversão: ${conversionRate}%`);
  
  return {
    clicks,
    unique_clicks: uniqueClicks,
    conversions,
    all_conversions: conversions,
    approved: conversions, // Assumindo que todas as conversões são aprovadas
    pending: 0,
    declined: 0,
    revenue: totalRevenue,
    cost: totalCost,
    impressions: 0,
    ctr,
    conversion_rate: conversionRate,
    profit,
    roi,
    cpc,
    cpa,
    epc
  };
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extrai todos os parâmetros da query
  const params = { ...req.query };
  let apiKey = params.api_key;
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' });
  }

  // Verificar cache
  const cacheKey = `campaigns_${JSON.stringify(params)}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [CAMPAIGNS] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('=== CAMPAIGNS API DEBUG START ===');
    console.log('Campaigns API - Nova abordagem: obter campanhas e dados específicos...');
    
    const dateFrom = params.date_from || new Date().toISOString().split('T')[0];
    const dateTo = params.date_to || dateFrom;
    
    console.log('Campaigns API - Data solicitada:', { dateFrom, dateTo });
    
    // PASSO 1: Obter lista de campanhas
    console.log('Campaigns API - Passo 1: Obtendo lista de campanhas...');
    const campaignsUrl = new URL('https://api.redtrack.io/campaigns');
    campaignsUrl.searchParams.set('api_key', apiKey);
    
    const campaignsData = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: campaignsUrl.toString(), 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0'
        }
      });
      processRequestQueue();
    });
    
    console.log('Campaigns API - Campanhas obtidas:', campaignsData.length);
    
    // PASSO 2: Para cada campanha, buscar dados específicos
    console.log('Campaigns API - Passo 2: Buscando dados específicos para cada campanha...');
    
    let processedData = [];
    
    for (const campaign of campaignsData) {
      try {
        console.log(`Campaigns API - Processando campanha: ${campaign.title} (ID: ${campaign.id})`);
        
        // Buscar dados específicos da campanha
        const campaignStats = await getCampaignData(apiKey, campaign.id, dateFrom, dateTo);
        
        processedData.push({
          id: campaign.id,
          title: campaign.title,
          source_title: campaign.source_title || '',
          status: campaign.status === 3 ? 'active' : 'inactive',
          stat: campaignStats
        });
        
        // Aguardar um pouco entre as requisições para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${campaign.title}:`, error);
        // Adicionar campanha com dados zerados em caso de erro
        processedData.push({
          id: campaign.id,
          title: campaign.title,
          source_title: campaign.source_title || '',
          status: campaign.status === 3 ? 'active' : 'inactive',
          stat: {
            clicks: 0,
            unique_clicks: 0,
            conversions: 0,
            all_conversions: 0,
            approved: 0,
            pending: 0,
            declined: 0,
            revenue: 0,
            cost: 0,
            impressions: 0,
            ctr: 0,
            conversion_rate: 0,
            profit: 0,
            roi: 0,
            cpc: 0,
            cpa: 0,
            epc: 0
          }
        });
      }
    }
    
    console.log('Campaigns API - Dados processados finais:', JSON.stringify(processedData, null, 2));
    console.log('=== CAMPAIGNS API DEBUG END ===');
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: processedData,
      timestamp: Date.now()
    });
    
    res.status(200).json(processedData);
  } catch (error) {
    console.error('Campaigns API - Erro geral:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
} 