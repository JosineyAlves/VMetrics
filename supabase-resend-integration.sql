-- 🚀 INTEGRAÇÃO SUPABASE + RESEND
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- REMOVER FUNÇÃO ANTIGA (MAILERSEND)
-- ========================================
DROP FUNCTION IF EXISTS public.send_email_message(jsonb);

-- ========================================
-- FUNÇÃO PARA ENVIO DE EMAILS VIA RESEND
-- ========================================
CREATE OR REPLACE FUNCTION public.send_email_message(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id UUID;
  template_id TEXT;
  variables JSONB;
  recipient_email TEXT;
  sender_email TEXT;
  subject_text TEXT;
  html_body TEXT;
  text_body TEXT;
BEGIN
  -- Extrair dados do payload
  sender_email := payload->>'sender';
  recipient_email := payload->>'recipient';
  subject_text := payload->>'subject';
  template_id := payload->>'template_id';
  variables := payload->'variables';
  html_body := payload->>'html_body';
  text_body := payload->>'text_body';
  
  -- Validar campos obrigatórios
  IF recipient_email IS NULL OR sender_email IS NULL OR subject_text IS NULL THEN
    RAISE EXCEPTION 'Campos obrigatórios: sender, recipient, subject';
  END IF;
  
  -- Inserir na tabela messages com status 'pending'
  INSERT INTO messages (
    sender,
    recipient,
    subject,
    html_body,
    text_body,
    status,
    provider_response
  ) VALUES (
    sender_email,
    recipient_email,
    subject_text,
    COALESCE(html_body, 'Resend Email Template'),
    COALESCE(text_body, 'Resend Email Template'),
    'pending',
    jsonb_build_object(
      'method', 'resend_smtp',
      'template_id', template_id,
      'variables', variables,
      'status', 'queued_for_sending',
      'provider', 'resend',
      'smtp_host', 'smtp.resend.com',
      'smtp_port', 465
    )
  ) RETURNING id INTO message_id;
  
  -- Retornar sucesso (o email será processado por Edge Function)
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email registrado para envio via Resend',
    'message_id', message_id,
    'template_id', template_id,
    'recipient', recipient_email,
    'status', 'queued',
    'provider', 'resend'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE,
      'payload', payload
    );
END;
$$;

-- ========================================
-- VERIFICAÇÃO DA FUNÇÃO
-- ========================================
-- Verificar se a função foi criada
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'send_email_message'
  AND routine_schema = 'public';

-- ========================================
-- PERMISSÕES
-- ========================================
-- Garantir que a função pode ser executada
GRANT EXECUTE ON FUNCTION public.send_email_message(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_email_message(JSONB) TO service_role;

-- ========================================
-- TESTE DA FUNÇÃO
-- ========================================
-- Testar a função com dados de exemplo
SELECT public.send_email_message('{
  "sender": "no-reply@vmetrics.com.br",
  "recipient": "teste@exemplo.com",
  "subject": "Teste de Email via Resend",
  "template_id": "welcome_template",
  "variables": {
    "user_name": "Usuário Teste",
    "signup_url": "https://exemplo.com/signup",
    "company_name": "VMetrics"
  }
}'::jsonb);
