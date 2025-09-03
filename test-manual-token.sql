-- 🧪 TESTE: CRIAR TOKEN DE REDEFINIÇÃO MANUALMENTE
-- Execute este script no SQL Editor do Supabase

-- 1. Criar token de redefinição manualmente
DO $$
DECLARE
  user_id UUID;
  token_hash TEXT;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'alvesjosiney@yahoo.com.br'
  LIMIT 1;
  
  IF user_id IS NOT NULL THEN
    -- Gerar token hash
    token_hash := encode(gen_random_bytes(32), 'hex');
    
    -- Inserir token de redefinição
    INSERT INTO auth.refresh_tokens (
      id,
      user_id,
      token_type,
      token_hash,
      created_at,
      expires_at
    ) VALUES (
      gen_random_uuid(),
      user_id,
      'recovery',
      token_hash,
      NOW(),
      NOW() + INTERVAL '1 hour'
    );
    
    RAISE NOTICE 'Token criado: %', token_hash;
    RAISE NOTICE 'User ID: %', user_id;
  ELSE
    RAISE NOTICE 'Usuário não encontrado';
  END IF;
END $$;

-- 2. Verificar token criado
SELECT 
  rt.id,
  rt.user_id,
  rt.token_type,
  rt.token_hash,
  rt.created_at,
  rt.expires_at,
  u.email
FROM auth.refresh_tokens rt
JOIN auth.users u ON rt.user_id = u.id
WHERE u.email = 'alvesjosiney@yahoo.com.br'
  AND rt.token_type = 'recovery'
  AND rt.expires_at > NOW()
ORDER BY rt.created_at DESC
LIMIT 5;
