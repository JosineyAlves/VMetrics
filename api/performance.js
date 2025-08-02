// Cache em memória para evitar múltiplas requisições
const requestCache = new Map();
const CACHE_DURATION = 300000; // 5 minutos

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
      
      console.log('⏳ [PERFORMANCE] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [PERFORMANCE] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [PERFORMANCE] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [PERFORMANCE] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [PERFORMANCE] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

// Função para processar dados de conversão e extrair performance
function processPerformanceData(conversions) {
  const campaigns = new Map();
  const ads = new Map();
  const offers = new Map();
  
  console.log(`🔍 [PERFORMANCE] Processando ${conversions.length} conversões...`);
  
  conversions.forEach((conversion, index) => {
    // Processar campanhas
    if (conversion.campaign && conversion.campaign_id) {
      const campaignKey = conversion.campaign_id;
      if (!campaigns.has(campaignKey)) {
        campaigns.set(campaignKey, {
          id: campaignKey,
          name: conversion.campaign,
          revenue: 0,
          conversions: 0,
          cost: 0,
          payout: 0
        });
      }
      
      const campaign = campaigns.get(campaignKey);
      campaign.revenue += parseFloat(conversion.payout || 0);
      campaign.conversions += 1;
      campaign.cost += parseFloat(conversion.cost || 0);
      campaign.payout += parseFloat(conversion.payout || 0);
    }
    
    // Processar anúncios (usando rt_ad e rt_ad_id)
    if (conversion.rt_ad && conversion.rt_ad_id && conversion.rt_ad_id !== '{{ad.id}}') {
      const adKey = conversion.rt_ad_id;
      if (!ads.has(adKey)) {
        ads.set(adKey, {
          id: adKey,
          name: conversion.rt_ad,
          revenue: 0,
          conversions: 0,
          cost: 0,
          payout: 0
        });
      }
      
      const ad = ads.get(adKey);
      ad.revenue += parseFloat(conversion.payout || 0);
      ad.conversions += 1;
      ad.cost += parseFloat(conversion.cost || 0);
      ad.payout += parseFloat(conversion.payout || 0);
    }
    
    // Processar ofertas
    if (conversion.offer && conversion.offer_id) {
      const offerKey = conversion.offer_id;
      if (!offers.has(offerKey)) {
        offers.set(offerKey, {
          id: offerKey,
          name: conversion.offer,
          revenue: 0,
          conversions: 0,
          cost: 0,
          payout: 0
        });
      }
      
      const offer = offers.get(offerKey);
      offer.revenue += parseFloat(conversion.payout || 0);
      offer.conversions += 1;
      offer.cost += parseFloat(conversion.cost || 0);
      offer.payout += parseFloat(conversion.payout || 0);
    }
  });
  
  // Converter para arrays e ordenar por conversões (prioridade) e depois por revenue
  const campaignsArray = Array.from(campaigns.values())
    .sort((a, b) => {
      // Primeiro por conversões (decrescente)
      if (b.conversions !== a.conversions) {
        return b.conversions - a.conversions;
      }
      // Se conversões iguais, ordenar por revenue
      return b.revenue - a.revenue;
    })
    .slice(0, 3); // Apenas top 3
    
  const adsArray = Array.from(ads.values())
    .sort((a, b) => {
      // Primeiro por conversões (decrescente)
      if (b.conversions !== a.conversions) {
        return b.conversions - a.conversions;
      }
      // Se conversões iguais, ordenar por revenue
      return b.revenue - a.revenue;
    })
    .slice(0, 3); // Apenas top 3
    
  const offersArray = Array.from(offers.values())
    .sort((a, b) => {
      // Primeiro por conversões (decrescente)
      if (b.conversions !== a.conversions) {
        return b.conversions - a.conversions;
      }
      // Se conversões iguais, ordenar por revenue
      return b.revenue - a.revenue;
    })
    .slice(0, 3); // Apenas top 3
  
  console.log(`✅ [PERFORMANCE] Processamento concluído:`);
  console.log(`   - Campanhas: ${campaignsArray.length} (de ${campaigns.size} total)`);
  console.log(`   - Anúncios: ${adsArray.length} (de ${ads.size} total)`);
  console.log(`   - Ofertas: ${offersArray.length} (de ${offers.size} total)`);
  
  return {
    campaigns: campaignsArray,
    ads: adsArray,
    offers: offersArray
  };
}

export default async function handler(req, res) {
  console.log('🔍 [PERFORMANCE] Requisição recebida:', req.method, req.url)

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [PERFORMANCE] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  let apiKey = authHeader ? authHeader.replace('Bearer ', '') : null

  // Permitir também via query string
  if (!apiKey) {
    if (req.query && req.query.api_key) {
      apiKey = req.query.api_key
    } else if (req.url && req.url.includes('api_key=')) {
      const match = req.url.match(/[?&]api_key=([^&]+)/)
      if (match) {
        apiKey = decodeURIComponent(match[1])
      }
    }
  }

  console.log('🔍 [PERFORMANCE] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [PERFORMANCE] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }

  // Validar parâmetros obrigatórios de data
  const { date_from, date_to } = req.query || {};
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date_from || !date_to || !dateRegex.test(date_from) || !dateRegex.test(date_to)) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: date_from e date_to no formato YYYY-MM-DD' });
  }

  // Verificar cache (ignorar se _t (timestamp) for fornecido)
  const { _t, ...queryParams } = req.query;
  const cacheKey = `performance_${JSON.stringify(queryParams)}`;
  const cachedData = requestCache.get(cacheKey);
  
  // Se não há _t (timestamp) e cache é válido, retornar cache
  if (!_t && cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [PERFORMANCE] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }
  
  // Se _t foi fornecido, limpar cache para forçar refresh
  if (_t) {
    console.log('🔄 [PERFORMANCE] Forçando refresh - ignorando cache');
    requestCache.delete(cacheKey);
  }

  try {
    console.log('🔍 [PERFORMANCE] Buscando dados de conversão para análise de performance...')
    console.log(`📅 Período: ${date_from} até ${date_to}`)
    
    // Buscar todas as conversões do período
    const conversionsUrl = new URL('https://api.redtrack.io/conversions');
    conversionsUrl.searchParams.set('api_key', apiKey);
    conversionsUrl.searchParams.set('date_from', date_from);
    conversionsUrl.searchParams.set('date_to', date_to);
    conversionsUrl.searchParams.set('per', '10000'); // Máximo para pegar todos os dados
    
    console.log('🔍 [PERFORMANCE] URL das conversões:', conversionsUrl.toString());
    
    const conversionsData = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: conversionsUrl.toString(), 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0 (https://my-dash-two.vercel.app)',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      processRequestQueue();
    });

    console.log('🔍 [PERFORMANCE] Dados de conversão recebidos com sucesso');
    
    // Processar dados de conversão para extrair performance
    let performanceData = {
      campaigns: [],
      ads: [],
      offers: []
    };
    
    if (conversionsData && conversionsData.items && conversionsData.items.length > 0) {
      console.log(`🔍 [PERFORMANCE] Processando ${conversionsData.items.length} conversões...`);
      performanceData = processPerformanceData(conversionsData.items);
    } else {
      console.log('🔍 [PERFORMANCE] Nenhuma conversão encontrada para o período');
    }
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: performanceData,
      timestamp: Date.now()
    });
    
    console.log('✅ [PERFORMANCE] Dados de performance processados com sucesso');
    res.status(200).json(performanceData);
    
  } catch (error) {
    console.error('❌ [PERFORMANCE] Erro ao processar dados de performance:', error)
    res.status(500).json({ 
      error: 'Erro ao processar dados de performance',
      details: error.message,
      endpoint: '/performance'
    })
  }
} 