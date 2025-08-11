import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.FROM_EMAIL || 'no-reply@example.com'

const resend = new Resend(resendApiKey || '')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { to, subject, content } = req.body || {}
  if (!to) return res.status(400).json({ error: 'Campo "to" é obrigatório' })
  try {
    if (!resendApiKey) return res.status(500).json({ error: 'RESEND_API_KEY não configurada' })
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: subject || 'Bem-vindo ao TrackView',
      html: content || '<p>Bem-vindo! Seu acesso ao TrackView foi ativado.</p>'
    })
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[EMAIL] welcome error', err)
    return res.status(500).json({ error: 'Erro ao enviar e-mail' })
  }
}


