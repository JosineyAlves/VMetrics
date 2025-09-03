-- 🧪 TESTE: VERIFICAR SE TOKEN DE REDEFINIÇÃO É CRIADO
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

-- 2. Verificar tokens de redefinição de senha
SELECT 
  id,
  user_id,
  token_type,
  token_hash,
  created_at,
  expires_at,
  used_at
FROM auth.refresh_tokens 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'alvesjosiney@yahoo.com.br'
)
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar se há tokens de redefinição ativos
SELECT 
  rt.id,
  rt.user_id,
  rt.token_type,
  rt.token_hash,
  rt.created_at,
  rt.expires_at,
  rt.used_at,
  u.email
FROM auth.refresh_tokens rt
JOIN auth.users u ON rt.user_id = u.id
WHERE u.email = 'alvesjosiney@yahoo.com.br'
  AND rt.token_type = 'recovery'
  AND rt.expires_at > NOW()
  AND rt.used_at IS NULL
ORDER BY rt.created_at DESC;

-- 4. Verificar configurações de expiração
SELECT 
  setting_name,
  setting_value
FROM auth.config
WHERE setting_name LIKE '%expiry%' 
   OR setting_name LIKE '%token%'
   OR setting_name LIKE '%recovery%';
