import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { access_token } = req.body || {}
  if (!access_token) return res.status(400).json({ error: 'access_token é obrigatório' })
  try {
    const { data: { user }, error } = await supabase.auth.getUser(access_token)
    if (error || !user) return res.status(401).json({ error: 'Sessão inválida' })
    return res.status(200).json({ user })
  } catch (err) {
    console.error('[AUTH] session error', err)
    return res.status(500).json({ error: 'Erro ao validar sessão' })
  }
}


