-- Criar tabela para armazenar API Keys dos usuários
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  redtrack_api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só podem ver/editar suas próprias API Keys
CREATE POLICY "Users can manage their own API keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_api_keys_updated_at 
  BEFORE UPDATE ON user_api_keys 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para inserir ou atualizar API Key
CREATE OR REPLACE FUNCTION upsert_user_api_key(
  p_user_id UUID,
  p_redtrack_api_key TEXT
)
RETURNS UUID AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO user_api_keys (user_id, redtrack_api_key)
  VALUES (p_user_id, p_redtrack_api_key)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    redtrack_api_key = EXCLUDED.redtrack_api_key,
    updated_at = NOW()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar API Key do usuário
CREATE OR REPLACE FUNCTION get_user_api_key(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  result_key TEXT;
BEGIN
  SELECT redtrack_api_key INTO result_key
  FROM user_api_keys
  WHERE user_id = p_user_id;
  
  RETURN result_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
