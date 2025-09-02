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
  new_user_id := gen_random_uuid();
  
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
    gen_random_uuid()::TEXT,
    NOW(),
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
END;
$$;
