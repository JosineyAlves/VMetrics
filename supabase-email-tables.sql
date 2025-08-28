-- 🚀 TABELAS FALTANTES PARA INTEGRAÇÃO MAILERSEND
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- TABELA PRIVATE.KEYS (Para API tokens)
-- ========================================
-- Criar schema private se não existir
CREATE SCHEMA IF NOT EXISTS private;

-- Tabela para armazenar chaves privadas (API tokens)
CREATE TABLE IF NOT EXISTS private.keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_private_keys_key ON private.keys(key);

-- ========================================
-- TABELA MESSAGES (Para tracking de emails)
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  html_body TEXT,
  text_body TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  provider_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ========================================
-- TABELA SIGNUP_TOKENS (Para tokens de cadastro)
-- ========================================
CREATE TABLE IF NOT EXISTS signup_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_signup_tokens_token ON signup_tokens(token);
CREATE INDEX IF NOT EXISTS idx_signup_tokens_email ON signup_tokens(email);
CREATE INDEX IF NOT EXISTS idx_signup_tokens_user_id ON signup_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_signup_tokens_expires_at ON signup_tokens(expires_at);

-- ========================================
-- FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ========================================
-- Habilitar RLS nas novas tabelas
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.keys ENABLE ROW LEVEL SECURITY;

-- Política para messages (apenas admin pode ver)
CREATE POLICY "Only admins can view messages" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para signup_tokens (apenas admin pode ver)
CREATE POLICY "Only admins can view signup_tokens" ON signup_tokens
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para private.keys (apenas admin pode ver)
CREATE POLICY "Only admins can view private keys" ON private.keys
  FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- INSERIR API TOKEN DO MAILERSEND
-- ========================================
-- IMPORTANTE: Substitua 'SEU_TOKEN_AQUI' pelo token real do MailerSend
INSERT INTO private.keys (key, value) 
VALUES ('MAILERSEND_API_TOKEN', 'SEU_TOKEN_AQUI')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value;

-- ========================================
-- VERIFICAÇÃO
-- ========================================
-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema IN ('public', 'private') 
  AND table_name IN ('messages', 'signup_tokens', 'keys')
ORDER BY table_schema, table_name;

-- Verificar se o token foi inserido
SELECT 
  key,
  CASE 
    WHEN LENGTH(value) > 10 THEN CONCAT(LEFT(value, 10), '...')
    ELSE value
  END as value_preview
FROM private.keys 
WHERE key = 'MAILERSEND_API_TOKEN';

-- Verificar índices criados
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE schemaname IN ('public', 'private')
  AND tablename IN ('messages', 'signup_tokens', 'keys')
ORDER BY schemaname, tablename, indexname;
