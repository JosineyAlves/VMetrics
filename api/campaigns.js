export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : null

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' })
  }

  // Datas do período (pode ajustar para o range desejado)
  const { date_from, date_to } = req.query
  const url = `https://api.redtrack.io/report?group_by=campaign&date_from=${date_from || '2024-01-01'}&date_to=${date_to || '2024-12-31'}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrackView-Dashboard/1.0'
      }
    })

    if (response.ok) {
      const data = await response.json()
      // Adapte o formato se necessário para o frontend
      res.status(200).json({ data: data, total: data.length || 0 })
    } else {
      res.status(200).json({ data: [], total: 0 })
    }
  } catch (error) {
    res.status(200).json({ data: [], total: 0 })
  }
} 