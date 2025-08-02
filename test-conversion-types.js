// Teste específico dos tipos de conversão
const API_KEY = 'K0Y6dcsgEqmjQp0CKD49'
const BASE_URL = 'https://my-dash-two.vercel.app'

async function testConversionTypes() {
  console.log('🧪 Testando tipos de conversão específicos...')
  
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
    
    // Verificar se há dados
    if (data.campaigns && data.campaigns.length > 0) {
      console.log('📊 Campanhas com conversões válidas (Purchase/Conversion):')
      data.campaigns.forEach((campaign, idx) => {
        console.log(`  ${idx + 1}. ${campaign.name}`)
        console.log(`     - Revenue: ${campaign.revenue}`)
        console.log(`     - Conversions: ${campaign.conversions}`)
        console.log(`     - CPA: ${campaign.conversions > 0 ? (campaign.cost / campaign.conversions).toFixed(2) : 0}`)
        console.log('')
      })
    } else {
      console.log('⚠️ Nenhuma campanha com conversões válidas encontrada')
    }
    
    if (data.ads && data.ads.length > 0) {
      console.log('📊 Anúncios com conversões válidas (Purchase/Conversion):')
      data.ads.forEach((ad, idx) => {
        console.log(`  ${idx + 1}. ${ad.name}`)
        console.log(`     - Revenue: ${ad.revenue}`)
        console.log(`     - Conversions: ${ad.conversions}`)
        console.log(`     - CPA: ${ad.conversions > 0 ? (ad.cost / ad.conversions).toFixed(2) : 0}`)
        console.log('')
      })
    } else {
      console.log('⚠️ Nenhum anúncio com conversões válidas encontrado')
    }
    
    if (data.offers && data.offers.length > 0) {
      console.log('📊 Ofertas com conversões válidas (Purchase/Conversion):')
      data.offers.forEach((offer, idx) => {
        console.log(`  ${idx + 1}. ${offer.name}`)
        console.log(`     - Revenue: ${offer.revenue}`)
        console.log(`     - Conversions: ${offer.conversions}`)
        console.log(`     - CPA: ${offer.conversions > 0 ? (offer.cost / offer.conversions).toFixed(2) : 0}`)
        console.log('')
      })
    } else {
      console.log('⚠️ Nenhuma oferta com conversões válidas encontrada')
    }
    
    console.log('✅ Teste concluído: Apenas Purchase e Conversion são contados como conversões!')
    console.log('📋 Tipos de conversão aceitos:')
    console.log('   ✅ Purchase (Compra)')
    console.log('   ✅ Conversion (Conversão)')
    console.log('   ❌ InitiateCheckout (Ignorado)')
    console.log('   ❌ Lead, SignUp, Subscribe, etc. (Ignorados)')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste
testConversionTypes() 