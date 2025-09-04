-- Script para corrigir dados do usuário e plano

-- 1. Primeiro, vamos ver o que temos
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'stripe_customer_id' as stripe_customer_id,
  u.raw_user_meta_data->>'full_name' as full_name
FROM auth.users u 
WHERE u.email = 'alvesjosiney@yahoo.com.br';

-- 2. Verificar planos existentes
SELECT 
  up.id,
  up.user_id,
  up.plan_type,
  up.stripe_subscription_id,
  up.stripe_customer_id,
  up.status,
  up.created_at
FROM user_plans up
JOIN auth.users u ON up.user_id = u.id
WHERE u.email = 'alvesjosiney@yahoo.com.br';

-- 3. Atualizar o usuário existente com o stripe_customer_id correto
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_build_object(
    'full_name', 'Josiney Alves',
    'stripe_customer_id', 'cus_SzOD3WusH4eAos'
  ),
  updated_at = NOW()
WHERE email = 'alvesjosiney@yahoo.com.br';

-- 4. Remover planos duplicados (manter apenas o mais recente)
DELETE FROM user_plans 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY stripe_subscription_id 
             ORDER BY created_at DESC
           ) as rn
    FROM user_plans
    WHERE stripe_subscription_id = 'sub_1S3PRML6dVrVagX4O1OiBI9b'
  ) t 
  WHERE rn > 1
);

-- 5. Atualizar o plano existente com o user_id correto
UPDATE user_plans 
SET 
  user_id = (SELECT id FROM auth.users WHERE email = 'alvesjosiney@yahoo.com.br'),
  status = 'active',
  updated_at = NOW()
WHERE stripe_subscription_id = 'sub_1S3PRML6dVrVagX4O1OiBI9b';

-- 6. Remover usuário duplicado criado pelo webhook
DELETE FROM auth.users 
WHERE email = 'stripe_cus_SzOD3WusH4eAos@vmetrics.com.br';

-- 7. Verificar resultado final
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'stripe_customer_id' as stripe_customer_id,
  u.raw_user_meta_data->>'full_name' as full_name
FROM auth.users u 
WHERE u.email = 'alvesjosiney@yahoo.com.br';

SELECT 
  up.id,
  up.user_id,
  up.plan_type,
  up.stripe_subscription_id,
  up.stripe_customer_id,
  up.status,
  up.created_at
FROM user_plans up
JOIN auth.users u ON up.user_id = u.id
WHERE u.email = 'alvesjosiney@yahoo.com.br';
