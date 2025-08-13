import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Logs de debug
console.log('🚀 Iniciando servidor...')
console.log('🔍 Verificando variáveis de ambiente:')
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configurada' : '❌ NÃO CONFIGURADA')
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configurada' : '❌ NÃO CONFIGURADA')
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ NÃO CONFIGURADA')

// Teste simples sem Stripe
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando!',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      STRIPE_CONFIGURED: !!process.env.STRIPE_SECRET_KEY,
      WEBHOOK_CONFIGURED: !!process.env.STRIPE_WEBHOOK_SECRET
    }
  })
})

// Endpoint de webhook do Stripe (simplificado)
app.post('/api/webhooks/stripe', async (req, res) => {
  console.log('📡 Webhook recebido!')
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY não configurada')
    return res.status(500).json({ error: 'Stripe não configurado' })
  }
  
  res.json({ 
    received: true, 
    message: 'Webhook funcionando!',
    stripeConfigured: true
  })
})

// Endpoint para verificar status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET
  })
})

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist')))

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📡 Endpoints de teste:`)
  console.log(`   - GET /api/test`)
  console.log(`   - GET /api/status`)
  console.log(`   - POST /api/webhooks/stripe`)
}) 