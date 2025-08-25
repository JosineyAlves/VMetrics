-- 🚀 Configuração do Stripe Wrapper para VMetrics
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
-- ========================================
CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;

-- ========================================
-- 2. CRIAR WRAPPER DO STRIPE
-- ========================================
CREATE FOREIGN DATA WRAPPER stripe_wrapper
  HANDLER stripe_fdw_handler
  VALIDATOR stripe_fdw_validator;

-- ========================================
-- 3. CRIAR SERVIDOR DO STRIPE
-- ========================================
-- IMPORTANTE: Chave secreta do Stripe configurada
CREATE SERVER stripe_server
  FOREIGN DATA WRAPPER stripe_wrapper
  OPTIONS (
    api_key 'sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj',
    api_url 'https://api.stripe.com/v1/',
    api_version '2024-06-20'
  );

-- ========================================
-- 4. CRIAR SCHEMA PARA TABELAS DO STRIPE
-- ========================================
CREATE SCHEMA IF NOT EXISTS stripe;

-- ========================================
-- 5. IMPORTAR TODAS AS TABELAS DO STRIPE
-- ========================================
IMPORT FOREIGN SCHEMA stripe 
  FROM SERVER stripe_server 
  INTO stripe;

-- ========================================
-- 6. CRIAR VIEWS CONSOLIDADAS PARA VMETRICS
-- ========================================

-- View para dados consolidados de assinaturas
CREATE OR REPLACE VIEW vmetrics_subscriptions AS
SELECT 
  s.id as subscription_id,
  s.customer as customer_id,
  s.attrs->>'status' as subscription_status,
  (s.attrs->>'current_period_start')::bigint as current_period_start_ts,
  (s.attrs->>'current_period_end')::bigint as current_period_end_ts,
  to_timestamp((s.attrs->>'current_period_start')::bigint) as current_period_start,
  to_timestamp((s.attrs->>'current_period_end')::bigint) as current_period_end,
  s.attrs->>'currency' as currency,
  to_timestamp((s.attrs->>'created')::bigint) as created_at,
  c.attrs->>'email' as customer_email,
  c.attrs->>'name' as customer_name,
  p.attrs->>'name' as product_name,
  pr.attrs->>'unit_amount' as price_amount,
  pr.attrs->>'currency' as price_currency,
  pr.attrs->'recurring'->>'interval' as billing_interval
FROM stripe.subscriptions s
JOIN stripe.customers c ON s.customer = c.id
JOIN stripe.products p ON (s.attrs->'items'->0->'price'->>'product')::text = p.id
JOIN stripe.prices pr ON (s.attrs->'items'->0->'price'->>'id')::text = pr.id
WHERE s.attrs->>'status' IN ('active', 'trialing', 'past_due');

-- View para dados de checkout completados
CREATE OR REPLACE VIEW vmetrics_checkouts AS
SELECT 
  cs.id as session_id,
  cs.customer as customer_id,
  cs.subscription as subscription_id,
  cs.attrs->>'payment_status' as payment_status,
  to_timestamp((cs.attrs->>'created')::bigint) as created_at,
  c.attrs->>'email' as customer_email,
  c.attrs->>'name' as customer_name
FROM stripe.checkout_sessions cs
JOIN stripe.customers c ON cs.customer = c.id
WHERE cs.attrs->>'payment_status' = 'paid';

-- View para faturas pagas
CREATE OR REPLACE VIEW vmetrics_invoices AS
SELECT 
  i.id as invoice_id,
  i.customer as customer_id,
  i.subscription as subscription_id,
  i.attrs->>'status' as invoice_status,
  i.attrs->>'total' as amount,
  i.attrs->>'currency' as currency,
  to_timestamp((i.attrs->>'period_start')::bigint) as period_start,
  to_timestamp((i.attrs->>'period_end')::bigint) as period_end,
  to_timestamp((i.attrs->>'created')::bigint) as created_at,
  c.attrs->>'email' as customer_email
FROM stripe.invoices i
JOIN stripe.customers c ON i.customer = c.id
WHERE i.attrs->>'status' = 'paid';

-- ========================================
-- 7. FUNÇÕES PARA SINCRONIZAÇÃO AUTOMÁTICA
-- ========================================

-- Função para sincronizar usuário após checkout
CREATE OR REPLACE FUNCTION sync_user_after_checkout()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
  plan_type TEXT;
