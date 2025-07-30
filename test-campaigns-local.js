// Teste do endpoint campaigns-direct na produção
const API_KEY = 'K0Y6dcsgEqmjQp0CKD49'
const BASE_URL = 'https://my-dash-two.vercel.app'

async function testCampaignsProduction() {
  try {
    console.log('🔍 Testando endpoint campaigns-direct na produção...')
    
    const url = `${BASE_URL}/api/campaigns-direct?api_key=${API_KEY}&date_from=2025-07-30&date_to=2025-07-30`
    
    console.log('URL:', url)
    
    const response = await fetch(url)
    console.log('Status da resposta:', response.status)
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()))
    
    const data = await response.json()
    
    console.log('📊 Resposta da API:', data)
    console.log('📊 Tipo da resposta:', typeof data)
    console.log('📊 É array?', Array.isArray(data))
    console.log('📊 Número de campanhas:', data.length)
    
    if (Array.isArray(data)) {
      data.forEach((campaign, index) => {
        console.log(`📊 Campanha ${index + 1}:`, {
          id: campaign.id,
          title: campaign.title,
          source_title: campaign.source_title,
          status: campaign.status,
          cost: campaign.stat?.cost,
          clicks: campaign.stat?.clicks,
          conversions: campaign.stat?.conversions,
          revenue: campaign.stat?.revenue
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testCampaignsProduction() 