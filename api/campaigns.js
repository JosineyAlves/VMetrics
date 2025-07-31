// Cache em memória para evitar múltiplas requisições
const requestCache = new Map();
const CACHE_DURATION = 300000; // 5 minutos (aumentado de 1 minuto)

// Controle de rate limiting otimizado
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Reduzido de 5 segundos para 1 segundo
let requestQueue = [];
let isProcessingQueue = false;

// Cache específico para dados de campanhas
const campaignDataCache = new Map();
const CAMPAIGN_CACHE_DURATION = 600000; // 10 minutos para dados de campanhas

// Função para processar fila de requisições otimizada
async function processRequestQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { resolve, reject, url, headers } = requestQueue.shift();
    
    try {
      // Aguardar intervalo mínimo entre requisições (reduzido)
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
          console.log('⚠️ [CAMPAIGNS] Rate limiting detectado - aguardando 2 segundos...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
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

  // Verificar cache otimizado
  const cacheKey = `campaigns_${JSON.stringify(params)}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [CAMPAIGNS] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('=== CAMPAIGNS API DEBUG START ===');
    console.log('Campaigns API - Nova abordagem: usar endpoint /report com group_by=campaign...');
    
    const dateFrom = params.date_from || new Date().toISOString().split('T')[0];
    const dateTo = params.date_to || dateFrom;
    
    console.log('Campaigns API - Data solicitada:', { dateFrom, dateTo });
    
    // PASSO 1: Obter lista de campanhas (com cache específico)
    const campaignsCacheKey = `campaigns_list_${apiKey}_${dateFrom}_${dateTo}`;
    let campaignsData = campaignDataCache.get(campaignsCacheKey);
    
    if (!campaignsData || (Date.now() - campaignsData.timestamp) > CAMPAIGN_CACHE_DURATION) {
      console.log('Campaigns API - Buscando lista de campanhas da API...');
      const campaignsUrl = new URL('https://api.redtrack.io/campaigns');
      campaignsUrl.searchParams.set('api_key', apiKey);
      
      campaignsData = await new Promise((resolve, reject) => {
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
      
      // Salvar no cache de campanhas
      campaignDataCache.set(campaignsCacheKey, {
        data: campaignsData,
        timestamp: Date.now()
      });
    } else {
      console.log('✅ [CAMPAIGNS] Lista de campanhas retornada do cache');
      campaignsData = campaignsData.data;
    }
    
    console.log('Campaigns API - Campanhas obtidas:', campaignsData.length);
    
    // PASSO 2: Buscar dados agregados por campanha usando /report
    console.log('Campaigns API - Passo 2: Buscando dados por campanha usando /report...');
    
    const reportUrl = new URL('https://api.redtrack.io/report');
    reportUrl.searchParams.set('api_key', apiKey);
    reportUrl.searchParams.set('date_from', dateFrom);
    reportUrl.searchParams.set('date_to', dateTo);
    reportUrl.searchParams.set('group_by', 'campaign');
    
    console.log('Campaigns API - URL do report:', reportUrl.toString());
    
    const reportData = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: reportUrl.toString(), 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0'
        }
      });
      processRequestQueue();
    });
    
    console.log('Campaigns API - Dados do report recebidos:', reportData);
    
    // PASSO 3: Combinar dados das campanhas com dados do report
    console.log('Campaigns API - Passo 3: Combinando dados...');
    
    const processedData = campaignsData.map(campaign => {
      // Buscar dados específicos desta campanha no report
      const campaignReportData = Array.isArray(reportData) ? 
        reportData.find(item => item.campaign_id === campaign.id || item.campaign === campaign.title) : 
        null;
      
      console.log(`Campaigns API - Dados para campanha ${campaign.title}:`, campaignReportData);
      
      // Mapear status numérico para string
      let statusString = 'inactive';
      if (campaign.status === 1) {
        statusString = 'active';
      } else if (campaign.status === 2) {
        statusString = 'paused';
      } else if (campaign.status === 3) {
        statusString = 'deleted';
      }
      
      // Usar dados do report se disponíveis, senão usar dados da campanha
      const stat = campaignReportData || campaign.stat || {};
      
      return {
        id: campaign.id,
        title: campaign.title,
        source_title: campaign.source_title || '',
        status: statusString,
        stat: {
          clicks: stat.clicks || 0,
          unique_clicks: stat.unique_clicks || 0,
          conversions: stat.conversions || 0,
          all_conversions: stat.conversions || 0,
          approved: stat.approved || 0,
          pending: stat.pending || 0,
          declined: stat.declined || 0,
          revenue: stat.revenue || 0,
          cost: stat.cost || 0,
          impressions: stat.impressions || 0,
          ctr: stat.ctr || 0,
          conversion_rate: stat.conversion_rate || 0,
          profit: (stat.revenue || 0) - (stat.cost || 0),
          roi: stat.cost > 0 ? (((stat.revenue || 0) - (stat.cost || 0)) / (stat.cost || 0)) * 100 : 0,
          cpc: stat.cpc || 0,
          cpa: stat.cpa || 0,
          epc: stat.epc || 0,
          epl: stat.epc || 0,
          roas: stat.cost > 0 ? ((stat.revenue || 0) / (stat.cost || 0)) * 100 : 0
        }
      };
    });
    
    console.log('Campaigns API - Dados processados finais:', processedData.length, 'campanhas');
    console.log('=== CAMPAIGNS API DEBUG END ===');
    
    // Salvar no cache principal
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