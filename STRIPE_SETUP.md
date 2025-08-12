# 🚀 Configuração do Stripe para VMetrics

Este documento contém instruções detalhadas para configurar a integração com o Stripe no projeto VMetrics.

## 📋 Pré-requisitos

- ✅ Conta no [Stripe Dashboard](https://dashboard.stripe.com/register)
- ✅ Conta ativada e verificada
- ✅ Acesso às chaves de API
- ✅ **CHAVES JÁ CONFIGURADAS** 🎉

## 🔑 Configuração das Chaves de API

### **Produtos e Preços Configurados:**

- **Plano Starter** (produto: `prod_PvrF2GjvBWFrqQ`)
  - Mensal: `price_1Rv5d9L6dVrVagX4T9MjZETw` (R$ 29,90)
- **Plano Pro** (produto: `prod_PvrF2GjvBWFrqQ`)
  - Mensal: `price_1Rv5diL6dVrVagX4RVadte0b` (R$ 79,90)

### **Chaves do Stripe Configuradas:**

- **Publishable Key**: `pk_test_51P2yvFL6dVrVagX4vr02IPi1zlchaO9YgmhNF7PlK4tn7QQUpzQdwQavnA8GfIQTcsuEN2PBusNZziQoT1ljB4ev006FJP20a6`
- **Secret Key**: `sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj`

### **1. Configurar Variáveis de Ambiente**

1. **Copie o arquivo `env.example` para `.env`:**
   ```bash
   cp env.example .env
   ```

2. **Edite o arquivo `.env` e configure as chaves reais:**
   ```env
   # Configurações do Stripe
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51P2yvFL6dVrVagX4vr02IPi1zlchaO9YgmhNF7PlK4tn7QQUpzQdwQavnA8GfIQTcsuEN2PBusNZziQoT1ljB4ev006FJP20a6
   STRIPE_SECRET_KEY=sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj
   STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
   ```

3. **⚠️ IMPORTANTE**: O arquivo `.env` NÃO será commitado no GitHub (está no .gitignore)

## 🌐 Configuração de Webhooks

### **1. Configurar Webhook no Stripe**

1. No Stripe Dashboard, vá para **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure o endpoint:
   - **Endpoint URL**: `http://localhost:3001/api/webhooks/stripe` (desenvolvimento)
   - **Events to send**: Selecione os eventos necessários:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.created`
     - `customer.updated`

4. Clique em **Add endpoint**
5. **Copie o Signing secret** (começa com `whsec_`)
6. **Adicione ao arquivo `.env`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_... # Cole aqui o segredo do webhook
   ```

### **2. Testar Webhooks Localmente**

Para desenvolvimento local, use o Stripe CLI:

```bash
# Instalar Stripe CLI (Windows)
# Baixe de: https://github.com/stripe/stripe-cli/releases

# Login no Stripe
stripe login

# Testar webhooks localmente
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

## 🧪 Testando a Integração

### **1. Verificar Configuração**

```bash
# Verificar se o Stripe está configurado
npm run stripe:test
```

### **2. Iniciar Servidor de Desenvolvimento**

1. **Inicie o servidor backend:**
   ```bash
   npm run dev:server
   ```

2. **Em outro terminal, inicie o frontend:**
   ```bash
   npm run dev
   ```

3. **Acesse o componente de teste:**
   - Navegue para `/stripe-test` (se configurado)
   - Ou use o componente `StripeTest` diretamente

### **3. Testar Funcionalidades**

1. **Verificar Status:**
   - ✅ Stripe configurado
   - ✅ Servidor online
   - ✅ Webhook configurado (após configurar)

2. **Testar Checkout:**
   - Clique em "Testar" nos planos disponíveis
   - Verifique se o checkout do Stripe é redirecionado

3. **Testar Portal do Cliente:**
   - Clique em "Testar Portal do Cliente"
   - Verifique se o portal é aberto

4. **Testar Webhooks:**
   - Use os botões de teste de webhook
   - Verifique os logs do servidor

### **4. Testar Webhooks com Stripe CLI**

```bash
# Simular eventos específicos
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

## 🚀 Deploy para Produção

### **1. Configurar Variáveis de Produção**

1. **No Vercel, configure as variáveis de ambiente:**
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

2. **Atualize as URLs de retorno:**
   ```env
   VITE_STRIPE_SUCCESS_URL=https://vmetrics.com.br/success
   VITE_STRIPE_CANCEL_URL=https://vmetrics.com.br/pricing
   VITE_STRIPE_PORTAL_RETURN_URL=https://vmetrics.com.br/dashboard
   ```

## 🎯 **Status Atual da Integração**

- ✅ **Fase 1: Configuração Base** - COMPLETA
- ✅ **Chaves do Stripe** - CONFIGURADAS (dados reais implementados)
- ✅ **Produtos e Preços** - SINCRONIZADOS (IDs reais do Stripe)
- ✅ **Servidor Backend** - IMPLEMENTADO
- ✅ **Endpoints Stripe** - FUNCIONANDO
- ✅ **Serviço de Webhook** - IMPLEMENTADO
- ✅ **Componente de Teste** - ATUALIZADO
- 🔄 **Webhook no Stripe** - PENDENTE (configurar no Dashboard)
- 🚀 **Fase 2: Checkout Funcional** - PRONTA PARA TESTAR
- 🚀 **Fase 3: Webhooks Reais** - PRONTA PARA IMPLEMENTAR

## 🔧 **Funcionalidades Implementadas**

### **Backend (server.js)**
- ✅ Endpoint de checkout: `/api/stripe/create-checkout-session`
- ✅ Endpoint do portal: `/api/stripe/create-portal-session`
- ✅ Endpoint de webhook: `/api/webhooks/stripe`
- ✅ Endpoint de status: `/api/stripe/webhook-status`
- ✅ Endpoint de teste: `/api/stripe/test-webhook` (DEV)

### **Frontend (StripeTest.tsx)**
- ✅ Verificação de configuração
- ✅ Status do servidor
- ✅ Status do webhook
- ✅ Teste de checkout
- ✅ Teste do portal
- ✅ Teste de webhooks
- ✅ Interface responsiva

### **Serviços**
- ✅ `StripeService` - Integração com Stripe
- ✅ `WebhookService` - Processamento de webhooks
- ✅ `useStripeStore` - Gerenciamento de estado

---

**⚠️ Importante**: Nunca commite chaves secretas no repositório. Sempre use variáveis de ambiente.

**🚀 Próximo Passo**: Configurar o webhook no Stripe Dashboard para receber eventos reais!