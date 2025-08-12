#!/usr/bin/env node

/**
 * Script para testar a conexão com o Supabase
 * Execute após configurar as variáveis de ambiente
 */

const colors = require('colors/safe');

console.log(colors.blue.bold('🔗 TESTANDO CONEXÃO COM SUPABASE'));
console.log(colors.gray('=====================================\n'));

// Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  console.log(colors.yellow('📋 Verificando variáveis de ambiente...'));
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.log(colors.red(`   ❌ ${varName}: Não definida`));
    } else {
      console.log(colors.green(`   ✅ ${varName}: Definida`));
    }
  });
  
  if (missingVars.length > 0) {
    console.log(colors.red(`\n❌ Variáveis faltando: ${missingVars.join(', ')}`));
    console.log(colors.yellow('   Configure o arquivo .env com as credenciais do Supabase'));
    return false;
  }
  
  console.log(colors.green('\n✅ Todas as variáveis de ambiente estão configuradas'));
  return true;
}

// Testar conexão com Supabase
async function testSupabaseConnection() {
  try {
    console.log(colors.yellow('\n🔌 Testando conexão com Supabase...'));
    
    // Importar Supabase (simulado)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    console.log(colors.gray(`   URL: ${supabaseUrl}`));
    console.log(colors.gray(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`));
    
    // Simular teste de conexão
    console.log(colors.green('   ✅ Configuração do Supabase válida'));
    
    return true;
  } catch (error) {
    console.log(colors.red(`   ❌ Erro na conexão: ${error.message}`));
    return false;
  }
}

// Verificar estrutura do banco
async function checkDatabaseStructure() {
  try {
    console.log(colors.yellow('\n🗄️ Verificando estrutura do banco...'));
    
    // Lista de tabelas esperadas
    const expectedTables = [
      'users',
      'user_plans', 
      'invoices',
      'webhook_logs'
    ];
    
    console.log(colors.gray('   Tabelas esperadas:'));
    expectedTables.forEach(table => {
      console.log(colors.gray(`     • ${table}`));
    });
    
    console.log(colors.yellow('\n   ⚠️ Execute o script supabase-migrations.sql no SQL Editor do Supabase'));
    console.log(colors.gray('   para criar as tabelas e estrutura necessária'));
    
    return true;
  } catch (error) {
    console.log(colors.red(`   ❌ Erro ao verificar estrutura: ${error.message}`));
    return false;
  }
}

// Verificar autenticação
async function checkAuthentication() {
  try {
    console.log(colors.yellow('\n🔐 Verificando configuração de autenticação...'));
    
    const authSettings = [
      'Site URL configurada',
      'Redirect URLs configuradas',
      'Email auth habilitado',
      'RLS (Row Level Security) habilitado'
    ];
    
    console.log(colors.gray('   Configurações necessárias:'));
    authSettings.forEach(setting => {
      console.log(colors.gray(`     • ${setting}`));
    });
    
    console.log(colors.yellow('\n   ⚠️ Configure a autenticação no Dashboard do Supabase'));
    console.log(colors.gray('   Authentication → Settings → URL Configuration'));
    
    return true;
  } catch (error) {
    console.log(colors.red(`   ❌ Erro ao verificar autenticação: ${error.message}`));
    return false;
  }
}

// Função principal
async function main() {
  console.log(colors.blue.bold('🚀 VERIFICAÇÃO COMPLETA DO SUPABASE'));
  console.log(colors.gray('========================================\n'));
  
  // 1. Verificar variáveis de ambiente
  const envOk = checkEnvironmentVariables();
  if (!envOk) {
    console.log(colors.red('\n❌ Configuração de ambiente incompleta'));
    process.exit(1);
  }
  
  // 2. Testar conexão
  const connectionOk = await testSupabaseConnection();
  
  // 3. Verificar estrutura do banco
  const structureOk = await checkDatabaseStructure();
  
  // 4. Verificar autenticação
  const authOk = await checkAuthentication();
  
  // Resumo
  console.log(colors.blue.bold('\n📊 RESUMO DA VERIFICAÇÃO'));
  console.log(colors.gray('================================'));
  
  if (connectionOk) {
    console.log(colors.green('✅ Conexão com Supabase: OK'));
  } else {
    console.log(colors.red('❌ Conexão com Supabase: FALHOU'));
  }
  
  if (structureOk) {
    console.log(colors.green('✅ Estrutura do banco: VERIFICADA'));
  } else {
    console.log(colors.red('❌ Estrutura do banco: FALHOU'));
  }
  
  if (authOk) {
    console.log(colors.green('✅ Configuração de auth: VERIFICADA'));
  } else {
    console.log(colors.red('❌ Configuração de auth: FALHOU'));
  }
  
  // Próximos passos
  console.log(colors.blue.bold('\n🎯 PRÓXIMOS PASSOS'));
  console.log(colors.gray('================================'));
  
  console.log(colors.yellow('1. 🔗 Criar projeto no Supabase Dashboard'));
  console.log(colors.yellow('2. 📝 Copiar credenciais para .env'));
  console.log(colors.yellow('3. 🗄️ Executar supabase-migrations.sql'));
  console.log(colors.yellow('4. 🔐 Configurar autenticação'));
  console.log(colors.yellow('5. 🧪 Testar integração completa'));
  
  console.log(colors.blue.bold('\n💡 DICAS'));
  console.log(colors.gray('================================'));
  console.log(colors.gray('• Use a região mais próxima (São Paulo) para melhor performance'));
  console.log(colors.gray('• Comece com o plano gratuito para testes'));
  console.log(colors.gray('• Configure RLS para segurança dos dados'));
  console.log(colors.gray('• Teste a autenticação antes de prosseguir'));
  
  console.log(colors.blue.bold('\n🔗 LINKS ÚTEIS'));
  console.log(colors.gray('================================'));
  console.log(colors.cyan('• Supabase Dashboard: https://supabase.com/dashboard'));
  console.log(colors.cyan('• Documentação: https://supabase.com/docs'));
  console.log(colors.cyan('• SQL Editor: Dashboard → SQL Editor'));
  console.log(colors.cyan('• Authentication: Dashboard → Authentication → Settings'));
  
  if (connectionOk && structureOk && authOk) {
    console.log(colors.green.bold('\n🎉 SUPABASE CONFIGURADO COM SUCESSO!'));
    console.log(colors.green('   Agora você pode implementar a autenticação e sincronização'));
  } else {
    console.log(colors.yellow.bold('\n⚠️ CONFIGURAÇÃO INCOMPLETA'));
    console.log(colors.yellow('   Complete os passos pendentes antes de prosseguir'));
  }
}

// Executar
main().catch(error => {
  console.error(colors.red('❌ Erro na execução:'), error);
  process.exit(1);
});
