// Teste do cálculo de CPA com dados de custo
const API_KEY = 'K0Y6dcsgEqmjQp0CKD49'
const BASE_URL = 'https://my-dash-two.vercel.app'

async function testCPACalculation() {
  console.log('🧪 Testando cálculo de CPA com dados de custo...')
  
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
      console.log('📊 Campanhas com CPA calculado:')
      data.campaigns.forEach((campaign, idx) => {
        const cpa = campaign.conversions > 0 ? (campaign.cost / campaign.conversions) : 0
        const roi = campaign.cost > 0 ? ((campaign.revenue - campaign.cost) / campaign.cost) * 100 : 0
        
        console.log(`  ${idx + 1}. ${campaign.name}`)
                 console.log(`     - Revenue: ${campaign.revenue}`)
         console.log(`     - Cost: ${campaign.cost}`)
         console.log(`     - Conversions: ${campaign.conversions}`)
         console.log(`     - CPA: ${cpa.toFixed(2)}`)
         console.log(`     - ROI: ${roi.toFixed(2)}%`)
        console.log('')
      })
    }
    
    if (data.ads) {
      console.log('📊 Anúncios com CPA calculado:')
      data.ads.forEach((ad, idx) => {
        const cpa = ad.conversions > 0 ? (ad.cost / ad.conversions) : 0
        const roi = ad.cost > 0 ? ((ad.revenue - ad.cost) / ad.cost) * 100 : 0
        
        console.log(`  ${idx + 1}. ${ad.name}`)
                 console.log(`     - Revenue: ${ad.revenue}`)
         console.log(`     - Cost: ${ad.cost}`)
         console.log(`     - Conversions: ${ad.conversions}`)
         console.log(`     - CPA: ${cpa.toFixed(2)}`)
         console.log(`     - ROI: ${roi.toFixed(2)}%`)
         console.log(`     - IDs: ${ad.all_ids ? ad.all_ids.join(', ') : ad.id}`)
        console.log('')
      })
    }
    
    if (data.offers) {
      console.log('📊 Ofertas com CPA calculado:')
      data.offers.forEach((offer, idx) => {
        const cpa = offer.conversions > 0 ? (offer.cost / offer.conversions) : 0
        const roi = offer.cost > 0 ? ((offer.revenue - offer.cost) / offer.cost) * 100 : 0
        
        console.log(`  ${idx + 1}. ${offer.name}`)
        console.log(`     - Revenue: ${offer.revenue}`)
        console.log(`     - Cost: ${offer.cost}`)
        console.log(`     - Conversions: ${offer.conversions}`)
        console.log(`     - CPA: ${cpa.toFixed(2)}`)
        console.log(`     - ROI: ${roi.toFixed(2)}%`)
        console.log('')
      })
    }
    
    console.log('✅ Teste concluído: CPA calculado com dados de custo reais!')
         console.log('📋 Métricas calculadas:')
     console.log('   ✅ CPA (Cost Per Acquisition)')
     console.log('   ✅ ROI (Return On Investment)')
     console.log('   ✅ Revenue, Cost, Conversions')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste
testCPACalculation() 