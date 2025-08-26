-- Script para verificar o status atual do plano do usuário
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário por email
SELECT 
  id,
  email,
  full_name,
  stripe_customer_id,
  is_active,
  created_at
FROM users 
WHERE email = 'alvesjosiney@yahoo.com.br';

-- 2. Verificar plano atual do usuário
SELECT 
  up.id,
  up.user_id,
  up.plan_type,
  up.stripe_subscription_id,
  up.stripe_customer_id,
  up.status,
  up.current_period_start,
  up.current_period_end,
  up.created_at,
  up.updated_at
FROM user_plans up
JOIN users u ON up.user_id = u.id
WHERE u.email = 'alvesjosiney@yahoo.com.br'
ORDER BY up.updated_at DESC;

-- 3. Verificar todas as assinaturas do usuário
SELECT 
  up.id,
  up.plan_type,
  up.stripe_subscription_id,
  up.status,
  up.updated_at
FROM user_plans up
JOIN users u ON up.user_id = u.id
WHERE u.email = 'alvesjosiney@yahoo.com.br'
ORDER BY up.updated_at DESC;

-- 4. Verificar se há múltiplos planos para o mesmo usuário
SELECT 
  u.email,
  COUNT(up.id) as total_plans,
  STRING_AGG(up.plan_type, ', ') as plan_types,
  STRING_AGG(up.status, ', ') as statuses
FROM users u
LEFT JOIN user_plans up ON u.id = up.user_id
WHERE u.email = 'alvesjosiney@yahoo.com.br'
GROUP BY u.email;
