// Teste do novo endpoint campaigns-direct
const API_KEY = 'K0Y6dcsgEqmjQp0CKD49'
const BASE_URL = 'https://my-dash-two.vercel.app'

async function testCampaignsDirect() {
  try {
    console.log('🔍 Testando novo endpoint campaigns-direct...')
    
    const url = `${BASE_URL}/api/campaigns-direct?api_key=${API_KEY}&date_from=2025-07-30&date_to=2025-07-30`
    
    console.log('URL:', url)
    
    const response = await fetch(url)
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
    
    console.log('\n🔍 Testando endpoint /pub/campaigns diretamente...')
    
    const pubCampaignsUrl = `https://api.redtrack.io/pub/campaigns?api_key=${API_KEY}&per=100`
    console.log('Pub Campaigns URL:', pubCampaignsUrl)
    
    const pubResponse = await fetch(pubCampaignsUrl)
    const pubData = await pubResponse.json()
    
    console.log('📊 Dados do /pub/campaigns:', pubData)
    console.log('📊 Número de campanhas no /pub/campaigns:', Array.isArray(pubData) ? pubData.length : 'N/A')
    
    if (Array.isArray(pubData)) {
      pubData.forEach((campaign, index) => {
        console.log(`📊 Campanha ${index + 1} do /pub/campaigns:`, {
          id: campaign.id,
          title: campaign.title,
          source_title: campaign.source_title,
          status: campaign.status
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testCampaignsDirect() 