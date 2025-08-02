// Teste da obtenção de dados de custo via /tracks
const API_KEY = 'K0Y6dcsgEqmjQp0CKD49'
const BASE_URL = 'https://my-dash-two.vercel.app'

async function testTracksCost() {
  console.log('🧪 Testando obtenção de dados de custo via /tracks...')
  
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
      console.log('📊 Campanhas com dados de custo:')
      data.campaigns.forEach((campaign, idx) => {
        const cpa = campaign.conversions > 0 ? (campaign.cost / campaign.conversions) : 0
        const cpc = campaign.clicks > 0 ? (campaign.cost / campaign.clicks) : 0
        const roi = campaign.cost > 0 ? ((campaign.revenue - campaign.cost) / campaign.cost) * 100 : 0
        
        console.log(`  ${idx + 1}. ${campaign.name}`)
        console.log(`     - Revenue: ${campaign.revenue}`)
        console.log(`     - Cost: ${campaign.cost}`)
        console.log(`     - Conversions: ${campaign.conversions}`)
        console.log(`     - Clicks: ${campaign.clicks}`)
        console.log(`     - CPA: ${cpa.toFixed(2)}`)
        console.log(`     - CPC: ${cpc.toFixed(2)}`)
        console.log(`     - ROI: ${roi.toFixed(2)}%`)
        console.log('')
      })
    }
    
    if (data.ads) {
      console.log('📊 Anúncios com dados de custo:')
      data.ads.forEach((ad, idx) => {
        const cpa = ad.conversions > 0 ? (ad.cost / ad.conversions) : 0
        const cpc = ad.clicks > 0 ? (ad.cost / ad.clicks) : 0
        const roi = ad.cost > 0 ? ((ad.revenue - ad.cost) / ad.cost) * 100 : 0
        
        console.log(`  ${idx + 1}. ${ad.name}`)
        console.log(`     - Revenue: ${ad.revenue}`)
        console.log(`     - Cost: ${ad.cost}`)
        console.log(`     - Conversions: ${ad.conversions}`)
        console.log(`     - Clicks: ${ad.clicks}`)
        console.log(`     - CPA: ${cpa.toFixed(2)}`)
        console.log(`     - CPC: ${cpc.toFixed(2)}`)
        console.log(`     - ROI: ${roi.toFixed(2)}%`)
        console.log(`     - IDs: ${ad.all_ids ? ad.all_ids.join(', ') : ad.id}`)
        console.log('')
      })
    }
    
    // Verificar se há dados de custo
    const hasCostData = data.campaigns.some(c => c.cost > 0) || data.ads.some(a => a.cost > 0)
    
    if (hasCostData) {
      console.log('✅ Dados de custo encontrados via /tracks!')
      console.log('📋 Métricas calculadas com sucesso:')
      console.log('   ✅ CPA (Cost Per Acquisition)')
      console.log('   ✅ CPC (Cost Per Click)')
      console.log('   ✅ ROI (Return On Investment)')
    } else {
      console.log('⚠️ Nenhum dado de custo encontrado')
      console.log('🔍 Possíveis causas:')
      console.log('   - Dados de custo não configurados no RedTrack')
      console.log('   - Período sem dados de custo')
      console.log('   - API Key sem permissões para dados de custo')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste
testTracksCost() 