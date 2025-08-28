-- 🚀 FUNÇÃO SQL SIMPLIFICADA PARA EMAILS
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- FUNÇÃO SIMPLIFICADA PARA ENVIO DE EMAILS
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
BEGIN
  -- Extrair dados do payload
  template_id := payload->>'template_id';
  variables := payload->'variables';
  
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
    payload->>'sender',
    payload->>'recipient',
    payload->>'subject',
    COALESCE(payload->>'html_body', 'MailerSend Template ' || template_id),
    COALESCE(payload->>'text_body', 'MailerSend Template ' || template_id),
    'pending',
    jsonb_build_object(
      'method', 'mailersend_template',
      'template_id', template_id,
      'variables', variables,
      'status', 'queued_for_sending'
    )
  ) RETURNING id INTO message_id;
  
  -- Retornar sucesso (o email será processado por um job separado)
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email registrado para envio',
    'message_id', message_id,
    'template_id', template_id,
    'recipient', payload->>'recipient',
    'status', 'queued'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e retornar erro
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
  "sender": "suporte@vmetrics.com.br",
  "recipient": "teste@exemplo.com",
  "subject": "Teste de Email",
  "template_id": "zr6ke4njwrmgon12",
  "variables": {
    "user_name": "Usuário Teste",
    "signup_url": "https://exemplo.com/signup",
    "company_name": "VMetrics"
  }
}'::jsonb);
