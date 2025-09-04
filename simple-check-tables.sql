-- 🔍 VERIFICAÇÃO SIMPLES DAS TABELAS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar tabelas existentes
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;

-- 2. Verificar se existe tabela profiles
SELECT COUNT(*) as profiles_exists 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 3. Verificar se existe tabela users
SELECT COUNT(*) as users_exists 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- 4. Verificar se existe tabela user_plans
SELECT COUNT(*) as user_plans_exists 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_plans';
