import Stripe from 'stripe'

// Configurar Stripe com chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subscriptionId } = req.query

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID é obrigatório' })
    }

    console.log('🔍 [STRIPE-INVOICE] Buscando fatura para assinatura:', subscriptionId)

    // Buscar a assinatura no Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!subscription) {
      return res.status(404).json({ error: 'Assinatura não encontrada' })
    }

    // Buscar a fatura mais recente da assinatura
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      limit: 1,
      status: 'paid'
    })

    if (invoices.data.length === 0) {
      return res.status(404).json({ error: 'Nenhuma fatura encontrada para esta assinatura' })
    }

    const invoice = invoices.data[0]

    // Retornar dados da fatura com URLs corretas
    const invoiceData = {
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      created: new Date(invoice.created * 1000).toISOString(),
      due_date: new Date(invoice.due_date * 1000).toISOString(),
      description: invoice.description || `Assinatura ${subscription.status}`,
      // URLs corretas do Stripe
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      formatted_amount: `R$ ${(invoice.amount_paid / 100).toFixed(2).replace('.', ',')}`,
      status_text: invoice.status === 'paid' ? 'Pago' : 'Pendente',
      status_color: invoice.status === 'paid' ? 'green' : 'yellow'
    }

    console.log('✅ [STRIPE-INVOICE] Fatura encontrada:', invoiceData.id)

    return res.status(200).json(invoiceData)

  } catch (error) {
    console.error('❌ [STRIPE-INVOICE] Erro:', error)
    
    // Se for erro de autenticação, retornar erro específico
    if (error.type === 'StripeAuthenticationError') {
      return res.status(401).json({ error: 'Chave do Stripe inválida' })
    }
    
    // Se for erro de não encontrado
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ error: 'Assinatura ou fatura não encontrada' })
    }

    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
}
