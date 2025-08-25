import { createClient } from '@supabase/supabase-js'

// Usar variáveis de ambiente do Vercel (VITE_ prefix)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fkqkwhzjvpzycfkbnqaq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcWt3aHpqdnB6eWNma2JucWFxIiwicm9sZSI6MTc1NDc1MTQ5NiwiZXhwIjoyMDcwMzI3NDk2fQ.ERA8osin0hmdw0sEoF9qhBU-tKRE4zt2lMGLScL4ap0'

console.log('🔧 [USER-INVOICES] Configuração Supabase:')
console.log('🔧 [USER-INVOICES] URL:', supabaseUrl)
console.log('🔧 [USER-INVOICES] Service Key presente:', !!supabaseServiceKey)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  console.log('🚀 [USER-INVOICES] API chamada com método:', req.method)
  console.log('🚀 [USER-INVOICES] Query params:', req.query)
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.query

    if (!email) {
      console.log('❌ [USER-INVOICES] Email não fornecido')
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    console.log('🔍 [USER-INVOICES] Buscando faturas para usuário:', email)

    // 1. Buscar usuário por email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.log('❌ [USER-INVOICES] Usuário não encontrado:', email)
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        invoices: []
      })
    }

    console.log('✅ [USER-INVOICES] Usuário encontrado:', user.id)

    // 2. Buscar plano ativo do usuário
    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (planError || !userPlan) {
      console.log('ℹ️ [USER-INVOICES] Nenhum plano ativo encontrado')
      return res.status(200).json({ 
        invoices: [],
        message: 'Nenhum plano ativo encontrado'
      })
    }

    console.log('✅ [USER-INVOICES] Plano ativo encontrado:', userPlan.plan_type)

    // 3. Buscar faturas do Stripe (simulado por enquanto)
    // TODO: Implementar busca real no Stripe quando tivermos as chaves
    const mockInvoices = [
      {
        id: 'in_1S04WaL6dVrVagX4LEl7HtY5',
        number: 'VM-001',
        amount: 2990,
        currency: 'brl',
        status: 'paid',
        created: userPlan.created_at,
        due_date: userPlan.current_period_end,
        description: `1 × ${userPlan.plan_type === 'starter' ? 'Plano Starter' : 'Plano Pro'} (R$ ${userPlan.plan_type === 'starter' ? '29,90' : '79,90'} / mês)`,
        invoice_pdf: `https://invoice.stripe.com/i/acct_1P2yvFL6dVrVagX4/test_${userPlan.stripe_subscription_id}`,
        hosted_invoice_url: `https://invoice.stripe.com/i/acct_1P2yvFL6dVrVagX4/test_${userPlan.stripe_subscription_id}`
      }
    ]

    // 4. Formatar resposta das faturas
    const formattedInvoices = mockInvoices.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      due_date: invoice.due_date,
      description: invoice.description,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      formatted_amount: `R$ ${(invoice.amount / 100).toFixed(2).replace('.', ',')}`,
      status_text: invoice.status === 'paid' ? 'Pago' : 
                   invoice.status === 'open' ? 'Aberto' : 
                   invoice.status === 'void' ? 'Cancelado' : 
                   invoice.status === 'uncollectible' ? 'Não Cobrável' : 'Desconhecido',
      status_color: invoice.status === 'paid' ? 'green' : 
                    invoice.status === 'open' ? 'yellow' : 
                    invoice.status === 'void' ? 'red' : 
                    invoice.status === 'uncollectible' ? 'red' : 'gray'
    }))

    const response = {
      invoices: formattedInvoices,
      user: {
        id: user.id,
        email: email,
        stripe_customer_id: user.stripe_customer_id
      },
      plan: {
        type: userPlan.plan_type,
        status: userPlan.status,
        subscription_id: userPlan.stripe_subscription_id
      }
    }

    console.log('✅ [USER-INVOICES] Resposta formatada:', response)

    return res.status(200).json(response)

  } catch (error) {
    console.error('❌ [USER-INVOICES] Erro:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      invoices: []
    })
  }
}
