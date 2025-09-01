# 🚀 Guia Completo: Configuração do Stripe Wrapper para VMetrics

## 📋 Visão Geral

Este guia te ajudará a configurar a integração 100% funcional entre Stripe, Supabase e VMetrics usando o **Stripe Wrapper** nativo do Supabase.

## 🎯 O que será implementado

1. **Cliente escolhe plano** → LandingPage
2. **Redireciona para checkout** → Stripe
3. **Após pagamento** → Criação automática de usuário
4. **Usuário recebe email** → Confirmação de criação
5. **Faz login** → Dashboard com plano ativo

## 🔧 Passo 1: Configurar o Stripe Wrapper no Supabase

### 1.1 Acessar o Supabase Dashboard
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione seu projeto VMetrics

### 1.2 Executar o Script SQL
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New Query"**
- Cole o conteúdo do arquivo `supabase-stripe-wrapper.sql`
- **IMPORTANTE**: Substitua `'your_stripe_secret_key'` pela sua chave secreta real do Stripe
- Clique em **"Run"**

### 1.3 Verificar a Configuração
Após executar o script, você deve ver:
- ✅ Extensão `wrappers` habilitada
- ✅ Foreign Data Wrapper `stripe_wrapper` criado
- ✅ Servidor `stripe_server` configurado
- ✅ Schema `stripe` criado
- ✅ Views `vmetrics_*` criadas
- ✅ Funções de sincronização criadas

## 🔑 Passo 2: Configurar Chaves do Stripe

### 2.1 Obter Chaves do Stripe
- Acesse [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
- Copie a **Secret Key** (começa com `sk_`)

### 2.2 Atualizar o Script SQL
- No script `supabase-stripe-wrapper.sql`, linha 35:
```sql
api_key 'your_stripe_secret_key_here', -- ⚠️ SUBSTITUIR PELA SUA CHAVE SECRETA
```

### 2.3 Reexecutar o Script
- Execute novamente o script no SQL Editor do Supabase

## 🌐 Passo 3: Configurar Webhooks no Stripe

### 3.1 Acessar Webhooks
- No Stripe Dashboard, vá para **"Developers" > "Webhooks"**
- Clique em **"Add endpoint"**

### 3.2 Configurar Endpoint
- **URL**: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- **Events**: Selecione os seguintes eventos:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 3.3 Copiar Webhook Secret
- Após criar o webhook, clique em **"Reveal"** para ver o signing secret
- Copie o valor (começa com `whsec_`)

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

### 4.1 Criar arquivo `.env`
```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4.2 Configurar no Vercel (Produção)
- No dashboard do Vercel, vá para **"Settings" > "Environment Variables"**
- Adicione todas as variáveis acima

## 🧪 Passo 5: Testar a Integração

### 5.1 Adicionar Componente de Teste
- No seu App.tsx ou rota de teste, importe:
```tsx
import StripeWrapperTest from './components/StripeWrapperTest'
```

### 5.2 Verificar Status
- O componente mostrará se o Stripe Wrapper está configurado
- Use os botões de teste para verificar cada funcionalidade

### 5.3 Testar Fluxo Completo
1. **Escolher plano** na LandingPage
2. **Fazer checkout** no Stripe
3. **Verificar criação automática** de usuário
4. **Confirmar sincronização** dos dados

## 📊 Passo 6: Monitoramento e Relatórios

### 6.1 Views SQL Disponíveis
- `vmetrics_subscriptions` - Todas as assinaturas ativas
- `vmetrics_checkouts` - Checkouts completados
- `vmetrics_invoices` - Faturas pagas

### 6.2 Funções SQL Disponíveis
- `get_user_subscription(email)` - Buscar assinatura por email
- `sync_user_after_checkout()` - Sincronização automática

### 6.3 Exemplos de Queries
```sql
-- Todas as assinaturas ativas
SELECT * FROM vmetrics_subscriptions;

-- Assinatura de um usuário específico
SELECT * FROM get_user_subscription('user@example.com');

-- Receita do último mês
SELECT 
  SUM(price_amount) as total_revenue,
  COUNT(*) as subscription_count
FROM vmetrics_subscriptions 
WHERE created_at >= NOW() - INTERVAL '1 month';
```

## 🔍 Passo 7: Solução de Problemas

### 7.1 Erro: "Wrapper não configurado"
- Verifique se o script SQL foi executado completamente
- Confirme se a chave do Stripe está correta
- Verifique se a extensão `wrappers` está habilitada

### 7.2 Erro: "Tabelas não encontradas"
- Execute novamente o `IMPORT FOREIGN SCHEMA`
- Verifique se o servidor `stripe_server` foi criado corretamente

### 7.3 Erro: "Permissão negada"
- Verifique se o usuário tem permissões para criar schemas
- Confirme se as políticas RLS estão configuradas corretamente

### 7.4 Dados não sincronizando
- Verifique se os webhooks estão configurados corretamente
- Confirme se as funções de sincronização foram criadas
- Monitore os logs do Supabase para erros

## 🚀 Passo 8: Produção

### 8.1 Configurar Webhooks de Produção
- Use a URL de produção do Supabase
- Configure eventos de produção no Stripe
- Teste com valores reais (não de teste)

### 8.2 Monitoramento
- Configure alertas para falhas de sincronização
- Monitore logs de erro
- Verifique métricas de performance

### 8.3 Backup e Segurança
- Faça backup regular das configurações
- Use chaves de produção seguras
- Configure rate limiting se necessário

## 📚 Recursos Adicionais

### Documentação Oficial
- [Supabase Wrappers](https://supabase.com/docs/guides/database/extensions/wrappers/overview)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Supabase Functions](https://supabase.com/docs/guides/functions)

### Suporte
- [Supabase Discord](https://discord.supabase.com)
- [Stripe Support](https://support.stripe.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## ✅ Checklist de Configuração

- [ ] Script SQL executado no Supabase
- [ ] Chave secreta do Stripe configurada
- [ ] Webhooks configurados no Stripe
- [ ] Variáveis de ambiente configuradas
- [ ] Componente de teste funcionando
- [ ] Fluxo de checkout testado
- [ ] Criação automática de usuário funcionando
- [ ] Sincronização de dados funcionando
- [ ] Relatórios e views funcionando
- [ ] Configuração de produção testada

## 🎉 Conclusão

Após seguir este guia, você terá uma integração 100% funcional entre Stripe, Supabase e VMetrics. O Stripe Wrapper elimina a necessidade de webhooks complexos e sincronização manual, tornando o sistema mais robusto e eficiente.

**Próximos passos sugeridos:**
1. Implementar sistema de emails automáticos
2. Criar dashboard de relatórios financeiros
3. Implementar sistema de notificações
4. Adicionar métricas de performance

---

**⚠️ Importante**: Sempre teste em ambiente de desenvolvimento antes de ir para produção!
