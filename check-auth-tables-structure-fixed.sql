-- 🔍 VERIFICAR ESTRUTURA DAS TABELAS DE AUTH (CORRIGIDO)
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela auth.refresh_tokens
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'refresh_tokens'
ORDER BY ordinal_position;

-- 2. Verificar estrutura da tabela auth.users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar se existe tabela para tokens de redefinição
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'auth' 
  AND table_name LIKE '%token%'
ORDER BY table_name;

-- 4. Verificar se existe tabela para recovery tokens
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'auth' 
  AND (table_name LIKE '%recovery%' OR table_name LIKE '%reset%')
ORDER BY table_name;

-- 5. Verificar dados na tabela auth.refresh_tokens (sem expires_at)
SELECT 
  id,
  user_id,
  created_at,
  updated_at
FROM auth.refresh_tokens 
LIMIT 5;

-- 6. Verificar se há tokens de redefinição em outras tabelas
SELECT 
  table_name,
  column_name
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND (column_name LIKE '%token%' OR column_name LIKE '%recovery%' OR column_name LIKE '%reset%')
ORDER BY table_name, column_name;

-- 7. Verificar todas as tabelas no schema auth
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;
