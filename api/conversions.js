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
      
      console.log('⏳ [CONVERSIONS] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [CONVERSIONS] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [CONVERSIONS] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [CONVERSIONS] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [CONVERSIONS] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function handler(req, res) {
  console.log('🔍 [CONVERSIONS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [CONVERSIONS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [CONVERSIONS] Authorization header:', req.headers['authorization'])

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [CONVERSIONS] Preflight request - retornando 200')
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

  console.log('🔍 [CONVERSIONS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [CONVERSIONS] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }

  // Validar parâmetros obrigatórios de data
  const { date_from, date_to } = req.query || {};
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date_from || !date_to || !dateRegex.test(date_from) || !dateRegex.test(date_to)) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: date_from e date_to no formato YYYY-MM-DD' });
  }

  // Verificar cache
  const cacheKey = `conversions_${JSON.stringify(req.query)}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [CONVERSIONS] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('🔍 [CONVERSIONS] Fazendo requisição para RedTrack /conversions...')
    console.log('🔍 [CONVERSIONS] URL:', `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=${date_from}&date_to=${date_to}`)
    console.log('🔍 [CONVERSIONS] API Key sendo testada:', apiKey)

    // Construir URL com parâmetros opcionais
    const url = new URL('https://api.redtrack.io/conversions');
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('date_from', date_from);
    url.searchParams.set('date_to', date_to);
    
    // Adicionar parâmetros opcionais se fornecidos
    if (req.query.type) {
      url.searchParams.set('type', req.query.type);
    }
    if (req.query.campaign) {
      url.searchParams.set('campaign', req.query.campaign);
    }
    if (req.query.country) {
      url.searchParams.set('country', req.query.country);
    }
    
    console.log('🔍 [CONVERSIONS] URL final:', url.toString());
    
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

    console.log('🔍 [CONVERSIONS] Dados recebidos com sucesso');
    
    // Se resposta vazia, retornar mensagem amigável
    if (Array.isArray(data) && data.length === 0) {
      const emptyData = { items: [], total: 0, message: 'Nenhuma conversão encontrada para o período.' };
      
      // Salvar no cache
      requestCache.set(cacheKey, {
        data: emptyData,
        timestamp: Date.now()
      });
      
      return res.status(200).json(emptyData);
    }
    if (data && data.items && data.items.length === 0) {
      data.message = 'Nenhuma conversão encontrada para o período.';
    }
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ [CONVERSIONS] Erro ao conectar com RedTrack:', error)
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/conversions'
    })
  }
} 