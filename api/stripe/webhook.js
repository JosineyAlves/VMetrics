import Stripe from 'stripe'
import supabase from '../_supabase.js'

export const config = {
  api: {
    bodyParser: false
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' })
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = []
    readable.on('data', (chunk) => chunks.push(chunk))
    readable.on('end', () => resolve(Buffer.concat(chunks)))
    readable.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
  } catch (err) {
    console.error('[STRIPE] webhook signature verification failed', err)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer
        const email = session.customer_details?.email || session.metadata?.email
        if (email && customerId) {
          await supabase.from('profiles').upsert({ email, stripe_customer_id: customerId, is_active: true })
          // enviar e-mail de boas-vindas de forma fire-and-forget
          fetch(process.env.SITE_URL + '/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email })
          }).catch(() => {})
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object
        const customerId = subscription.customer
        const status = subscription.status
        await supabase.from('profiles').update({ subscription_status: status, is_active: status === 'active' }).eq('stripe_customer_id', customerId)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer
        await supabase.from('profiles').update({ subscription_status: 'canceled', is_active: false }).eq('stripe_customer_id', customerId)
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('[STRIPE] webhook handler error', err)
    return res.status(500).send('Webhook handler error')
  }

  return res.status(200).json({ received: true })
}


