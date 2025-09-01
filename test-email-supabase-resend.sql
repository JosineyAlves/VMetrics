-- 🧪 TESTE DE EMAIL VIA SUPABASE + RESEND
-- Execute este script no SQL Editor do Supabase para testar a integração

-- ========================================
-- PASSO 1: VERIFICAR SE AS TABELAS EXISTEM
-- ========================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('messages', 'signup_tokens', 'users')
ORDER BY table_name;

-- ========================================
-- PASSO 2: VERIFICAR SE A FUNÇÃO EXISTE
-- ========================================
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'send_email_message';

-- ========================================
-- PASSO 3: TESTE DE ENVIO DE EMAIL
-- ========================================
-- IMPORTANTE: Substitua 'seu-email@exemplo.com' pelo seu email real
SELECT public.send_email_message(
  jsonb_build_object(
    'sender', 'no-reply@vmetrics.com.br',
    'recipient', 'seu-email@exemplo.com', -- ⚠️ SUBSTITUA AQUI
    'subject', '🧪 Teste de Integração Supabase + Resend',
    'html_body', '
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3cd48f 0%, #2bb673 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1>🎉 Teste de Integração</h1>
              <p>Supabase + Resend funcionando!</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2>Olá!</h2>
              <p>Este é um email de teste para verificar se a integração entre Supabase e Resend está funcionando corretamente.</p>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>✅ Status da Integração:</h3>
                <ul>
                  <li>Supabase: Conectado</li>
                  <li>Resend SMTP: Configurado</li>
                  <li>Função SQL: Executada</li>
                  <li>Email: Enviado</li>
                </ul>
              </div>
              
              <p><strong>Próximos passos:</strong></p>
              <ol>
                <li>Verificar se este email chegou</li>
                <li>Configurar templates do Resend</li>
                <li>Integrar com webhook do Stripe</li>
                <li>Testar fluxo completo de boas-vindas</li>
              </ol>
              
              <p>Se você recebeu este email, a integração está funcionando! 🚀</p>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
              <p>© 2025 VMetrics. Teste de integração.</p>
            </div>
          </div>
        </body>
      </html>
    ',
    'text_body', '
      🧪 Teste de Integração Supabase + Resend
      
      Olá!
      
      Este é um email de teste para verificar se a integração entre Supabase e Resend está funcionando corretamente.
      
      ✅ Status da Integração:
      - Supabase: Conectado
      - Resend SMTP: Configurado
      - Função SQL: Executada
      - Email: Enviado
      
      Próximos passos:
      1. Verificar se este email chegou
      2. Configurar templates do Resend
      3. Integrar com webhook do Stripe
      4. Testar fluxo completo de boas-vindas
      
      Se você recebeu este email, a integração está funcionando! 🚀
      
      © 2025 VMetrics. Teste de integração.
    '
  )
) as resultado;

-- ========================================
-- PASSO 4: VERIFICAR SE O EMAIL FOI REGISTRADO
-- ========================================
SELECT 
  id,
  sender,
  recipient,
  subject,
  status,
  created_at
FROM messages 
WHERE subject LIKE '%Teste de Integração%'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- PASSO 5: VERIFICAR LOGS DE EMAIL (se existir)
-- ========================================
SELECT 
  id,
  status,
  provider_response,
  sent_at,
  created_at
FROM messages 
WHERE recipient = 'seu-email@exemplo.com' -- ⚠️ SUBSTITUA AQUI
ORDER BY created_at DESC
LIMIT 3;

-- ========================================
-- INSTRUÇÕES:
-- ========================================
-- 1. Substitua 'seu-email@exemplo.com' pelo seu email real em duas linhas
-- 2. Execute este script no SQL Editor do Supabase
-- 3. Verifique se o email chegou na sua caixa de entrada
-- 4. Verifique se o registro foi criado na tabela 'messages'
-- 5. Se funcionou, podemos prosseguir para o próximo passo
