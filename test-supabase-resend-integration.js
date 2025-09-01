// Teste da integração Supabase + Resend
// Execute com: node test-supabase-resend-integration.js

import { createClient } from '@supabase/supabase-js';

// Configurações
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fkqkwhzjvpzycfkbnqaq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseResendIntegration() {
  console.log('🧪 Testando integração Supabase + Resend...\n');

  try {
    // Verificar configurações
    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY não está configurada');
      return;
    }

    console.log('✅ Configurações do Supabase encontradas');

    // Teste 1: Verificar se as funções do Supabase estão disponíveis
    console.log('\n1️⃣ Verificando funções do Supabase...');
    
    const { data: functions, error: functionsError } = await supabase.functions.list();
    
    if (functionsError) {
      console.error('❌ Erro ao listar funções:', functionsError.message);
      return;
    }

    console.log('✅ Funções encontradas:', functions.length);
    
    const emailFunction = functions.find(f => f.name === 'send-email-resend');
    if (emailFunction) {
      console.log('✅ Função send-email-resend encontrada');
    } else {
      console.log('❌ Função send-email-resend não encontrada');
      console.log('Funções disponíveis:', functions.map(f => f.name));
    }

    // Teste 2: Testar envio de email via Supabase Edge Function
    if (emailFunction) {
      console.log('\n2️⃣ Testando envio de email via Supabase...');
      
      const testEmailData = {
        from: 'VMetrics <noreply@vmetrics.com.br>',
        to: 'teste@exemplo.com',
        subject: '🧪 Teste Supabase + Resend - VMetrics',
        html: `
          <h1>Teste de Integração Supabase + Resend</h1>
          <p>Este é um email de teste enviado via Supabase Edge Function + Resend.</p>
          <p>Se você recebeu este email, a integração está funcionando corretamente!</p>
          <p><strong>Data do teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Status:</strong> ✅ Integração Supabase + Resend funcionando</p>
        `,
        text: `
          Teste de Integração Supabase + Resend
          
          Este é um email de teste enviado via Supabase Edge Function + Resend.
          
          Se você recebeu este email, a integração está funcionando corretamente!
          
          Data do teste: ${new Date().toLocaleString('pt-BR')}
          Status: ✅ Integração Supabase + Resend funcionando
        `
      };

      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-resend', {
        body: { emailData: testEmailData }
      });

      if (emailError) {
        console.error('❌ Erro ao enviar email via Supabase:', emailError.message);
      } else {
        console.log('✅ Email enviado com sucesso via Supabase!');
        console.log('📧 Resposta:', emailResult);
      }
    }

    // Teste 3: Verificar variáveis de ambiente
    console.log('\n3️⃣ Verificando configurações...');
    
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'RESEND_API_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('✅ Todas as variáveis de ambiente necessárias estão configuradas');
    } else {
      console.log('❌ Variáveis de ambiente faltando:', missingVars);
      console.log('Configure estas variáveis no painel do Supabase > Settings > Edge Functions > Environment Variables');
    }

    // Teste 4: Verificar conexão com Supabase
    console.log('\n4️⃣ Verificando conexão com Supabase...');
    
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('⚠️ Erro ao conectar com Supabase:', testError.message);
    } else {
      console.log('✅ Conexão com Supabase funcionando');
    }

    console.log('\n🎉 Teste de integração Supabase + Resend concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testSupabaseResendIntegration();
