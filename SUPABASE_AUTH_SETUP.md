# 🔐 Configuração de Autenticação com Supabase

## 📋 Pré-requisitos

1. **Projeto Supabase criado** em [supabase.com](https://supabase.com)
2. **Dependência instalada**: `@supabase/supabase-js` ✅

## ⚙️ Configuração

### **1. Obter Credenciais do Supabase**

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** → **API**
3. Copie:
   - **Project URL** (ex: `https://xyz.supabase.co`)
   - **anon public** key

### **2. Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Outras configurações já existentes...
```

### **3. Configurar Banco de Dados**

Execute o SQL no **SQL Editor** do Supabase:

```sql
-- Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  api_key TEXT,
  plan_type VARCHAR(50) DEFAULT 'starter',
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### **4. Configurar Autenticação**

1. **Settings** → **Auth** → **Providers**
2. **Email** → Habilitar
3. **Confirm email** → Desabilitar (para desenvolvimento)
4. **Settings** → **Auth** → **URL Configuration**
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: `http://localhost:5173/**`

## 🧪 Teste

### **1. Criar Usuário de Teste**

```sql
-- Inserir usuário de teste
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'teste@vmetrics.com.br',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

### **2. Testar Login**

1. **Iniciar servidor**: `npm run dev:full`
2. **Acessar**: `http://localhost:5173`
3. **Fazer login** com as credenciais de teste
4. **Verificar console** para logs de autenticação

## 🔍 Troubleshooting

### **Erro: "Configuração do Supabase não encontrada"**

- Verifique se `.env.local` existe
- Verifique se variáveis estão corretas
- Reinicie o servidor após alterações

### **Erro: "Invalid login credentials"**

- Verifique se usuário existe no Supabase
- Verifique se senha está correta
- Verifique se autenticação está habilitada

### **Erro: "Table 'users' does not exist"**

- Execute o SQL de criação das tabelas
- Verifique se RLS está configurado corretamente

## 🚀 Próximos Passos

1. **✅ Configurar credenciais** do Supabase
2. **✅ Executar SQL** de criação das tabelas
3. **✅ Testar login** com usuário real
4. **✅ Configurar webhook** para criação automática de usuários
5. **✅ Implementar emails** automáticos

## 📚 Recursos

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Schema](https://supabase.com/docs/guides/database/schema)
