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
      
      console.log('⏳ [INITIATE-CHECKOUT] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [INITIATE-CHECKOUT] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [INITIATE-CHECKOUT] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [INITIATE-CHECKOUT] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [INITIATE-CHECKOUT] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function handler(req, res) {
  console.log('🔍 [INITIATE-CHECKOUT] Requisição recebida:', req.method, req.url)
  console.log('🔍 [INITIATE-CHECKOUT] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [INITIATE-CHECKOUT] Authorization header:', req.headers['authorization'])

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [INITIATE-CHECKOUT] Preflight request - retornando 200')
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

  console.log('🔍 [INITIATE-CHECKOUT] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [INITIATE-CHECKOUT] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }

  // Validar parâmetros obrigatórios de data
  const { date_from, date_to } = req.query || {};
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date_from || !date_to || !dateRegex.test(date_from) || !dateRegex.test(date_to)) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: date_from e date_to no formato YYYY-MM-DD' });
  }

  // Verificar cache
  const cacheKey = `initiate_checkout_${JSON.stringify(req.query)}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [INITIATE-CHECKOUT] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('🔍 [INITIATE-CHECKOUT] Fazendo requisição para RedTrack /conversions com tipo InitiateCheckout...')
    
    // Construir URL com parâmetros para buscar conversões do tipo InitiateCheckout
    const url = new URL('https://api.redtrack.io/conversions');
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('date_from', date_from);
    url.searchParams.set('date_to', date_to);
    // Não filtrar por type, pois vamos processar localmente para pegar convtype1 = 1
    
    // Adicionar parâmetros opcionais se fornecidos
    if (req.query.campaign) {
      url.searchParams.set('campaign', req.query.campaign);
    }
    if (req.query.country) {
      url.searchParams.set('country', req.query.country);
    }
    
    console.log('🔍 [INITIATE-CHECKOUT] URL final:', url.toString());
    console.log('🔍 [INITIATE-CHECKOUT] API Key sendo testada:', apiKey)

    const data = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: url.toString(), 
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

    console.log('🔍 [INITIATE-CHECKOUT] Dados recebidos com sucesso');
    console.log('🔍 [INITIATE-CHECKOUT] Total de conversões recebidas:', data?.items?.length || 0);
    console.log('🔍 [INITIATE-CHECKOUT] Estrutura dos dados recebidos:', {
      isArray: Array.isArray(data),
      hasItems: data && data.items,
      itemsLength: data?.items?.length,
      firstItem: data?.items?.[0]
    });
    
    // Filtrar conversões que são InitiateCheckout (convtype1 = 1)
    let initiateCheckoutConversions = [];
    if (data && data.items && Array.isArray(data.items)) {
      initiateCheckoutConversions = data.items.filter(conversion => {
        // Verificar se é InitiateCheckout baseado em convtype1 = 1
        const isInitiateCheckout = conversion.convtype1 === 1 || conversion.convtype1 === '1';
        console.log(`🔍 [INITIATE-CHECKOUT] Conversão ${conversion.id}: convtype1 = ${conversion.convtype1}, isInitiateCheckout = ${isInitiateCheckout}`);
        return isInitiateCheckout;
      });
    }
    
    console.log('🔍 [INITIATE-CHECKOUT] Total de conversões InitiateCheckout filtradas:', initiateCheckoutConversions.length);
    
    // Criar resposta com conversões filtradas
    const filteredData = {
      items: initiateCheckoutConversions,
      total: initiateCheckoutConversions.length,
      message: initiateCheckoutConversions.length > 0 
        ? `Encontradas ${initiateCheckoutConversions.length} conversões InitiateCheckout` 
        : 'Nenhuma conversão InitiateCheckout encontrada para o período.'
    };
    
    // Se resposta vazia, retornar mensagem amigável
    if (initiateCheckoutConversions.length === 0) {
      const emptyData = { items: [], total: 0, message: 'Nenhuma conversão InitiateCheckout encontrada para o período.' };
      
      // Salvar no cache
      requestCache.set(cacheKey, {
        data: emptyData,
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyData);
    }
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: filteredData,
      timestamp: Date.now()
    });
    
    res.status(200).json(filteredData);
  } catch (error) {
    console.error('❌ [INITIATE-CHECKOUT] Erro ao conectar com RedTrack:', error)
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/initiate-checkout'
    })
  }
} 