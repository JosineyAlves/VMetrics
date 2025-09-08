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
  if (isProcessingQueue || requestQueue.length > 0) return;
  
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
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      lastRequestTime = Date.now();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      resolve(data);
      
    } catch (error) {
      console.error('❌ [SETTINGS] Erro na requisição da fila:', error);
      reject(error);
    }
  }
  
  isProcessingQueue = false;
}

// Função para adicionar requisição à fila
function addToQueue(url, headers = {}) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject, url, headers });
    processRequestQueue();
  });
}

// Função para fazer requisição com cache e rate limiting
async function makeRequest(url, headers = {}) {
  const cacheKey = `request_${url}_${JSON.stringify(headers)}`;
  
  // Verificar cache primeiro
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 [SETTINGS] Retornando dados do cache');
      return cached.data;
    }
  }
  
  try {
    console.log('🌐 [SETTINGS] Fazendo requisição para:', url);
    const data = await addToQueue(url, headers);
    
    // Salvar no cache
    requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('❌ [SETTINGS] Erro na requisição:', error);
    throw error;
  }
}

// Função para lidar com requisições de plano do usuário
async function handleUserPlan(req, res) {
  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'User ID é obrigatório' })
    }

    console.log('🔍 [USER-PLAN] Buscando plano para user_id:', user_id)

    // Importar Supabase e Stripe dinamicamente para evitar problemas
    const { createClient } = await import('@supabase/supabase-js')
    const Stripe = (await import('stripe')).default

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    const supabase = createClient(supabaseUrl, supabaseKey)
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' })

    // 1. Buscar usuário pelo user_id
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      console.log('❌ [USER-PLAN] Usuário não encontrado:', userError)
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    console.log('✅ [USER-PLAN] Usuário encontrado:', user.id)

    // 2. Buscar TODOS os planos do usuário (sem filtros)
    console.log('🔍 [USER-PLAN] Buscando todos os planos para user_id:', user_id)
    
    const { data: allPlans, error: allPlansError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user_id)
    
    console.log('🔍 [USER-PLAN] Todos os planos encontrados:', allPlans)
    console.log('🔍 [USER-PLAN] Erro ao buscar planos:', allPlansError)

    if (allPlansError) {
      console.log('❌ [USER-PLAN] Erro ao buscar planos:', allPlansError)
      return res.status(500).json({ error: 'Erro ao buscar planos do usuário' })
    }

    if (!allPlans || allPlans.length === 0) {
      console.log('❌ [USER-PLAN] Nenhum plano encontrado para o usuário')
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          stripe_customer_id: user.stripe_customer_id
        },
        plan: null,
        invoice: null
      })
    }

    // 3. Encontrar o primeiro plano ativo
    const activePlan = allPlans.find(plan => plan.status === 'active')
    
    if (!activePlan) {
      console.log('❌ [USER-PLAN] Nenhum plano ativo encontrado')
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          stripe_customer_id: user.stripe_customer_id
        },
        plan: null,
        invoice: null
      })
    }

    console.log('✅ [USER-PLAN] Plano ativo encontrado:', activePlan)

    // 4. Buscar detalhes da subscription no Stripe se necessário
    let stripeSubscription = null
    let invoice = null
    
    if (activePlan.stripe_subscription_id) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(activePlan.stripe_subscription_id)
        
        // Buscar última fatura
        const invoices = await stripe.invoices.list({
          subscription: activePlan.stripe_subscription_id,
          limit: 1
        })
        
        if (invoices.data.length > 0) {
          const stripeInvoice = invoices.data[0]
          invoice = {
            id: stripeInvoice.id,
            number: stripeInvoice.number,
            description: `Plano ${activePlan.plan_type === 'monthly' ? 'Mensal' : 'Trimestral'}`,
            amount: stripeInvoice.amount_due,
            formatted_amount: `R$ ${(stripeInvoice.amount_due / 100).toFixed(2).replace('.', ',')}`,
            status: stripeInvoice.status,
            status_text: stripeInvoice.status === 'paid' ? 'Pago' : 
                        stripeInvoice.status === 'open' ? 'Em Aberto' : 
                        stripeInvoice.status === 'draft' ? 'Rascunho' : 'Vencido',
            status_color: stripeInvoice.status === 'paid' ? 'green' : 
                         stripeInvoice.status === 'open' ? 'yellow' : 'red',
            created: stripeInvoice.created * 1000,
            due_date: stripeInvoice.due_date ? stripeInvoice.due_date * 1000 : Date.now(),
            hosted_invoice_url: stripeInvoice.hosted_invoice_url
          }
        }
      } catch (stripeError) {
        console.error('❌ [USER-PLAN] Erro ao buscar dados do Stripe:', stripeError)
      }
    }

    // 5. Mapear dados do plano
    const planFeatures = activePlan.plan_type === 'monthly' ? [
      'Dashboard completo de métricas',
      'Relatórios avançados',
      'Análise de campanhas',
      'Suporte por email'
    ] : [
      'Dashboard completo de métricas',
      'Relatórios avançados',
      'Análise de campanhas',
      'Suporte prioritário',
      'Consultorias mensais',
      '20% de desconto'
    ]

    const planData = {
      id: activePlan.id,
      plan_type: activePlan.plan_type,
      status: activePlan.status,
      stripe_subscription_id: activePlan.stripe_subscription_id,
      stripe_customer_id: activePlan.stripe_customer_id,
      current_period_start: activePlan.current_period_start,
      current_period_end: activePlan.current_period_end,
      name: activePlan.plan_type === 'monthly' ? 'Plano Mensal' : 'Plano Trimestral',
      price: activePlan.plan_type === 'monthly' ? 'R$ 79,00' : 'R$ 65,67',
      period: activePlan.plan_type === 'monthly' ? 'mensal' : 'trimestral',
      features: planFeatures,
      nextBilling: activePlan.current_period_end
    }

    const response = {
      user: {
        id: user.id,
        email: user.email,
        stripe_customer_id: user.stripe_customer_id
      },
      plan: planData,
      invoice: invoice
    }

    console.log('✅ [USER-PLAN] Resposta completa:', response)
    return res.json(response)

  } catch (error) {
    console.error('❌ [USER-PLAN] Erro geral:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}

export default async function handler(req, res) {
  console.log('🔍 [SETTINGS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [SETTINGS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [SETTINGS] Authorization header:', req.headers['authorization'])

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Verificar se é uma requisição de plano do usuário
  if (req.query.user_plan && req.query.user_id) {
    return await handleUserPlan(req, res)
  }

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

  if (!apiKey) {
    return res.status(400).json({ error: 'API Key é obrigatória' })
  }

  console.log('🔍 [SETTINGS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')

  try {
    // Verificar cache primeiro
    const cacheKey = `settings_${apiKey}_${req.query.debug || 'false'}`;
    
    if (requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 [SETTINGS] Retornando dados do cache');
        return res.status(200).json(cached.data);
      }
    }

    // Fazer requisição para RedTrack
    const url = `https://api.redtrack.io/settings?api_key=${apiKey}`;
    console.log('🌐 [SETTINGS] Fazendo requisição para RedTrack...');
    
    const data = await makeRequest(url, {
      'Authorization': `Bearer ${apiKey}`
    });

    console.log('✅ [SETTINGS] Dados recebidos do RedTrack');

    // Se debug está ativado, fazer análise de moeda
    if (req.query.debug === 'true') {
      console.log('🔍 [SETTINGS] Modo debug ativado - analisando moeda...');
      
      let currencyAnalysis = {
        currency_detected: null,
        analysis_details: {}
      };

      try {
        // 1. Verificar se há dados de campanhas para análise
        const campaignsUrl = `https://api.redtrack.io/campaigns?api_key=${apiKey}`;
        const campaignsData = await makeRequest(campaignsUrl, {
          'Authorization': `Bearer ${apiKey}`
        });

        if (campaignsData && Array.isArray(campaignsData) && campaignsData.length > 0) {
          // Analisar campanhas para detectar moeda
          const currencies = campaignsData
            .map(campaign => campaign.currency)
            .filter(currency => currency && currency.length > 0)
            .reduce((acc, currency) => {
              acc[currency] = (acc[currency] || 0) + 1;
              return acc;
            }, {});

          const mostCommonCurrency = Object.keys(currencies).reduce((a, b) => 
            currencies[a] > currencies[b] ? a : b, null
          );

          if (mostCommonCurrency) {
            currencyAnalysis.currency_detected = mostCommonCurrency;
            currencyAnalysis.analysis_details = {
              method: 'campaign_analysis',
              total_campaigns: campaignsData.length,
              currency_distribution: currencies,
              most_common: mostCommonCurrency
            };
          }
        }

        // 2. Se não encontrou nas campanhas, verificar conversões
        if (!currencyAnalysis.currency_detected) {
          const conversionsUrl = `https://api.redtrack.io/conversions?api_key=${apiKey}&date_from=2024-01-01&date_to=2024-12-31`;
          const conversionsData = await makeRequest(conversionsUrl, {
            'Authorization': `Bearer ${apiKey}`
          });

          if (conversionsData && Array.isArray(conversionsData) && conversionsData.length > 0) {
            const currencies = conversionsData
              .map(conversion => conversion.currency)
              .filter(currency => currency && currency.length > 0)
              .reduce((acc, currency) => {
                acc[currency] = (acc[currency] || 0) + 1;
                return acc;
              }, {});

            const mostCommonCurrency = Object.keys(currencies).reduce((a, b) => 
              currencies[a] > currencies[b] ? a : b, null
            );

            if (mostCommonCurrency) {
              currencyAnalysis.currency_detected = mostCommonCurrency;
              currencyAnalysis.analysis_details = {
                method: 'conversion_analysis',
                total_conversions: conversionsData.length,
                currency_distribution: currencies,
                most_common: mostCommonCurrency
              };
            }
          }
        }

        // 3. Se ainda não encontrou, verificar configurações da conta
        if (!currencyAnalysis.currency_detected) {
          currencyAnalysis.analysis_details.fallback = 'Nenhuma moeda detectada nas campanhas ou conversões'
        }

      } catch (currencyError) {
        console.error('❌ [SETTINGS] Erro na análise de moeda:', currencyError);
        currencyAnalysis.analysis_details.error = currencyError.message;
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