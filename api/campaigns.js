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
  const cacheKey = `campaigns_${JSON.stringify(params)}`;
  const cachedData = requestCache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log('✅ [CAMPAIGNS] Dados retornados do cache');
    return res.status(200).json(cachedData.data);
  }

  try {
    console.log('=== CAMPAIGNS API DEBUG START ===');
    console.log('Campaigns API - Nova abordagem: obter campanhas e dados específicos...');
    
    const dateFrom = params.date_from || new Date().toISOString().split('T')[0];
    const dateTo = params.date_to || dateFrom;
    
    console.log('Campaigns API - Data solicitada:', { dateFrom, dateTo });
    
    // PASSO 1: Obter lista de campanhas
    console.log('Campaigns API - Passo 1: Obtendo lista de campanhas...');
    const campaignsUrl = new URL('https://api.redtrack.io/campaigns');
    campaignsUrl.searchParams.set('api_key', apiKey);
    
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
    
    console.log('Campaigns API - Campanhas obtidas:', campaignsData.length);
    
    // PASSO 2: Para cada campanha, buscar dados específicos
    console.log('Campaigns API - Passo 2: Buscando dados específicos para cada campanha...');
    
    let processedData = [];
    
    for (const campaign of campaignsData) {
      try {
        console.log(`Campaigns API - Processando campanha: ${campaign.title} (ID: ${campaign.id})`);
        
        // Buscar dados específicos da campanha
        const reportUrl = new URL('https://api.redtrack.io/report');
        reportUrl.searchParams.set('api_key', apiKey);
        reportUrl.searchParams.set('date_from', dateFrom);
        reportUrl.searchParams.set('date_to', dateTo);
        reportUrl.searchParams.set('filter_by', 'campaign_id');
        reportUrl.searchParams.set('filter_value', campaign.id);
        reportUrl.searchParams.set('metrics', 'clicks,conversions,cost,revenue,impressions');
        reportUrl.searchParams.set('per', '1000');
        
        const campaignReportData = await new Promise((resolve, reject) => {
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
        
        console.log(`Campaigns API - Dados da campanha ${campaign.title}:`, JSON.stringify(campaignReportData, null, 2));
        
        // Processar dados da campanha
        if (campaignReportData && Array.isArray(campaignReportData) && campaignReportData.length > 0) {
          const item = campaignReportData[0]; // Pegar o primeiro item (deve ser único por campanha)
          
          const clicks = item.clicks || 0;
          const conversions = item.conversions || 0;
          const cost = item.cost || 0;
          const revenue = item.revenue || 0;
          const impressions = item.impressions || 0;
          
          // Usar métricas já calculadas pela RedTrack quando disponíveis
          const roi = item.roi !== undefined ? item.roi : (cost > 0 ? ((revenue - cost) / cost) * 100 : 0);
          const ctr = item.ctr !== undefined ? item.ctr : (impressions > 0 ? (clicks / impressions) * 100 : 0);
          const conversionRate = item.cr !== undefined ? item.cr * 100 : (clicks > 0 ? (conversions / clicks) * 100 : 0);
          const cpc = item.cpc !== undefined ? item.cpc : (clicks > 0 ? cost / clicks : 0);
          const cpa = item.cpa !== undefined ? item.cpa : (conversions > 0 ? cost / conversions : 0);
          const epc = item.epc !== undefined ? item.epc : (clicks > 0 ? revenue / clicks : 0);
          
          console.log(`✅ Campanha processada: ${campaign.title}`);
          console.log(`   - Cliques: ${clicks}, Conversões: ${conversions}`);
          console.log(`   - Custo: ${cost}, Receita: ${revenue}`);
          console.log(`   - ROI: ${roi}%, CTR: ${ctr}%`);
          
          processedData.push({
            id: campaign.id,
            title: campaign.title,
            source_title: campaign.source_title || '',
            status: campaign.status === 3 ? 'active' : 'inactive',
            stat: {
              clicks: clicks,
              unique_clicks: item.unique_clicks || clicks,
              conversions: conversions,
              all_conversions: item.total_conversions || conversions,
              approved: item.approved || conversions,
              pending: item.pending || 0,
              declined: item.declined || 0,
              revenue: revenue,
              cost: cost,
              impressions: impressions,
              ctr: ctr,
              conversion_rate: conversionRate,
              profit: item.profit !== undefined ? item.profit : (revenue - cost),
              roi: roi,
              cpc: cpc,
              cpa: cpa,
              epc: epc
            }
          });
        } else {
          console.log(`⚠️ Campanha ${campaign.title} não tem dados para o período`);
          // Adicionar campanha com dados zerados
          processedData.push({
            id: campaign.id,
            title: campaign.title,
            source_title: campaign.source_title || '',
            status: campaign.status === 3 ? 'active' : 'inactive',
            stat: {
              clicks: 0,
              unique_clicks: 0,
              conversions: 0,
              all_conversions: 0,
              approved: 0,
              pending: 0,
              declined: 0,
              revenue: 0,
              cost: 0,
              impressions: 0,
              ctr: 0,
              conversion_rate: 0,
              profit: 0,
              roi: 0,
              cpc: 0,
              cpa: 0,
              epc: 0
            }
          });
        }
        
        // Aguardar um pouco entre as requisições para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${campaign.title}:`, error);
        // Adicionar campanha com dados zerados em caso de erro
        processedData.push({
          id: campaign.id,
          title: campaign.title,
          source_title: campaign.source_title || '',
          status: campaign.status === 3 ? 'active' : 'inactive',
          stat: {
            clicks: 0,
            unique_clicks: 0,
            conversions: 0,
            all_conversions: 0,
            approved: 0,
            pending: 0,
            declined: 0,
            revenue: 0,
            cost: 0,
            impressions: 0,
            ctr: 0,
            conversion_rate: 0,
            profit: 0,
            roi: 0,
            cpc: 0,
            cpa: 0,
            epc: 0
          }
        });
      }
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