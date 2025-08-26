import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID é obrigatório' });
    }

    console.log('🚀 [PORTAL] Criando sessão para cliente:', customerId);
    
    // Criar sessão do portal
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://app.vmetrics.com.br/dashboard'
    });
    
    console.log('✅ [PORTAL] Sessão criada com sucesso:', session.url);
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ [PORTAL] Erro ao criar sessão:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
}
