// 🧪 TESTE DA EDGE FUNCTION USER-PLAN
// Execute: node test-edge-function.js

const testEdgeFunction = async () => {
  const userId = 'fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d' // ID do usuário josineyalves.produtos@gmail.com
  const supabaseUrl = 'https://your-project.supabase.co' // Substitua pela sua URL
  const supabaseAnonKey = 'your-anon-key' // Substitua pela sua chave
  
  try {
    console.log('🔍 Testando Edge Function user-plan...')
    console.log('User ID:', userId)
    
    const response = await fetch(`${supabaseUrl}/functions/v1/user-plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId })
    })
    
    console.log('Status:', response.status)
    console.log('Headers:', response.headers)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na Edge Function:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('✅ Dados recebidos:', JSON.stringify(data, null, 2))
    
    // Verificar estrutura dos dados
    if (data.plan) {
      console.log('✅ Plano encontrado:')
      console.log('- Tipo:', data.plan.plan_type)
      console.log('- Status:', data.plan.status)
      console.log('- Nome:', data.plan.name)
      console.log('- Preço:', data.plan.price)
      console.log('- Período:', data.plan.period)
      console.log('- Features:', data.plan.features)
    } else {
      console.log('❌ Nenhum plano encontrado')
    }
    
    if (data.user) {
      console.log('✅ Usuário encontrado:')
      console.log('- ID:', data.user.id)
      console.log('- Email:', data.user.email)
      console.log('- Stripe Customer ID:', data.user.stripe_customer_id)
    } else {
      console.log('❌ Nenhum usuário encontrado')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste
testEdgeFunction()
