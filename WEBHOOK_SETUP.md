# 🔗 Configuração de Webhooks no Stripe Dashboard

## 📋 **PASSO A PASSO PARA CONFIGURAR WEBHOOKS**

### **1. Acessar Stripe Dashboard**
1. Acesse: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login com sua conta
3. Certifique-se de estar no modo **Test** (toggle no canto superior direito)

### **2. Navegar para Webhooks**
1. No menu lateral esquerdo, clique em **Developers**
2. Clique em **Webhooks**
3. Clique no botão **+ Add endpoint**

### **3. Configurar Endpoint**
```
Endpoint URL: https://vmetrics.com.br/api/webhooks/stripe
Description: VMetrics - Receber eventos de pagamento e assinatura
```

### **4. Selecionar Eventos**
Marque os seguintes eventos:

#### **✅ Eventos Essenciais:**
- `checkout.session.completed` - Checkout finalizado com sucesso
- `customer.subscription.created` - Nova assinatura criada
- `customer.subscription.updated` - Assinatura atualizada
- `customer.subscription.deleted` - Assinatura cancelada
- `invoice.payment_succeeded` - Pagamento de fatura realizado
- `invoice.payment_failed` - Falha no pagamento
- `customer.created` - Novo cliente criado
- `customer.updated` - Cliente atualizado

### **5. Salvar e Obter Webhook Secret**
1. Clique em **Add endpoint**
2. Copie o **Webhook signing secret** (começa com `whsec_`)
3. Adicione no seu arquivo `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_seu_secret_aqui
   ```

### **6. Testar Webhook**
1. Clique no endpoint criado
2. Clique em **Send test webhook**
3. Selecione um evento (ex: `checkout.session.completed`)
4. Clique em **Send test webhook**
5. Verifique se o evento foi recebido

## 🔧 **IMPLEMENTAÇÃO NO BACKEND**

### **Arquivo: `server.js`**
```javascript
// Middleware para webhooks (raw body)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))

// Endpoint de webhook
app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Processar evento
  try {
    await webhookService.processEvent(event)
    res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
```

### **Arquivo: `src/services/webhookService.ts`**
```typescript
export class WebhookService {
  async processEvent(event: WebhookEvent): Promise<void> {
    console.log(`📡 [WEBHOOK] Processando evento: ${event.type}`)
    
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as CheckoutSession)
        break
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Subscription)
        break
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Subscription)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object as Subscription)
        break
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Invoice)
        break
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Invoice)
        break
      default:
        console.log(`⚠️ [WEBHOOK] Evento não tratado: ${event.type}`)
    }
  }

  private async handleCheckoutCompleted(session: CheckoutSession): Promise<void> {
    console.log('✅ [WEBHOOK] Checkout completado:', session.id)
    
    // TODO: Implementar lógica de ativação
    // 1. Verificar se é uma nova assinatura
    // 2. Ativar plano no sistema
    // 3. Enviar email de boas-vindas
    // 4. Atualizar status do usuário
  }

  private async handleSubscriptionCreated(subscription: Subscription): Promise<void> {
    console.log('🚀 [WEBHOOK] Nova assinatura criada:', subscription.id)
    
    // TODO: Implementar ativação de plano
    // 1. Identificar usuário pelo customer_id
    // 2. Ativar recursos do plano
    // 3. Atualizar banco de dados
    // 4. Enviar confirmação
  }

  private async handleSubscriptionUpdated(subscription: Subscription): Promise<void> {
    console.log('🔄 [WEBHOOK] Assinatura atualizada:', subscription.id)
    
    // TODO: Implementar mudança de plano
    // 1. Verificar mudanças no plano
    // 2. Atualizar recursos disponíveis
    // 3. Notificar usuário
  }

  private async handleSubscriptionCanceled(subscription: Subscription): Promise<void> {
    console.log('❌ [WEBHOOK] Assinatura cancelada:', subscription.id)
    
    // TODO: Implementar cancelamento
    // 1. Desativar recursos premium
    // 2. Manter acesso até fim do período
    // 3. Enviar email de cancelamento
  }

  private async handlePaymentSucceeded(invoice: Invoice): Promise<void> {
    console.log('💰 [WEBHOOK] Pagamento realizado:', invoice.id)
    
    // TODO: Implementar confirmação de pagamento
    // 1. Atualizar status da fatura
    // 2. Enviar recibo
    // 3. Atualizar histórico
  }

  private async handlePaymentFailed(invoice: Invoice): Promise<void> {
    console.log('💸 [WEBHOOK] Falha no pagamento:', invoice.id)
    
    // TODO: Implementar tratamento de falha
    // 1. Notificar usuário
    // 2. Tentar nova cobrança
    // 3. Atualizar status
  }
}
```

## 🎯 **LÓGICA DE ATIVAÇÃO DE PLANOS**

### **Fluxo de Ativação:**
1. **Usuário clica no botão** → Redireciona para Stripe
2. **Stripe processa pagamento** → Cria assinatura
3. **Stripe envia webhook** → `checkout.session.completed`
4. **Sistema processa webhook** → Ativa plano
5. **Usuário recebe acesso** → Recursos premium liberados

### **Implementação da Lógica:**
```typescript
// Exemplo de implementação
private async activateUserPlan(customerId: string, planId: string): Promise<void> {
  try {
    // 1. Buscar usuário pelo customer_id
    const user = await this.findUserByStripeCustomerId(customerId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // 2. Identificar plano
    const plan = this.getPlanById(planId)
    if (!plan) {
      throw new Error('Plano não encontrado')
    }

    // 3. Ativar recursos
    await this.updateUserPlan(user.id, plan)
    await this.activatePremiumFeatures(user.id, plan.features)

    // 4. Enviar confirmação
    await this.sendWelcomeEmail(user.email, plan)

    console.log(`✅ Plano ativado para usuário: ${user.email}`)
  } catch (error) {
    console.error('❌ Erro ao ativar plano:', error)
    throw error
  }
}
```

## 🧪 **TESTANDO WEBHOOKS**

### **1. Teste Local (Stripe CLI)**
```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Em outro terminal, testar evento
stripe trigger checkout.session.completed
```

### **2. Teste no Dashboard**
1. Acesse o endpoint de webhook
2. Clique em **Send test webhook**
3. Selecione evento e envie
4. Verifique logs do servidor

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

- [ ] Configurar webhook no Stripe Dashboard
- [ ] Implementar endpoint `/api/webhooks/stripe`
- [ ] Implementar `WebhookService` com handlers
- [ ] Implementar lógica de ativação de planos
- [ ] Testar webhooks localmente
- [ ] Testar fluxo completo de compra
- [ ] Implementar tratamento de erros
- [ ] Adicionar logs e monitoramento

## 🚨 **IMPORTANTE**

- **Webhook secret** deve ser mantido seguro
- **Sempre verificar assinatura** do webhook
- **Implementar retry logic** para falhas
- **Logs detalhados** para debugging
- **Testes em ambiente de desenvolvimento** primeiro

---

**🎯 Próximo passo**: Implementar a lógica de ativação de planos no sistema!
