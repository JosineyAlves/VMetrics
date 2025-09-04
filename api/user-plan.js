import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    console.log('🔍 [API-USER-PLAN] Buscando plano para user_id:', user_id)

    // Buscar plano do usuário por user_id
    const { data: userPlan, error: planError } = await supabaseAdmin
      .from('user_plans')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single()

    if (planError) {
      console.error('❌ [API-USER-PLAN] Erro ao buscar plano:', planError)
      return res.status(404).json({ error: 'User plan not found' })
    }

    console.log('✅ [API-USER-PLAN] Plano encontrado:', userPlan)

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('❌ [API-USER-PLAN] Erro ao buscar usuário:', userError)
      return res.status(404).json({ error: 'User not found' })
    }

    console.log('✅ [API-USER-PLAN] Usuário encontrado:', user)

    // Formatar resposta
    const response = {
      plan: userPlan ? {
        id: userPlan.id,
        plan_type: userPlan.plan_type,
        status: userPlan.status,
        stripe_subscription_id: userPlan.stripe_subscription_id,
        stripe_customer_id: userPlan.stripe_customer_id,
        current_period_start: userPlan.current_period_start,
        current_period_end: userPlan.current_period_end,
        name: getPlanName(userPlan.plan_type),
        price: getPlanPrice(userPlan.plan_type),
        period: getPlanPeriod(userPlan.plan_type),
        features: getPlanFeatures(userPlan.plan_type),
        nextBilling: userPlan.current_period_end
      } : null,
      user: {
        id: user.id,
        email: user.email,
        stripe_customer_id: user.stripe_customer_id
      }
    }

    console.log('✅ [API-USER-PLAN] Resposta formatada:', response)
    res.status(200).json(response)

  } catch (error) {
    console.error('❌ [API-USER-PLAN] Erro interno:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

function getPlanName(planType) {
  const plans = {
    'monthly': 'Plano Mensal',
    'quarterly': 'Plano Trimestral',
    'starter': 'Starter',
    'pro': 'Pro',
    'enterprise': 'Enterprise'
  }
  return plans[planType] || 'Plano Desconhecido'
}

function getPlanPrice(planType) {
  const prices = {
    'monthly': 'R$ 79,00',
    'quarterly': 'R$ 197,00',
    'starter': 'R$ 29,00',
    'pro': 'R$ 79,00',
    'enterprise': 'R$ 199,00'
  }
  return prices[planType] || 'Gratuito'
}

function getPlanPeriod(planType) {
  const periods = {
    'monthly': 'mês',
    'quarterly': 'trimestre',
    'starter': 'mês',
    'pro': 'mês',
    'enterprise': 'mês'
  }
  return periods[planType] || 'mês'
}

function getPlanFeatures(planType) {
  const features = {
    'monthly': ['Acesso completo', 'Suporte prioritário', 'Relatórios avançados'],
    'quarterly': ['Acesso completo', 'Suporte prioritário', 'Relatórios avançados', 'Desconto trimestral'],
    'starter': ['Acesso básico', 'Suporte por email'],
    'pro': ['Acesso completo', 'Suporte prioritário', 'Relatórios avançados'],
    'enterprise': ['Acesso completo', 'Suporte dedicado', 'Relatórios customizados', 'API access']
  }
  return features[planType] || ['Acesso básico']
}
