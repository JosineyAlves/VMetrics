-- 🚀 INTEGRAÇÃO SUPABASE + RESEND
-- Execute este script no SQL Editor do Supabase

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
  recipient_email TEXT;
  sender_email TEXT;
  subject_text TEXT;
  html_body TEXT;
  text_body TEXT;
BEGIN
  -- Extrair dados do payload
  sender_email := payload->>
'
"
'sender'
"
'
;
  recipient_email := payload->>
'
"
'recipient'
"
'
;
  subject_text := payload->>
'
"
'subject'
"
'
;
  html_body := payload->>
'
"
'html_body'
"
'
;
  text_body := payload->>
'
"
'text_body'
"
'
;

  -- Validar campos obrigatórios
  IF recipient_email IS NULL OR sender_email IS NULL OR subject_text IS NULL THEN
    RAISE EXCEPTION 
'
Campos obrigatórios: sender, recipient, subject
'
;
  END IF;

  -- Inserir na tabela messages com status 
'
pending
'

  INSERT INTO messages (
    sender,
    recipient,
    subject,
    html_body,
    text_body,
    status
  ) VALUES (
    sender_email,
    recipient_email,
    subject_text,
    COALESCE(html_body, 
'
Resend Email Template
'
),
    COALESCE(text_body, 
'
Resend Email Template
'
),
    
'
pending
'

  ) RETURNING id INTO message_id;

  -- Retornar sucesso
  RETURN jsonb_build_object(
    
'
success
'
, true,
    
'
message
'
, 
'
Email registrado para envio via Resend
'
,
    
'
message_id
'
, message_id,
    
'
recipient
'
, recipient_email,
    
'
status
'
, 
'
queued
'

  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      
'
success
'
, false,
      
'
error
'
, SQLERRM,
      
'
detail
'
, SQLSTATE
    );
END;
$$;
