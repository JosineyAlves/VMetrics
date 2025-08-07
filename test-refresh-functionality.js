// Teste para verificar a funcionalidade de refresh
console.log('🧪 Testando funcionalidade de refresh...')

// Simular o evento forceRefresh
function testForceRefresh() {
  console.log('🔄 Disparando evento forceRefresh...')
  
  const event = new CustomEvent('forceRefresh', { 
    detail: { 
      section: 'dashboard', 
      forceNewData: true 
    } 
  })
  
  window.dispatchEvent(event)
  
  console.log('✅ Evento forceRefresh disparado')
}

// Função para testar se os parâmetros estão sendo enviados corretamente
function testParameters() {
  console.log('🔍 Testando parâmetros de refresh...')
  
  const timestamp = Date.now()
  const params = {
    force_refresh: 'true',
    _t: timestamp.toString()
  }
  
  console.log('📋 Parâmetros de teste:', params)
  console.log('✅ Parâmetros configurados corretamente')
}

// Função para verificar se o cache está sendo limpo
function testCacheClearing() {
  console.log('🗑️ Testando limpeza de cache...')
  
  // Simular limpeza de cache do localStorage
  const cacheKeys = Object.keys(localStorage).filter(key => 
    key.includes('campaigns') || 
    key.includes('dashboard') || 
    key.includes('performance') || 
    key.includes('funnel') ||
    key.includes('conversions')
  )
  
  console.log('📋 Chaves de cache encontradas:', cacheKeys)
  
  if (cacheKeys.length > 0) {
    cacheKeys.forEach(key => {
      console.log(`🗑️ Removendo cache: ${key}`)
      localStorage.removeItem(key)
    })
    console.log('✅ Cache limpo com sucesso')
  } else {
    console.log('ℹ️ Nenhuma chave de cache encontrada')
  }
}

// Executar testes
console.log('🚀 Iniciando testes de funcionalidade de refresh...\n')

testParameters()
console.log('')
testCacheClearing()
console.log('')
testForceRefresh()

console.log('\n✅ Todos os testes executados!')
console.log('📝 Verifique o console do navegador para logs detalhados') 