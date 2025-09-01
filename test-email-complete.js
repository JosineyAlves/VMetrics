// Teste completo do sistema de email
// Execute com: node test-email-complete.js

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Configurações
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fkqkwhzjvpzycfkbnqaq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCompleteEmailSystem() {
  console.log('🧪 Teste Completo do Sistema de Email - VMetrics\n');
  console.log('=' .repeat(60));

  try {
    // Verificar configurações básicas
    console.log('\n1️⃣ Verificando configurações básicas...');
    
    const configs = {
      'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
      'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'RESEND_API_KEY': process.env.RESEND_API_KEY
    };

    let configOk = true;
    Object.entries(configs).forEach(([key, value]) => {
      if (value) {
        console.log(`✅ ${key}: Configurada`);
      } else {
        console.log(`❌ ${key}: Não configurada`);
        configOk = false;
      }
    });

    if (!configOk) {
      console.log('\n⚠️ Algumas configurações estão faltando. Configure as variáveis de ambiente necessárias.');
      return;
    }

    // Teste 2: Resend direto
    console.log('\n2️⃣ Testando Resend direto...');
    
    try {
      const { data, error } = await resend.emails.send({
        from: 'VMetrics <noreply@vmetrics.com.br>',
        to: ['teste@exemplo.com'],
        subject: '🧪 Teste Resend Direto - VMetrics',
        html: `
          <h1>Teste Resend Direto</h1>
          <p>Este é um teste direto da API do Resend.</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        `,
        text: `
          Teste Resend Direto
          
          Este é um teste direto da API do Resend.
          
          Data: ${new Date().toLocaleString('pt-BR')}
        `
      });

      if (error) {
        console.log('❌ Erro no Resend direto:', error.message);
      } else {
        console.log('✅ Resend direto funcionando!');
        console.log('📧 ID do email:', data.id);
      }
    } catch (resendError) {
      console.log('❌ Erro no Resend direto:', resendError.message);
    }

    // Teste 3: Supabase Edge Functions
    console.log('\n3️⃣ Testando Supabase Edge Functions...');
    
    try {
      const { data: functions, error: functionsError } = await supabase.functions.list();
      
      if (functionsError) {
        console.log('❌ Erro ao listar funções:', functionsError.message);
      } else {
        console.log('✅ Funções encontradas:', functions.length);
        
        const emailFunction = functions.find(f => f.name === 'send-email-resend');
        if (emailFunction) {
          console.log('✅ Função send-email-resend encontrada');
          
          // Testar a função
          const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-resend', {
            body: { 
              emailData: {
                from: 'VMetrics <noreply@vmetrics.com.br>',
                to: 'teste@exemplo.com',
                subject: '🧪 Teste Supabase Edge Function - VMetrics',
                html: `
                  <h1>Teste Supabase Edge Function</h1>
                  <p>Este é um teste via Supabase Edge Function + Resend.</p>
                  <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                `,
                text: `
                  Teste Supabase Edge Function
                  
                  Este é um teste via Supabase Edge Function + Resend.
                  
                  Data: ${new Date().toLocaleString('pt-BR')}
                `
              }
            }
          });

          if (emailError) {
            console.log('❌ Erro na Edge Function:', emailError.message);
          } else {
            console.log('✅ Supabase Edge Function funcionando!');
            console.log('📧 Resposta:', emailResult);
          }
        } else {
          console.log('❌ Função send-email-resend não encontrada');
          console.log('Funções disponíveis:', functions.map(f => f.name));
        }
      }
    } catch (supabaseError) {
      console.log('❌ Erro no Supabase:', supabaseError.message);
    }

    // Teste 4: Verificar domínios
    console.log('\n4️⃣ Verificando domínios no Resend...');
    
    try {
      const domains = await resend.domains.list();
      console.log('✅ Domínios encontrados:', domains.data?.length || 0);
      
      if (domains.data && domains.data.length > 0) {
        domains.data.forEach(domain => {
          console.log(`   - ${domain.name} (${domain.status})`);
        });
      } else {
        console.log('⚠️ Nenhum domínio configurado');
        console.log('   Configure o domínio vmetrics.com.br no painel do Resend');
      }
    } catch (domainError) {
      console.log('⚠️ Não foi possível verificar domínios:', domainError.message);
    }

    // Resumo final
    console.log('\n' + '=' .repeat(60));
    console.log('📋 RESUMO DO TESTE');
    console.log('=' .repeat(60));
    
    console.log('\n✅ O que está funcionando:');
    console.log('   - Integração Resend configurada');
    console.log('   - Supabase configurado');
    console.log('   - Funções implementadas');
    
    console.log('\n⚠️ O que precisa ser verificado:');
    console.log('   - Domínio vmetrics.com.br no Resend');
    console.log('   - Variáveis de ambiente no Supabase');
    console.log('   - Deploy das Edge Functions');
    
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Configure o domínio no Resend');
    console.log('   2. Faça deploy das Edge Functions');
    console.log('   3. Teste o webhook do Stripe');
    console.log('   4. Teste o envio de emails reais');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testCompleteEmailSystem();
