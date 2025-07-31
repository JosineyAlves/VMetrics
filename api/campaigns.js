// Cache em memória para evitar múltiplas requisições
const requestCache = new Map();
const CACHE_DURATION = 300000; // 5 minutos

// Controle de rate limiting otimizado
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo
let requestQueue = [];
let isProcessingQueue = false;

// Cache específico para dados de campanhas
const campaignDataCache = new Map();
const CAMPAIGN_CACHE_DURATION = 600000; // 10 minutos

// Função para processar fila de requisições otimizada
async function processRequestQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { resolve, reject, url, headers } = requestQueue.shift();
    
    try {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
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

// Função auxiliar para obter datas
function getDates() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfMonthStr = firstDayOfMonth.toISOString().split('T')[0];
  
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = lastMonth.toISOString().split('T')[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
  
  return {
    today,
    yesterday: yesterdayStr,
    thisMonth: firstDayOfMonthStr,
    lastMonthStart,
    lastMonthEnd
  };
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

  const cacheKey = `campaigns_${JSON.stringify(params)}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    return res.status(200).json(cachedData.data);
  }

  try {
    const dates = getDates();
    
    // Buscar dados para diferentes períodos
    async function fetchPeriodData(dateFrom, dateTo) {
      const url = new URL('https://api.redtrack.io/campaigns');
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('date_from', dateFrom);
      url.searchParams.set('date_to', dateTo);
      url.searchParams.set('with_clicks', 'true');
      url.searchParams.set('total', 'true');
      
      return new Promise((resolve, reject) => {
        requestQueue.push({ 
          resolve, 
          reject, 
          url: url.toString(), 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'TrackView-Dashboard/1.0'
          }
        });
        processRequestQueue();
      });
    }

    // Buscar dados para todos os períodos em paralelo
    const [todayData, yesterdayData, thisMonthData, lastMonthData] = await Promise.all([
      fetchPeriodData(dates.today, dates.today),
      fetchPeriodData(dates.yesterday, dates.yesterday),
      fetchPeriodData(dates.thisMonth, dates.today),
      fetchPeriodData(dates.lastMonthStart, dates.lastMonthEnd)
    ]);

    // Função para calcular métricas de um período
    function calculatePeriodMetrics(data) {
      return data.reduce((acc, campaign) => {
        const stat = campaign.stat || {};
        acc.ad_spend += stat.cost || 0;
        acc.revenue += stat.revenue || 0;
        acc.roas = acc.ad_spend > 0 ? acc.revenue / acc.ad_spend : 0;
        return acc;
      }, { ad_spend: 0, revenue: 0, roas: 0 });
    }

    // Calcular métricas para cada período
    const todayMetrics = calculatePeriodMetrics(todayData);
    const yesterdayMetrics = calculatePeriodMetrics(yesterdayData);
    const thisMonthMetrics = calculatePeriodMetrics(thisMonthData);
    const lastMonthMetrics = calculatePeriodMetrics(lastMonthData);

    // Função para obter top 3 campanhas de um período
    function getTopCampaigns(data) {
      return data
        .map(campaign => ({
          name: campaign.title || '',
          conversions: (campaign.stat && campaign.stat.conversions) || 0,
          revenue: (campaign.stat && campaign.stat.revenue) || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);
    }

    // Estruturar resposta no formato do dashboard do RedTrack
    const response = {
      metric_categories: [
        {
          type: "ad_spend",
          values: [
            {
              period: "today",
              trend: todayMetrics.ad_spend < yesterdayMetrics.ad_spend ? "fall" : "rise",
              value: todayMetrics.ad_spend
            },
            {
              period: "yesterday",
              value: yesterdayMetrics.ad_spend
            },
            {
              period: "this_month",
              value: thisMonthMetrics.ad_spend
            },
            {
              period: "last_month",
              value: lastMonthMetrics.ad_spend
            }
          ]
        },
        {
          type: "revenue",
          values: [
            {
              period: "today",
              trend: todayMetrics.revenue < yesterdayMetrics.revenue ? "fall" : "rise",
              value: todayMetrics.revenue
            },
            {
              period: "yesterday",
              value: yesterdayMetrics.revenue
            },
            {
              period: "this_month",
              value: thisMonthMetrics.revenue
            },
            {
              period: "last_month",
              value: lastMonthMetrics.revenue
            }
          ]
        },
        {
          type: "roas",
          values: [
            {
              period: "today",
              trend: todayMetrics.roas < yesterdayMetrics.roas ? "fall" : "rise",
              value: todayMetrics.roas
            },
            {
              period: "yesterday",
              value: yesterdayMetrics.roas
            },
            {
              period: "this_month",
              value: thisMonthMetrics.roas
            },
            {
              period: "last_month",
              value: lastMonthMetrics.roas
            }
          ]
        }
      ],
      performance_categories: [
        {
          type: "campaigns",
          values: [
            {
              type: "today",
              values: getTopCampaigns(todayData)
            },
            {
              type: "yesterday",
              values: getTopCampaigns(yesterdayData)
            }
          ]
        }
      ],
      // Manter a lista completa de campanhas para compatibilidade
      campaigns: todayData.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        source_title: campaign.source_title || '',
        status: campaign.status === 1 ? 'active' : 
                campaign.status === 2 ? 'paused' : 
                campaign.status === 3 ? 'deleted' : 'inactive',
        stat: campaign.stat || {}
      }))
    };

    // Salvar no cache
    requestCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Campaigns API - Erro geral:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
} 