import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user_id from request body
    const body = await req.json()
    const userId = body.user_id

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔍 [EDGE-FUNCTION] Buscando plano para user_id:', userId)

    // Buscar plano do usuário por user_id
    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (planError) {
      console.error('❌ [EDGE-FUNCTION] Erro ao buscar plano:', planError)
      return new Response(
        JSON.stringify({ error: 'User plan not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ [EDGE-FUNCTION] Plano encontrado:', userPlan)

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ [EDGE-FUNCTION] Erro ao buscar usuário:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ [EDGE-FUNCTION] Usuário encontrado:', user)

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

    console.log('✅ [EDGE-FUNCTION] Resposta formatada:', response)

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ [EDGE-FUNCTION] Erro interno:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getPlanName(planType: string) {
  const plans = {
    'monthly': 'Plano Mensal',
    'quarterly': 'Plano Trimestral',
    'starter': 'Starter',
    'pro': 'Pro',
    'enterprise': 'Enterprise'
  }
  return plans[planType] || 'Plano Desconhecido'
}

function getPlanPrice(planType: string) {
  const prices = {
    'monthly': 'R$ 79,00',
    'quarterly': 'R$ 197,00',
    'starter': 'R$ 29,00',
    'pro': 'R$ 79,00',
    'enterprise': 'R$ 199,00'
  }
  return prices[planType] || 'Gratuito'
}

function getPlanPeriod(planType: string) {
  const periods = {
    'monthly': 'mês',
    'quarterly': 'trimestre',
    'starter': 'mês',
    'pro': 'mês',
    'enterprise': 'mês'
  }
  return periods[planType] || 'mês'
}

function getPlanFeatures(planType: string) {
  const features = {
    'monthly': ['Acesso completo', 'Suporte prioritário', 'Relatórios avançados'],
    'quarterly': ['Acesso completo', 'Suporte prioritário', 'Relatórios avançados', 'Desconto trimestral'],
    'starter': ['Acesso básico', 'Suporte por email'],
    'pro': ['Acesso completo', 'Suporte prioritário', 'Relatórios avançados'],
    'enterprise': ['Acesso completo', 'Suporte dedicado', 'Relatórios customizados', 'API access']
  }
  return features[planType] || ['Acesso básico']
}
