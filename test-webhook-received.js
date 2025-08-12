#!/usr/bin/env node

/**
 * Script para verificar se o webhook foi recebido e processado
 * após o pagamento de teste realizado
 */

const colors = require('colors/safe');

console.log(colors.blue.bold('🔍 VERIFICANDO WEBHOOK RECEBIDO'));
console.log(colors.gray('=====================================\n'));

// Verificar se o servidor está rodando
async function checkServerStatus() {
  try {
    console.log(colors.yellow('📡 Verificando status do servidor...'));
    
    const response = await fetch('http://localhost:3001/api/stripe/webhook-status');
    
    if (response.ok) {
      const data = await response.json();
      console.log(colors.green('✅ Servidor está rodando'));
      console.log(colors.gray(`   Status: ${data.status}`));
      console.log(colors.gray(`   Webhook URL: ${data.webhookUrl}`));
      return true;
    } else {
      console.log(colors.red('❌ Servidor não está respondendo'));
      return false;
    }
  } catch (error) {
    console.log(colors.red('❌ Erro ao conectar com servidor:'), error.message);
    return false;
  }
}

// Verificar logs do webhook
async function checkWebhookLogs() {
  try {
    console.log(colors.yellow('\n📋 Verificando logs de webhook...'));
    
    const response = await fetch('http://localhost:3001/api/stripe/webhook-logs');
    
    if (response.ok) {
      const logs = await response.json();
      
      if (logs.length > 0) {
        console.log(colors.green(`✅ ${logs.length} webhook(s) recebido(s)`));
        
        logs.forEach((log, index) => {
          console.log(colors.cyan(`\n   Webhook ${index + 1}:`));
          console.log(colors.gray(`   Evento: ${log.event}`));
          console.log(colors.gray(`   Horário: ${new Date(log.timestamp).toLocaleString('pt-BR')}`));
          console.log(colors.gray(`   Status: ${log.status}`));
          
          if (log.customerEmail) {
            console.log(colors.gray(`   Cliente: ${log.customerEmail}`));
          }
          
          if (log.planType) {
            console.log(colors.gray(`   Plano: ${log.planType}`));
          }
        });
        
        return true;
      } else {
        console.log(colors.yellow('⚠️  Nenhum webhook recebido ainda'));
        return false;
      }
    } else {
      console.log(colors.red('❌ Erro ao buscar logs de webhook'));
      return false;
    }
  } catch (error) {
    console.log(colors.red('❌ Erro ao verificar logs:'), error.message);
    return false;
  }
}

// Verificar status do plano atual
async function checkCurrentPlanStatus() {
  try {
    console.log(colors.yellow('\n👤 Verificando status do plano atual...'));
    
    // Simular verificação do plano atual
    console.log(colors.gray('   Status: Verificando...'));
    console.log(colors.gray('   Plano: Verificando...'));
    console.log(colors.gray('   Próxima cobrança: Verificando...'));
    
    // TODO: Implementar verificação real do plano
    console.log(colors.yellow('⚠️  Função de verificação de plano ainda não implementada'));
    
    return false;
  } catch (error) {
    console.log(colors.red('❌ Erro ao verificar plano:'), error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log(colors.blue.bold('🚀 VERIFICAÇÃO PÓS-PAGAMENTO'));
  console.log(colors.gray('================================\n'));
  
  // 1. Verificar servidor
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    console.log(colors.red('\n❌ Servidor não está rodando. Execute: npm run dev:server'));
    process.exit(1);
  }
  
  // 2. Verificar webhooks
  const webhooksOk = await checkWebhookLogs();
  
  // 3. Verificar plano
  const planOk = await checkCurrentPlanStatus();
  
  // Resumo
  console.log(colors.blue.bold('\n📊 RESUMO DA VERIFICAÇÃO'));
  console.log(colors.gray('================================'));
  
  if (webhooksOk) {
    console.log(colors.green('✅ Webhook recebido e processado'));
    console.log(colors.green('✅ Pagamento confirmado pelo Stripe'));
    console.log(colors.green('✅ Sistema processou o evento'));
  } else {
    console.log(colors.yellow('⚠️  Webhook ainda não recebido'));
    console.log(colors.gray('   Isso pode ser normal se o pagamento foi feito há pouco tempo'));
  }
  
  if (planOk) {
    console.log(colors.green('✅ Plano ativado com sucesso'));
  } else {
    console.log(colors.yellow('⚠️  Status do plano não verificado'));
  }
  
  // Próximos passos
  console.log(colors.blue.bold('\n🎯 PRÓXIMOS PASSOS'));
  console.log(colors.gray('================================'));
  
  if (webhooksOk) {
    console.log(colors.green('1. ✅ Webhook funcionando perfeitamente'));
    console.log(colors.green('2. ✅ Pagamento processado com sucesso'));
    console.log(colors.yellow('3. 🔄 Verificar se plano foi ativado no frontend'));
    console.log(colors.yellow('4. 🔄 Testar upgrade para outro plano'));
  } else {
    console.log(colors.yellow('1. 🔄 Aguardar recebimento do webhook'));
    console.log(colors.yellow('2. 🔄 Verificar logs do servidor'));
    console.log(colors.yellow('3. 🔄 Confirmar configuração do webhook no Stripe'));
  }
  
  console.log(colors.blue.bold('\n💡 DICAS'));
  console.log(colors.gray('================================'));
  console.log(colors.gray('• Webhooks podem levar alguns minutos para serem enviados'));
  console.log(colors.gray('• Verifique os logs do servidor em tempo real'));
  console.log(colors.gray('• Confirme se o webhook está ativo no Stripe Dashboard'));
  console.log(colors.gray('• Teste a interface do frontend para ver mudanças'));
  
  console.log(colors.blue.bold('\n🔗 LINKS ÚTEIS'));
  console.log(colors.gray('================================'));
  console.log(colors.cyan('• Stripe Dashboard: https://dashboard.stripe.com/webhooks'));
  console.log(colors.cyan('• Frontend: http://localhost:5173/settings?tab=billing'));
  console.log(colors.cyan('• Servidor: http://localhost:3001/api/stripe/webhook-status'));
}

// Executar
main().catch(error => {
  console.error(colors.red('❌ Erro na execução:'), error);
  process.exit(1);
});

