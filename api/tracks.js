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
      
      console.log('⏳ [TRACKS] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [TRACKS] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [TRACKS] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [TRACKS] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [TRACKS] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function handler(req, res) {
  console.log('🔍 [TRACKS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [TRACKS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [TRACKS] Authorization header:', req.headers['authorization'])
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : null
  
  console.log('🔍 [TRACKS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' })
  }

  // Validar parâmetros obrigatórios de data
  const { date_from, date_to } = req.query || {};
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date_from || !date_to || !dateRegex.test(date_from) || !dateRegex.test(date_to)) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: date_from e date_to no formato YYYY-MM-DD' });
  }

  // Verificar se é uma atualização forçada
  const isForceRefresh = req.query.force_refresh === 'true' || req.query._t;
  
  // Verificar cache
  const cacheKey = `tracks_${JSON.stringify(req.query)}`;
  const cachedData = requestCache.get(cacheKey);
  
  // Se não for atualização forçada e há cache válido, usar cache
  if (!isForceRefresh && cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [TRACKS] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }
  
  // Se for atualização forçada, limpar cache
  if (isForceRefresh) {
    console.log('🔄 [TRACKS] Atualização forçada - ignorando cache');
    requestCache.delete(cacheKey);
  }

  try {
    console.log('🔍 [TRACKS] Fazendo requisição para RedTrack /tracks...')
    console.log('🔍 [TRACKS] URL:', 'https://api.redtrack.io/tracks')
    console.log('🔍 [TRACKS] API Key sendo testada:', apiKey)
    
    // Buscar tracks (cliques) reais do RedTrack usando fila
    const url = `https://api.redtrack.io/tracks?api_key=${apiKey}&date_from=${date_from}&date_to=${date_to}`;
    
    const tracksData = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: url, 
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

    console.log('🔍 [TRACKS] Dados recebidos com sucesso');
    
    if (Array.isArray(tracksData) && tracksData.length === 0) {
      const emptyData = { items: [], total: 0, message: 'Nenhum clique encontrado para o período.' };
      
      // Salvar no cache
      requestCache.set(cacheKey, {
        data: emptyData,
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyData);
    }
    
    console.log('📊 Tracks reais carregados do RedTrack')
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: tracksData,
      timestamp: Date.now()
    });
    
    res.status(200).json(tracksData)
    
  } catch (error) {
    console.error('❌ [TRACKS] Erro ao buscar tracks:', error)
    // Fallback para dados zerados
    const emptyData = {
      data: [],
      total: 0
    }
    res.status(200).json(emptyData)
  }
} 