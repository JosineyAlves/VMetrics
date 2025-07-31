// Script para testar performance da API de campanhas
import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3001'

async function testCampaignsPerformance() {
  console.log('🚀 Testando performance da API de campanhas...')
  
  const startTime = Date.now()
  
  try {
    // Simular parâmetros típicos
    const params = new URLSearchParams({
      api_key: 'test_key', // Substitua pela sua API key real
      date_from: '2024-01-01',
      date_to: '2024-01-31',
      group_by: 'campaign'
    })
    
    console.log('⏳ Fazendo requisição para /api/campaigns...')
    console.log(`📡 URL: ${API_BASE}/campaigns?${params.toString()}`)
    
    const response = await fetch(`${API_BASE}/campaigns?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log('✅ Requisição concluída!')
    console.log(`⏱️  Tempo total: ${duration}ms`)
    console.log(`📊 Campanhas retornadas: ${Array.isArray(data) ? data.length : 'N/A'}`)
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('📋 Primeira campanha:')
      console.log(`   - Nome: ${data[0].title}`)
      console.log(`   - ID: ${data[0].id}`)
      console.log(`   - Status: ${data[0].status}`)
      if (data[0].stat) {
        console.log(`   - Cliques: ${data[0].stat.clicks}`)
        console.log(`   - Conversões: ${data[0].stat.conversions}`)
        console.log(`   - Receita: $${data[0].stat.revenue}`)
        console.log(`   - Custo: $${data[0].stat.cost}`)
      }
    }
    
    // Avaliar performance
    if (duration < 5000) {
      console.log('🎉 Excelente! Performance muito boa (< 5s)')
    } else if (duration < 15000) {
      console.log('👍 Bom! Performance aceitável (< 15s)')
    } else if (duration < 30000) {
      console.log('⚠️  Lento! Performance pode ser melhorada (< 30s)')
    } else {
      console.log('❌ Muito lento! Precisa de otimização (> 30s)')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// Executar teste
testCampaignsPerformance() 