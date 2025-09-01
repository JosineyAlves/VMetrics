// Teste simples da integração com Resend
// Execute com: node test-resend-integration-simple.js

import { Resend } from 'resend';

// Configuração do Resend
const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendIntegration() {
  console.log('🧪 Testando integração com Resend...\n');

  try {
    // Verificar se a chave da API está configurada
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY não está configurada');
      console.log('Configure a variável de ambiente RESEND_API_KEY');
      return;
    }

    console.log('✅ Chave da API do Resend encontrada');

    // Teste 1: Enviar email de teste
    console.log('\n1️⃣ Enviando email de teste...');
    
    const { data, error } = await resend.emails.send({
      from: 'VMetrics <noreply@vmetrics.com.br>',
      to: ['teste@exemplo.com'],
      subject: '🧪 Teste de Integração - VMetrics',
      html: `
        <h1>Teste de Integração com Resend</h1>
        <p>Este é um email de teste para verificar se a integração com Resend está funcionando.</p>
        <p>Se você recebeu este email, a integração está funcionando corretamente!</p>
        <p><strong>Data do teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> ✅ Integração funcionando</p>
      `,
      text: `
        Teste de Integração com Resend
        
        Este é um email de teste para verificar se a integração com Resend está funcionando.
        
        Se você recebeu este email, a integração está funcionando corretamente!
        
        Data do teste: ${new Date().toLocaleString('pt-BR')}
        Status: ✅ Integração funcionando
      `
    });

    if (error) {
      console.error('❌ Erro ao enviar email:', error);
      return;
    }

    console.log('✅ Email enviado com sucesso!');
    console.log('📧 ID do email:', data.id);
    console.log('📧 Resposta completa:', data);

    // Teste 2: Verificar domínios
    console.log('\n2️⃣ Verificando domínios...');
    
    try {
      const domains = await resend.domains.list();
      console.log('✅ Domínios encontrados:', domains.data?.length || 0);
      
      if (domains.data && domains.data.length > 0) {
        domains.data.forEach(domain => {
          console.log(`   - ${domain.name} (${domain.status})`);
        });
      } else {
        console.log('⚠️ Nenhum domínio configurado');
        console.log('Configure o domínio vmetrics.com.br no painel do Resend');
      }
    } catch (domainError) {
      console.log('⚠️ Não foi possível verificar domínios:', domainError.message);
    }

    // Teste 3: Verificar estatísticas
    console.log('\n3️⃣ Verificando estatísticas...');
    
    try {
      const stats = await resend.emails.list();
      console.log('✅ Emails enviados:', stats.data?.length || 0);
    } catch (statsError) {
      console.log('⚠️ Não foi possível verificar estatísticas:', statsError.message);
    }

    console.log('\n🎉 Teste de integração concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure o domínio vmetrics.com.br no Resend');
    console.log('2. Teste o envio de emails reais');
    console.log('3. Configure o webhook do Stripe');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testResendIntegration();
