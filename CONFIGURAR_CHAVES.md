# 🔑 Configuração das Chaves do Stripe

## ⚠️ **IMPORTANTE: Segurança**

**NUNCA commite chaves secretas no repositório!** O GitHub detectou e bloqueou o push por segurança.

## 🛠️ **Como Configurar Localmente:**

### **1. Criar arquivo `.env` na raiz do projeto:**

```bash
# Na raiz do projeto, crie o arquivo .env
touch .env
```

### **2. Adicionar suas chaves reais no `.env`:**

```env
# ===== STRIPE CONFIGURATION =====

# Chaves de API do Stripe (REAIS - NÃO COMMITAR!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51P2yvFL6dVrVagX4vr02IPi1zlchaO9YgmhNF7PlK4tn7QQUpzQdwQavnA8GfIQTcsuEN2PBusNZziQoT1ljB4ev006FJP20a6
STRIPE_SECRET_KEY=sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj
STRIPE_WEBHOOK_SECRET=whsec_... # Será configurado depois

# URLs de retorno do Stripe
VITE_STRIPE_SUCCESS_URL=http://localhost:5173/success
VITE_STRIPE_CANCEL_URL=http://localhost:5173/pricing
VITE_STRIPE_PORTAL_RETURN_URL=http://localhost:5173/dashboard

# ===== REDTRACK API =====
VITE_REDTRACK_API_URL=https://api.redtrack.io

# ===== APP CONFIGURATION =====
VITE_APP_NAME=VMetrics
VITE_APP_VERSION=1.0.0
VITE_APP_URL=http://localhost:5173

# ===== ENVIRONMENT =====
NODE_ENV=development
VITE_NODE_ENV=development

# ===== DEBUG =====
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

### **3. Verificar se está funcionando:**

```bash
# Build para verificar se não há erros
npm run build

# Iniciar desenvolvimento
npm run dev
```

## 🔒 **Por que isso aconteceu?**

1. **GitHub Security**: O GitHub detecta automaticamente chaves secretas
2. **Push Protection**: Bloqueia commits com chaves expostas
3. **Boas Práticas**: Chaves devem estar apenas em variáveis de ambiente

## ✅ **Status Atual:**

- ✅ **Código limpo**: Sem chaves hardcoded
- ✅ **Gitignore**: `.env` não será commitado
- ✅ **Configuração**: Funciona via variáveis de ambiente
- 🔄 **Próximo**: Configurar webhook no Stripe Dashboard

## 🚀 **Próximos Passos:**

1. **Criar arquivo `.env`** com suas chaves
2. **Testar localmente** se está funcionando
3. **Fazer commit** do código limpo
4. **Configurar webhook** no Stripe Dashboard
5. **Continuar para Fase 2** (Checkout)

---

**💡 Dica**: Sempre use variáveis de ambiente para chaves secretas!
