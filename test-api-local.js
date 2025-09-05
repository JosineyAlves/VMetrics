// 🧪 TESTE LOCAL DA API USER-PLAN
// Execute: node test-api-local.js

const { createClient } = require('@supabase/supabase-js')

// Simular variáveis de ambiente
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key'

const testAPI = async () => {
  try {
    console.log('🔍 Testando API localmente...')
    
    // Simular requisição
    const req = {
      method: 'GET',
      query: {
        user_id: 'fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d'
      }
    }
    
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log('Status:', code)
          console.log('Response:', JSON.stringify(data, null, 2))
        }
      })
    }
    
    // Importar e executar a função
    const handler = require('./api/user-plan.js')
    await handler(req, res)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testAPI()

