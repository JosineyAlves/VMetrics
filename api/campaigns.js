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
    console.log('Campaigns API - Buscando dados de campanhas usando endpoint /report...');
    
    // Usar apenas a data específica solicitada pelo usuário
    const dateFrom = params.date_from || new Date().toISOString().split('T')[0];
    const dateTo = params.date_to || dateFrom;
    
    console.log('Campaigns API - Data solicitada:', { dateFrom, dateTo });
    
    // USAR O ENDPOINT CORRETO: /report com group_by=campaign
    const reportUrl = new URL('https://api.redtrack.io/report');
    reportUrl.searchParams.set('api_key', apiKey);
    reportUrl.searchParams.set('date_from', dateFrom);
    reportUrl.searchParams.set('date_to', dateTo);
    reportUrl.searchParams.set('group_by', 'campaign');
    reportUrl.searchParams.set('metrics', 'clicks,conversions,cost,revenue,impressions');
    reportUrl.searchParams.set('per', '1000');
    
    console.log('Campaigns API - URL para relatório de campanhas:', reportUrl.toString());
    
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
    
    console.log('Campaigns API - Dados do relatório:', JSON.stringify(reportData, null, 2));
    
    // Processar dados do relatório
    let processedData = [];
    
    if (reportData && reportData.data && Array.isArray(reportData.data)) {
      console.log(`Campaigns API - Total de campanhas encontradas: ${reportData.data.length}`);
      
      processedData = reportData.data.map((item, index) => {
        const campaignName = item.campaign || item.campaign_name || item.title || 'Campanha sem nome';
        const campaignId = item.campaign_id || item.id || Math.random().toString(36).slice(2);
        
        // Calcular métricas derivadas
        const clicks = item.clicks || 0;
        const conversions = item.conversions || 0;
        const cost = item.cost || 0;
        const revenue = item.revenue || 0;
        const impressions = item.impressions || 0;
        
        // Calcular métricas calculadas
        const profit = revenue - cost;
        const roi = cost > 0 ? (profit / cost) * 100 : 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
        const cpc = clicks > 0 ? cost / clicks : 0;
        const cpa = conversions > 0 ? cost / conversions : 0;
        const epc = clicks > 0 ? revenue / clicks : 0;
        
        console.log(`✅ Campanha processada: ${campaignName}`);
        console.log(`   - Cliques: ${clicks}, Conversões: ${conversions}`);
        console.log(`   - Custo: ${cost}, Receita: ${revenue}`);
        console.log(`   - ROI: ${roi}%, CTR: ${ctr}%`);
        
        return {
          id: campaignId,
          title: campaignName,
          source_title: item.source || item.source_name || '',
          status: 'active', // Status será determinado pelo frontend baseado na atividade
          stat: {
            clicks: clicks,
            unique_clicks: clicks, // Simplificado - usar mesmo valor
            conversions: conversions,
            all_conversions: conversions, // Simplificado - usar mesmo valor
            approved: conversions, // Simplificado - usar mesmo valor
            pending: 0, // Não disponível no relatório
            declined: 0, // Não disponível no relatório
            revenue: revenue,
            cost: cost,
            impressions: impressions,
            ctr: ctr,
            conversion_rate: conversionRate,
            // Métricas calculadas adicionais
            profit: profit,
            roi: roi,
            cpc: cpc,
            cpa: cpa,
            epc: epc
          }
        };
      });
    } else {
      console.log('Campaigns API - Nenhum dado encontrado ou estrutura inesperada');
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