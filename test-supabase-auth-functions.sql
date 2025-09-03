-- 🧪 TESTE: VERIFICAR FUNÇÕES DE AUTH DO SUPABASE
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se usuário existe
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'alvesjosiney@yahoo.com.br'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar configurações de auth
SELECT 
  key,
  value
FROM auth.config
WHERE key LIKE '%expiry%' 
   OR key LIKE '%token%'
   OR key LIKE '%recovery%'
   OR key LIKE '%reset%'
ORDER BY key;

-- 3. Verificar se há função para criar tokens de redefinição
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'auth' 
  AND (routine_name LIKE '%token%' OR routine_name LIKE '%recovery%' OR routine_name LIKE '%reset%')
ORDER BY routine_name;

-- 4. Verificar se há triggers relacionados a auth
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth'
ORDER BY trigger_name;

-- 5. Testar se conseguimos acessar funções de auth via RPC
SELECT 
  proname,
  proargnames,
  proargtypes
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
  AND proname LIKE '%token%'
ORDER BY proname;
