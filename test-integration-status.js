#!/usr/bin/env node

/**
 * Script para verificar o status da integração
 * Supabase + Vercel + GitHub
 */

const colors = require('colors/safe');
const fs = require('fs');
const path = require('path');

console.log(colors.blue.bold('🔗 VERIFICANDO STATUS DA INTEGRAÇÃO'));
console.log(colors.gray('========================================\n'));

// Verificar arquivos de configuração
function checkConfigurationFiles() {
  console.log(colors.yellow('📋 Verificando arquivos de configuração...'));
  
  const requiredFiles = [
    'vercel.json',
    'package.json',
    'env.example',
    'supabase-migrations.sql'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(colors.green(`   ✅ ${file}`));
    } else {
      missingFiles.push(file);
      console.log(colors.red(`   ❌ ${file}`));
    }
  });
  
  if (missingFiles.length > 0) {
    console.log(colors.red(`\n❌ Arquivos faltando: ${missingFiles.join(', ')}`));
    return false;
  }
  
  console.log(colors.green('\n✅ Todos os arquivos de configuração estão presentes'));
  return true;
}

// Verificar configuração do Vercel
function checkVercelConfig() {
  try {
    console.log(colors.yellow('\n🚀 Verificando configuração do Vercel...'));
    
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    console.log(colors.gray('   Configurações encontradas:'));
    
    if (vercelConfig.buildCommand) {
      console.log(colors.green(`     ✅ Build Command: ${vercelConfig.buildCommand}`));
    } else {
      console.log(colors.yellow(`     ⚠️ Build Command: Não definido (usará padrão)`));
    }
    
    if (vercelConfig.outputDirectory) {
      console.log(colors.green(`     ✅ Output Directory: ${vercelConfig.outputDirectory}`));
    } else {
      console.log(colors.yellow(`     ⚠️ Output Directory: Não definido (usará padrão)`));
    }
    
    if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
      console.log(colors.green(`     ✅ Rewrites: ${vercelConfig.rewrites.length} regra(s)`));
    } else {
      console.log(colors.yellow(`     ⚠️ Rewrites: Não definido`));
    }
    
    return true;
  } catch (error) {
    console.log(colors.red(`   ❌ Erro ao ler vercel.json: ${error.message}`));
    return false;
  }
}

// Verificar configuração do package.json
function checkPackageConfig() {
  try {
    console.log(colors.yellow('\n📦 Verificando configuração do package.json...'));
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log(colors.gray('   Scripts encontrados:'));
    
    const requiredScripts = ['build', 'dev', 'supabase:test'];
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(colors.green(`     ✅ ${script}: ${packageJson.scripts[script]}`));
      } else {
        console.log(colors.yellow(`     ⚠️ ${script}: Não definido`));
      }
    });
    
    if (packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js']) {
      console.log(colors.green(`   ✅ Supabase SDK instalado`));
    } else {
      console.log(colors.red(`   ❌ Supabase SDK não instalado`));
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(colors.red(`   ❌ Erro ao ler package.json: ${error.message}`));
    return false;
  }
}

// Verificar estrutura do projeto
function checkProjectStructure() {
  console.log(colors.yellow('\n🗂️ Verificando estrutura do projeto...'));
  
  const requiredDirs = [
    'src',
    'src/lib',
    'src/hooks',
    'src/services',
    'src/components'
  ];
  
  const missingDirs = [];
  
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(colors.green(`   ✅ ${dir}/`));
    } else {
      missingDirs.push(dir);
      console.log(colors.red(`   ❌ ${dir}/`));
    }
  });
  
  if (missingDirs.length > 0) {
    console.log(colors.red(`\n❌ Diretórios faltando: ${missingDirs.join(', ')}`));
    return false;
  }
  
  console.log(colors.green('\n✅ Estrutura do projeto está correta'));
  return true;
}

// Verificar arquivos do Supabase
function checkSupabaseFiles() {
  console.log(colors.yellow('\n🗄️ Verificando arquivos do Supabase...'));
  
  const supabaseFiles = [
    'src/lib/supabase.ts',
    'src/hooks/useAuth.ts',
    'supabase-migrations.sql'
  ];
  
  const missingFiles = [];
  
  supabaseFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(colors.green(`   ✅ ${file}`));
    } else {
      missingFiles.push(file);
      console.log(colors.red(`   ❌ ${file}`));
    }
  });
  
  if (missingFiles.length > 0) {
    console.log(colors.red(`\n❌ Arquivos Supabase faltando: ${missingFiles.join(', ')}`));
    return false;
  }
  
  console.log(colors.green('\n✅ Todos os arquivos Supabase estão presentes'));
  return true;
}

