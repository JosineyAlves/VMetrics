// 🧪 TESTE: VERIFICAR API DE REDEFINIÇÃO DE SENHA
// Execute este script no console do navegador

// 1. Testar se Supabase está configurado
console.log('Supabase URL:', window.supabase?.supabaseUrl);
console.log('Supabase Key:', window.supabase?.supabaseKey);

// 2. Testar função resetPasswordForEmail
async function testResetPassword() {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail('alvesjosiney@yahoo.com.br', {
      redirectTo: window.location.origin + '/setup-password'
    });
    
    console.log('Reset Password Result:', { data, error });
    
    if (error) {
      console.error('Erro ao enviar email de redefinição:', error);
    } else {
      console.log('Email de redefinição enviado com sucesso!');
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}

// 3. Executar teste
testResetPassword();

// 4. Verificar se há usuário logado
supabase.auth.getUser().then(({ data, error }) => {
  console.log('Usuário atual:', { data, error });
});

// 5. Verificar sessão atual
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Sessão atual:', { data, error });
});
