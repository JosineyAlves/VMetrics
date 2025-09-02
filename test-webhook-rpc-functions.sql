-- 🧪 TESTE COMPLETO DAS FUNÇÕES RPC E WEBHOOK
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, execute o script create-auth-rpc-functions.sql se ainda não executou

-- 2. Teste básico das funções RPC
DO $$
BEGIN
  RAISE NOTICE '🚀 INICIANDO TESTES DAS FUNÇÕES RPC';
  
  -- Verificar se as funções existem
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'find_user_by_email') THEN
    RAISE NOTICE '✅ Função find_user_by_email existe';
  ELSE
    RAISE NOTICE '❌ Função find_user_by_email NÃO existe - execute create-auth-rpc-functions.sql primeiro';
    RETURN;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_auth_user') THEN
    RAISE NOTICE '✅ Função create_auth_user existe';
  ELSE
    RAISE NOTICE '❌ Função create_auth_user NÃO existe';
    RETURN;
  END IF;
  
  RAISE NOTICE '🎯 Todas as funções RPC estão disponíveis!';
END $$;

-- 3. Teste de criação de usuário (SIMULA O WEBHOOK)
DO $$
DECLARE
  test_user_id UUID;
  existing_user RECORD;
BEGIN
  RAISE NOTICE '🧪 TESTE: Simulando webhook do Stripe...';
  
  -- Simular dados do Stripe
  DECLARE
    customer_email TEXT := 'teste-webhook@vmetrics.com.br';
    customer_name TEXT := 'Teste Webhook';
    stripe_customer_id TEXT := 'cus_test_webhook_123';
  BEGIN
    
    -- 1. Verificar se usuário já existe (como faz o webhook)
    SELECT * INTO existing_user FROM find_user_by_email(customer_email);
    
    IF existing_user.user_id IS NOT NULL THEN
      RAISE NOTICE '👤 Usuário já existe: %', existing_user.user_id;
      test_user_id := existing_user.user_id;
    ELSE
      RAISE NOTICE '👤 Usuário não existe, criando novo...';
      
      -- 2. Criar usuário (como faz o webhook)
      SELECT create_auth_user(customer_email, customer_name, stripe_customer_id) INTO test_user_id;
      
      RAISE NOTICE '✅ Usuário criado com ID: %', test_user_id;
    END IF;
    
    -- 3. Verificar se usuário foi criado corretamente
    SELECT * INTO existing_user FROM find_user_by_email(customer_email);
    
    IF existing_user.user_id IS NOT NULL THEN
      RAISE NOTICE '✅ Verificação: Usuário encontrado após criação';
      RAISE NOTICE '   - ID: %', existing_user.user_id;
      RAISE NOTICE '   - Email: %', existing_user.user_email;
      RAISE NOTICE '   - Nome: %', existing_user.full_name;
      RAISE NOTICE '   - Stripe ID: %', existing_user.stripe_customer_id;
    ELSE
      RAISE NOTICE '❌ ERRO: Usuário não foi encontrado após criação!';
    END IF;
    
  END;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO no teste: %', SQLERRM;
END $$;

-- 4. Teste de busca por stripe_customer_id
DO $$
DECLARE
  stripe_user RECORD;
BEGIN
  RAISE NOTICE '🔍 TESTE: Busca por stripe_customer_id...';
  
  SELECT * INTO stripe_user FROM find_user_by_stripe_id('cus_test_webhook_123');
  
  IF stripe_user.user_id IS NOT NULL THEN
    RAISE NOTICE '✅ Usuário encontrado por stripe_customer_id: %', stripe_user.user_id;
  ELSE
    RAISE NOTICE '❌ Usuário NÃO encontrado por stripe_customer_id';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO na busca por stripe_customer_id: %', SQLERRM;
END $$;

-- 5. Verificar se usuário aparece em Authentication > Users
SELECT 
  'Verificação final' as teste,
  id,
  email,
  raw_user_meta_data,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'teste-webhook@vmetrics.com.br';

-- 6. Teste de inserção na user_plans (simula resto do webhook)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  RAISE NOTICE '📋 TESTE: Criação de plano do usuário...';
  
  -- Buscar o usuário de teste
  SELECT user_id INTO test_user_id FROM find_user_by_email('teste-webhook@vmetrics.com.br');
  
  IF test_user_id IS NOT NULL THEN
    -- Inserir plano do usuário
    INSERT INTO user_plans (
      user_id,
      plan_type,
      stripe_subscription_id,
      stripe_customer_id,
      status,
      current_period_start,
      current_period_end
    ) VALUES (
      test_user_id,
      'monthly',
      'sub_test_webhook_123',
      'cus_test_webhook_123',
      'active',
      NOW(),
      NOW() + INTERVAL '30 days'
    )
    ON CONFLICT (stripe_subscription_id) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Plano do usuário criado/atualizado com sucesso';
  ELSE
    RAISE NOTICE '❌ Usuário não encontrado para criar plano';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO ao criar plano: %', SQLERRM;
END $$;

-- 7. Verificar resultado final
SELECT 
  'Resultado Final' as teste,
  up.user_id,
  u.email,
  up.plan_type,
  up.status,
  up.stripe_customer_id,
  up.stripe_subscription_id
FROM user_plans up
JOIN auth.users u ON u.id = up.user_id
WHERE u.email = 'teste-webhook@vmetrics.com.br';

-- 8. Limpeza (opcional - descomente se quiser limpar os dados de teste)
/*
DELETE FROM user_plans WHERE stripe_customer_id = 'cus_test_webhook_123';
DELETE FROM auth.users WHERE email = 'teste-webhook@vmetrics.com.br';
*/

RAISE NOTICE '🎉 TESTES CONCLUÍDOS! Verifique os resultados acima.';
RAISE NOTICE '📧 Se o usuário foi criado corretamente, ele deve aparecer em Authentication > Users';
RAISE NOTICE '📧 E deve receber email automaticamente via Supabase + Resend!';
