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
      
      console.log('⏳ [DASHBOARD] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [DASHBOARD] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [DASHBOARD] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [DASHBOARD] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [DASHBOARD] Erro de conexão:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

export default async function (req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Pega a API Key da query string
  const apiKey = req.query.api_key

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' })
  }

  try {
    console.log('🔍 [DASHBOARD] Requisição recebida:', req.method, req.url)
    console.log('🔍 [DASHBOARD] Headers recebidos:', Object.keys(req.headers))
    console.log('🔍 [DASHBOARD] API Key recebida:', apiKey ? 'SIM' : 'NÃO')

    // Verificar se é uma atualização forçada
    const isForceRefresh = req.query.force_refresh === 'true' || req.query._t;
    
    // Verificar cache
    const cacheKey = `dashboard_${JSON.stringify(req.query)}`;
    const cachedData = requestCache.get(cacheKey);
    
    // Se não for atualização forçada e há cache válido, usar cache
    if (!isForceRefresh && cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('✅ [DASHBOARD] Dados retornados do cache');
      return res.status(200).json(cachedData.data);
    }
    
    // Se for atualização forçada, limpar cache
    if (isForceRefresh) {
      console.log('🔄 [DASHBOARD] Atualização forçada - ignorando cache');
      requestCache.delete(cacheKey);
    }

    // Testar se a API key é válida usando fila
    console.log('🔍 [DASHBOARD] Fazendo requisição para RedTrack /me/settings...')
    console.log('🔍 [DASHBOARD] URL:', 'https://api.redtrack.io/me/settings')
    
    const testData = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: `https://api.redtrack.io/me/settings?api_key=${apiKey}`, 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0'
        }
      });
      processRequestQueue();
    });

    if (!testData) {
      console.log('🔍 [DASHBOARD] API Key inválida ou erro na API do RedTrack');
      return res.status(401).json({
        error: 'API Key inválida ou erro na API do RedTrack'
      });
    }

    console.log('🔍 [DASHBOARD] API Key válida - buscando dados do dashboard');

    // Buscar dados reais do dashboard usando parâmetros de data
    const { date_from, date_to } = req.query;
    const dateFrom = date_from || new Date().toISOString().split('T')[0];
    const dateTo = date_to || dateFrom;
    
    console.log('🔍 [DASHBOARD] Fazendo requisição para RedTrack /report...')
    console.log('🔍 [DASHBOARD] Data solicitada:', { dateFrom, dateTo });
    
    const reportUrl = `https://api.redtrack.io/report?api_key=${apiKey}&group_by=date&date_from=${dateFrom}&date_to=${dateTo}`;
    console.log('🔍 [DASHBOARD] URL:', reportUrl);
    
    const reportData = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: reportUrl, 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0'
        }
      });
      processRequestQueue();
    });

    if (reportData) {
      console.log('🔍 [DASHBOARD] Dados recebidos com sucesso');

      const hasData = reportData.revenue > 0 ||
        reportData.conversions > 0 ||
        reportData.clicks > 0 ||
        reportData.impressions > 0

      if (hasData) {
        const dashboardData = {
          revenue: reportData.revenue || 0,
          conversions: reportData.conversions || 0,
          ctr: reportData.ctr || 0,
          profit: (reportData.revenue || 0) - (reportData.spend || 0),
          impressions: reportData.impressions || 0,
          clicks: reportData.clicks || 0,
          spend: reportData.spend || 0,
          conversion_rate: reportData.conversion_rate || 0,
          epc: reportData.epc || 0,
  
          is_demo: false,
          message: 'Dados reais do RedTrack'
        }
        
        // Salvar no cache
        requestCache.set(cacheKey, {
          data: dashboardData,
          timestamp: Date.now()
        });
        
        res.status(200).json(dashboardData)
      } else {
        // Conta nova sem dados
        const emptyData = {
          revenue: 0,
          conversions: 0,
          ctr: 0,
          profit: 0,
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversion_rate: 0,
          epc: 0,
          is_demo: true,
          message: 'Conta nova - Configure suas campanhas no RedTrack para começar a ver dados reais.'
        }
        
        // Salvar no cache
        requestCache.set(cacheKey, {
          data: emptyData,
          timestamp: Date.now()
        });
        
        res.status(200).json(emptyData)
      }
    } else {
      console.log('🔍 [DASHBOARD] Erro ao buscar dados do report');
      // Fallback para dados zerados
      const fallbackData = {
        revenue: 0,
        conversions: 0,
        ctr: 0,
        profit: 0,
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversion_rate: 0,
        epc: 0,
        is_demo: true,
        message: 'Erro de conexão - Configure suas campanhas no RedTrack para começar a ver dados reais'
      }
      
      // Salvar no cache
      requestCache.set(cacheKey, {
        data: fallbackData,
        timestamp: Date.now()
      });
      
      res.status(200).json(fallbackData)
    }
  } catch (error) {
    console.error('❌ [DASHBOARD] Erro geral:', error);
    // Fallback para dados zerados
    const fallbackData = {
      revenue: 0,
      conversions: 0,
      ctr: 0,
      profit: 0,
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversion_rate: 0,
      epc: 0,
      is_demo: true,
      message: 'Erro de conexão - Configure suas campanhas no RedTrack para começar a ver dados reais'
    }
    res.status(200).json(fallbackData)
  }
} 