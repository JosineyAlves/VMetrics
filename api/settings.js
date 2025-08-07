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
      
      console.log('⏳ [SETTINGS] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [SETTINGS] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [SETTINGS] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [SETTINGS] Rate limiting persistente - retornando dados vazios');
            resolve(null);
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
      console.error('❌ [SETTINGS] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function handler(req, res) {
  console.log('🔍 [SETTINGS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [SETTINGS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [SETTINGS] Authorization header:', req.headers['authorization'])

  // Extrair API key dos query params
  let apiKey = req.query.api_key
  
  // Fallback: tentar extrair do header Authorization
  if (!apiKey && req.headers.authorization) {
    const authHeader = req.headers.authorization
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7)
    }
  }

  // Fallback: tentar extrair da query string manualmente
  if (!apiKey) {
    const url = new URL(req.url, `http://${req.headers.host}`)
    apiKey = url.searchParams.get('api_key')
  }

  console.log('🔍 [SETTINGS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  if (!apiKey) {
    console.log('❌ [SETTINGS] API Key não encontrada')
    return res.status(401).json({ error: 'API Key não fornecida' })
  }

  // Verificar cache
  const cacheKey = `settings_${apiKey}_${req.query.debug || 'false'}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [SETTINGS] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('🔍 [SETTINGS] Fazendo requisição para RedTrack /me/settings...')
    console.log('🔍 [SETTINGS] URL:', 'https://api.redtrack.io/me/settings')
    console.log('🔍 [SETTINGS] API Key sendo testada:', apiKey)

    const data = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: `https://api.redtrack.io/me/settings?api_key=${apiKey}`, 
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

    if (!data) {
      console.log('❌ [SETTINGS] Erro na resposta da API');
      return res.status(500).json({ error: 'Erro na API do RedTrack' });
    }

    console.log('✅ [SETTINGS] Dados recebidos com sucesso')
    console.log('🔍 [SETTINGS] Estrutura dos dados:', JSON.stringify(data, null, 2))
    
    // Se o parâmetro debug=true estiver presente, adicionar análise de moeda
    if (req.query.debug === 'true') {
      console.log('🔍 [SETTINGS] Modo debug ativado - analisando moeda...')
      
      const currencyAnalysis = {
        timestamp: new Date().toISOString(),
        fields_count: Object.keys(data).length,
        fields_available: Object.keys(data),
        currency_detected: null,
        analysis_details: {}
      }

      // 1. Verificar campos diretos
      if (data.currency) {
        currencyAnalysis.currency_detected = data.currency
        currencyAnalysis.analysis_details.direct_field = 'currency'
      } else if (data.default_currency) {
        currencyAnalysis.currency_detected = data.default_currency
        currencyAnalysis.analysis_details.direct_field = 'default_currency'
      }

      // 2. Verificar campos aninhados
      if (!currencyAnalysis.currency_detected) {
        const nestedFields = ['account', 'user', 'settings', 'preferences']
        for (const field of nestedFields) {
          if (data[field]?.currency) {
            currencyAnalysis.currency_detected = data[field].currency
            currencyAnalysis.analysis_details.nested_field = `${field}.currency`
            break
          }
        }
      }

      // 3. Procurar por padrões em todos os campos
      if (!currencyAnalysis.currency_detected) {
        currencyAnalysis.analysis_details.pattern_search = []
        for (const [field, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            if (value.includes('BRL')) {
              currencyAnalysis.currency_detected = 'BRL'
              currencyAnalysis.analysis_details.pattern_search.push(`${field}: BRL encontrado`)
              break
            } else if (value.includes('USD')) {
              currencyAnalysis.currency_detected = 'USD'
              currencyAnalysis.analysis_details.pattern_search.push(`${field}: USD encontrado`)
              break
            } else if (value.includes('EUR')) {
              currencyAnalysis.currency_detected = 'EUR'
              currencyAnalysis.analysis_details.pattern_search.push(`${field}: EUR encontrado`)
              break
            }
          }
        }
      }

      // 4. Se não encontrou, usar USD como padrão
      if (!currencyAnalysis.currency_detected) {
        currencyAnalysis.currency_detected = 'USD'
        currencyAnalysis.analysis_details.fallback = 'Nenhuma moeda detectada, usando USD como padrão'
      }

      console.log('✅ [SETTINGS] Análise de moeda concluída:', currencyAnalysis.currency_detected)
      
      const responseData = {
        settings: data,
        currency_analysis: currencyAnalysis
      };
      
      // Salvar no cache
      requestCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });
      
      return res.status(200).json(responseData)
    }
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('❌ [SETTINGS] Erro na requisição:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 