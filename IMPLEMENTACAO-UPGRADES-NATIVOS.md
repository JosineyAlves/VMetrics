# 🚀 **Implementação de Upgrades Nativos - Stripe + Supabase**

## **📋 Visão Geral**

Este sistema implementa **DUAS opções** para upgrades de planos:

1. **Customer Portal** (Recomendado pela Stripe)
2. **API Direta** (Controle total via código)

## **🔧 Arquivos Criados/Modificados**

### **APIs Backend:**
- `api/stripe-portal.js` - Customer Portal
- `api/stripe-upgrade.js` - Upgrades diretos via API

### **Hooks Frontend:**
- `src/hooks/useStripePortal.ts` - Hook para Customer Portal
- `src/hooks/useStripeUpgrade.ts` - Hook para upgrades diretos

### **Componentes:**
- `src/components/Settings.tsx` - Interface atualizada com ambas as opções

### **Configuração:**
- `src/config/stripe.ts` - IDs dos preços para upgrades

---

## **🎯 Como Funciona**

### **Opção 1: Customer Portal (Recomendada)**
```typescript
// Usuário clica em "Gerenciar Plano" ou "Fazer Upgrade"
const { openCustomerPortal } = useStripePortal()

// Redireciona para o portal do Stripe
openCustomerPortal(customerId)

// Usuário faz upgrade no portal
// Webhook sincroniza automaticamente
// Usuário retorna para o app
```

### **Opção 2: Upgrade Direto via API**
```typescript
// Usuário clica em "Upgrade Direto"
const { upgradeSubscription } = useStripeUpgrade()

// Faz upgrade diretamente via Stripe API
upgradeSubscription(
  subscriptionId,
  newPriceId,
  customerId
)

// Retorna sucesso/erro imediatamente
// Webhook sincroniza automaticamente
```

---

## **⚙️ Configuração Necessária**

### **1. Variáveis de Ambiente**
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs (opcional)
NEXT_PUBLIC_APP_URL=https://vmetrics.com
STRIPE_PORTAL_CONFIGURATION_ID=... # Opcional
```

### **2. IDs dos Preços no Stripe**
```typescript
// src/config/stripe.ts
STRIPE_PRODUCTS = {
  starter: {
    prices: {
      monthly: {
        priceId: 'price_1Rv5d9L6dVrVagX4T9MjZETw' // ✅ Configurado
      }
    }
  },
  pro: {
    prices: {
      monthly: {
        priceId: 'price_1Rv5diL6dVrVagX4RVadte0b' // ✅ Configurado
      }
    }
  }
}
```

---

## **🧪 Testando o Sistema**

### **Teste 1: Customer Portal**
1. Faça login no dashboard
2. Vá para Settings → Planos & Faturas
3. Clique em "Gerenciar Plano" (se já tiver plano) ou "Fazer Upgrade"
4. Deve abrir o Customer Portal do Stripe
5. Faça upgrade/downgrade no portal
6. Retorne para o app
7. Verifique se o plano foi atualizado

### **Teste 2: Upgrade Direto**
1. Faça login no dashboard
2. Vá para Settings → Planos & Faturas
3. Clique em "Upgrade Direto" (se disponível)
4. Deve fazer upgrade imediatamente
5. Verifique notificação de sucesso
6. Clique em "Atualizar" para sincronizar dados

---

## **🔍 Logs e Debugging**

### **Customer Portal:**
```bash
🔗 [STRIPE-PORTAL] Criando sessão do Customer Portal para: cus_xxx
✅ [STRIPE-PORTAL] Sessão criada com sucesso: bps_xxx
```

### **Upgrade Direto:**
```bash
🔄 [STRIPE-UPGRADE] Iniciando upgrade para subscription: sub_xxx
🔄 [STRIPE-UPGRADE] Novo preço: price_xxx
✅ [STRIPE-UPGRADE] Upgrade realizado com sucesso!
```

### **Webhook:**
```bash
[WEBHOOK] customer.subscription.updated recebido
[WEBHOOK] Atualizando plano do usuário
[WEBHOOK] Plano atualizado com sucesso
```

---

## **🚨 Solução de Problemas**

### **Erro: "Customer ID não corresponde à assinatura"**
- **Causa:** Customer ID diferente entre Stripe e banco
- **Solução:** Verificar se `stripe_customer_id` está correto na tabela `users`

### **Erro: "Assinatura não encontrada"**
- **Causa:** Subscription ID inválido ou expirado
- **Solução:** Verificar se `stripe_subscription_id` está correto na tabela `user_plans`

### **Customer Portal não abre**
- **Causa:** Customer ID inválido ou Stripe não configurado
- **Solução:** Verificar variáveis de ambiente e customer ID

### **Upgrade direto falha**
- **Causa:** Price ID inválido ou permissões insuficientes
- **Solução:** Verificar IDs dos preços em `src/config/stripe.ts`

---

## **📈 Benefícios da Implementação**

### **✅ Customer Portal:**
- **Profissional:** Interface nativa do Stripe
- **Seguro:** Stripe gerencia todas as mudanças
- **Flexível:** Usuário pode fazer várias alterações
- **Automático:** Webhooks sincronizam tudo

### **✅ API Direta:**
- **Controle Total:** Upgrade programático
- **Feedback Imediato:** Sucesso/erro em tempo real
- **Personalização:** Lógica customizada de upgrade
- **Integração:** Pode ser chamada de outros sistemas

### **✅ Webhooks:**
- **Sincronização Automática:** Dados sempre atualizados
- **Consistência:** Evita problemas de customer IDs
- **Auditoria:** Log de todas as mudanças
- **Escalabilidade:** Funciona com milhares de usuários

---

## **🔮 Próximos Passos**

### **1. Configurar Customer Portal no Stripe Dashboard**
- Acesse: Stripe Dashboard → Billing → Customer portal
- Configure funcionalidades desejadas
- Personalize aparência

### **2. Adicionar Mais Planos**
- Enterprise plan
- Planos anuais
- Add-ons e extras

### **3. Implementar Analytics**
- Tracking de upgrades/downgrades
- Métricas de conversão
- Análise de churn

### **4. Melhorar UX**
- Confirmações antes de upgrades
- Calculadora de preços
- Comparação de planos

---

## **📞 Suporte**

Se encontrar problemas:

1. **Verifique os logs** no console do navegador
2. **Verifique os logs** do Vercel (APIs)
3. **Verifique os logs** do Supabase (webhooks)
4. **Teste com dados de teste** do Stripe
5. **Consulte a documentação** do Stripe

---

## **🎉 Conclusão**

Agora você tem um sistema **completo e profissional** para upgrades de planos:

- ✅ **Customer Portal** para upgrades gerais
- ✅ **API Direta** para upgrades programáticos  
- ✅ **Webhooks** sincronizando automaticamente
- ✅ **Interface moderna** e intuitiva
- ✅ **Logs detalhados** para debugging
- ✅ **Tratamento de erros** robusto

**O sistema está pronto para produção! 🚀**
