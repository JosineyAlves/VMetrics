# 🚀 Configuração do Supabase para Sistema de Email

## 🎯 **Configurações Necessárias**

### **1. Variáveis de Ambiente**

Adicione estas variáveis no seu projeto Supabase:

```bash
# URL do Frontend
FRONTEND_URL=https://app.vmetrics.com.br

# URL do Supabase (já configurada)
SUPABASE_URL=https://fkqkwhzjvpzycfkbnqaq.supabase.co

# Service Role Key (já configurada)
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### **2. Configuração de Autenticação**

#### **Site URL:**
```
https://app.vmetrics.com.br
```

#### **Redirect URLs:**
```
https://app.vmetrics.com.br/auth/callback
https://app.vmetrics.com.br/setup
https://app.vmetrics.com.br/dashboard
```

### **3. Configuração de Email**

#### **Remetente Padrão:**
```
noreply@vmetrics.com.br
```

#### **Nome do Remetente:**
```
VMetrics
```

## 🔧 **Configuração dos Templates de Email**

### **Passo 1: Acessar Email Templates**
```
Dashboard Supabase → Authentication → Email Templates
```

### **Passo 2: Personalizar Magic Link**

1. **Clique em "Magic Link"**
2. **Altere o Assunto:**
   ```
   🎉 Bem-vindo ao VMetrics! Complete seu cadastro
   ```
3. **Cole o HTML personalizado** do arquivo `email-templates.md`
4. **Salve as alterações**

### **Passo 3: Personalizar Confirm Signup**

1. **Clique em "Confirm Signup"**
2. **Altere o Assunto:**
   ```
   ✅ Conta criada com sucesso! Configure sua API key
   ```
3. **Cole o HTML personalizado** do arquivo `email-templates.md`
4. **Salve as alterações**

## 📧 **Teste do Sistema de Email**

### **1. Teste Manual**
```bash
# Chamar Edge Function diretamente
curl -X POST https://fkqkwhzjvpzycfkbnqaq.supabase.co/functions/v1/send-welcome-email \
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@vmetrics.com.br",
    "fullName": "Usuário Teste",
    "planType": "monthly",
    "stripeCustomerId": "cus_test123"
  }'
```

### **2. Verificar Logs**
```
Dashboard → Logs → Edge Functions → send-welcome-email
```

### **3. Verificar Emails Enviados**
```
Dashboard → Authentication → Users → Ver histórico de autenticação
```

## ⚠️ **Rate Limits e Limitações**

### **Limites Atuais:**
- **Magic Link**: 60 emails/hora por usuário
- **Confirm Signup**: 60 emails/hora por usuário
- **Total**: 200 emails/hora por projeto

### **Para Alto Volume:**
Se precisar de mais de 200 emails/hora, configure:
1. **SMTP Customizado** (SendGrid, Mailgun)
2. **Serviços de Email Transacional** (Resend, Postmark)

## 🔐 **Segurança**

### **1. Service Role Key**
- ✅ **Nunca exponha** no frontend
- ✅ **Use apenas** em Edge Functions
- ✅ **Rotacione** periodicamente

### **2. Validação de Dados**
- ✅ **Valide email** antes de enviar
- ✅ **Verifique origem** (Stripe)
- ✅ **Rate limiting** por usuário

### **3. URLs de Redirecionamento**
- ✅ **Restrinja** apenas domínios permitidos
- ✅ **Use HTTPS** sempre
- ✅ **Valide parâmetros** na chegada

## 🚀 **Deploy das Edge Functions**

### **1. Deploy da Função de Email**
```bash
cd supabase/functions/send-welcome-email
supabase functions deploy send-welcome-email
```

### **2. Deploy do Webhook**
```bash
cd supabase/functions/stripe-webhook
supabase functions deploy stripe-webhook
```

### **3. Verificar Status**
```bash
supabase functions list
```

## 📊 **Monitoramento**

### **1. Métricas de Email**
- Taxa de entrega
- Taxa de abertura
- Taxa de clique
- Bounces e rejeições

### **2. Logs de Autenticação**
- Tentativas de login
- Criação de contas
- Falhas de autenticação

### **3. Alertas**
- Falhas no envio de email
- Rate limits atingidos
- Erros de autenticação

## 🔧 **Troubleshooting**

### **Email não enviado:**
1. Verificar logs da Edge Function
2. Confirmar variáveis de ambiente
3. Verificar rate limits
4. Testar template de email

### **Link não funciona:**
1. Verificar URLs de redirecionamento
2. Confirmar configuração de autenticação
3. Verificar parâmetros na URL
4. Testar fluxo completo

### **Usuário não criado:**
1. Verificar webhook do Stripe
2. Confirmar criação na tabela users
3. Verificar logs de autenticação
4. Testar criação manual
