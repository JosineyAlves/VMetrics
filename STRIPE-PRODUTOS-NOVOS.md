# 🚀 **Configuração dos Novos Produtos no Stripe**

## 📋 **Produtos a Serem Criados/Atualizados**

### **1. Produto Existente: vMetrics**
- **ID:** `prod_PvrF2GjvBWFrqQ`
- **Nome:** vMetrics
- **Descrição:** Plataforma completa de métricas e análise de campanhas

### **2. Preços a Serem Criados/Atualizados**

#### **🟢 Plano Mensal (R$ 47,00)**
- **Tipo:** Recurring
- **Intervalo:** Monthly
- **Valor:** R$ 47,00 (R$ 0,47 × 100)
- **Moeda:** BRL
- **Desconto:** 40% vs preço final (R$ 79,90)
- **Status:** Active
- **ID Sugerido:** `price_monthly_47`

#### **🟡 Plano Trimestral (R$ 38,00)**
- **Tipo:** Recurring
- **Intervalo:** Monthly (billing every 3 months)
- **Valor:** R$ 38,00 (R$ 0,38 × 100)
- **Moeda:** BRL
- **Desconto:** 52% vs preço final (R$ 79,90) + 20% vs plano mensal
- **Status:** Active
- **ID Sugerido:** `price_quarterly_38`
- **Nota:** Configurar para cobrar a cada 3 meses

#### **🔴 Plano Pro (R$ 79,90) - Existente**
- **ID:** `price_1Rv5diL6dVrVagX4RVadte0b`
- **Valor:** R$ 79,90
- **Status:** Active (manter para referência)

## 🔧 **Passos para Configuração no Stripe Dashboard**

### **Passo 1: Acessar Dashboard do Stripe**
1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login na sua conta
3. Selecione o projeto correto

### **Passo 2: Atualizar Produto Existente**
1. Vá em **Products** → **vMetrics**
2. Verifique se o ID é `prod_PvrF2GjvBWFrqQ`
3. Se não for, anote o ID correto

### **Passo 3: Criar/Atualizar Preços**

#### **Para o Plano Mensal (R$ 47,00):**
1. Clique em **Add price**
2. Configure:
   - **Price type:** Recurring
   - **Billing period:** Monthly
   - **Amount:** 47.00
   - **Currency:** BRL
   - **Billing cycle:** Every month
3. Clique em **Save**
4. Copie o **Price ID** gerado

#### **Para o Plano Trimestral (R$ 38,00):**
1. Clique em **Add price**
2. Configure:
   - **Price type:** Recurring
   - **Billing period:** Monthly
   - **Amount:** 38.00
   - **Currency:** BRL
   - **Billing cycle:** Every 3 months
3. Clique em **Save**
4. Copie o **Price ID** gerado

### **Passo 4: Atualizar Configuração do Código**

Após criar os preços, atualize os arquivos:

#### **`src/config/stripe.ts`:**
```typescript
monthly: {
  // ... outras configs
  stripeIds: {
    product: 'prod_PvrF2GjvBWFrqQ',
    prices: {
      monthly: 'price_monthly_47', // ID real gerado
      yearly: null
    }
  }
},
quarterly: {
  // ... outras configs
  stripeIds: {
    product: 'prod_PvrF2GjvBWFrqQ',
    prices: {
      quarterly: 'price_quarterly_38', // ID real gerado
      yearly: null
    }
  }
}
```

#### **`src/components/Settings.tsx`:**
```typescript
const STRIPE_CHECKOUT_LINKS = {
  monthly: 'https://buy.stripe.com/...', // Link real do plano mensal
  quarterly: 'https://buy.stripe.com/...', // Link real do plano trimestral
  pro: 'https://buy.stripe.com/test_8x200k0wM6x53kZ5ve33W02'
}
```

## 📊 **Estrutura Final dos Planos**

```
🟢 **Plano Mensal (R$ 47/mês)**
- 40% de desconto vs preço final
- Pagamento mensal
- Todas as funcionalidades

🟡 **Plano Trimestral (R$ 38/mês)**
- 52% de desconto vs preço final
- 20% adicional vs plano mensal
- Pagamento a cada 3 meses
- Todas as funcionalidades

🔴 **Plano Pro (R$ 79,90/mês)**
- Preço final (sem desconto)
- Pagamento mensal
- Todas as funcionalidades
```

## 🎯 **Próximos Passos**

1. **Configurar produtos no Stripe** (seguir passos acima)
2. **Atualizar IDs dos preços** no código
3. **Criar links de checkout** para cada plano
4. **Testar funcionalidade** completa
5. **Lançar planos promocionais**

## ⚠️ **Importante**

- **Mantenha os IDs existentes** se possível
- **Teste cada plano** antes do lançamento
- **Verifique webhooks** para novos tipos de plano
- **Monitore logs** durante testes

---

**Status:** ✅ Configuração preparada
**Próximo:** Configurar produtos no Stripe Dashboard
