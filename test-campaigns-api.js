// Teste da API de campanhas
const testCampaignsAPI = async () => {
  console.log('🚀 Testando API de campanhas...')
  
  try {
    // Simular chamada para a API
    const params = {
      api_key: 'kXlmMfpINGQqv4btkwRL',
      date_from: '2025-08-01',
      date_to: '2025-08-16',
      group_by: 'campaign'
    }
    
    const url = new URL('/api/campaigns', window.location.origin)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value.toString())
      }
    })
    
    console.log('🔍 URL da API:', url.toString())
    
    const response = await fetch(url.toString())
    console.log('🔍 Status da resposta:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Dados recebidos:', data)
      console.log('✅ Tipo:', typeof data)
      console.log('✅ É array?', Array.isArray(data))
      console.log('✅ Keys disponíveis:', data ? Object.keys(data) : 'null/undefined')
      
      if (data && data.campaigns) {
        console.log('✅ data.campaigns existe:', Array.isArray(data.campaigns))
        console.log('✅ Número de campanhas:', data.campaigns.length)
        
        if (data.campaigns.length > 0) {
          console.log('✅ Primeira campanha:', data.campaigns[0])
          console.log('✅ source_title:', data.campaigns[0].source_title)
          console.log('✅ stat.cost:', data.campaigns[0].stat?.cost)
        }
      }
    } else {
      console.log('❌ Erro na resposta:', response.status)
      const errorText = await response.text()
      console.log('❌ Detalhes do erro:', errorText)
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error)
  }
}

// Executar teste
testCampaignsAPI()

