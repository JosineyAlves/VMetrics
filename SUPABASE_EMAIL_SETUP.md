# 📧 Configuração de Emails Automáticos no Supabase

## 🎯 **OBJETIVO**
Configurar o Supabase para enviar emails automáticos quando um cliente adquire um plano, incluindo o link de cadastro personalizado.

## 🚀 **PASSO A PASSO**

### **1. Configurar Email Provider no Supabase**

#### **A. Acessar Dashboard do Supabase**
```bash
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto VMetrics
3. Vá em: Settings → Auth → Email Templates
```

#### **B. Configurar SMTP (Recomendado)**
```bash
1. Em Settings → Auth → SMTP Settings
2. Configure com seu provedor de email:
   - Gmail (com App Password)
   - SendGrid
   - Amazon SES
   - Resend
```

**Exemplo com Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-app-password
SMTP_SENDER=noreply@vmetrics.com.br
```

### **2. Criar Função Edge para Envio de Emails**

#### **A. Criar arquivo: supabase/functions/send-welcome-email/index.ts**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, planType, customerName } = await req.json()

    // Validar dados
    if (!email || !planType) {
      throw new Error('Email e tipo de plano são obrigatórios')
    }

    // Criar link de cadastro
    const signupUrl = `https://app.vmetrics.com.br?email=${encodeURIComponent(email)}&plan=${encodeURIComponent(planType)}`

    // Enviar email via Supabase Auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase.auth.admin.sendRawEmail({
      to: email,
      subject: `🎉 Bem-vindo ao VMetrics - ${planType.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao VMetrics</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bem-vindo ao VMetrics!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Seu plano ${planType.toUpperCase()} foi ativado com sucesso</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin-top: 0;">🚀 Próximos Passos</h2>
            <p>Para começar a usar o VMetrics, você precisa:</p>
            <ol style="text-align: left;">
              <li><strong>Completar seu cadastro</strong> - Configure sua conta</li>
              <li><strong>Conectar sua API Key</strong> - Integre com RedTrack</li>
              <li><strong>Acessar o dashboard</strong> - Comece a analisar seus dados</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signupUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
              🎯 Completar Cadastro
            </a>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db;">
            <h3 style="color: #2980b9; margin-top: 0;">📋 Detalhes do Plano</h3>
            <p><strong>Plano:</strong> ${planType.toUpperCase()}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Status:</strong> ✅ Ativo</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p>Se você não solicitou este plano, entre em contato conosco.</p>
            <p>© 2024 VMetrics. Todos os direitos reservados.</p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        signupUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

### **3. Configurar Webhook do Stripe para Chamar a Função**

#### **A. Atualizar webhookService.ts**
```typescript
// Em src/services/webhookService.ts

async handleCheckoutCompleted(session: CheckoutSession): Promise<void> {
  try {
    console.log('✅ [WEBHOOK] Checkout completado:', session.id)
    
    // Ativar plano no banco
    await planService.activateUserPlan(
      session.customer,
      session.subscription || '',
      this.getPlanTypeFromPriceId(session)
    )
    
    // Enviar email de boas-vindas
    await this.sendWelcomeEmail(session)
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao processar checkout:', error)
  }
}

private async sendWelcomeEmail(session: CheckoutSession): Promise<void> {
  try {
    // Obter dados do cliente
    const customer = await stripeService.getCustomer(session.customer)
    if (!customer?.email) return
    
    // Determinar tipo do plano
    const planType = this.getPlanTypeFromPriceId(session)
    
    // Chamar função Edge do Supabase
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/send-welcome-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email: customer.email,
          planType,
          customerName: customer.name || 'Cliente'
        })
      }
    )
    
    if (response.ok) {
      console.log('📧 Email de boas-vindas enviado para:', customer.email)
    } else {
      console.error('❌ Erro ao enviar email:', await response.text())
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error)
  }
}
```

### **4. Configurar Variáveis de Ambiente**

#### **A. No Supabase Dashboard**
```bash
1. Vá em: Settings → API
2. Copie as URLs e chaves necessárias
3. Configure as variáveis no Vercel
```

#### **B. No Vercel Dashboard**
```bash
1. Acesse seu projeto
2. Vá em: Settings → Environment Variables
3. Adicione:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
```

### **5. Testar a Integração**

#### **A. Deploy da Função Edge**
```bash
# No terminal, na pasta do projeto
supabase functions deploy send-welcome-email
```

#### **B. Testar Webhook**
```bash
# Usar o script de teste
npm run stripe:webhook-test
```

#### **C. Verificar Email**
```bash
1. Fazer uma compra de teste
2. Verificar se o email foi recebido
3. Clicar no link de cadastro
4. Verificar se redireciona corretamente
```

## 🔧 **CONFIGURAÇÕES ADICIONAIS**

### **A. Templates de Email Personalizados**
```typescript
// Criar diferentes templates para cada plano
const emailTemplates = {
  starter: {
    subject: '🚀 Bem-vindo ao VMetrics Starter!',
    features: ['Analytics básicos', 'Até 5 campanhas', 'Suporte por email']
  },
  pro: {
    subject: '🎯 Bem-vindo ao VMetrics Pro!',
    features: ['Analytics avançados', 'Campanhas ilimitadas', 'Suporte prioritário']
  },
  enterprise: {
    subject: '🏢 Bem-vindo ao VMetrics Enterprise!',
    features: ['Analytics customizados', 'API dedicada', 'Suporte 24/7']
  }
}
```

### **B. Configuração de DNS para Email**
```bash
# Adicionar no Cloudflare
1. SPF Record: v=spf1 include:_spf.google.com ~all
2. DKIM Record: (configurado pelo provedor de email)
3. DMARC Record: v=DMARC1; p=quarantine; rua=mailto:dmarc@vmetrics.com.br
```

## ✅ **CHECKLIST DE VERIFICAÇÃO**

- [ ] SMTP configurado no Supabase
- [ ] Função Edge criada e deployada
- [ ] Webhook do Stripe atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] Email de teste enviado com sucesso
- [ ] Link de cadastro funcionando
- [ ] Redirecionamento correto para SignupForm

## 🚨 **TROUBLESHOOTING**

### **Erro: Email não enviado**
```bash
1. Verificar logs da função Edge
2. Confirmar configuração SMTP
3. Verificar variáveis de ambiente
4. Testar função isoladamente
```

### **Erro: Link não funciona**
```bash
1. Verificar URL no email
2. Confirmar parâmetros na URL
3. Verificar redirecionamento no App.tsx
4. Testar manualmente no navegador
```

## 🎉 **RESULTADO FINAL**

Com essa configuração, o fluxo completo será:

1. **Cliente compra plano** → Stripe
2. **Webhook recebido** → VMetrics
3. **Email automático** → Supabase
4. **Link de cadastro** → Cliente
5. **Formulário de cadastro** → VMetrics
6. **Dashboard ativo** → Cliente

**Agora você tem um sistema 100% automatizado e profissional! 🚀**
