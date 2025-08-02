// Teste do agrupamento de anúncios
const API_KEY = 'K0Y6dcsgEqmjQp0CKD49'
const BASE_URL = 'https://my-dash-two.vercel.app'

async function testAdGrouping() {
  console.log('🧪 Testando agrupamento de anúncios...')
  
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
    
    if (data.ads) {
      console.log('📊 Anúncios agrupados:')
      data.ads.forEach((ad, idx) => {
        console.log(`  ${idx + 1}. ${ad.name}`)
        console.log(`     - Revenue: ${ad.revenue}`)
        console.log(`     - Conversions: ${ad.conversions}`)
        console.log(`     - IDs: ${ad.all_ids ? ad.all_ids.join(', ') : ad.id}`)
        console.log('')
      })
      
      // Verificar se há duplicações
      const adNames = data.ads.map(ad => ad.name)
      const uniqueNames = [...new Set(adNames)]
      
      if (adNames.length === uniqueNames.length) {
        console.log('✅ Sucesso: Não há duplicações de nomes de anúncios!')
      } else {
        console.log('⚠️ Aviso: Ainda há duplicações de nomes de anúncios')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste
testAdGrouping() 