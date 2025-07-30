// Endpoint para buscar campanhas diretamente do RedTrack
// Usando o endpoint correto /pub/campaigns conforme documentação

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

      console.log('⏳ [CAMPAIGNS-DIRECT] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      lastRequestTime = Date.now();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [CAMPAIGNS-DIRECT] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });

        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [CAMPAIGNS-DIRECT] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });

          if (!retryResponse.ok) {
            console.log('⚠️ [CAMPAIGNS-DIRECT] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [CAMPAIGNS-DIRECT] Erro de conexão:', error);
      reject(error);
    }
  }

  isProcessingQueue = false;
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Extrai todos os parâmetros da query
  const params = { ...req.query };
  let apiKey = params.api_key;
  const { date_from, date_to } = params;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key é obrigatória' });
  }

  console.log('=== CAMPAIGNS DIRECT API DEBUG START ===');
  console.log('Campaigns Direct API - Requisição recebida:', {
    method: req.method,
    url: req.url,
    query: req.query
  });

  // Verificar cache
  const cacheKey = `campaigns_direct_${JSON.stringify(params)}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('✅ [CAMPAIGNS-DIRECT] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('🔍 [CAMPAIGNS-DIRECT] Buscando campanhas diretamente do RedTrack...');
    
    // Buscar campanhas do endpoint /pub/campaigns conforme documentação
    const campaignsUrl = new URL('https://api.redtrack.io/pub/campaigns');
    campaignsUrl.searchParams.set('api_key', apiKey);
    campaignsUrl.searchParams.set('per', '100'); // Máximo de campanhas
    
    console.log('🔍 [CAMPAIGNS-DIRECT] URL:', campaignsUrl.toString());
    
    const campaignsData = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: campaignsUrl.toString(), 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0'
        }
      });
      processRequestQueue();
    });
    
    console.log('🔍 [CAMPAIGNS-DIRECT] Dados de campanhas recebidos:', campaignsData);
    
    // Buscar dados de performance via /report
    const reportUrl = new URL('https://api.redtrack.io/report');
    reportUrl.searchParams.set('api_key', apiKey);
    reportUrl.searchParams.set('date_from', date_from || '2025-07-30');
    reportUrl.searchParams.set('date_to', date_to || '2025-07-30');
    reportUrl.searchParams.set('group_by', 'campaign');
    
    console.log('🔍 [CAMPAIGNS-DIRECT] Buscando dados de performance:', reportUrl.toString());
    
    const reportData = await new Promise((resolve, reject) => {
      requestQueue.push({ 
        resolve, 
        reject, 
        url: reportUrl.toString(), 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrackView-Dashboard/1.0'
        }
      });
      processRequestQueue();
    });
    
    console.log('🔍 [CAMPAIGNS-DIRECT] Dados de performance recebidos:', reportData);
    
    // Mapear dados de performance por campanha
    const performanceMap = new Map();
    if (Array.isArray(reportData)) {
      reportData.forEach((item: any) => {
        if (item.campaign || item.campaign_name) {
          const campaignName = item.campaign || item.campaign_name;
          performanceMap.set(campaignName.toLowerCase().trim(), item);
        }
      });
    }
    
    // Processar campanhas com dados de performance
    const processedCampaigns = [];
    
    if (Array.isArray(campaignsData)) {
      campaignsData.forEach((campaign: any) => {
        console.log('🔍 [CAMPAIGNS-DIRECT] Processando campanha:', campaign);
        
        // Mapear status numérico para string conforme documentação
        let status = 'inactive';
        if (campaign.status === 1) status = 'active';
        else if (campaign.status === 2) status = 'paused';
        else if (campaign.status === 3) status = 'inactive';
        
        // Buscar dados de performance para esta campanha
        const performanceData = performanceMap.get(campaign.title?.toLowerCase().trim());
        
        const processedCampaign = {
          id: campaign.id,
          title: campaign.title,
          source_title: campaign.source_title || campaign.source,
          status: status,
          stat: {
            clicks: performanceData?.clicks || 0,
            unique_clicks: performanceData?.unique_clicks || 0,
            conversions: performanceData?.conversions || 0,
            all_conversions: performanceData?.conversions || 0,
            approved: performanceData?.approved || 0,
            pending: performanceData?.pending || 0,
            declined: performanceData?.declined || 0,
            revenue: performanceData?.revenue || 0,
            cost: performanceData?.cost || 0,
            impressions: performanceData?.impressions || 0,
            ctr: performanceData?.ctr || 0,
            conversion_rate: performanceData?.cr || 0,
          }
        };
        
        processedCampaigns.push(processedCampaign);
        console.log('✅ [CAMPAIGNS-DIRECT] Campanha processada:', processedCampaign);
      });
    }
    
    console.log('Campaigns Direct API - Dados processados finais:', JSON.stringify(processedCampaigns, null, 2));
    console.log('=== CAMPAIGNS DIRECT API DEBUG END ===');
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: processedCampaigns,
      timestamp: Date.now()
    });
    
    res.status(200).json(processedCampaigns);
  } catch (error) {
    console.error('Campaigns Direct API - Erro geral:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
} 