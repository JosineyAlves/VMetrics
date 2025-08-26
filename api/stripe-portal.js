import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customerId } = req.body

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID é obrigatório' })
    }

    console.log('🔗 [STRIPE-PORTAL] Criando sessão do Customer Portal para:', customerId)

    // Criar sessão do Customer Portal
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vmetrics.com'}/settings`,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID || null, // Opcional: ID de configuração personalizada
    })

    console.log('✅ [STRIPE-PORTAL] Sessão criada com sucesso:', session.id)

    res.status(200).json({ 
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('❌ [STRIPE-PORTAL] Erro ao criar sessão:', error)
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}

