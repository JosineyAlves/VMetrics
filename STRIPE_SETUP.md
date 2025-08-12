# 🚀 Configuração do Stripe para VMetrics

Este documento contém instruções detalhadas para configurar a integração com o Stripe no projeto VMetrics.

## 📋 Pré-requisitos

- ✅ Conta no [Stripe Dashboard](https://dashboard.stripe.com/register)
- ✅ Conta ativada e verificada
- ✅ Acesso às chaves de API
- ✅ **CHAVES JÁ CONFIGURADAS** 🎉

## 🔑 Configuração das Chaves de API

### ✅ **CHAVES JÁ CONFIGURADAS!**

As seguintes chaves já estão configuradas no projeto:

- **Publishable Key**: `pk_test_51P2yvFL6dVrVagX4vr02IPi1zlchaO9YgmhNF7PlK4tn7QQUpzQdwQavnA8GfIQTcsuEN2PBusNZziQoT1ljB4ev006FJP20a6`
- **Secret Key**: `sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj`

### **Produtos e Preços Configurados:**

- **Plano Starter** (produto: `prod_PvrF2GjvBWFrqQ`)
  - Mensal: `price_1Rv5d9L6dVrVagX4T9MjZETw` (R$ 29,90)
- **Plano Pro** (preço mensal: `price_1Rv5diL6dVrVagX4RVadte0b` (R$ 79,90))

### **1. Configurar Variáveis de Ambiente**

1. **Copie o arquivo `stripe-keys.env` para `.env`:**
   ```bash
   cp stripe-keys.env .env
   ```

2. **O arquivo `.env` já contém as chaves corretas!**

## 🌐 Configuração de Webhooks

### **1. Configurar Webhook no Stripe**

1. No Stripe Dashboard, vá para **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure o endpoint:
   - **Endpoint URL**: `https://vmetrics.com.br/api/webhooks/stripe` (produção)
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
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 🧪 Testando a Integração

### **1. Verificar Configuração**

```bash
# Verificar se o Stripe está configurado
npm run stripe:test
```

### **2. Testar Checkout**

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Acesse o componente de teste:**
   - Navegue para `/stripe-test` (se configurado)
   - Ou use o componente `StripeTest` diretamente

3. **Teste os produtos:**
   - Clique em "Testar" nos planos disponíveis
   - Verifique se o checkout do Stripe é redirecionado

### **3. Testar Webhooks**

1. **Use o Stripe CLI para simular eventos:**
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.created
   ```

2. **Verifique os logs do servidor para confirmar recebimento**

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

### **2. Atualizar Webhook**

1. **No Stripe Dashboard, atualize a URL do webhook para:**
   ```
   https://vmetrics.com.br/api/webhooks/stripe
   ```

2. **Teste o endpoint de produção**

### **3. Mudar para Chaves de Produção**

1. **Substitua as chaves de teste pelas de produção**
2. **Atualize as variáveis de ambiente**
3. **Teste o checkout com cartões reais**

## 🔍 Troubleshooting

### **Problemas Comuns**

1. **"Stripe não configurado"**
   - ✅ **RESOLVIDO** - As chaves já estão configuradas
   - Verifique se o arquivo `.env` existe e está correto

2. **Erro de webhook**
   - Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
   - Confirme se o endpoint está acessível publicamente

3. **Produtos não aparecem**
   - ✅ **RESOLVIDO** - Os produtos já estão configurados com IDs reais
   - Execute `npm run stripe:sync` se necessário

4. **Checkout não funciona**
   - ✅ **RESOLVIDO** - As chaves estão configuradas
   - Verifique se as URLs de retorno estão corretas

### **Logs e Debug**

Para debug, verifique:
- Console do navegador
- Logs do servidor
- Stripe Dashboard → Logs
- Stripe CLI logs

## 📚 Recursos Adicionais

- [Documentação Oficial do Stripe](https://docs.stripe.com/)
- [Guia de Integração SaaS](https://docs.stripe.com/saas)
- [Referência da API](https://docs.stripe.com/api)
- [Webhooks](https://docs.stripe.com/webhooks)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Consulte a documentação do Stripe
3. Teste com o Stripe CLI
4. Verifique as variáveis de ambiente

## 🎯 **Status Atual da Integração**

- ✅ **Fase 1: Configuração Base** - COMPLETA
- ✅ **Chaves do Stripe** - CONFIGURADAS
- ✅ **Produtos e Preços** - SINCRONIZADOS
- 🔄 **Webhook** - PENDENTE (configurar no Dashboard)
- 🚀 **Fase 2: Checkout** - PRONTA PARA IMPLEMENTAR

---

**⚠️ Importante**: Nunca commite chaves secretas no repositório. Sempre use variáveis de ambiente.
