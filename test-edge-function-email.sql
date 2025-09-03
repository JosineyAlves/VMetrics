-- 🧪 TESTE DA EDGE FUNCTION CORRIGIDA
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- PASSO 1: TESTE SIMPLES DE EMAIL
-- ========================================

-- Enviar email de teste
SELECT public.send_email_message(
  jsonb_build_object(
    'sender', 'no-reply@vmetrics.com.br',
    'recipient', 'alvesjosiney@yahoo.com.br', -- ⚠️ SUBSTITUA AQUI
    'subject', '🧪 Teste Edge Function Corrigida',
    'html_body', '
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3cd48f 0%, #2bb673 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1>🎉 Teste Edge Function</h1>
              <p>Supabase + Resend funcionando!</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2>Olá!</h2>
              <p>Este é um teste da Edge Function corrigida para envio de emails via Resend API.</p>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>✅ Status da Integração:</h3>
                <ul>
                  <li>Supabase: Conectado</li>
                  <li>Resend API: Configurado</li>
                  <li>Edge Function: Corrigida</li>
                  <li>Email: Enviado via API</li>
                </ul>
              </div>
              
              <p>Se você recebeu este email, a integração está funcionando perfeitamente! 🚀</p>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
              <p>© 2025 VMetrics. Teste de integração.</p>
            </div>
          </div>
        </body>
      </html>
    ',
    'text_body', '
      🧪 Teste Edge Function Corrigida
      
      Olá!
      
      Este é um teste da Edge Function corrigida para envio de emails via Resend API.
      
      ✅ Status da Integração:
      - Supabase: Conectado
      - Resend API: Configurado
      - Edge Function: Corrigida
      - Email: Enviado via API
      
      Se você recebeu este email, a integração está funcionando perfeitamente! 🚀
      
      © 2025 VMetrics. Teste de integração.
    '
  )
) as resultado;

-- ========================================
-- PASSO 2: VERIFICAR EMAIL REGISTRADO
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
-- PASSO 3: CHAMAR EDGE FUNCTION PARA PROCESSAR
-- ========================================

-- IMPORTANTE: Execute este comando no terminal ou via API
-- curl -X POST "https://seu-projeto.supabase.co/functions/v1/process-emails-resend-fixed" \
--   -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json"

-- ========================================
-- PASSO 4: VERIFICAR RESULTADO APÓS PROCESSAMENTO
-- ========================================

-- Verificar se o email foi processado
SELECT 
  id,
  sender,
  recipient,
  subject,
  status,
  sent_at,
  provider_response,
  created_at
FROM messages 
WHERE recipient = 'alvesjosiney@yahoo.com.br' -- ⚠️ SUBSTITUA AQUI
ORDER BY created_at DESC
LIMIT 3;

-- ========================================
-- INSTRUÇÕES:
-- ========================================
-- 1. Execute este script no SQL Editor
-- 2. Verifique se o email foi registrado como 'pending'
-- 3. Execute a Edge Function corrigida via terminal ou API
-- 4. Verifique se o email chegou na sua caixa de entrada
-- 5. Verifique se o status mudou para 'sent'

