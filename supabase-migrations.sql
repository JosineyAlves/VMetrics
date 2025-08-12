-- 🚀 Migrações do Supabase para VMetrics
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- TABELA DE USUÁRIOS
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_customer_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ========================================
-- TABELA DE PLANOS/ASSINATURAS
-- ========================================
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('starter', 'pro', 'enterprise')),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_stripe_subscription_id ON user_plans(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_status ON user_plans(status);
CREATE INDEX IF NOT EXISTS idx_user_plans_plan_type ON user_plans(plan_type);

-- ========================================
-- TABELA DE FATURAS
-- ========================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  amount INTEGER NOT NULL CHECK (amount > 0), -- em centavos
  currency VARCHAR(3) DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
  status VARCHAR(50) CHECK (status IN ('paid', 'open', 'void', 'uncollectible')),
  invoice_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- ========================================
-- TABELA DE LOGS DE WEBHOOK
-- ========================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id VARCHAR(255) UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255),
  customer_id VARCHAR(255),
  subscription_id VARCHAR(255),
  plan_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'processed' CHECK (status IN ('processed', 'failed', 'pending')),
  raw_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_customer_email ON webhook_logs(customer_email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- ========================================
-- FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_plans_updated_at 
  BEFORE UPDATE ON user_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para usuários (cada usuário só vê seus próprios dados)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Política para planos (usuários só veem seus próprios planos)
CREATE POLICY "Users can view own plans" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Política para faturas (usuários só veem suas próprias faturas)
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Política para webhook logs (apenas admin pode ver)
CREATE POLICY "Only admins can view webhook logs" ON webhook_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- DADOS INICIAIS (OPCIONAL)
-- ========================================

-- Inserir usuário de teste (opcional)
-- INSERT INTO users (email, full_name, is_active) 
-- VALUES ('admin@vmetrics.com.br', 'Administrador VMetrics', true);

-- ========================================
-- VERIFICAÇÃO
-- ========================================

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_plans', 'invoices', 'webhook_logs')
ORDER BY table_name;

-- Verificar índices criados
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'user_plans', 'invoices', 'webhook_logs')
ORDER BY tablename, indexname;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
