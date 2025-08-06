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

  const authHeader = req.headers['authorization']
  let apiKey = authHeader ? authHeader.replace('Bearer ', '') : null

  // Permitir também via query string
  if (!apiKey && req.query.api_key) {
    apiKey = req.query.api_key
  }

  console.log('🔍 [FUNNEL] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.error('❌ [FUNNEL] API Key não fornecida')
    return res.status(401).json({ 
      error: 'API Key é obrigatória',
      message: 'Forneça a API Key via Authorization header ou query parameter api_key'
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
      per = 1000
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

    // Criar cache key
    const cacheKey = `funnel_${apiKey}_${date_from}_${date_to}_${campaign_id || 'all'}_${status}_${type}_${per}`
    
    // Verificar cache
    const cachedData = requestCache.get(cacheKey)
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('✅ [FUNNEL] Retornando dados do cache')
      return res.status(200).json(cachedData.data)
    }

    // Adicionar à fila de requisições
    const queuePromise = new Promise((resolve, reject) => {
      requestQueue.push({
        resolve,
        reject,
        url: null, // Será definido abaixo
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
    })

    // Buscar dados de conversões
    const conversionsParams = new URLSearchParams({
      api_key: apiKey,
      date_from,
      date_to,
      per: per.toString(),
      ...(campaign_id && { campaign_id }),
      ...(status && { status }),
      ...(type && { type })
    })

    const conversionsUrl = `https://api.redtrack.io/conversions?${conversionsParams.toString()}`
    console.log('🔍 [FUNNEL] URL conversões:', conversionsUrl)

    // Buscar dados de tracks (cliques)
    const tracksParams = new URLSearchParams({
      api_key: apiKey,
      date_from,
      date_to,
      per: per.toString(),
      ...(campaign_id && { campaign_id })
    })

    const tracksUrl = `https://api.redtrack.io/tracks?${tracksParams.toString()}`
    console.log('🔍 [FUNNEL] URL tracks:', tracksUrl)

    // Fazer requisições paralelas
    const [conversionsResponse, tracksResponse] = await Promise.all([
      fetch(conversionsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(tracksUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
    ])

    if (!conversionsResponse.ok) {
      console.error('❌ [FUNNEL] Erro na API de conversões:', conversionsResponse.status)
      return res.status(conversionsResponse.status).json({
        error: 'Erro ao buscar conversões',
        status: conversionsResponse.status
      })
    }

    if (!tracksResponse.ok) {
      console.error('❌ [FUNNEL] Erro na API de tracks:', tracksResponse.status)
      return res.status(tracksResponse.status).json({
        error: 'Erro ao buscar tracks',
        status: tracksResponse.status
      })
    }

    const [conversionsData, tracksData] = await Promise.all([
      conversionsResponse.json(),
      tracksResponse.json()
    ])

    console.log('✅ [FUNNEL] Dados recebidos:', {
      conversions: conversionsData.items?.length || 0,
      tracks: tracksData.items?.length || 0
    })

    // Processar dados do funil
    const funnelData = processFunnelData(conversionsData.items || [], tracksData.items || [])

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

// Função para processar dados do funil
function processFunnelData(conversions, tracks) {
  console.log('🔍 [FUNNEL] Processando dados do funil...')
  
  // Calcular cliques totais
  const totalClicks = tracks.reduce((sum, track) => sum + (track.clicks || 0), 0)
  console.log('🔍 [FUNNEL] Total de cliques:', totalClicks)

  // Detectar estágios do funil
  const stages = []

  // Sempre incluir cliques como primeiro estágio
  if (totalClicks > 0) {
    stages.push({
      name: 'Cliques',
      value: totalClicks,
      percentage: 100,
      description: 'Total de cliques recebidos'
    })
  }

  // Detectar Pre-LP se houver dados
  const prelpViews = conversions.reduce((sum, conv) => {
    return sum + (conv.prelp_views || conv.pre_landing_views || 0)
  }, 0)
  
  if (prelpViews > 0) {
    const prelpRate = totalClicks > 0 ? (prelpViews / totalClicks) * 100 : 0
    stages.push({
      name: 'Pre-LP',
      value: prelpViews,
      percentage: prelpRate,
      description: 'Visualizações da página pré-landing'
    })
  }

  // Detectar LP se houver dados
  const lpViews = conversions.reduce((sum, conv) => {
    return sum + (conv.lp_views || conv.landing_views || 0)
  }, 0)
  
  if (lpViews > 0) {
    const baseValue = prelpViews > 0 ? prelpViews : totalClicks
    const lpRate = baseValue > 0 ? (lpViews / baseValue) * 100 : 0
    stages.push({
      name: 'LP',
      value: lpViews,
      percentage: lpRate,
      description: 'Visualizações da landing page'
    })
  }

  // Detectar Offer se houver dados
  const offerViews = conversions.reduce((sum, conv) => {
    return sum + (conv.offer_views || conv.offer_clicks || 0)
  }, 0)
  
  if (offerViews > 0) {
    const baseValue = lpViews > 0 ? lpViews : (prelpViews > 0 ? prelpViews : totalClicks)
    const offerRate = baseValue > 0 ? (offerViews / baseValue) * 100 : 0
    stages.push({
      name: 'Offer',
      value: offerViews,
      percentage: offerRate,
      description: 'Visualizações/cliques da oferta'
    })
  }

  // Detectar InitiateCheckout se houver dados
  const initiateCheckouts = conversions.filter(conv => conv.type === 'initiatecheckout').length
  if (initiateCheckouts > 0) {
    const baseValue = offerViews > 0 ? offerViews : (lpViews > 0 ? lpViews : (prelpViews > 0 ? prelpViews : totalClicks))
    const checkoutRate = baseValue > 0 ? (initiateCheckouts / baseValue) * 100 : 0
    stages.push({
      name: 'InitiateCheckout',
      value: initiateCheckouts,
      percentage: checkoutRate,
      description: 'Inícios de checkout'
    })
  }

  // Sempre incluir conversões finais
  const finalConversions = conversions.filter(conv => 
    conv.type === 'conversion' && conv.status === 'APPROVED'
  ).length
  
  if (finalConversions > 0) {
    const baseValue = initiateCheckouts > 0 ? initiateCheckouts : 
                     (offerViews > 0 ? offerViews : 
                     (lpViews > 0 ? lpViews : 
                     (prelpViews > 0 ? prelpViews : totalClicks)))
    const conversionRate = baseValue > 0 ? (finalConversions / baseValue) * 100 : 0
    stages.push({
      name: 'Conversão',
      value: finalConversions,
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
      totalClicks,
      totalConversions: finalConversions,
      totalConversionRate: totalConversionRate.toFixed(2) + '%'
    }
  }
} 