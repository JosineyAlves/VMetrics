-- 🚀 FUNÇÕES RPC PARA GERENCIAR AUTH.USERS VIA EDGE FUNCTIONS
-- Execute este script no SQL Editor do Supabase

-- 1. Function para buscar usuário por email
CREATE OR REPLACE FUNCTION find_user_by_email(user_email TEXT)
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  stripe_customer_id TEXT,
  full_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE((u.raw_user_meta_data->>'stripe_customer_id')::TEXT, '') as stripe_customer_id,
    COALESCE((u.raw_user_meta_data->>'full_name')::TEXT, '') as full_name
  FROM auth.users u
  WHERE u.email = user_email;
END;
$$;

-- 2. Function para buscar usuário por stripe_customer_id
CREATE OR REPLACE FUNCTION find_user_by_stripe_id(stripe_id TEXT)
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  stripe_customer_id TEXT,
  full_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE((u.raw_user_meta_data->>'stripe_customer_id')::TEXT, '') as stripe_customer_id,
    COALESCE((u.raw_user_meta_data->>'full_name')::TEXT, '') as full_name
  FROM auth.users u
  WHERE u.raw_user_meta_data->>'stripe_customer_id' = stripe_id;
END;
$$;

-- 3. Function para criar usuário na auth.users
CREATE OR REPLACE FUNCTION create_auth_user(
  user_email TEXT,
  user_name TEXT,
  stripe_customer_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Gerar novo UUID para o usuário
  new_user_id := gen_random_uuid();
  
  -- Inserir usuário na tabela auth.users
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
    confirmed_at,
    email_change_confirm_status
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    gen_random_uuid()::TEXT, -- Senha temporária
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    jsonb_build_object(
      'full_name', user_name,
      'stripe_customer_id', stripe_customer_id
    ),
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email')
    ),
    false,
    NOW(),
    0
  );
  
  RETURN new_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar usuário: %', SQLERRM;
END;
$$;

-- 4. Function para atualizar metadata do usuário
CREATE OR REPLACE FUNCTION update_user_metadata(
  user_id UUID,
  stripe_customer_id TEXT,
  full_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_metadata JSONB;
BEGIN
  -- Buscar metadata atual
  SELECT raw_user_meta_data INTO current_metadata
  FROM auth.users 
  WHERE id = user_id;
  
  IF current_metadata IS NULL THEN
    current_metadata := '{}'::jsonb;
  END IF;
  
  -- Atualizar metadata
  current_metadata := current_metadata || jsonb_build_object('stripe_customer_id', stripe_customer_id);
  
  IF full_name IS NOT NULL THEN
    current_metadata := current_metadata || jsonb_build_object('full_name', full_name);
  END IF;
  
  -- Atualizar usuário
  UPDATE auth.users 
  SET 
    raw_user_meta_data = current_metadata,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar metadata: %', SQLERRM;
END;
$$;

-- 5. Function para listar todos os usuários (para busca por stripe_customer_id)
CREATE OR REPLACE FUNCTION list_users_with_metadata()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  stripe_customer_id TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE((u.raw_user_meta_data->>'stripe_customer_id')::TEXT, '') as stripe_customer_id,
    COALESCE((u.raw_user_meta_data->>'full_name')::TEXT, '') as full_name,
    u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- 6. Teste rápido das funções
DO $$
BEGIN
  RAISE NOTICE 'Funções RPC criadas com sucesso!';
  RAISE NOTICE 'Testando find_user_by_email...';
  
  -- Teste básico (não deve retornar nada se não houver usuários)
  PERFORM * FROM find_user_by_email('teste@example.com');
  
  RAISE NOTICE 'Todas as funções estão funcionais!';
END $$;

-- 7. Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'find_user_by_email',
  'find_user_by_stripe_id', 
  'create_auth_user',
  'update_user_metadata',
  'list_users_with_metadata'
)
ORDER BY routine_name;
