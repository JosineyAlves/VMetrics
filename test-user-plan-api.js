// 🧪 TESTE DA API USER-PLAN
// Execute este arquivo para testar a API

const testUserPlanAPI = async () => {
  const userId = 'fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d' // ID do usuário josineyalves.produtos@gmail.com
  
  try {
    console.log('🔍 Testando API user-plan...')
    console.log('User ID:', userId)
    
    const response = await fetch(`/api/user-plan?user_id=${userId}`)
    
    console.log('Status:', response.status)
    console.log('Headers:', response.headers)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API:', errorText)
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
testUserPlanAPI()
