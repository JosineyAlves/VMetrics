# 🚀 Configuração do Supabase para VMetrics

Este documento contém instruções detalhadas para configurar o Supabase como banco de dados para o projeto VMetrics.

## 📋 Pré-requisitos

- ✅ Conta no [Supabase](https://supabase.com)
- ✅ Projeto GitHub conectado
- ✅ Deploy no Vercel
- ✅ Integração Stripe funcionando

## 🌐 **PASSO 1: CRIAR PROJETO NO SUPABASE**

### **1.1 Acessar Supabase**
1. Vá para: [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com GitHub

### **1.2 Criar Novo Projeto**
1. Clique em **"New Project"**
2. Escolha sua organização
3. Configure o projeto:
   - **Name**: `vmetrics-db`
   - **Database Password**: `vmetrics_2025_secure_db`
   - **Region**: `South America (São Paulo)` ou mais próximo
   - **Pricing Plan**: Free tier (para começar)

### **1.3 Aguardar Configuração**
- ⏱️ **Tempo estimado**: 2-5 minutos
- ✅ Banco de dados será criado automaticamente
- ✅ API keys serão geradas

## 🔑 **PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE**

### **2.1 Obter Credenciais do Supabase**
1. No projeto criado, vá para **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **2.2 Atualizar arquivo .env**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration (já configurado)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51P2yvFL6dVrVagX4vr02IPi1zlchaO9YgmhNF7PlK4tn7QQUpzQdwQavnA8GfIQTcsuEN2PBusNZziQoT1ljB4ev006FJP20a6
STRIPE_SECRET_KEY=sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj
STRIPE_WEBHOOK_SECRET=whsec_i1iRo3NKiHAC4vvBXGFTOtIy5NN4lpc6
```

## 🗄️ **PASSO 3: CRIAR ESTRUTURA DO BANCO**

### **3.1 Tabela de Usuários**
```sql
-- Tabela principal de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_customer_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
```

### **3.2 Tabela de Planos/Assinaturas**
```sql
-- Tabela de planos ativos dos usuários
CREATE TABLE user_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- 'starter', 'pro', 'enterprise'
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_plans_stripe_subscription_id ON user_plans(stripe_subscription_id);
CREATE INDEX idx_user_plans_status ON user_plans(status);
```

### **3.3 Tabela de Faturas**
```sql
-- Tabela de faturas do Stripe
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  amount INTEGER NOT NULL, -- em centavos
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(50), -- 'paid', 'open', 'void', 'uncollectible'
  invoice_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### **3.4 Tabela de Logs de Webhook**
```sql
-- Tabela para logs de webhooks do Stripe
CREATE TABLE webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id VARCHAR(255) UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255),
  customer_id VARCHAR(255),
  subscription_id VARCHAR(255),
  plan_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'processed',
  raw_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_customer_email ON webhook_logs(customer_email);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
```

## 🔐 **PASSO 4: CONFIGURAR AUTENTICAÇÃO**

### **4.1 Habilitar Auth no Supabase**
1. Vá para **Authentication** → **Settings**
2. Configure:
   - **Site URL**: `https://vmetrics.com.br`
   - **Redirect URLs**: 
     - `https://vmetrics.com.br/auth/callback`
     - `http://localhost:5173/auth/callback` (desenvolvimento)

### **4.2 Configurar Providers**
1. **Email**: Habilitado por padrão
2. **GitHub**: Opcional para login social
3. **Google**: Opcional para login social

## 🚀 **PASSO 5: INTEGRAR COM VERCEL**

### **5.1 Configurar Variáveis no Vercel**
1. No projeto Vercel, vá para **Settings** → **Environment Variables**
2. Adicione:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **5.2 Configurar Domínio**
1. **Settings** → **Domains**
2. Adicionar: `vmetrics.com.br`
3. Configurar DNS conforme instruções

## 📱 **PASSO 6: IMPLEMENTAR NO FRONTEND**

### **6.1 Instalar Dependências**
```bash
npm install @supabase/supabase-js
```

### **6.2 Configurar Cliente Supabase**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### **6.3 Implementar Autenticação**
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

## 🔄 **PASSO 7: CONECTAR COM STRIPE**

### **7.1 Atualizar WebhookService**
```typescript
// src/services/webhookService.ts
import { supabase } from '../lib/supabase'

// No método handleCheckoutCompleted:
const user = await findOrCreateUser(stripeCustomerId, customerEmail)
if (user) {
  await activateUserPlan(user.id, stripeSubscriptionId, planType)
}
```

### **7.2 Implementar Sincronização**
```typescript
// src/services/userPlanSync.ts
export class UserPlanSyncService {
  async syncUserPlan(userId: string): Promise<UserPlanStatus> {
    const { data: plan } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (plan) {
      return this.formatPlanStatus(plan)
    }

    return this.getDefaultPlanStatus()
  }
}
```

## 🧪 **PASSO 8: TESTAR INTEGRAÇÃO**

### **8.1 Testar Banco de Dados**
```bash
# Verificar conexão
npm run supabase:test

# Executar migrações
npm run supabase:migrate
```

### **8.2 Testar Fluxo Completo**
1. **Criar usuário** via Supabase Auth
2. **Fazer pagamento** no Stripe
3. **Receber webhook** e salvar no banco
4. **Verificar plano ativo** no frontend

## 📊 **ESTRUTURA FINAL**

```
VMetrics + Supabase + Stripe + Vercel
├── Frontend (React + Vite)
├── Backend (Node.js + Express)
├── Banco (Supabase PostgreSQL)
├── Pagamentos (Stripe)
├── Deploy (Vercel)
└── Integração 100% funcional
```

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ **Criar projeto no Supabase**
2. ✅ **Configurar variáveis de ambiente**
3. ✅ **Criar estrutura do banco**
4. ✅ **Integrar com Vercel**
5. ✅ **Implementar no frontend**
6. ✅ **Conectar com Stripe**
7. ✅ **Testar ciclo completo**

---

**🚀 Status**: Preparando implementação do Supabase para integração 100% funcional!

**🎯 Objetivo**: VMetrics funcionando com ciclo completo de autenticação, pagamentos e sincronização!

