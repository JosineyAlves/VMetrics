-- Script para limpar tabelas antigas e evitar conflitos
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados antes de deletar
SELECT 'profiles' as tabela, COUNT(*) as total FROM profiles;
SELECT 'subscriptions' as tabela, COUNT(*) as total FROM subscriptions;

-- 2. Deletar tabela profiles (antiga)
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Deletar tabela subscriptions (antiga)
DROP TABLE IF EXISTS subscriptions CASCADE;

-- 4. Verificar se as tabelas foram removidas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'subscriptions');

-- 5. Verificar tabelas ativas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_plans');

-- 6. Verificar dados nas tabelas ativas
SELECT 'users' as tabela, COUNT(*) as total FROM users;
SELECT 'user_plans' as tabela, COUNT(*) as total FROM user_plans;
