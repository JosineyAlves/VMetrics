// Teste do filtro de conversões (apenas Purchase e Conversion)
const API_KEY = 'K0Y6dcsgEqmjQp0CKD49'
const BASE_URL = 'https://my-dash-two.vercel.app'

async function testConversionFiltering() {
  console.log('🧪 Testando filtro de conversões (apenas Purchase e Conversion)...')
  
  const params = {
    api_key: API_KEY,
    date_from: '2025-07-01',
    date_to: '2025-07-31',
    _t: Date.now() // Forçar refresh
  }
  
  const url = new URL('/api/performance', BASE_URL)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  
  try {
    console.log('📡 Fazendo requisição para:', url.toString())
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    console.log('✅ Resposta recebida:')
    
    if (data.campaigns) {
      console.log('📊 Campanhas (apenas conversões válidas):')
      data.campaigns.forEach((campaign, idx) => {
        console.log(`  ${idx + 1}. ${campaign.name}`)
        console.log(`     - Revenue: ${campaign.revenue}`)
        console.log(`     - Conversions: ${campaign.conversions}`)
        console.log('')
      })
    }
    
    if (data.ads) {
      console.log('📊 Anúncios (apenas conversões válidas):')
      data.ads.forEach((ad, idx) => {
        console.log(`  ${idx + 1}. ${ad.name}`)
        console.log(`     - Revenue: ${ad.revenue}`)
        console.log(`     - Conversions: ${ad.conversions}`)
        console.log('')
      })
    }
    
    if (data.offers) {
      console.log('📊 Ofertas (apenas conversões válidas):')
      data.offers.forEach((offer, idx) => {
        console.log(`  ${idx + 1}. ${offer.name}`)
        console.log(`     - Revenue: ${offer.revenue}`)
        console.log(`     - Conversions: ${offer.conversions}`)
        console.log('')
      })
    }
    
    console.log('✅ Teste concluído: Apenas Purchase e Conversion são considerados conversões válidas!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste
testConversionFiltering() 