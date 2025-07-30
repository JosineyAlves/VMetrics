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
      
      console.log('⏳ [TEST-INITIATE-CHECKOUT] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [TEST-INITIATE-CHECKOUT] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [TEST-INITIATE-CHECKOUT] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [TEST-INITIATE-CHECKOUT] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [TEST-INITIATE-CHECKOUT] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function handler(req, res) {
  console.log('🔍 [TEST-INITIATE-CHECKOUT] Requisição recebida:', req.method, req.url)

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [TEST-INITIATE-CHECKOUT] Preflight request - retornando 200')
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

  console.log('🔍 [TEST-INITIATE-CHECKOUT] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [TEST-INITIATE-CHECKOUT] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }

  try {
    console.log('🔍 [TEST-INITIATE-CHECKOUT] Fazendo requisição para RedTrack /conversions...')
    
    // Buscar conversões dos últimos 30 dias para teste
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const date_from = startDate.toISOString().split('T')[0];
    const date_to = endDate.toISOString().split('T')[0];
    
    // Construir URL com parâmetros para buscar conversões
    const url = new URL('https://api.redtrack.io/conversions');
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('date_from', date_from);
    url.searchParams.set('date_to', date_to);
    
    console.log('🔍 [TEST-INITIATE-CHECKOUT] Buscando conversões de:', date_from, 'até:', date_to);
    console.log('🔍 [TEST-INITIATE-CHECKOUT] URL final:', url.toString());

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

    console.log('🔍 [TEST-INITIATE-CHECKOUT] Dados recebidos com sucesso');
    console.log('🔍 [TEST-INITIATE-CHECKOUT] Tipo de dados:', typeof data);
    console.log('🔍 [TEST-INITIATE-CHECKOUT] É array?', Array.isArray(data));
    
    // Extrair todas as conversões
    let allConversions = [];
    if (data && data.items && Array.isArray(data.items)) {
      allConversions = data.items;
    } else if (Array.isArray(data)) {
      allConversions = data;
    }
    
    console.log('🔍 [TEST-INITIATE-CHECKOUT] Total de conversões encontradas:', allConversions.length);
    
    // Log das primeiras conversões para debug
    if (allConversions.length > 0) {
      console.log('🔍 [TEST-INITIATE-CHECKOUT] Primeiras 5 conversões:', allConversions.slice(0, 5).map(c => ({
        id: c.id,
        type: c.type,
        convtype1: c.convtype1,
        campaign: c.campaign,
        conv_time: c.conv_time
      })));
    }
    
    // Filtrar conversões InitiateCheckout
    const initiateCheckoutConversions = allConversions.filter(conversion => {
      const isInitiateCheckout = conversion.convtype1 === 1 || conversion.convtype1 === '1' || conversion.type === 'InitiateCheckout';
      return isInitiateCheckout;
    });
    
    console.log('🔍 [TEST-INITIATE-CHECKOUT] Total de conversões InitiateCheckout:', initiateCheckoutConversions.length);
    
    // Criar resposta com conversões filtradas
    const filteredData = {
      items: initiateCheckoutConversions,
      total: initiateCheckoutConversions.length,
      message: initiateCheckoutConversions.length > 0 
        ? `Encontradas ${initiateCheckoutConversions.length} conversões InitiateCheckout nos últimos 30 dias` 
        : 'Nenhuma conversão InitiateCheckout encontrada nos últimos 30 dias.'
    };
    
    res.status(200).json(filteredData);
  } catch (error) {
    console.error('❌ [TEST-INITIATE-CHECKOUT] Erro ao conectar com RedTrack:', error)
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/test-initiate-checkout'
    })
  }
} 