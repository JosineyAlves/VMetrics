import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    console.log('🔍 [USER-PLAN] Buscando plano para usuário:', email)

    // 1. Buscar usuário por email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.log('❌ [USER-PLAN] Usuário não encontrado:', email)
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        plan: null 
      })
    }

    console.log('✅ [USER-PLAN] Usuário encontrado:', user.id)

    // 2. Buscar plano ativo do usuário
    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (planError || !userPlan) {
      console.log('ℹ️ [USER-PLAN] Nenhum plano ativo encontrado para usuário:', user.id)
      return res.status(200).json({ 
        plan: null,
        user: {
          id: user.id,
          email: email,
          stripe_customer_id: user.stripe_customer_id
        }
      })
    }

    console.log('✅ [USER-PLAN] Plano ativo encontrado:', userPlan.plan_type)

    // 3. Formatar resposta do plano
    const planData = {
      id: userPlan.id,
      plan_type: userPlan.plan_type,
      status: userPlan.status,
      stripe_subscription_id: userPlan.stripe_subscription_id,
      stripe_customer_id: userPlan.stripe_customer_id,
      current_period_start: userPlan.current_period_start,
      current_period_end: userPlan.current_period_end,
      created_at: userPlan.created_at,
      updated_at: userPlan.updated_at
    }

    // 4. Mapear tipo de plano para informações detalhadas
    const planInfo = getPlanInfo(userPlan.plan_type)

    const response = {
      plan: {
        ...planData,
        ...planInfo
      },
      user: {
        id: user.id,
        email: email,
        stripe_customer_id: user.stripe_customer_id
      }
    }

    console.log('✅ [USER-PLAN] Resposta formatada:', response)

    return res.status(200).json(response)

  } catch (error) {
    console.error('❌ [USER-PLAN] Erro:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}

// Função para mapear tipo de plano para informações detalhadas
function getPlanInfo(planType) {
  const plans = {
    starter: {
      name: 'Plano Starter',
      price: 'R$ 29,90',
      period: 'mês',
      features: [
        'Dashboard integrado ao RedTrack',
        'Métricas básicas (ROI, CPA, CTR)',
        'Suporte por email',
        'Até 5 campanhas'
      ],
      nextBilling: null // Será calculado dinamicamente
    },
    pro: {
      name: 'Plano Pro',
      price: 'R$ 79,90',
      period: 'mês',
      features: [
        'Campanhas ilimitadas',
        'Análise de funil 3D',
        'Métricas avançadas (50+ indicadores)',
        'Suporte prioritário',
        'Comparação entre campanhas'
      ],
      nextBilling: null // Será calculado dinamicamente
    },
    enterprise: {
      name: 'Plano Enterprise',
      price: 'Sob consulta',
      period: 'personalizado',
      features: [
        'Tudo do plano Pro',
        'Suporte 24/7',
        'Integrações customizadas',
        'SLA garantido'
      ],
      nextBilling: null
    }
  }

  const plan = plans[planType] || plans.starter

  // Calcular próxima cobrança se o plano for ativo
  if (planType !== 'enterprise') {
    plan.nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  return plan
}
