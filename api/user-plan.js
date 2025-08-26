import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Usar variáveis de ambiente do Vercel (VITE_ prefix)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fkqkwhzjvpzycfkbnqaq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcWt3aHpqdnB6eWNma2JucWFxIiwicm9sZSI6MTc1NDc1MTQ5NiwiZXhwIjoyMDcwMzI3NDk2fQ.ERA8osin0hmdw0sEoF9qhBU-tKRE4zt2lMGLScL4ap0'

// Configurar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...')

console.log('🔧 [USER-PLAN] Configuração Supabase:')
console.log('🔧 [USER-PLAN] URL:', supabaseUrl)
console.log('🔧 [USER-PLAN] Service Key presente:', !!supabaseServiceKey)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  console.log('🚀 [USER-PLAN] API chamada com método:', req.method)
  console.log('🚀 [USER-PLAN] Query params:', req.query)
  console.log('🔧 [USER-PLAN] Environment:', process.env.NODE_ENV)
  console.log('🔧 [USER-PLAN] Supabase URL:', process.env.VITE_SUPABASE_URL)
  console.log('🔧 [USER-PLAN] Service Key presente:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.query

    if (!email) {
      console.log('❌ [USER-PLAN] Email não fornecido')
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    console.log('🔍 [USER-PLAN] Buscando plano para usuário:', email)
    console.log('🔧 [USER-PLAN] Supabase configurado:', !!supabase)

    // 1. Buscar usuário por email
    console.log('🔍 [USER-PLAN] Executando query para buscar usuário...')
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('email', email)
      .single()

    console.log('🔍 [USER-PLAN] Resultado da busca:', { user, userError })

    if (userError || !user) {
      console.log('❌ [USER-PLAN] Usuário não encontrado:', email)
      console.log('❌ [USER-PLAN] Erro detalhado:', userError)
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        plan: null,
        details: userError
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
           
           // 5. Buscar fatura do Stripe se tiver subscription_id
           let invoice = null
           if (userPlan.stripe_subscription_id) {
             try {
               console.log('🔍 [USER-PLAN] Buscando fatura no Stripe para:', userPlan.stripe_subscription_id)
               
               // Buscar a fatura mais recente da assinatura
               const invoices = await stripe.invoices.list({
                 subscription: userPlan.stripe_subscription_id,
                 limit: 1,
                 status: 'paid'
               })
               
               if (invoices.data.length > 0) {
                 const stripeInvoice = invoices.data[0]
                 invoice = {
                   id: stripeInvoice.id,
                   number: stripeInvoice.number,
                   amount: stripeInvoice.amount_paid,
                   currency: stripeInvoice.currency,
                   status: stripeInvoice.status,
                   created: new Date(stripeInvoice.created * 1000).toISOString(),
                   due_date: new Date(stripeInvoice.due_date * 1000).toISOString(),
                   description: stripeInvoice.description || `Assinatura ${userPlan.plan_type}`,
                   invoice_pdf: stripeInvoice.invoice_pdf,
                   hosted_invoice_url: stripeInvoice.hosted_invoice_url,
                   formatted_amount: `R$ ${(stripeInvoice.amount_paid / 100).toFixed(2).replace('.', ',')}`,
                   status_text: stripeInvoice.status === 'paid' ? 'Pago' : 'Pendente',
                   status_color: stripeInvoice.status === 'paid' ? 'green' : 'yellow'
                 }
                 console.log('✅ [USER-PLAN] Fatura encontrada:', invoice.id)
               }
             } catch (error) {
               console.error('❌ [USER-PLAN] Erro ao buscar fatura no Stripe:', error)
               // Não falhar se Stripe der erro, apenas continuar sem fatura
             }
           }
       
           const response = {
             plan: {
               ...planData,
               ...planInfo
             },
             user: {
               id: user.id,
               email: email,
               stripe_customer_id: user.stripe_customer_id
             },
             invoice: invoice
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
