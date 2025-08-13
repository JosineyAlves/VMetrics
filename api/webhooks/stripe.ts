import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  if (!sig) {
    return res.status(400).json({ error: 'Stripe signature missing' })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    console.log('✅ Webhook verified:', event.type)
  } catch (err) {
    console.error('❌ Webhook verification failed:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log('⚠️ Unhandled event type:', event.type)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🛒 Checkout completed:', session.id)
  
  try {
    // 1. Obter dados da sessão
    const customerEmail = session.customer_details?.email
    const customerName = session.customer_details?.name || 'Usuário VMetrics'
    const stripeCustomerId = session.customer as string
    
    if (!customerEmail || !stripeCustomerId) {
      console.error('❌ Dados do cliente incompletos:', { customerEmail, stripeCustomerId })
      return
    }

    console.log('👤 Dados do cliente:', { customerEmail, customerName, stripeCustomerId })

    // 2. Obter detalhes do produto comprado
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    if (lineItems.data.length > 0) {
      const priceId = lineItems.data[0].price?.id
      const productName = lineItems.data[0].description
      console.log('📦 Produto comprado:', { priceId, productName })
    }

    // 3. Logs para configuração manual no Supabase
    console.log('📋 AÇÕES NECESSÁRIAS NO SUPABASE:')
    console.log('1. Verificar se usuário foi criado na tabela "profiles" (deve ser automático)')
    console.log('2. Verificar se assinatura foi criada na tabela "subscriptions"')
    console.log('3. Atualizar stripe_customer_id na tabela "profiles" se necessário')
    
    console.log('✅ Processamento do checkout concluído!')
    
  } catch (error) {
    console.error('❌ Erro no processamento do checkout:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📅 Nova assinatura criada:', subscription.id)
  console.log('📋 Dados da assinatura:', {
    id: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price.id
  })
  
  console.log('📋 AÇÕES NECESSÁRIAS NO SUPABASE:')
  console.log('1. Inserir nova assinatura na tabela "subscriptions"')
  console.log('2. Verificar se usuário existe na tabela "profiles"')
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Assinatura atualizada:', subscription.id)
  console.log('📋 Atualizar dados da assinatura na tabela "subscriptions"')
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Assinatura cancelada:', subscription.id)
  console.log('📋 Atualizar status da assinatura para "canceled" na tabela "subscriptions"')
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Pagamento de fatura realizado:', invoice.id)
  console.log('📋 Verificar se assinatura está ativa na tabela "subscriptions"')
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💸 Pagamento de fatura falhou:', invoice.id)
  console.log('📋 Atualizar status da assinatura para "past_due" na tabela "subscriptions"')
}

export const config = {
  api: {
    bodyParser: false,
  },
}
