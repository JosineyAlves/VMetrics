export default async function handler(req, res) {
  console.log('🔍 [REPORT] Requisição recebida:', req.method, req.url)
  console.log('🔍 [REPORT] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [REPORT] Authorization header:', req.headers['authorization'])
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [REPORT] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : null
  
  console.log('🔍 [REPORT] API Key extraída:', apiKey ? 'SIM' : 'NÃO')
  
  if (!apiKey) {
    console.log('❌ [REPORT] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }

  try {
    console.log('🔍 [REPORT] Fazendo requisição para RedTrack /report...')
    console.log('🔍 [REPORT] URL:', 'https://api.redtrack.io/report?group_by=campaign&date_from=2024-01-01&date_to=2024-12-31')
    console.log('🔍 [REPORT] API Key sendo testada:', apiKey)
    
    const response = await fetch('https://api.redtrack.io/report?group_by=campaign&date_from=2024-01-01&date_to=2024-12-31', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    console.log('🔍 [REPORT] Status da resposta:', response.status)
    console.log('🔍 [REPORT] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ [REPORT] Erro na resposta:', errorData)
      
      // Mensagens de erro mais específicas para /report
      let errorMessage = 'API Key inválida ou erro na API do RedTrack'
      let suggestions = []
      
      if (response.status === 401) {
        errorMessage = 'API Key inválida ou expirada'
        suggestions = [
          'Verifique se a API Key está correta',
          'A API Key pode ter expirado - gere uma nova no RedTrack',
          'Certifique-se de que a API Key tem permissões para relatórios'
        ]
      } else if (response.status === 403) {
        errorMessage = 'Acesso negado - API Key sem permissões para relatórios'
        suggestions = [
          'Verifique se a API Key tem permissões para acessar relatórios',
          'Entre em contato com o administrador da conta RedTrack'
        ]
      } else if (response.status === 429) {
        errorMessage = 'Limite de requisições excedido'
        suggestions = [
          'Aguarde alguns minutos antes de tentar novamente',
          'Verifique o plano da sua conta RedTrack'
        ]
      }
      
      return res.status(response.status).json({ 
        error: errorMessage,
        details: errorData,
        suggestions: suggestions,
        status: response.status,
        endpoint: '/report'
      })
    }

    const data = await response.json()
    console.log('✅ [REPORT] Dados recebidos com sucesso do endpoint /report')
    res.status(200).json({
      ...data,
      workingEndpoint: 'https://api.redtrack.io/report',
      message: 'API Key válida! Conectado com sucesso ao RedTrack via /report.',
      endpoint: '/report'
    })
    
  } catch (error) {
    console.error('❌ [REPORT] Erro ao conectar com RedTrack:', error)
    console.error('❌ [REPORT] Tipo do erro:', typeof error)
    console.error('❌ [REPORT] Mensagem do erro:', error.message)
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/report'
    })
  }
} 