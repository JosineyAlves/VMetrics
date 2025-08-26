import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subscriptionId, newPriceId, customerId } = req.body

    if (!subscriptionId || !newPriceId || !customerId) {
      return res.status(400).json({ 
        error: 'Subscription ID, New Price ID e Customer ID são obrigatórios' 
      })
    }

    console.log('🔄 [STRIPE-UPGRADE] Iniciando upgrade para subscription:', subscriptionId)
    console.log('🔄 [STRIPE-UPGRADE] Novo preço:', newPriceId)
    console.log('🔄 [STRIPE-UPGRADE] Customer:', customerId)

    // 1. Buscar a assinatura atual
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!currentSubscription) {
      return res.status(404).json({ error: 'Assinatura não encontrada' })
    }

    if (currentSubscription.customer !== customerId) {
      return res.status(403).json({ error: 'Customer ID não corresponde à assinatura' })
    }

    console.log('✅ [STRIPE-UPGRADE] Assinatura atual encontrada:', currentSubscription.status)

    // 2. Fazer o upgrade da assinatura
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [{
          id: currentSubscription.items.data[0].id, // Primeiro item da assinatura
          price: newPriceId
        }],
        proration_behavior: 'create_prorations', // Calcular prorata automaticamente
        metadata: {
          upgraded_at: new Date().toISOString(),
          previous_price: currentSubscription.items.data[0].price.id,
          upgrade_method: 'api_direct'
        }
      }
    )

    console.log('✅ [STRIPE-UPGRADE] Upgrade realizado com sucesso!')
    console.log('✅ [STRIPE-UPGRADE] Novo status:', updatedSubscription.status)

    // 3. Retornar dados da assinatura atualizada
    res.status(200).json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_start: updatedSubscription.current_period_start,
        current_period_end: updatedSubscription.current_period_end,
        items: updatedSubscription.items.data.map(item => ({
          price_id: item.price.id,
          product_id: item.price.product
        }))
      },
      message: 'Upgrade realizado com sucesso!'
    })

  } catch (error) {
    console.error('❌ [STRIPE-UPGRADE] Erro ao fazer upgrade:', error)
    
    // Tratar erros específicos do Stripe
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ 
        error: 'Erro no cartão de crédito',
        details: error.message 
      })
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        error: 'Dados inválidos para upgrade',
        details: error.message 
      })
    }

    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}
