export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : null
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' })
  }

  try {
    // Primeiro, testar se a API key é válida
    const testResponse = await fetch('https://api.redtrack.io/me/settings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}))
      return res.status(testResponse.status).json({ 
        error: 'API Key inválida ou erro na API do RedTrack',
        details: errorData
      })
    }

    // Se a API key for válida, buscar dados reais do dashboard
    const reportResponse = await fetch('https://api.redtrack.io/report?group_by=date&date_from=2024-01-01&date_to=2024-12-31', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    if (reportResponse.ok) {
      const reportData = await reportResponse.json()
      
      // Verificar se a conta tem dados ou é nova
      const hasData = reportData.revenue > 0 || 
                     reportData.conversions > 0 || 
                     reportData.clicks > 0 || 
                     reportData.impressions > 0
      
      if (hasData) {
        // Conta tem dados reais
        const dashboardData = {
          revenue: reportData.revenue || 0,
          conversions: reportData.conversions || 0,
          ctr: reportData.ctr || 0,
          profit: (reportData.revenue || 0) - (reportData.spend || 0),
          impressions: reportData.impressions || 0,
          clicks: reportData.clicks || 0,
          spend: reportData.spend || 0,
          conversion_rate: reportData.conversion_rate || 0,
          is_demo: false,
          message: 'Dados reais do RedTrack'
        }

        console.log('📊 Dados reais carregados do RedTrack:', dashboardData)
        res.status(200).json(dashboardData)
        
      } else {
        // Conta nova sem dados - mostrar dados zerados
        console.log('🆕 Conta nova detectada, mostrando dados zerados')
        const emptyData = {
          revenue: 0,
          conversions: 0,
          ctr: 0,
          profit: 0,
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversion_rate: 0,
          is_demo: true,
          message: 'Conta nova - Configure suas campanhas no RedTrack para começar a ver dados reais.'
        }
        
        res.status(200).json(emptyData)
      }
      
    } else {
      // Se não conseguir buscar dados reais, usar dados zerados como fallback
      console.log('⚠️ Não foi possível buscar dados reais, usando dados zerados')
      const fallbackData = {
        revenue: 0,
        conversions: 0,
        ctr: 0,
        profit: 0,
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversion_rate: 0,
        is_demo: true,
        message: 'Erro de conexão - Configure suas campanhas no RedTrack para começar a ver dados reais'
      }
      
      res.status(200).json(fallbackData)
    }
    
  } catch (error) {
    console.error('Erro ao conectar com RedTrack:', error)
    
    // Em caso de erro, retornar dados zerados como fallback
    const fallbackData = {
      revenue: 0,
      conversions: 0,
      ctr: 0,
      profit: 0,
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversion_rate: 0,
      is_demo: true,
      message: 'Erro de conexão - Configure suas campanhas no RedTrack para começar a ver dados reais'
    }
    
    res.status(200).json(fallbackData)
  }
} 