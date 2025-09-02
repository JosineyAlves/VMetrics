-- 🔍 TESTE RÁPIDO: VERIFICAR ACESSO À AUTH.USERS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela auth.users existe
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 2. Verificar estrutura da tabela auth.users
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar usuários existentes
SELECT 
  id, 
  email, 
  raw_user_meta_data,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Verificar tabelas customizadas que criamos
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_plans', 'invoices');

-- 5. Teste de inserção na auth.users (CUIDADO - só teste)
-- NÃO EXECUTE ESTE BLOCO SE NÃO QUISER CRIAR UM USUÁRIO DE TESTE
/*
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Tentar inserir usuário de teste
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data,
    is_super_admin,
    confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste-webhook@vmetrics.com.br',
    gen_random_uuid()::TEXT,
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Teste Webhook", "stripe_customer_id": "cus_test123"}',
    '{"provider": "email", "providers": ["email"]}',
    false,
    NOW()
  )
  RETURNING id INTO test_user_id;
  
  RAISE NOTICE 'Usuário de teste criado com ID: %', test_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar usuário: %', SQLERRM;
END $$;
*/

-- 6. Verificar permissões RLS na auth.users
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'auth' AND tablename = 'users';

-- 7. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users';
