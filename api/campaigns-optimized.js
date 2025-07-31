// Cache para requisições
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Fila de requisições para rate limiting
const requestQueue = [];
let isProcessingQueue = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre requisições

async function processRequestQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    
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
      
      let retryCount = 0;
      const maxRetries = 3;
      let retryResponse;
      
      while (retryCount < maxRetries) {
        try {
          retryResponse = await fetch(request.url, {
            method: 'GET',
            headers: request.headers
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            lastRequestTime = Date.now();
            request.resolve(data);
            break;
          } else if (retryResponse.status === 429) {
            console.log(`⚠️ [CAMPAIGNS] Rate limiting (429) - tentativa ${retryCount + 1}/${maxRetries}`);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 5000 * retryCount));
            }
          } else {
            console.log(`❌ [CAMPAIGNS] Erro HTTP ${retryResponse.status}`);
            request.reject(new Error(`HTTP ${retryResponse.status}`));
            break;
          }
        } catch (error) {
          console.log(`❌ [CAMPAIGNS] Erro de rede - tentativa ${retryCount + 1}/${maxRetries}:`, error.message);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          } else {
            request.reject(error);
          }
        }
      }
      
      if (retryCount >= maxRetries && !retryResponse?.ok) {
        console.log('⚠️ [CAMPAIGNS] Rate limiting persistente - retornando dados vazios');
        request.resolve({ items: [], total: 0 });
        continue;
      }
      
    } catch (error) {
      console.error('❌ [CAMPAIGNS] Erro ao processar requisição:', error);
      request.reject(error);
    }
  }
  
  isProcessingQueue = false;
}

// ABORDAGEM MAIS SIMPLES: Usar diretamente o endpoint /campaigns
async function getCampaignsWithStats(apiKey) {
  console.log('Campaigns API - Obtendo campanhas com estatísticas...');
  
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
  return campaignsData;
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
    console.log('Campaigns API - Abordagem simplificada: usar /campaigns diretamente...');
    
    // PASSO 1: Obter campanhas com estatísticas já incluídas
    console.log('Campaigns API - Passo 1: Obtendo campanhas com estatísticas...');
    const campaignsData = await getCampaignsWithStats(apiKey);
    
    // PASSO 2: Processar dados das campanhas
    console.log('Campaigns API - Passo 2: Processando dados das campanhas...');
    
    let processedData = [];
    
    for (const campaign of campaignsData) {
      try {
        console.log(`Campaigns API - Processando campanha: ${campaign.title} (ID: ${campaign.id})`);
        
        // Mapear status numérico para string baseado na documentação do RedTrack
        let statusString = 'inactive';
        if (campaign.status === 1) {
          statusString = 'active';
        } else if (campaign.status === 2) {
          statusString = 'paused';
        } else if (campaign.status === 3) {
          statusString = 'deleted';
        }
        
        // Usar dados estatísticos já fornecidos pela API
        const stat = campaign.stat || {};
        const clicks = stat.clicks || 0;
        const uniqueClicks = stat.unique_clicks || 0;
        const conversions = stat.conversions || 0;
        const cost = stat.cost || 0;
        const revenue = stat.revenue || 0;
        const cpc = stat.cpc || 0;
        
        // Calcular métricas derivadas se não estiverem disponíveis
        const profit = revenue - cost;
        const roi = cost > 0 ? (profit / cost) * 100 : 0;
        const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
        const calculatedCpc = clicks > 0 ? cost / clicks : 0;
        const cpa = conversions > 0 ? cost / conversions : 0;
        const epc = clicks > 0 ? revenue / clicks : 0;
        const epl = clicks > 0 ? profit / clicks : 0;
        const roas = cost > 0 ? (revenue / cost) * 100 : 0;
        
        processedData.push({
          id: campaign.id,
          title: campaign.title,
          source_title: campaign.source_title || '',
          status: statusString,
          stat: {
            clicks,
            unique_clicks: uniqueClicks,
            conversions,
            all_conversions: conversions,
            approved: stat.approved || 0,
            pending: stat.pending || 0,
            declined: stat.declined || 0,
            revenue,
            cost,
            impressions: stat.impressions || 0,
            ctr: stat.ctr || 0,
            conversion_rate: conversionRate,
            profit,
            roi,
            cpc: cpc || calculatedCpc, // Usar CPC da API se disponível, senão calcular
            cpa,
            epc,
            epl,
            roas
          }
        });
        
      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${campaign.title}:`, error);
        // Adicionar campanha com dados zerados em caso de erro
        processedData.push({
          id: campaign.id,
          title: campaign.title,
          source_title: campaign.source_title || '',
          status: 'inactive',
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
            epc: 0,
            epl: 0,
            roas: 0
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