BEGIN
  -- Verificar se é um checkout de assinatura
  IF NEW.subscription IS NOT NULL THEN
    
    -- Determinar tipo de plano baseado no produto
    SELECT 
      CASE 
        WHEN p.attrs->>'name' ILIKE '%starter%' THEN 'starter'
        WHEN p.attrs->>'name' ILIKE '%pro%' THEN 'pro'
        WHEN p.attrs->>'name' ILIKE '%enterprise%' THEN 'enterprise'
        ELSE 'starter'
      END INTO plan_type
    FROM stripe.subscriptions s
    JOIN stripe.products p ON (s.attrs->'items'->0->'price'->>'product')::text = p.id
    WHERE s.id = NEW.subscription;
    
    -- Buscar ou criar usuário
    SELECT id INTO user_id 
    FROM public.users 
    WHERE stripe_customer_id = NEW.customer;
    
    IF user_id IS NULL THEN
      -- Criar novo usuário
      INSERT INTO public.users (email, full_name, stripe_customer_id, is_active)
      SELECT 
        c.attrs->>'email',
        COALESCE(c.attrs->>'name', 'Usuário VMetrics'),
        NEW.customer,
        true
      FROM stripe.customers c
      WHERE c.id = NEW.customer
      RETURNING id INTO user_id;
      
      -- Enviar email de boas-vindas (implementar depois)
      RAISE NOTICE 'Novo usuário criado: %', user_id;
    END IF;
    
    -- Criar ou atualizar plano do usuário
    INSERT INTO public.user_plans (
      user_id, 
      plan_type, 
      stripe_subscription_id, 
      stripe_customer_id, 
      status, 
      current_period_start, 
      current_period_end
    )
    SELECT 
      user_id,
      plan_type,
      NEW.subscription,
      NEW.customer,
      'active',
      to_timestamp((s.attrs->>'current_period_start')::bigint),
      to_timestamp((s.attrs->>'current_period_end')::bigint)
    FROM stripe.subscriptions s
    WHERE s.id = NEW.subscription
    ON CONFLICT (stripe_subscription_id) 
    DO UPDATE SET
      plan_type = EXCLUDED.plan_type,
      status = EXCLUDED.status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = NOW();
      
    RAISE NOTICE 'Plano sincronizado para usuário: %', user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. TRIGGERS PARA SINCRONIZAÇÃO AUTOMÁTICA
-- ========================================

-- Trigger para sincronizar após checkout
CREATE TRIGGER trigger_sync_after_checkout
  AFTER INSERT ON stripe.checkout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_after_checkout();

-- ========================================
-- 9. FUNÇÕES UTILITÁRIAS
-- ========================================

-- Função para buscar dados de assinatura do usuário
CREATE OR REPLACE FUNCTION get_user_subscription(user_email TEXT)
RETURNS TABLE (
  subscription_id TEXT,
  plan_type TEXT,
  status TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  product_name TEXT,
  price_amount BIGINT,
  currency TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    CASE 
      WHEN p.attrs->>'name' ILIKE '%starter%' THEN 'starter'
      WHEN p.attrs->>'name' ILIKE '%pro%' THEN 'pro'
      WHEN p.attrs->>'name' ILIKE '%enterprise%' THEN 'enterprise'
      ELSE 'starter'
    END as plan_type,
    s.attrs->>'status' as status,
    to_timestamp((s.attrs->>'current_period_start')::bigint) as current_period_start,
    to_timestamp((s.attrs->>'current_period_end')::bigint) as current_period_end,
    p.attrs->>'name' as product_name,
    (pr.attrs->>'unit_amount')::bigint as price_amount,
    pr.attrs->>'currency' as currency
  FROM stripe.subscriptions s
  JOIN stripe.customers c ON s.customer = c.id
  JOIN stripe.products p ON (s.attrs->'items'->0->'price'->>'product')::text = p.id
  JOIN stripe.prices pr ON (s.attrs->'items'->0->'price'->>'id')::text = pr.id
  WHERE c.attrs->>'email' = user_email
    AND s.attrs->>'status' IN ('active', 'trialing');
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 10. VERIFICAÇÃO DA CONFIGURAÇÃO
-- ========================================

-- Verificar se as tabelas foram criadas
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'stripe'
ORDER BY tablename;

-- Verificar se as views foram criadas
SELECT 
  schemaname,
  viewname
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname LIKE 'vmetrics_%'
ORDER BY viewname;

-- Verificar se as funções foram criadas
SELECT 
  proname
FROM pg_proc 
WHERE proname IN ('sync_user_after_checkout', 'get_user_subscription');

-- ========================================
-- 11. EXEMPLOS DE USO
-- ========================================

-- Exemplo: Buscar todas as assinaturas ativas
-- SELECT * FROM vmetrics_subscriptions;

-- Exemplo: Buscar checkout de um usuário específico
-- SELECT * FROM vmetrics_checkouts WHERE customer_email = 'user@example.com';

-- Exemplo: Buscar assinatura de um usuário
-- SELECT * FROM get_user_subscription('user@example.com');

-- ========================================
-- 12. NOTAS IMPORTANTES
-- ========================================

/*
⚠️ IMPORTANTE:
1. Execute este script no SQL Editor do Supabase
2. Verifique se todas as tabelas foram criadas corretamente
3. Teste as funções antes de usar em produção

🔧 CONFIGURAÇÃO ADICIONAL:
- Configure webhooks no Stripe para: checkout.session.completed, customer.subscription.*
- URL do webhook: https://your-project.supabase.co/functions/v1/stripe-webhook
- Ou use o endpoint local: http://localhost:3001/api/webhooks/stripe

📊 MONITORAMENTO:
- Use as views vmetrics_* para relatórios
- Monitore os logs do Supabase para erros de sincronização
- Configure alertas para falhas na sincronização

🚀 PRÓXIMOS PASSOS:
1. Execute este script no Supabase
2. Configure webhooks no Stripe
3. Teste a integração com o componente StripeWrapperTest
4. Implemente o fluxo completo de checkout
*/
