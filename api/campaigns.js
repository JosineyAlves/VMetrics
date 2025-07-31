// Cache em memória para evitar múltiplas requisições
const requestCache = new Map();
const CACHE_DURATION = 300000; // 5 minutos (aumentado de 60 segundos)

// Controle de rate limiting otimizado
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo entre requisições (reduzido de 5 segundos)
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
            const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            console.log(`⏳ [CAMPAIGNS] Aguardando ${waitTime}ms para rate limiting...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
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
          console.log('⚠️ [CAMPAIGNS] Rate limiting detectado - aguardando 3 segundos...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [CAMPAIGNS] Rate limiting persistente - retornando dados vazios');
          resolve({ items: [], total: 0 });
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

// Função otimizada para buscar dados de múltiplas campanhas em paralelo
async function getCampaignsDataBatch(apiKey, campaigns, dateFrom, dateTo) {
  console.log(`Campaigns API - Buscando dados em lote para ${campaigns.length} campanhas...`);
  
  // Buscar todos os tracks de uma vez
  const tracksUrl = new URL('https://api.redtrack.io/tracks');
  tracksUrl.searchParams.set('api_key', apiKey);
  tracksUrl.searchParams.set('date_from', dateFrom);
  tracksUrl.searchParams.set('date_to', dateTo);
  tracksUrl.searchParams.set('per', '10000'); // Aumentar limite
  
  console.log(`Campaigns API - URL tracks para todas as campanhas:`, tracksUrl.toString());
  
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
  
  // Buscar todas as conversões de uma vez
  const conversionsUrl = new URL('https://api.redtrack.io/conversions');
  conversionsUrl.searchParams.set('api_key', apiKey);
  conversionsUrl.searchParams.set('date_from', dateFrom);
  conversionsUrl.searchParams.set('date_to', dateTo);
  conversionsUrl.searchParams.set('per', '10000'); // Aumentar limite
  
  console.log(`Campaigns API - URL conversions para todas as campanhas:`, conversionsUrl.toString());
  
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
  
  // Processar dados em memória para todas as campanhas
  const tracksArray = tracksData.items || tracksData.data || tracksData || [];
  const conversionsArray = conversionsData.items || conversionsData.data || conversionsData || [];
  
  console.log(`Campaigns API - Dados brutos obtidos: ${tracksArray.length} tracks, ${conversionsArray.length} conversões`);
  
  // Agrupar tracks por campanha
  const tracksByCampaign = {};
  tracksArray.forEach(track => {
    const campaignId = track.campaign_id;
    if (!tracksByCampaign[campaignId]) {
      tracksByCampaign[campaignId] = [];
    }
    tracksByCampaign[campaignId].push(track);
  });
  
  // Agrupar conversões por campanha
  const conversionsByCampaign = {};
  conversionsArray.forEach(conv => {
    const campaignId = conv.campaign_id;
    if (!conversionsByCampaign[campaignId]) {
      conversionsByCampaign[campaignId] = [];
    }
    conversionsByCampaign[campaignId].push(conv);
  });
  
  // Calcular métricas para cada campanha
  const results = campaigns.map(campaign => {
    const campaignTracks = tracksByCampaign[campaign.id] || [];
    const campaignConversions = conversionsByCampaign[campaign.id] || [];
    
    const clicks = campaignTracks.length;
    
    // Calcular unique_clicks
    let uniqueClicks = 0;
    if (campaignTracks.length > 0) {
      const uniqueIdentifiers = new Set();
      campaignTracks.forEach(track => {
        const identifier = track.clickid || track.fingerprint || track.ip;
        if (identifier) {
          uniqueIdentifiers.add(identifier);
        }
      });
      uniqueClicks = uniqueIdentifiers.size;
    }
    
    const conversions = campaignConversions.length;
    
    // Calcular custo total
    const totalCost = campaignTracks.reduce((sum, track) => sum + (track.cost || 0), 0);
    
    // Calcular receita total
    const totalRevenue = campaignConversions.reduce((sum, conv) => sum + (conv.payout || 0), 0);
    
    // Calcular status das conversões
    const statusCounts = {
      approved: 0,
      pending: 0,
      declined: 0,
      other: 0
    };
    
    campaignConversions.forEach(conv => {
      const status = conv.status || 'other';
      if (status === 'approved' || status === 'approve') {
        statusCounts.approved++;
      } else if (status === 'pending' || status === 'pend') {
        statusCounts.pending++;
      } else if (status === 'declined' || status === 'decline') {
        statusCounts.declined++;
      } else {
        statusCounts.other++;
      }
    });
    
    // Calcular métricas derivadas
    const profit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    const ctr = 0; // Não temos dados de impressões
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? totalCost / clicks : 0;
    const cpa = conversions > 0 ? totalCost / conversions : 0;
    const epc = clicks > 0 ? totalRevenue / clicks : 0;
    const epl = clicks > 0 ? profit / clicks : 0;
    const roas = totalCost > 0 ? (totalRevenue / totalCost) * 100 : 0;
    
    // Mapear status numérico para string baseado na documentação do RedTrack
    let statusString = 'inactive';
    if (campaign.status === 1) {
      statusString = 'active';
    } else if (campaign.status === 2) {
      statusString = 'paused';
    } else if (campaign.status === 3) {
      statusString = 'deleted';
    }
    
    return {
      id: campaign.id,
      title: campaign.title,
      source_title: campaign.source_title || '',
      status: statusString,
      stat: {
        clicks,
        unique_clicks: uniqueClicks,
        conversions,
        all_conversions: conversions,
        approved: statusCounts.approved,
        pending: statusCounts.pending,
        declined: statusCounts.declined,
        revenue: totalRevenue,
        cost: totalCost,
        impressions: 0,
        ctr,
        conversion_rate: conversionRate,
        profit,
        roi,
        cpc,
        cpa,
        epc,
        epl,
        roas
      }
    };
  });
  
  console.log(`Campaigns API - Processamento em lote concluído para ${results.length} campanhas`);
  
  return results;
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
    console.log('Campaigns API - Nova abordagem otimizada: processamento em lote...');
    
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
    
    // PASSO 2: Processar todas as campanhas em lote (muito mais rápido)
    console.log('Campaigns API - Passo 2: Processando todas as campanhas em lote...');
    
    const processedData = await getCampaignsDataBatch(apiKey, campaignsData, dateFrom, dateTo);
    
    console.log('Campaigns API - Dados processados finais:', processedData.length, 'campanhas');
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