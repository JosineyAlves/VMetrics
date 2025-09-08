import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Middleware especial para webhooks do Stripe (raw body)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))

// Importar os handlers da API
import reportHandler from './api/report.js'
import dashboardHandler from './api/dashboard.js'
import campaignsHandler from './api/campaigns.js'
import conversionsHandler from './api/conversions.js'
import tracksHandler from './api/tracks.js'
import settingsHandler from './api/settings.js'
import dictionariesHandler from './api/dictionaries.js'
import performanceHandler from './api/performance.js'

// Importar Stripe para webhooks
import Stripe from 'stripe'

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
})

// Rotas da API
app.get('/report', async (req, res) => {
  try {
    await reportHandler(req, res)
  } catch (error) {
    console.error('Erro no endpoint /report:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.get('/dashboard', async (req, res) => {
  try {
    await dashboardHandler(req, res)
  } catch (error) {
    console.error('Erro no endpoint /dashboard:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.get('/campaigns', async (req, res) => {
  try {
    await campaignsHandler(req, res)
  } catch (error) {
    console.error('Erro no endpoint /campaigns:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.get('/conversions', async (req, res) => {
  try {
    await conversionsHandler(req, res)
  } catch (error) {
    console.error('Erro no endpoint /conversions:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.get('/tracks', async (req, res) => {
  try {
    await tracksHandler(req, res)
  } catch (error) {
    console.error('Erro no endpoint /tracks:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.get('/settings', async (req, res) => {
  try {
    await settingsHandler(req, res)
  } catch (error) {
    console.error('Erro no endpoint /settings:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.get('/dictionaries', async (req, res) => {
  try {
    await dictionariesHandler(req, res)
  } catch (error) {
    console.error('Erro no endpoint /dictionaries:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

app.get('/performance', async (req, res) => {
  try {
    await performanceHandler(req, res)
  } catch (error) {
    console.error('Erro no endpoint /performance:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// ===== ENDPOINTS DO STRIPE =====

// Endpoint para criar sessão de checkout
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerId, successUrl, cancelUrl } = req.body

    if (!priceId || !customerId) {
      return res.status(400).json({ 
        error: 'priceId e customerId são obrigatórios' 
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.VITE_STRIPE_SUCCESS_URL || 'http://localhost:5173/success'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || process.env.VITE_STRIPE_CANCEL_URL || 'http://localhost:5173/pricing',
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error('❌ Erro ao criar sessão de checkout:', error)
    res.status(500).json({ 
      error: 'Erro ao criar sessão de checkout',
      details: error.message 
    })
  }
})

// Endpoint para criar sessão do portal do cliente
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body

    if (!customerId) {
      return res.status(400).json({ 
        error: 'customerId é obrigatório' 
      })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || process.env.VITE_STRIPE_PORTAL_RETURN_URL || 'http://localhost:5173/dashboard'
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error('❌ Erro ao criar sessão do portal:', error)
    res.status(500).json({ 
      error: 'Erro ao criar sessão do portal',
      details: error.message 
    })
  }
})

// Endpoint de webhook do Stripe
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET não configurado')
    return res.status(500).json({ error: 'Webhook secret não configurado' })
  }

  let event

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    console.log('✅ Webhook verificado:', event.type)
  } catch (err) {
    console.error('❌ Erro na verificação do webhook:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Processar evento de forma assíncrona
  processWebhookEvent(event)

  // Retornar 200 para confirmar recebimento
  res.json({ received: true })
})

// Função para processar eventos do webhook
async function processWebhookEvent(event) {
  try {
    console.log(`🔄 Processando evento: ${event.type}`)
    
    // Importar o serviço de webhook dinamicamente
    const { webhookService } = await import('./src/services/webhookService.js')
    
    // Processar o evento usando o serviço
    await webhookService.processEvent(event)
    
    console.log(`✅ Evento processado com sucesso: ${event.type}`)
  } catch (error) {
    console.error(`❌ Erro ao processar webhook ${event.type}:`, error)
    
    // Em produção, você pode querer:
    // - Enviar notificação para um serviço de monitoramento
    // - Registrar em um sistema de logs
    // - Tentar reprocessar o evento
  }
}

// Endpoint para verificar status dos webhooks
app.get('/api/stripe/webhook-status', (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  res.json({
    webhookConfigured: !!webhookSecret,
    webhookSecret: webhookSecret ? `${webhookSecret.substring(0, 10)}...` : null,
    supportedEvents: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'customer.created',
      'customer.updated'
    ],
    webhookUrl: `${req.protocol}://${req.get('host')}/api/webhooks/stripe`
  })
})

// Endpoint para testar webhook (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/stripe/test-webhook', async (req, res) => {
    try {
      const { eventType, eventData } = req.body
      
      if (!eventType) {
        return res.status(400).json({ error: 'eventType é obrigatório' })
      }
      
      // Simular evento do Stripe
      const mockEvent = {
        id: 'evt_test_' + Date.now(),
        type: eventType,
        data: { object: eventData || {} },
        created: Math.floor(Date.now() / 1000)
      }
      
      // Processar evento
      await processWebhookEvent(mockEvent)
      
      res.json({ 
        success: true, 
        message: `Evento ${eventType} processado com sucesso`,
        event: mockEvent
      })
    } catch (error) {
      console.error('❌ Erro ao testar webhook:', error)
      res.status(500).json({ 
        error: 'Erro ao testar webhook',
        details: error.message 
      })
    }
  })
}

// Servir arquivos estáticos do build (se existir)
app.use(express.static(path.join(__dirname, 'dist')))

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  console.log(`📡 API endpoints disponíveis:`)
  console.log(`   - GET /report`)
  console.log(`   - GET /dashboard`)
  console.log(`   - GET /campaigns`)
  console.log(`   - GET /conversions`)
  console.log(`   - GET /tracks`)
  console.log(`   - GET /settings`)
  console.log(`   - GET /dictionaries`)
  console.log(`   - POST /api/stripe/create-checkout-session`)
  console.log(`   - POST /api/stripe/create-portal-session`)
  console.log(`   - POST /api/webhooks/stripe`)
  console.log(`   - GET /api/stripe/webhook-status`)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`   - POST /api/stripe/test-webhook (DEV)`)
  }
}) 
import sendEmailHandler from './api/send-email.js'

// Rota do Resend
app.post('/api/send-email', async (req, res) => {
  try {
    await sendEmailHandler(req, res)
  } catch (error) {
    console.error('Error in send-email route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
