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
    const { email, temp_password, plan_type, customer_name } = await req.json()

    // Validar dados obrigatórios
    if (!email || !temp_password || !plan_type) {
      throw new Error('Email, senha temporária e tipo de plano são obrigatórios')
    }

    console.log(`📧 [SUPABASE] Enviando email para: ${email} - Plano: ${plan_type}`)

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Enviar email via Supabase Auth
    const { data, error } = await supabase.auth.admin.sendRawEmail({
      to: email,
      subject: `🎉 Bem-vindo ao VMetrics - ${plan_type.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao VMetrics</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #f8f9fa;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              padding: 30px; 
              border-radius: 10px; 
              text-align: center; 
              margin-bottom: 30px; 
              color: white;
            }
            .content { 
              background: white; 
              padding: 25px; 
              border-radius: 8px; 
              margin-bottom: 25px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .credentials { 
              background: #e8f4fd; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #3498db; 
              margin: 20px 0;
            }
            .cta-button { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 25px; 
              font-weight: bold; 
              font-size: 16px; 
              display: inline-block; 
              margin: 20px 0;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
            }
            .warning { 
              background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              color: #856404; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo ao VMetrics!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Seu plano ${plan_type.toUpperCase()} foi ativado com sucesso</p>
          </div>
          
          <div class="content">
            <h2 style="color: #2c3e50; margin-top: 0;">🚀 Próximos Passos</h2>
            <p>Para começar a usar o VMetrics, você precisa:</p>
            <ol style="text-align: left;">
              <li><strong>Fazer login</strong> com suas credenciais abaixo</li>
              <li><strong>Configurar sua API Key</strong> do RedTrack</li>
              <li><strong>Acessar o dashboard</strong> e começar a analisar</li>
            </ol>
          </div>
          
          <div class="credentials">
            <h3 style="color: #2980b9; margin-top: 0;">📋 SUAS CREDENCIAIS DE ACESSO</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Senha:</strong> ${temp_password}</p>
            <p><strong>Plano:</strong> ${plan_type.toUpperCase()}</p>
            <p><strong>Status:</strong> ✅ Ativo</p>
          </div>
          
          <div class="warning">
            <h4 style="margin-top: 0;">⚠️ IMPORTANTE</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Esta é uma senha temporária</li>
              <li>Altere sua senha no primeiro login</li>
              <li>Mantenha suas credenciais seguras</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.vmetrics.com.br" class="cta-button">
              🎯 Acessar Dashboard
            </a>
          </div>
          
          <div class="footer">
            <p>Se você não solicitou este plano, entre em contato conosco.</p>
            <p>© 2024 VMetrics. Todos os direitos reservados.</p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ [SUPABASE] Erro ao enviar email:', error)
      throw error
    }

    console.log('✅ [SUPABASE] Email enviado com sucesso para:', email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        email,
        plan_type
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ [SUPABASE] Erro na função:', error)
    
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
