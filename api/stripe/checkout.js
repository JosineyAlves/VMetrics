import Stripe from 'stripe'
import supabase from '../_supabase.js'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePriceId = process.env.STRIPE_PRICE_ID // preço do plano principal
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
    const { email, user_id } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' })

    // buscar/associar customer ao usuário
    let customerId

    // tentar recuperar customer salvo
    if (user_id) {
      const { data: existing, error } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user_id)
        .maybeSingle()

      if (error) console.warn('[SUPABASE] profiles select error', error)
      if (existing?.stripe_customer_id) customerId = existing.stripe_customer_id
    }

    // criar/recuperar customer no Stripe
    if (!customerId) {
      const customers = await stripe.customers.list({ email, limit: 1 })
      customerId = customers.data[0]?.id
      if (!customerId) {
        const customer = await stripe.customers.create({ email })
        customerId = customer.id
      }
    }

    // salvar customer no perfil
    if (user_id && customerId) {
      await supabase
        .from('profiles')
        .upsert({ id: user_id, stripe_customer_id: customerId })
    }

    const priceId = stripePriceId
    if (!priceId) {
      return res.status(500).json({ error: 'STRIPE_PRICE_ID não configurado' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto'
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[STRIPE] checkout error', err)
    return res.status(500).json({ error: 'Erro ao criar sessão de checkout' })
  }
}


