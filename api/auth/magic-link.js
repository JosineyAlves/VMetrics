import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const siteUrl = process.env.SITE_URL || 'http://localhost:5173'

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email é obrigatório' })

  try {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${siteUrl}/auth/callback` } })
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[AUTH] magic-link error', err)
    return res.status(500).json({ error: 'Erro ao enviar link mágico' })
  }
}
