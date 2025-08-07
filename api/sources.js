// Cache em memória para evitar múltiplas requisições
const requestCache = new Map();
const CACHE_DURATION = 300000; // 5 minutos

// Controle de rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 segundos entre requisições
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
      
      console.log('⏳ [SOURCES] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [SOURCES] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [SOURCES] Rate limiting detectado - aguardando 10 segundos...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [SOURCES] Rate limiting persistente - retornando dados vazios');
            resolve([]);
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
      console.error('❌ [SOURCES] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function handler(req, res) {
  console.log('🔍 [SOURCES] Requisição recebida:', req.method, req.url)
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [SOURCES] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  // Extrai todos os parâmetros da query
  const params = { ...req.query };

  // Garante que a API Key está presente
  let apiKey = params.api_key;
  let frontendAuth = req.headers['authorization'];
  
  console.log('🔍 [SOURCES] API Key da query:', apiKey ? 'SIM' : 'NÃO');
  console.log('🔍 [SOURCES] Authorization header:', frontendAuth ? 'SIM' : 'NÃO');
  
  if (!apiKey && !frontendAuth) {
    console.log('❌ [SOURCES] Nenhuma API Key fornecida');
    return res.status(401).json({ error: 'API Key required' });
  }

  // Usar API Key da query se disponível, senão do header
  const finalApiKey = apiKey || (frontendAuth ? frontendAuth.replace('Bearer ', '') : null);
  
  if (!finalApiKey) {
    console.log('❌ [SOURCES] API Key final não encontrada');
    return res.status(401).json({ error: 'API Key required' });
  }

  // Monta a URL do RedTrack para buscar fontes
  const url = new URL('https://api.redtrack.io/report');
  
  // Parâmetros para buscar fontes
  const sourceParams = {
    date_from: params.date_from || '2025-01-01',
    date_to: params.date_to || '2025-12-31',
    group_by: 'source',
    api_key: finalApiKey
  };
  
  Object.entries(sourceParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value.toString());
    }
  });

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TrackView-Dashboard/1.0'
  };

  // Verificar cache
  const cacheKey = url.toString();
  console.log('🔍 [SOURCES] Chave do cache:', cacheKey);
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [SOURCES] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('🔍 [SOURCES] URL final:', url.toString());
    console.log('🔍 [SOURCES] Headers enviados:', headers);
    
    // Adicionar requisição à fila
    const responseData = await new Promise((resolve, reject) => {
      requestQueue.push({ resolve, reject, url: url.toString(), headers });
      processRequestQueue();
    });
    
    console.log('✅ [SOURCES] Dados recebidos com sucesso');
    console.log('🔍 [SOURCES] Tipo dos dados recebidos:', typeof responseData);
    console.log('🔍 [SOURCES] É array?', Array.isArray(responseData));
    console.log('🔍 [SOURCES] Tamanho dos dados:', Array.isArray(responseData) ? responseData.length : 'N/A');
    
    // Log dos primeiros itens se for array
    if (Array.isArray(responseData) && responseData.length > 0) {
      console.log('🔍 [SOURCES] Primeiro item:', responseData[0]);
      console.log('🔍 [SOURCES] Campos do primeiro item:', Object.keys(responseData[0]));
    }
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ [SOURCES] Erro de conexão:', error);
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/sources'
    });
  }
} 