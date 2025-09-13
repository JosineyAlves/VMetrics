-- 🔧 CORREÇÃO MANUAL: Atualizar dados do usuário após nova assinatura
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- CORREÇÃO DOS DADOS DO USUÁRIO
-- ========================================

-- 1. Atualizar stripe_customer_id na tabela profiles
UPDATE profiles 
SET stripe_customer_id = 'cus_T2oosWpoD6pQiI'
WHERE email = 'josineyalves.produtos@gmail.com';

-- 2. Inserir novo plano ativo (substituindo o cancelado)
INSERT INTO user_plans (
  user_id,
  plan_type,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
) VALUES (
  'fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d',  -- user_id existente
  'quarterly',                               -- plan_type
  'sub_1S6jArL6dVrVagX4MgMZsq1j',          -- nova subscription_id
  'cus_T2oosWpoD6pQiI',                     -- novo customer_id
  'active',                                  -- status ativo
  '2025-09-13 02:26:51.000+00',             -- current_period_start
  '2026-01-13 02:26:51.000+00',             -- current_period_end (3 meses)
  NOW(),                                     -- created_at
  NOW()                                      -- updated_at
);

-- 3. Verificar se os dados foram atualizados corretamente
SELECT 
  p.email,
  p.stripe_customer_id,
  up.plan_type,
  up.stripe_subscription_id,
  up.status,
  up.current_period_start,
  up.current_period_end
FROM profiles p
LEFT JOIN user_plans up ON p.id = up.user_id
WHERE p.email = 'josineyalves.produtos@gmail.com'
ORDER BY up.created_at DESC;

-- ========================================
-- LOG DA CORREÇÃO
-- ========================================

-- Inserir log da correção manual
INSERT INTO webhook_logs (
  event_type,
  subscription_id,
  customer_id,
  user_id,
  plan_type,
  metadata,
  created_at
) VALUES (
  'manual_fix_applied',
  'sub_1S6jArL6dVrVagX4MgMZsq1j',
  'cus_T2oosWpoD6pQiI',
  'fdc6c3f1-323f-49b9-a90e-ec5ae030dc9d',
  'quarterly',
  '{"reason": "fix_customer_id_mismatch", "old_customer_id": "cus_SzjCo7NFizJM7v", "new_customer_id": "cus_T2oosWpoD6pQiI"}',
  NOW()
);
