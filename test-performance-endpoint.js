// Teste do endpoint de performance
const API_KEY = 'sua_api_key_aqui' // Substitua pela sua API key
const BASE_URL = 'http://localhost:3001'

async function testPerformanceEndpoint() {
  console.log('🧪 Testando endpoint de performance...')
  
  const params = {
    api_key: API_KEY,
    date_from: '2024-01-01',
    date_to: '2024-01-31'
  }
  
  const url = new URL('/performance', BASE_URL)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  
  try {
    console.log('📡 Fazendo requisição para:', url.toString())
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    console.log('✅ Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    })
    
    if (data.campaigns) {
      console.log('📊 Campanhas encontradas:', data.campaigns.length)
      data.campaigns.slice(0, 3).forEach((campaign, idx) => {
        console.log(`  ${idx + 1}. ${campaign.name} - Revenue: $${campaign.revenue} - Conversions: ${campaign.conversions}`)
      })
    }
    
    if (data.ads) {
      console.log('📊 Anúncios encontrados:', data.ads.length)
      data.ads.slice(0, 3).forEach((ad, idx) => {
        console.log(`  ${idx + 1}. ${ad.name} - Revenue: $${ad.revenue} - Conversions: ${ad.conversions}`)
      })
    }
    
    if (data.offers) {
      console.log('📊 Ofertas encontradas:', data.offers.length)
      data.offers.slice(0, 3).forEach((offer, idx) => {
        console.log(`  ${idx + 1}. ${offer.name} - Revenue: $${offer.revenue} - Conversions: ${offer.conversions}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste
testPerformanceEndpoint() 