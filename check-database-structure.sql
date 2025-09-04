-- 🔍 VERIFICAÇÃO COMPLETA DA ESTRUTURA DO BANCO
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================
SELECT 
  table_name,
  table_type,
  table_schema
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- ========================================
-- 2. VERIFICAR ESTRUTURA DA TABELA USERS (se existir)
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ========================================
-- 3. VERIFICAR ESTRUTURA DA TABELA USER_PLANS (se existir)
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_plans'
ORDER BY ordinal_position;

-- ========================================
-- 4. VERIFICAR ESTRUTURA DA TABELA PROFILES (se existir)
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ========================================
-- 5. VERIFICAR ESTRUTURA DA TABELA AUTH.USERS
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ========================================
-- 6. VERIFICAR DADOS NAS TABELAS
-- ========================================
-- Contar registros em cada tabela
SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users
UNION ALL
SELECT 'public.users' as tabela, COUNT(*) as total FROM public.users
UNION ALL
SELECT 'public.user_plans' as tabela, COUNT(*) as total FROM public.user_plans
UNION ALL
SELECT 'public.profiles' as tabela, COUNT(*) as total FROM public.profiles;

-- ========================================
-- 7. VERIFICAR DADOS ESPECÍFICOS DO USUÁRIO
-- ========================================
-- Buscar usuário por email
SELECT 
  'auth.users' as origem,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'josineyalves.produtos@gmail.com'

UNION ALL

SELECT 
  'public.users' as origem,
  id::text,
  email,
  created_at::text,
  null
FROM public.users 
WHERE email = 'josineyalves.produtos@gmail.com'

UNION ALL

SELECT 
  'public.profiles' as origem,
  id::text,
  email,
  created_at::text,
  null
FROM public.profiles 
WHERE email = 'josineyalves.produtos@gmail.com';

-- ========================================
-- 8. VERIFICAR PLANOS DO USUÁRIO
-- ========================================
-- Buscar planos do usuário
SELECT 
  up.id,
  up.user_id,
  up.plan_type,
  up.status,
  up.stripe_subscription_id,
  up.stripe_customer_id,
  up.current_period_start,
  up.current_period_end,
  up.created_at,
  up.updated_at
FROM public.user_plans up
WHERE up.user_id IN (
  SELECT id FROM auth.users WHERE email = 'josineyalves.produtos@gmail.com'
  UNION
  SELECT id FROM public.users WHERE email = 'josineyalves.produtos@gmail.com'
  UNION
  SELECT id FROM public.profiles WHERE email = 'josineyalves.produtos@gmail.com'
);
