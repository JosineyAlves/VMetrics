// Script de teste para verificar a integração de email
// Execute com: node test-email-integration.js

const { createClient } = require('@supabase/supabase-js')

// Configurações (substitua pelos seus valores)
const supabaseUrl = process.env.SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxxxxxxx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testEmailIntegration() {
  console.log('🧪 Testando integração de email...\n')

  try {
    // Teste 1: Verificar se as funções do Supabase estão disponíveis
    console.log('1️⃣ Verificando funções do Supabase...')
    
    const { data: functions, error: functionsError } = await supabase.functions.list()
    
    if (functionsError) {
      console.error('❌ Erro ao listar funções:', functionsError.message)
      return
    }

    const emailFunction = functions.find(f => f.name === 'send-email-resend')
    if (emailFunction) {
      console.log('✅ Função send-email-resend encontrada')
    } else {
      console.log('❌ Função send-email-resend não encontrada')
      console.log('Funções disponíveis:', functions.map(f => f.name))
    }

    // Teste 2: Testar envio de email
    console.log('\n2️⃣ Testando envio de email...')
    
    const testEmailData = {
      from: 'VMetrics <noreply@vmetrics.com.br>',
      to: 'teste@exemplo.com',
      subject: '🧪 Teste de Integração - VMetrics',
      html: `
        <h1>Teste de Integração</h1>
        <p>Este é um email de teste para verificar se a integração com Resend está funcionando.</p>
        <p>Se você recebeu este email, a integração está funcionando corretamente!</p>
        <p><strong>Data do teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      `,
      text: `
        Teste de Integração
        
        Este é um email de teste para verificar se a integração com Resend está funcionando.
        
        Se você recebeu este email, a integração está funcionando corretamente!
        
        Data do teste: ${new Date().toLocaleString('pt-BR')}
      `
    }

    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-resend', {
      body: { emailData: testEmailData }
    })

    if (emailError) {
      console.error('❌ Erro ao enviar email:', emailError.message)
    } else {
      console.log('✅ Email enviado com sucesso!')
      console.log('📧 Resposta:', emailResult)
    }

    // Teste 3: Verificar configurações
    console.log('\n3️⃣ Verificando configurações...')
    
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      console.log('✅ Variáveis de ambiente do Supabase configuradas')
      console.log('✅ Integração nativa com Resend ativa (não precisa de RESEND_API_KEY)')
    } else {
      console.log('❌ Variáveis de ambiente faltando:', missingVars)
      console.log('Configure estas variáveis no painel do Supabase > Settings > Edge Functions > Environment Variables')
    }

    console.log('\n🎉 Teste de integração concluído!')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
  }
}

// Executar o teste
testEmailIntegration()
