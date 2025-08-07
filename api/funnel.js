// Cache em memória para evitar múltiplas requisições
const requestCache = new Map();
const CACHE_DURATION = 60000; // 60 segundos

// Controle de rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre requisições
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
      
      console.log('⏳ [FUNNEL] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [FUNNEL] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [FUNNEL] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [FUNNEL] Rate limiting persistente - retornando dados vazios');
            resolve({ items: [], total: 0, message: 'Rate limiting - tente novamente em alguns segundos.' });
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
      console.error('❌ [FUNNEL] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function handler(req, res) {
  console.log('🔍 [FUNNEL] Requisição recebida:', req.method, req.url)
  console.log('🔍 [FUNNEL] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [FUNNEL] Authorization header:', req.headers['authorization'])
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [FUNNEL] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  const params = { ...req.query };
  let apiKey = params.api_key;
  
  // Permitir também via Authorization header
  if (!apiKey) {
    const authHeader = req.headers['authorization']
    apiKey = authHeader ? authHeader.replace('Bearer ', '') : null
  }

  console.log('🔍 [FUNNEL] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.error('❌ [FUNNEL] API Key não fornecida')
    return res.status(401).json({ 
      error: 'API Key é obrigatória',
      message: 'Forneça a API Key via query parameter api_key ou Authorization header'
    })
  }

  try {
    // Extrair parâmetros da query
    const {
      date_from,
      date_to,
      campaign_id,
      status = 'APPROVED',
      type = 'conversion',
      per = 100
    } = req.query

    // Validar parâmetros obrigatórios
    if (!date_from || !date_to) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios',
        message: 'date_from e date_to são obrigatórios'
      })
    }

    console.log('🔍 [FUNNEL] Parâmetros recebidos:', {
      date_from,
      date_to,
      campaign_id,
      status,
      type,
      per
    })

    // Verificar se é uma atualização forçada
    const isForceRefresh = req.query.force_refresh === 'true' || req.query._t;
    
    // Criar cache key
    const cacheKey = `funnel_${apiKey}_${date_from}_${date_to}_${campaign_id || 'all'}_${status}_${type}_${per}`
    
    // Verificar cache
    const cachedData = requestCache.get(cacheKey)
    if (!isForceRefresh && cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('✅ [FUNNEL] Retornando dados do cache')
      return res.status(200).json(cachedData.data)
    }
    
    // Se for atualização forçada, limpar cache
    if (isForceRefresh) {
      console.log('🔄 [FUNNEL] Atualização forçada - ignorando cache')
      requestCache.delete(cacheKey)
    }

    // Buscar dados de campanhas do RedTrack
    const campaignsParams = new URLSearchParams({
      api_key: apiKey,
      date_from,
      date_to,
      per: per.toString(),
      with_clicks: 'true',
      total: 'true',
      timezone: 'America/Sao_Paulo'
    })

    const campaignsUrl = `https://api.redtrack.io/campaigns?${campaignsParams.toString()}`
    console.log('🔍 [FUNNEL] URL campanhas:', campaignsUrl)

    // Fazer requisição para buscar campanhas usando a mesma estrutura do campaigns.js
    const campaignsResponse = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: campaignsUrl, 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0'
        }
      });
      processRequestQueue();
    });

    if (!campaignsResponse) {
      console.error('❌ [FUNNEL] Erro na API de campanhas: resposta vazia')
      return res.status(500).json({
        error: 'Erro ao buscar campanhas',
        message: 'Resposta vazia da API'
      })
    }

    console.log('✅ [FUNNEL] Dados de campanhas recebidos:', {
      total: campaignsResponse.total || 0,
      items: campaignsResponse.items?.length || 0
    })

    // Processar dados do funil baseado nas campanhas
    const funnelData = processFunnelDataFromCampaigns(campaignsResponse.items || [], campaign_id)

    // Salvar no cache
    const cacheData = {
      timestamp: Date.now(),
      data: funnelData
    }
    requestCache.set(cacheKey, cacheData)

    console.log('✅ [FUNNEL] Dados do funil processados:', funnelData)

    return res.status(200).json(funnelData)

  } catch (error) {
    console.error('❌ [FUNNEL] Erro interno:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    })
  }
}

