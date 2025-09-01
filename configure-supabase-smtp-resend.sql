-- 🚀 CONFIGURAÇÃO SMTP SUPABASE + RESEND
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- VERIFICAR CONFIGURAÇÕES ATUAIS
-- ========================================

-- 1. Verificar se há configurações SMTP existentes
SELECT 
  name,
  value
FROM pg_settings 
WHERE name LIKE '%smtp%' 
   OR name LIKE '%email%'
   OR name LIKE '%resend%';

-- 2. Verificar emails pendentes
SELECT 
  COUNT(*) as total_pending,
  MIN(created_at) as oldest_pending,
  MAX(created_at) as newest_pending
FROM messages 
WHERE status = 'pending';

-- ========================================
-- CONFIGURAR SMTP DO SUPABASE
-- ========================================

-- IMPORTANTE: As configurações SMTP do Supabase devem ser feitas via Dashboard
-- Este script apenas verifica e prepara o ambiente

-- 1. Verificar se a extensão pg_sendmail está disponível
SELECT 
  extname,
  extversion
FROM pg_extension 
WHERE extname = 'pg_sendmail';

-- 2. Se não estiver disponível, tentar instalar
-- CREATE EXTENSION IF NOT EXISTS pg_sendmail;

-- ========================================
-- FUNÇÃO MELHORADA PARA ENVIO DE EMAIL
-- ========================================

-- Função que usa pg_sendmail (se disponível) ou registra para processamento
CREATE OR REPLACE FUNCTION public.send_email_via_smtp(
  p_sender TEXT,
  p_recipient TEXT,
  p_subject TEXT,
  p_html_body TEXT DEFAULT NULL,
  p_text_body TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id UUID;
  result JSONB;
BEGIN
  -- Inserir na tabela messages
  INSERT INTO messages (
    sender,
    recipient,
    subject,
    html_body,
    text_body,
    status
  ) VALUES (
    p_sender,
    p_recipient,
    p_subject,
    p_html_body,
    p_text_body,
    'pending'
  ) RETURNING id INTO message_id;

  -- Tentar enviar via pg_sendmail se disponível
  BEGIN
    -- Esta parte só funcionará se pg_sendmail estiver configurado
    -- e as configurações SMTP estiverem corretas no Supabase
    
    PERFORM pg_sendmail(
      p_recipient,
      p_subject,
      COALESCE(p_text_body, 'Email enviado via VMetrics'),
      p_sender
    );
    
    -- Se chegou aqui, o email foi enviado
    UPDATE messages 
    SET 
      status = 'sent',
      sent_at = NOW(),
      provider_response = jsonb_build_object(
        'method', 'pg_sendmail',
        'sent_at', NOW()
      )
    WHERE id = message_id;
    
    result := jsonb_build_object(
      'success', true,
      'message', 'Email enviado via SMTP',
      'message_id', message_id,
      'method', 'pg_sendmail'
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Se pg_sendmail falhar, manter como pending para processamento posterior
    result := jsonb_build_object(
      'success', true,
      'message', 'Email registrado para processamento SMTP',
      'message_id', message_id,
      'method', 'queued',
      'error', SQLERRM
    );
  END;

  RETURN result;
END;
$$;

-- ========================================
-- FUNÇÃO PARA PROCESSAR EMAILS PENDENTES
-- ========================================

-- Esta função deve ser chamada periodicamente para processar emails pendentes
CREATE OR REPLACE FUNCTION public.process_pending_emails()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_record RECORD;
  processed_count INTEGER := 0;
  failed_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Processar emails pendentes
  FOR email_record IN 
    SELECT id, sender, recipient, subject, html_body, text_body
    FROM messages 
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT 10
  LOOP
    BEGIN
      -- Tentar enviar via pg_sendmail
      PERFORM pg_sendmail(
        email_record.recipient,
        email_record.subject,
        COALESCE(email_record.text_body, 'Email enviado via VMetrics'),
        email_record.sender
      );
      
      -- Marcar como enviado
      UPDATE messages 
      SET 
        status = 'sent',
        sent_at = NOW(),
        provider_response = jsonb_build_object(
          'method', 'pg_sendmail',
          'sent_at', NOW()
        )
      WHERE id = email_record.id;
      
      processed_count := processed_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Marcar como falhou
      UPDATE messages 
      SET 
        status = 'failed',
        provider_response = jsonb_build_object(
          'error', SQLERRM,
          'failed_at', NOW()
        )
      WHERE id = email_record.id;
      
      failed_count := failed_count + 1;
    END;
  END LOOP;

  result := jsonb_build_object(
    'success', true,
    'processed', processed_count,
    'failed', failed_count,
    'total_processed', processed_count + failed_count
  );

  RETURN result;
END;
$$;

-- ========================================
-- TESTE DA NOVA FUNÇÃO
-- ========================================

-- Teste da função melhorada
SELECT public.send_email_via_smtp(
  'no-reply@vmetrics.com.br',
  'seu-email@exemplo.com', -- ⚠️ SUBSTITUA AQUI
  '🧪 Teste SMTP Configurado',
  '<h1>Teste SMTP</h1><p>Se você recebeu este email, o SMTP está funcionando!</p>',
  'Teste SMTP - Se você recebeu este email, o SMTP está funcionando!'
) as resultado_teste;

-- ========================================
-- INSTRUÇÕES IMPORTANTES:
-- ========================================
-- 
-- 1. CONFIGURAR SMTP NO DASHBOARD DO SUPABASE:
--    - Vá para Project Settings > Authentication > SMTP
--    - Habilite "Enable Custom SMTP"
--    - Configure:
--      * Sender email: no-reply@vmetrics.com.br
--      * Sender name: VMetrics
--      * Host: smtp.resend.com
--      * Port: 465
--      * Username: resend
--      * Password: SUA_API_KEY_DO_RESEND
-- 
-- 2. VERIFICAR DOMÍNIO NO RESEND:
--    - Certifique-se de que vmetrics.com.br está verificado
-- 
-- 3. TESTAR NOVAMENTE:
--    - Execute este script
--    - Verifique se o email chegou
-- 
-- 4. SE AINDA NÃO FUNCIONAR:
--    - Verificar logs do Supabase
--    - Verificar se pg_sendmail está disponível
--    - Considerar usar Edge Functions para envio
