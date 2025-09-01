-- 🧪 TESTE SIMPLES DE EMAIL VIA SUPABASE + RESEND
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- PASSO 1: VERIFICAR CONFIGURAÇÕES
-- ========================================

-- Verificar se a função existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'send_email_message';

-- Verificar emails pendentes
SELECT 
  COUNT(*) as total_pending,
  MIN(created_at) as oldest_pending
FROM messages 
WHERE status = 'pending';

-- ========================================
-- PASSO 2: TESTE SIMPLES DE EMAIL
-- ========================================

-- IMPORTANTE: Substitua 'seu-email@exemplo.com' pelo seu email real
-- Exemplo: 'alvesjosiney@yahoo.com.br'

SELECT public.send_email_message(
  jsonb_build_object(
    'sender', 'no-reply@vmetrics.com.br',
    'recipient', 'alvesjosiney@yahoo.com.br', -- ⚠️ SUBSTITUA AQUI
    'subject', '🧪 Teste Simples - Supabase + Resend',
    'html_body', '<h1>Teste Simples</h1><p>Se você recebeu este email, está funcionando!</p>',
    'text_body', 'Teste Simples - Se você recebeu este email, está funcionando!'
  )
) as resultado;

-- ========================================
-- PASSO 3: VERIFICAR RESULTADO
-- ========================================

-- Verificar se o email foi registrado
SELECT 
  id,
  sender,
  recipient,
  subject,
  status,
  created_at
FROM messages 
WHERE recipient = 'alvesjosiney@yahoo.com.br' -- ⚠️ SUBSTITUA AQUI
ORDER BY created_at DESC
LIMIT 3;

-- ========================================
-- PASSO 4: PROCESSAR EMAILS PENDENTES (se necessário)
-- ========================================

-- Se o email ficar como 'pending', execute esta função para processar
-- SELECT public.process_pending_emails() as processamento;

-- ========================================
-- INSTRUÇÕES:
-- ========================================
-- 1. Substitua 'alvesjosiney@yahoo.com.br' pelo seu email real
-- 2. Execute o script completo
-- 3. Verifique se retornou "success": true
-- 4. Verifique se o email chegou na sua caixa de entrada
-- 5. Se ficar como 'pending', execute a função process_pending_emails()
