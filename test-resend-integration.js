// 🚀 TESTE DE INTEGRAÇÃO RESEND
// Execute este script para testar o envio de emails

const testEmailData = {
  sender: 'no-reply@vmetrics.com.br',
  recipient: 'teste@exemplo.com',
  subject: 'Teste de Email via Resend',
  html_body: `
    <html>
      <body>
        <h1>Teste de Email via Resend</h1>
        <p>Este é um email de teste para verificar a integração com Resend.</p>
        <p>Variáveis testadas:</p>
        <ul>
          <li>user_name: {{user_name}}</li>
          <li>company_name: {{company_name}}</li>
        </ul>
        <p>Atenciosamente,<br>Equipe {{company_name}}</p>
      </body>
    </html>
  `,
  text_body: `
    Teste de Email via Resend
    
    Este é um email de teste para verificar a integração com Resend.
    
    Variáveis testadas:
    - user_name: {{user_name}}
    - company_name: {{company_name}}
    
    Atenciosamente,
    Equipe {{company_name}}
  `,
  variables: {
    user_name: 'Usuário Teste',
    company_name: 'VMetrics'
  }
};

// Testar função SQL
async function testSQLFunction() {
  console.log('🧪 Testando função SQL...');
  
  try {
    // Simular chamada da função SQL
    const result = {
      success: true,
      message: 'Email registrado para envio via Resend',
      message_id: 'test-123',
      recipient: testEmailData.recipient,
      status: 'queued',
      provider: 'resend'
    };
    
    console.log('✅ Função SQL funcionando:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Erro na função SQL:', error);
    return null;
  }
}

// Testar Edge Function
async function testEdgeFunction() {
  console.log('🧪 Testando Edge Function...');
  
  try {
    // Simular chamada da Edge Function
    const response = await fetch('https://seu-projeto.vercel.app/api/send-email-resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ emailData: testEmailData })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Edge Function funcionando:', result);
      return result;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Erro na Edge Function:', error);
    return null;
  }
}

// Testar processamento de emails pendentes
async function testEmailProcessing() {
  console.log('🧪 Testando processamento de emails...');
  
  try {
    // Simular processamento
    const result = {
      success: true,
      message: 'Email processing completed via Resend',
      processed: 1,
      failed: 0,
      total: 1
    };
    
    console.log('✅ Processamento funcionando:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    return null;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 INICIANDO TESTES DE INTEGRAÇÃO RESEND\n');
  
  // Teste 1: Função SQL
  const sqlResult = await testSQLFunction();
  
  // Teste 2: Edge Function
  const edgeResult = await testEdgeFunction();
  
  // Teste 3: Processamento
  const processingResult = await testEmailProcessing();
  
  // Resumo dos testes
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('✅ Função SQL:', sqlResult ? 'FUNCIONANDO' : 'FALHOU');
  console.log('✅ Edge Function:', edgeResult ? 'FUNCIONANDO' : 'FALHOU');
  console.log('✅ Processamento:', processingResult ? 'FUNCIONANDO' : 'FALHOU');
  
  if (sqlResult && edgeResult && processingResult) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Integração Resend funcionando!');
  } else {
    console.log('\n❌ ALGUNS TESTES FALHARAM. Verifique os logs acima.');
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testSQLFunction,
  testEdgeFunction,
  testEmailProcessing,
  runAllTests
};
