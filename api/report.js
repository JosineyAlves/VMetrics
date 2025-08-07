// Cache em memória para evitar múltiplas requisições
const requestCache = new Map();
const CACHE_DURATION = 60000; // 60 segundos (aumentado de 30s)

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
      
      console.log('⏳ [REPORT] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [REPORT] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [REPORT] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [REPORT] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [REPORT] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function handler(req, res) {
  console.log('🔍 [REPORT] Requisição recebida:', req.method, req.url)
  console.log('🔍 [REPORT] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [REPORT] Authorization header:', req.headers['authorization'])
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [REPORT] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  // Extrai todos os parâmetros da query
  const params = { ...req.query };

  // Garante que a API Key está presente
  let apiKey = params.api_key;
  let frontendAuth = req.headers['authorization'];
  
  console.log('🔍 [REPORT] API Key da query:', apiKey ? 'SIM' : 'NÃO');
  console.log('🔍 [REPORT] Authorization header:', frontendAuth ? 'SIM' : 'NÃO');
  
  if (!apiKey && !frontendAuth) {
    console.log('❌ [REPORT] Nenhuma API Key fornecida');
    return res.status(401).json({ error: 'API Key required' });
  }

  // Usar API Key da query se disponível, senão do header
  const finalApiKey = apiKey || (frontendAuth ? frontendAuth.replace('Bearer ', '') : null);
  
  if (!finalApiKey) {
    console.log('❌ [REPORT] API Key final não encontrada');
    return res.status(401).json({ error: 'API Key required' });
  }

  // Monta a URL do RedTrack
  const url = new URL('https://api.redtrack.io/report');
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'api_key' && value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value.toString());
    }
  });
  
  // Verificar se force_refresh foi removido incorretamente
  if (params.force_refresh === 'true') {
    console.log('🔄 [REPORT] force_refresh detectado - não enviando para RedTrack')
  }
  
  console.log('🔍 [REPORT] Parâmetros recebidos:', params);
  console.log('🔍 [REPORT] Parâmetros enviados para RedTrack:', Object.fromEntries(url.searchParams.entries()));
  
  // Adicionar API Key como parâmetro da query
  url.searchParams.set('api_key', finalApiKey);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TrackView-Dashboard/1.0'
  };

  // Verificar cache
  const cacheKey = url.toString();
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [REPORT] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }
  
  // Se for uma atualização forçada, limpar cache
  if (params.force_refresh === 'true') {
    console.log('🔄 [REPORT] Atualização forçada - limpando cache');
    requestCache.delete(cacheKey);
    console.log('🔄 [REPORT] Cache limpo para:', cacheKey);
  }

  try {
    console.log('🔍 [REPORT] URL final:', url.toString());
    console.log('🔍 [REPORT] Headers enviados:', headers);
    
    // Adicionar requisição à fila
    const responseData = await new Promise((resolve, reject) => {
      requestQueue.push({ resolve, reject, url: url.toString(), headers });
      processRequestQueue();
    });
    
    console.log('✅ [REPORT] Dados recebidos com sucesso');
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ [REPORT] Erro de conexão:', error);
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/report'
    });
  }
} 