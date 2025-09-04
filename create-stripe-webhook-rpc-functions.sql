-- Funções RPC necessárias para o webhook do Stripe

-- 1. Função para buscar usuário por email
CREATE OR REPLACE FUNCTION find_user_by_email(user_email TEXT)
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  stripe_customer_id TEXT,
  full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email as user_email,
    COALESCE((u.raw_user_meta_data->>'stripe_customer_id')::TEXT, '') as stripe_customer_id,
    COALESCE((u.raw_user_meta_data->>'full_name')::TEXT, '') as full_name
  FROM auth.users u 
  WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para buscar usuário por stripe_customer_id
CREATE OR REPLACE FUNCTION find_user_by_stripe_id(stripe_id TEXT)
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  stripe_customer_id TEXT,
  full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email as user_email,
    COALESCE((u.raw_user_meta_data->>'stripe_customer_id')::TEXT, '') as stripe_customer_id,
    COALESCE((u.raw_user_meta_data->>'full_name')::TEXT, '') as full_name
  FROM auth.users u 
  WHERE (u.raw_user_meta_data->>'stripe_customer_id')::TEXT = stripe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para criar usuário
CREATE OR REPLACE FUNCTION create_auth_user(
  user_email TEXT,
  user_name TEXT,
  stripe_customer_id TEXT
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Gerar novo UUID para o usuário
  new_user_id := gen_random_uuid();
  
  -- Inserir usuário na tabela auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_sso_user,
    is_anonymous
  ) VALUES (
    new_user_id,
    user_email,
    gen_random_uuid()::TEXT, -- Senha aleatória
    NOW(), -- Email já confirmado
    NOW(),
    NOW(),
    jsonb_build_object(
      'full_name', user_name,
      'stripe_customer_id', stripe_customer_id
    ),
    false,
    false
  );
  
  RETURN new_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar usuário: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para atualizar metadata do usuário
CREATE OR REPLACE FUNCTION update_user_metadata(
  user_id UUID,
  stripe_customer_id TEXT,
  full_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE auth.users 
  SET 
    raw_user_meta_data = jsonb_build_object(
      'full_name', full_name,
      'stripe_customer_id', stripe_customer_id
    ),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao atualizar metadata do usuário: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
