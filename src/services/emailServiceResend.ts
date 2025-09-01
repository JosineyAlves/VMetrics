// Serviço de envio de emails via Resend API direta

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

export interface WelcomeEmailData {
  customerEmail: string
  customerName?: string
  planType: string
  signupUrl: string
}

// Função para enviar email genérico via Resend API direta
export async function sendEmailDirect(emailData: EmailData): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      return { success: true, message: 'Email enviado com sucesso', data: result.data }
    } else {
      return { success: false, message: result.error || 'Erro ao enviar email' }
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
    return { success: false, message: 'Erro de conexão ao enviar email' }
  }
}

// Template HTML para email de boas-vindas
function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  const customerName = data.customerName || 'Cliente'
  const planDisplayName = getPlanDisplayName(data.planType)

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Bem-vindo ao VMetrics!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3cd48f 0%, #2bb673 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #3cd48f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .plan-badge { background: #1f1f1f; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 Bem-vindo ao VMetrics!</h1>
            <p>Sua plataforma de análise de marketing está pronta!</p>
        </div>
        <div class='content'>
            <h2>Olá ${customerName}!</h2>
            <p>Parabéns! Você acabou de adquirir o plano <span class='plan-badge'>${planDisplayName}</span> no VMetrics.</p>
            <p>Para começar a usar sua plataforma, você precisa criar sua conta:</p>
            <div style='text-align: center;'>
                <a href='${data.signupUrl}' class='cta-button'>🚀 Criar Minha Conta</a>
            </div>
            <p><strong>O que você pode fazer agora:</strong></p>
            <ul>
                <li>📊 Analisar campanhas de marketing</li>
                <li>💰 Rastrear conversões e ROI</li>
                <li>📈 Visualizar funis de conversão</li>
                <li>🎯 Otimizar performance das campanhas</li>
            </ul>
            <p>Se tiver alguma dúvida, nossa equipe está aqui para ajudar!</p>
        </div>
        <div class='footer'>
            <p>© 2025 VMetrics. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`
}

// Função auxiliar para nomes dos planos
function getPlanDisplayName(planType: string): string {
  const planNames: Record<string, string> = {
    'monthly': 'Mensal',
    'quarterly': 'Trimestral',
    'starter': 'Starter',
    'pro': 'Pro',
    'enterprise': 'Enterprise'
  }
  return planNames[planType] || planType
}

// Função principal para enviar email de boas-vindas
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const html = generateWelcomeEmailHTML(data)
    const emailData: EmailData = {
      to: data.customerEmail,
      subject: '🎉 Bem-vindo ao VMetrics! Sua conta está pronta',
      html,
      from: 'VMetrics <noreply@vmetrics.com.br>'
    }

    return await sendEmailDirect(emailData)
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error)
    return { success: false, message: 'Erro ao gerar email de boas-vindas' }
  }
}

// Função para testar o envio de email
export async function testEmailSend(): Promise<{ success: boolean; message: string }> {
  try {
    const testData: WelcomeEmailData = {
      customerEmail: 'teste@exemplo.com',
      customerName: 'Usuário Teste',
      planType: 'monthly',
      signupUrl: 'https://app.vmetrics.com.br/auth/signup?token=test-token'
    }

    const result = await sendWelcomeEmail(testData)
    return result
  } catch (error) {
    console.error('❌ Erro no teste de email:', error)
    return { success: false, message: 'Erro no teste de email' }
  }
}