// Função para processar dados do funil baseado nas campanhas
function processFunnelDataFromCampaigns(campaigns, selectedCampaignId) {
  console.log('🔍 [FUNNEL] Processando dados do funil baseado em campanhas...')
  
  // Se um campaign_id específico foi fornecido, filtrar apenas essa campanha
  let targetCampaigns = campaigns
  if (selectedCampaignId) {
    targetCampaigns = campaigns.filter(campaign => campaign.id == selectedCampaignId)
    console.log('🔍 [FUNNEL] Filtrando campanha específica:', selectedCampaignId)
  }

  if (targetCampaigns.length === 0) {
    console.log('⚠️ [FUNNEL] Nenhuma campanha encontrada')
    return {
      stages: [],
      totalVolume: 0,
      totalConversionRate: 0,
      totalStages: 0,
      summary: {
        totalClicks: 0,
        totalConversions: 0,
        totalConversionRate: '0%'
      },
      message: 'Nenhuma campanha foi encontrada'
    }
  }

  // Agregar dados de todas as campanhas selecionadas
  const aggregatedStats = targetCampaigns.reduce((acc, campaign) => {
    const stat = campaign.stat || {}
    
    return {
      clicks: acc.clicks + (stat.clicks || 0),
      unique_clicks: acc.unique_clicks + (stat.unique_clicks || 0),
      prelp_views: acc.prelp_views + (stat.prelp_views || 0),
      lp_views: acc.lp_views + (stat.lp_views || 0),
      lp_clicks: acc.lp_clicks + (stat.lp_clicks || 0),
      conversions: acc.conversions + (stat.conversions || 0),
      approved: acc.approved + (stat.approved || 0),
      pending: acc.pending + (stat.pending || 0),
      declined: acc.declined + (stat.declined || 0),
      revenue: acc.revenue + (stat.revenue || 0),
      cost: acc.cost + (stat.cost || 0)
    }
  }, {
    clicks: 0,
    unique_clicks: 0,
    prelp_views: 0,
    lp_views: 0,
    lp_clicks: 0,
    conversions: 0,
    approved: 0,
    pending: 0,
    declined: 0,
    revenue: 0,
    cost: 0
  })

  console.log('🔍 [FUNNEL] Estatísticas agregadas:', aggregatedStats)

  // Construir estágios do funil
  const stages = []

  // Sempre incluir cliques como primeiro estágio
  if (aggregatedStats.clicks > 0) {
    stages.push({
      name: 'Cliques',
      value: aggregatedStats.clicks,
      percentage: 100,
      description: 'Total de cliques recebidos'
    })
  }

  // Detectar Pre-LP se houver dados
  if (aggregatedStats.prelp_views > 0) {
    const prelpRate = aggregatedStats.clicks > 0 ? (aggregatedStats.prelp_views / aggregatedStats.clicks) * 100 : 0
    stages.push({
      name: 'Pre-LP',
      value: aggregatedStats.prelp_views,
      percentage: prelpRate,
      description: 'Visualizações da página pré-landing'
    })
  }

  // Detectar LP se houver dados
  if (aggregatedStats.lp_views > 0) {
    const baseValue = aggregatedStats.prelp_views > 0 ? aggregatedStats.prelp_views : aggregatedStats.clicks
    const lpRate = baseValue > 0 ? (aggregatedStats.lp_views / baseValue) * 100 : 0
    stages.push({
      name: 'LP',
      value: aggregatedStats.lp_views,
      percentage: lpRate,
      description: 'Visualizações da landing page'
    })
  }

  // Detectar Offer (usando lp_clicks como proxy para offer views/clicks)
  if (aggregatedStats.lp_clicks > 0) {
    const baseValue = aggregatedStats.lp_views > 0 ? aggregatedStats.lp_views : 
                     (aggregatedStats.prelp_views > 0 ? aggregatedStats.prelp_views : aggregatedStats.clicks)
    const offerRate = baseValue > 0 ? (aggregatedStats.lp_clicks / baseValue) * 100 : 0
    stages.push({
      name: 'Offer',
      value: aggregatedStats.lp_clicks,
      percentage: offerRate,
      description: 'Cliques na oferta (via landing page)'
    })
  }

  // Sempre incluir conversões finais (apenas aprovadas)
  if (aggregatedStats.approved > 0) {
    const baseValue = aggregatedStats.lp_clicks > 0 ? aggregatedStats.lp_clicks :
                     (aggregatedStats.lp_views > 0 ? aggregatedStats.lp_views : 
                     (aggregatedStats.prelp_views > 0 ? aggregatedStats.prelp_views : aggregatedStats.clicks))
    const conversionRate = baseValue > 0 ? (aggregatedStats.approved / baseValue) * 100 : 0
    stages.push({
      name: 'Conversão',
      value: aggregatedStats.approved,
      percentage: conversionRate,
      description: 'Conversões aprovadas'
    })
  }

  // Calcular métricas resumidas
  const totalVolume = stages.length > 0 ? stages[0].value : 0
  const totalConversionRate = stages.length > 0 && totalVolume > 0 
    ? (stages[stages.length - 1].value / totalVolume) * 100 
    : 0

  console.log('✅ [FUNNEL] Estágios detectados:', stages.length)
  console.log('✅ [FUNNEL] Taxa de conversão total:', totalConversionRate.toFixed(2) + '%')

  return {
    stages,
    totalVolume,
    totalConversionRate,
    totalStages: stages.length,
    summary: {
      totalClicks: aggregatedStats.clicks,
      totalConversions: aggregatedStats.approved,
      totalConversionRate: totalConversionRate.toFixed(2) + '%'
    },
    campaigns: targetCampaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      source_title: campaign.source_title || ''
    }))
  }
} 