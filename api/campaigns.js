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
      
      console.log('⏳ [CAMPAIGNS] Processando requisição da fila...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 [CAMPAIGNS] Erro da RedTrack:', {
          status: response.status,
          url: url,
          errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Se for rate limiting, aguardar e tentar novamente
        if (response.status === 429) {
          console.log('⚠️ [CAMPAIGNS] Rate limiting detectado - aguardando 5 segundos...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Tentar novamente uma vez
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!retryResponse.ok) {
            console.log('⚠️ [CAMPAIGNS] Rate limiting persistente - retornando dados vazios');
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
      console.error('❌ [CAMPAIGNS] Erro de conexão:', error);
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

  // Extrai todos os parâmetros da query
  const params = { ...req.query };
  let apiKey = params.api_key;
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' });
  }

  // Verificar cache
  const cacheKey = `campaigns_report_${JSON.stringify(params)}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [CAMPAIGNS] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('=== CAMPAIGNS API DEBUG START ===');
    console.log('Campaigns API - Nova abordagem usando /report endpoint...');
    
    // Usar a data específica solicitada pelo usuário
    const dateFrom = params.date_from || new Date().toISOString().split('T')[0];
    const dateTo = params.date_to || dateFrom;
    
    console.log('Campaigns API - Data solicitada:', { dateFrom, dateTo });
    
    // NOVA ABORDAGEM: Usar endpoint /report com group_by=campaign
    const reportUrl = new URL('https://api.redtrack.io/report');
    reportUrl.searchParams.set('api_key', apiKey);
    reportUrl.searchParams.set('date_from', dateFrom);
    reportUrl.searchParams.set('date_to', dateTo);
    reportUrl.searchParams.set('group_by', 'campaign');
    reportUrl.searchParams.set('per', '1000');
    
    // Também buscar dados de campanhas individuais para obter nomes
    const campaignsUrl = new URL('https://api.redtrack.io/campaigns');
    campaignsUrl.searchParams.set('api_key', apiKey);
    campaignsUrl.searchParams.set('per', '1000');
    
    console.log('Campaigns API - URL para /report:', reportUrl.toString());
    
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
    
    console.log('Campaigns API - Dados do /report:', JSON.stringify(reportData, null, 2));
    console.log('Campaigns API - Dados de campanhas:', JSON.stringify(campaignsData, null, 2));
    
    // Processar dados do /report para o formato esperado
    const processedData = [];
    
    // Criar mapa de campanhas para obter nomes
    const campaignMap = new Map();
    if (Array.isArray(campaignsData)) {
      campaignsData.forEach(campaign => {
        campaignMap.set(campaign.id, campaign);
      });
    }
    
    if (Array.isArray(reportData)) {
      reportData.forEach((item, index) => {
        // Tentar encontrar o nome da campanha
        let campaignName = 'Campanha sem nome';
        let sourceTitle = '';
        
        // Se temos dados de campanhas, usar o nome real
        if (campaignMap.size > 0) {
          // Usar o primeiro ID de campanha disponível
          const campaignIds = Array.from(campaignMap.keys());
          if (campaignIds.length > 0) {
            const campaign = campaignMap.get(campaignIds[0]);
            campaignName = campaign.title || campaign.name || 'Campanha sem nome';
            sourceTitle = campaign.source_title || campaign.source || '';
          }
        }
        
        // Determinar status baseado na atividade
        let status = 'inactive';
        if (item.clicks > 0 || item.conversions > 0) {
          status = 'active';
        } else if (item.clicks > 0 && item.conversions === 0) {
          status = 'paused';
        }
        
        processedData.push({
          id: item.campaign_id || item.id || Math.random().toString(36).slice(2),
          title: campaignName,
          source_title: sourceTitle,
          status: status,
          stat: {
            clicks: item.clicks || 0,
            unique_clicks: item.unique_clicks || item.clicks || 0,
            conversions: item.conversions || 0,
            all_conversions: item.all_conversions || item.conversions || 0,
            approved: item.approved || item.conversions || 0,
            pending: item.pending || 0,
            declined: item.declined || 0,
            revenue: item.revenue || 0,
            cost: item.cost || item.spend || 0,
            impressions: item.impressions || 0,
            ctr: item.ctr || 0,
            conversion_rate: item.conversion_rate || 0
          }
        });
        
        console.log(`✅ [CAMPAIGNS] Campanha processada: ${campaignName}`);
        console.log(`   - Cliques: ${item.clicks || 0}`);
        console.log(`   - Conversões: ${item.conversions || 0}`);
        console.log(`   - Cost: ${item.cost || item.spend || 0}`);
        console.log(`   - Revenue: ${item.revenue || 0}`);
        console.log(`   - Status: ${status}`);
      });
    }
    
    console.log('Campaigns API - Dados processados finais:', JSON.stringify(processedData, null, 2));
    console.log('=== CAMPAIGNS API DEBUG END ===');
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data: processedData,
      timestamp: Date.now()
    });
    
    res.status(200).json(processedData);
  } catch (error) {
    console.error('Campaigns API - Erro geral:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
} 