// API para buscar plano do usuário
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    // Importar Supabase
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Configuração do Supabase não encontrada' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar usuário por email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email, stripe_customer_id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      console.log('Usuário não encontrado:', email)
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Buscar plano do usuário
    const { data: planData, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userData.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (planError || !planData) {
      console.log('Plano não encontrado para usuário:', userData.id)
      return res.json({
        plan: null,
        user: userData
      })
    }

    // Buscar fatura mais recente
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Mapear dados do plano
    const plan = {
      id: planData.id,
      plan_type: planData.plan_type,
      status: planData.status,
      stripe_subscription_id: planData.stripe_subscription_id,
      stripe_customer_id: planData.stripe_customer_id,
      current_period_start: planData.current_period_start,
      current_period_end: planData.current_period_end,
      name: planData.plan_type === 'monthly' ? 'Plano Mensal' : 'Plano Trimestral',
      price: planData.plan_type === 'monthly' ? 'R$ 79,00' : 'R$ 197,00',
      period: planData.plan_type === 'monthly' ? 'mês' : 'trimestre',
      features: [
        'Dashboard completo',
        'Relatórios avançados',
        'Suporte prioritário',
        'Integração RedTrack'
      ],
      nextBilling: planData.current_period_end
    }

    const response = {
      plan,
      user: userData
    }

    if (invoiceData) {
      response.invoice = invoiceData
    }

    console.log('✅ [USER-PLAN-API] Plano encontrado:', plan.plan_type, 'para:', email)

    return res.json(response)

  } catch (error) {
    console.error('❌ [USER-PLAN-API] Erro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
