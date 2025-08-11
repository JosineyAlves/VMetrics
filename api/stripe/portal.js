import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const siteUrl = process.env.SITE_URL || 'http://localhost:5173'

if (!stripeSecretKey) {
  console.warn('[STRIPE] Missing STRIPE_SECRET_KEY env var')
}

const stripe = new Stripe(stripeSecretKey || '', { apiVersion: '2024-06-20' })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customer_id } = req.body || {}
    if (!customer_id) return res.status(400).json({ error: 'customer_id é obrigatório' })

    const portal = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: siteUrl
    })
    return res.status(200).json({ url: portal.url })
  } catch (err) {
    console.error('[STRIPE] portal error', err)
    return res.status(500).json({ error: 'Erro ao criar sessão do portal' })
  }
}