// Verificar .gitignore
function checkGitignore() {
  try {
    console.log(colors.yellow('\n🔒 Verificando .gitignore...'));
    
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    
    const requiredPatterns = [
      '.env.local',
      '.vercel',
      'node_modules'
    ];
    
    const missingPatterns = [];
    
    requiredPatterns.forEach(pattern => {
      if (gitignore.includes(pattern)) {
        console.log(colors.green(`   ✅ ${pattern}`));
      } else {
        missingPatterns.push(pattern);
        console.log(colors.red(`   ❌ ${pattern}`));
      }
    });
    
    if (missingPatterns.length > 0) {
      console.log(colors.yellow(`\n⚠️ Padrões faltando no .gitignore: ${missingPatterns.join(', ')}`));
    } else {
      console.log(colors.green('\n✅ .gitignore configurado corretamente'));
    }
    
    return missingPatterns.length === 0;
  } catch (error) {
    console.log(colors.red(`   ❌ Erro ao ler .gitignore: ${error.message}`));
    return false;
  }
}

// Função principal
async function main() {
  console.log(colors.blue.bold('🚀 VERIFICAÇÃO COMPLETA DA INTEGRAÇÃO'));
  console.log(colors.gray('========================================\n'));
  
  // 1. Verificar arquivos de configuração
  const configOk = checkConfigurationFiles();
  
  // 2. Verificar configuração do Vercel
  const vercelOk = checkVercelConfig();
  
  // 3. Verificar configuração do package.json
  const packageOk = checkPackageConfig();
  
  // 4. Verificar estrutura do projeto
  const structureOk = checkProjectStructure();
  
  // 5. Verificar arquivos do Supabase
  const supabaseOk = checkSupabaseFiles();
  
  // 6. Verificar .gitignore
  const gitignoreOk = checkGitignore();
  
  // Resumo
  console.log(colors.blue.bold('\n📊 RESUMO DA VERIFICAÇÃO'));
  console.log(colors.gray('================================'));
  
  const checks = [
    { name: 'Arquivos de Configuração', ok: configOk },
    { name: 'Configuração Vercel', ok: vercelOk },
    { name: 'Package.json', ok: packageOk },
    { name: 'Estrutura do Projeto', ok: structureOk },
    { name: 'Arquivos Supabase', ok: supabaseOk },
    { name: 'Gitignore', ok: gitignoreOk }
  ];
  
  checks.forEach(check => {
    if (check.ok) {
      console.log(colors.green(`✅ ${check.name}: OK`));
    } else {
      console.log(colors.red(`❌ ${check.name}: FALHOU`));
    }
  });
  
  const allOk = checks.every(check => check.ok);
  
  // Próximos passos
  console.log(colors.blue.bold('\n🎯 PRÓXIMOS PASSOS'));
  console.log(colors.gray('================================'));
  
  if (allOk) {
    console.log(colors.green('🎉 Projeto configurado corretamente!'));
    console.log(colors.yellow('1. 🔗 Criar projeto no Supabase Dashboard'));
    console.log(colors.yellow('2. 📝 Configurar variáveis de ambiente'));
    console.log(colors.yellow('3. 🚀 Conectar Vercel + GitHub'));
    console.log(colors.yellow('4. 🧪 Testar deploy automático'));
    console.log(colors.yellow('5. 🌐 Configurar domínio personalizado'));
  } else {
    console.log(colors.red('⚠️ Corrija os problemas antes de prosseguir'));
    console.log(colors.yellow('1. 🔧 Resolver erros de configuração'));
    console.log(colors.yellow('2. 📁 Verificar estrutura de arquivos'));
    console.log(colors.yellow('3. 📦 Instalar dependências faltantes'));
    console.log(colors.yellow('4. 🔒 Configurar .gitignore'));
  }
  
  console.log(colors.blue.bold('\n💡 DICAS'));
  console.log(colors.gray('================================'));
  console.log(colors.gray('• Execute: npm run supabase:test para verificar conexão'));
  console.log(colors.gray('• Execute: npm run build para verificar build'));
  console.log(colors.gray('• Verifique: git status para arquivos não commitados'));
  console.log(colors.gray('• Teste: vercel --version para verificar CLI'));
  
  console.log(colors.blue.bold('\n🔗 LINKS ÚTEIS'));
  console.log(colors.gray('================================'));
  console.log(colors.cyan('• Supabase: https://supabase.com/dashboard'));
  console.log(colors.cyan('• Vercel: https://vercel.com/dashboard'));
  console.log(colors.cyan('• GitHub: https://github.com/settings/connections'));
  
  if (allOk) {
    console.log(colors.green.bold('\n🎉 INTEGRAÇÃO PRONTA PARA CONFIGURAÇÃO!'));
    console.log(colors.green('   Agora você pode seguir o guia SUPABASE_VERCEL_GITHUB_INTEGRATION.md'));
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
