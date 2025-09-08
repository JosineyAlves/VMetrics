import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' })

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    console.log('🔍 [USER-PLAN] Buscando plano para email:', email)

    // 1. Buscar usuário pelo email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.log('❌ [USER-PLAN] Usuário não encontrado:', userError)
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    console.log('✅ [USER-PLAN] Usuário encontrado:', user.id)

    // 2. Buscar plano do usuário
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (subscriptionError || !subscription) {
      console.log('❌ [USER-PLAN] Plano não encontrado:', subscriptionError)
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

    console.log('✅ [USER-PLAN] Plano encontrado:', subscription)

    // 3. Buscar detalhes da subscription no Stripe se necessário
    let stripeSubscription = null
    let invoice = null
    
    if (subscription.stripe_subscription_id) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
        
        // Buscar última fatura
        const invoices = await stripe.invoices.list({
          subscription: subscription.stripe_subscription_id,
          limit: 1
        })
        
        if (invoices.data.length > 0) {
          const stripeInvoice = invoices.data[0]
          invoice = {
            id: stripeInvoice.id,
            number: stripeInvoice.number,
            description: `Plano ${subscription.plan_type === 'monthly' ? 'Mensal' : 'Trimestral'}`,
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

    // 4. Mapear dados do plano
    const planFeatures = subscription.plan_type === 'monthly' ? [
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
      id: subscription.id,
      plan_type: subscription.plan_type,
      status: subscription.status,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_customer_id: subscription.stripe_customer_id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      name: subscription.plan_type === 'monthly' ? 'Plano Mensal' : 'Plano Trimestral',
      price: subscription.plan_type === 'monthly' ? 'R$ 79,00' : 'R$ 65,67',
      period: subscription.plan_type === 'monthly' ? 'mensal' : 'trimestral',
      features: planFeatures,
      nextBilling: subscription.current_period_end
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
    res.json(response)

  } catch (error) {
    console.error('❌ [USER-PLAN] Erro geral:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}
