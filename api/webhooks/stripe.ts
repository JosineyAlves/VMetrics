import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
  // TODO: Implementar criação de usuário e ativação de plano
}

export const config = {
  api: {
    bodyParser: false,
  },
}
