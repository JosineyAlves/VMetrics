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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const params = { ...req.query };
  let apiKey = params.api_key;
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' });
  }

  // Verificar se é uma atualização forçada
  const isForceRefresh = params.force_refresh === 'true';
  
  const cacheKey = `campaigns_${JSON.stringify(params)}`;
  const cachedData = requestCache.get(cacheKey);
  
  // Se não for atualização forçada e há cache válido, usar cache
  if (!isForceRefresh && cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [CAMPAIGNS] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }
  
  // Se for atualização forçada, limpar cache
  if (isForceRefresh) {
    console.log('🔄 [CAMPAIGNS] Atualização forçada - ignorando cache');
    requestCache.delete(cacheKey);
  }

  try {
    console.log('=== CAMPAIGNS API DEBUG START ===');
    
    // Obter datas para comparação
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];
    const firstDayOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0];

    // PASSO 1: Obter dados do dashboard para métricas de performance
    console.log('Campaigns API - Buscando dados do dashboard...');
    let dashboardData = null;
    try {
      const dashboardUrl = new URL('https://api.redtrack.io/dashboard');
      dashboardUrl.searchParams.set('api_key', apiKey);
      dashboardUrl.searchParams.set('date_from', params.date_from || today);
      dashboardUrl.searchParams.set('date_to', params.date_to || today);
      
      dashboardData = await new Promise((resolve, reject) => {
        requestQueue.push({ 
          resolve, 
          reject, 
          url: dashboardUrl.toString(), 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'TrackView-Dashboard/1.0'
          }
        });
        processRequestQueue();
      });
      console.log('Campaigns API - Dados do dashboard obtidos com sucesso');
    } catch (error) {
      console.warn('Campaigns API - Erro ao buscar dados do dashboard:', error);
      console.log('Campaigns API - Continuando sem dados de performance...');
    }

    // PASSO 2: Obter lista de campanhas com dados stat
    console.log('Campaigns API - Buscando lista de campanhas com dados stat...');
    const campaignsUrl = new URL('https://api.redtrack.io/campaigns');
    campaignsUrl.searchParams.set('api_key', apiKey);
    campaignsUrl.searchParams.set('date_from', params.date_from || today);
    campaignsUrl.searchParams.set('date_to', params.date_to || today);
    campaignsUrl.searchParams.set('with_clicks', 'true');
    campaignsUrl.searchParams.set('total', 'true');
    
    const campaignsResponse = await new Promise((resolve, reject) => {
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

    // PASSO 3: Processar dados das campanhas e adicionar métricas de performance
    console.log('Campaigns API - Processando dados...');
    console.log('Campaigns API - Resposta da API de campanhas:', campaignsResponse);
    
    // Extrair array de campanhas da resposta
    let campaignsData = [];
    if (campaignsResponse) {
      if (Array.isArray(campaignsResponse)) {
        campaignsData = campaignsResponse;
      } else if (campaignsResponse.items && Array.isArray(campaignsResponse.items)) {
        campaignsData = campaignsResponse.items;
      } else if (campaignsResponse.data && Array.isArray(campaignsResponse.data)) {
        campaignsData = campaignsResponse.data;
      } else {
        console.warn('Campaigns API - Formato de resposta inesperado:', campaignsResponse);
      }
    }
    
    const processedData = campaignsData.map(campaign => {
      // Mapear status
      let statusString = 'inactive';
      if (campaign.status === 1) statusString = 'active';
      else if (campaign.status === 2) statusString = 'paused';
      else if (campaign.status === 3) statusString = 'deleted';
      
      // Usar stat da campanha
      const stat = campaign.stat || {
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
      };
      
      // Debug: verificar dados de funil
      console.log(`🔍 [CAMPAIGNS API] Campanha: ${campaign.title}`);
      console.log(`🔍 [CAMPAIGNS API] Stat keys:`, Object.keys(stat));
      console.log(`🔍 [CAMPAIGNS API] Funnel data:`, {
        prelp_views: stat.prelp_views,
        prelp_clicks: stat.prelp_clicks,
        lp_views: stat.lp_views,
        lp_clicks: stat.lp_clicks,
        initiatecheckout: stat.initiatecheckout
      });
      
      return {
        id: campaign.id,
        title: campaign.title,
        source_title: campaign.source_title || '',
        status: statusString,
        stat: stat
      };
    });

    // PASSO 4: Adicionar dados de performance comparativa
    let performanceData = {
      campaigns: { today: [], yesterday: [] },
      ads: { today: [], yesterday: [] },
      offers: { today: [], yesterday: [] },
      metrics: {
        ad_spend: [],
        revenue: [],
        roas: []
      }
    };

    if (dashboardData && dashboardData.performance_categories && dashboardData.metric_categories) {
      try {
        performanceData = {
          campaigns: {
            today: dashboardData.performance_categories
              .find(cat => cat.type === 'campaigns')?.values
              .find(val => val.type === 'today')?.values || [],
            yesterday: dashboardData.performance_categories
              .find(cat => cat.type === 'campaigns')?.values
              .find(val => val.type === 'yesterday')?.values || []
          },
          ads: {
            today: dashboardData.performance_categories
              .find(cat => cat.type === 'ads')?.values
              .find(val => val.type === 'today')?.values || [],
            yesterday: dashboardData.performance_categories
              .find(cat => cat.type === 'ads')?.values
              .find(val => val.type === 'yesterday')?.values || []
          },
          offers: {
            today: dashboardData.performance_categories
              .find(cat => cat.type === 'offers')?.values
              .find(val => val.type === 'today')?.values || [],
            yesterday: dashboardData.performance_categories
              .find(cat => cat.type === 'offers')?.values
              .find(val => val.type === 'yesterday')?.values || []
          },
          metrics: {
            ad_spend: dashboardData.metric_categories
              .find(cat => cat.type === 'ad_spend')?.values || [],
            revenue: dashboardData.metric_categories
              .find(cat => cat.type === 'revenue')?.values || [],
            roas: dashboardData.metric_categories
              .find(cat => cat.type === 'roas')?.values || []
          }
        };
      } catch (error) {
        console.warn('Campaigns API - Erro ao processar dados de performance:', error);
        console.log('Campaigns API - Usando dados de performance vazios...');
      }
    } else {
      console.log('Campaigns API - Dados do dashboard não disponíveis, usando dados vazios...');
    }

    const response = {
      campaigns: processedData,
      performance: performanceData
    };

    // Salvar no cache
    requestCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    console.log('=== CAMPAIGNS API DEBUG END ===');
    res.status(200).json(response);

  } catch (error) {
    console.error('Campaigns API - Erro geral:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
} 