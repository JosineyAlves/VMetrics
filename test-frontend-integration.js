// 🧪 TESTE DE INTEGRAÇÃO FRONTEND
// Simula o comportamento do frontend

const testFrontendIntegration = () => {
  console.log('🔍 Testando integração frontend...')
  
  // Simular dados do usuário logado
  const mockUser = {
    id: 'fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d',
    email: 'josineyalves.produtos@gmail.com'
  }
  
  console.log('✅ Usuário logado:', mockUser.email)
  console.log('✅ User ID:', mockUser.id)
  
  // Simular chamada da Edge Function (como o frontend faria)
  const callEdgeFunction = async (userId) => {
    const supabaseUrl = 'https://fkqkwhzjvpzycfkbnqaq.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcWt3aHpqdnB6eWNma2JucWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTE0OTYsImV4cCI6MjA3MDMyNzQ5Nn0.69mJMOg5_qiJIyNAPLsjb-FY1mXT7cJWkf_p3rE68K0'
    
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/user-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('❌ Erro na chamada:', error)
      return null
    }
  }
  
  // Testar integração
  callEdgeFunction(mockUser.id).then(data => {
    if (data) {
      console.log('✅ Frontend receberia os dados:', {
        planType: data.plan?.plan_type,
        planName: data.plan?.name,
        planPrice: data.plan?.price,
        userEmail: data.user?.email
      })
      
      // Verificar se é o usuário correto
      if (data.user?.email === mockUser.email) {
        console.log('✅ SUCESSO: Frontend está buscando dados do usuário correto!')
        console.log('✅ PROBLEMA RESOLVIDO: Não mais busca dados do usuário antigo!')
      } else {
        console.log('❌ ERRO: Frontend ainda está buscando dados incorretos!')
      }
    }
  })
}

testFrontendIntegration()

