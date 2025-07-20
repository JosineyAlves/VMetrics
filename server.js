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

// Importar os handlers da API
import reportHandler from './api/report.js'
import dashboardHandler from './api/dashboard.js'
import campaignsHandler from './api/campaigns.js'
import conversionsHandler from './api/conversions.js'
import tracksHandler from './api/tracks.js'
import settingsHandler from './api/settings.js'
import dictionariesHandler from './api/dictionaries.js'

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
}) 