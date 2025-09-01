-- 🔍 VERIFICAÇÃO DA INTEGRAÇÃO RESEND SMTP
-- Execute este script para verificar se a integração SMTP está configurada

-- ========================================
-- VERIFICAR CONFIGURAÇÕES SMTP DO RESEND
-- ========================================

-- 1. Verificar se a função send_email_message existe e está funcionando
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'send_email_message';

-- 2. Verificar se a tabela messages existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- 3. Verificar se há emails na tabela messages
SELECT 
  COUNT(*) as total_emails,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_emails,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_emails,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_emails
FROM messages;

-- 4. Verificar últimos emails enviados
SELECT 
  id,
  sender,
  recipient,
  subject,
  status,
  created_at,
  sent_at,
  provider_response
FROM messages 
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- TESTE SIMPLES DE FUNÇÃO
-- ========================================

-- Teste básico da função (sem enviar email real)
SELECT public.send_email_message(
  jsonb_build_object(
    'sender', 'test@vmetrics.com.br',
    'recipient', 'test@example.com',
    'subject', 'Teste de Função',
    'html_body', '<p>Teste</p>',
    'text_body', 'Teste'
  )
) as resultado_teste;

-- ========================================
-- VERIFICAR CONFIGURAÇÕES DO SUPABASE
-- ========================================

-- Verificar se há configurações de email no Supabase
SELECT 
  name,
  value
FROM pg_settings 
WHERE name LIKE '%smtp%' 
   OR name LIKE '%email%'
   OR name LIKE '%resend%';

-- ========================================
-- INSTRUÇÕES PARA PRÓXIMOS PASSOS:
-- ========================================
-- 
-- Se a função retornar sucesso mas o email não for enviado:
-- 1. Verificar se as configurações SMTP estão corretas no Supabase
-- 2. Verificar se o domínio 'vmetrics.com.br' está verificado no Resend
-- 3. Verificar se há logs de erro no Supabase
-- 
-- Se a função retornar erro:
-- 1. Verificar se a tabela 'messages' existe
-- 2. Verificar se há permissões adequadas
-- 3. Verificar se a função está corretamente definida
