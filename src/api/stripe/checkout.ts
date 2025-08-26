import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function createCheckoutSession(req: Request): Promise<Response> {
  try {
    const body = await req.json()
    const { price_id, customer_email, customer_name, plan_type, success_url, cancel_url } = body

    if (!price_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Price ID é obrigatório' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      customer_email,
      customer_creation: 'always',
      metadata: {
        plan_type: plan_type,
        customer_name: customer_name || ''
      },
      success_url: success_url || `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/pricing?cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          plan_type: plan_type
        }
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        checkout_url: session.url
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}

export async function createPortalSession(req: Request): Promise<Response> {
  try {
    const body = await req.json()
    const { customer_id, return_url } = body

    if (!customer_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Customer ID é obrigatório' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Criar sessão do portal do cliente
    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: return_url || `${req.headers.get('origin')}/dashboard`
    })

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro ao criar sessão do portal:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}

export async function getSubscriptionDetails(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const subscriptionId = url.searchParams.get('subscription_id')

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription ID é obrigatório' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Buscar detalhes da assinatura
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'items.data.price.product']
    })

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          customer: subscription.customer,
          items: subscription.items.data,
          metadata: subscription.metadata
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro ao buscar detalhes da assinatura:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}
