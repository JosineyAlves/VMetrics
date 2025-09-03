# 🔧 Configuração de Redirecionamento no Supabase

## 📋 **INSTRUÇÕES PARA CONFIGURAR REDIRECIONAMENTO**

### **1. ACESSAR CONFIGURAÇÕES DO SUPABASE:**

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto **vmetrics**
3. Vá para **Authentication** → **URL Configuration**

### **2. CONFIGURAR URLS DE REDIRECIONAMENTO:**

#### **Site URL:**
```
https://app.vmetrics.com.br
```

#### **Redirect URLs (adicionar estas URLs):**
```
https://app.vmetrics.com.br/setup-password
https://app.vmetrics.com.br/login
https://app.vmetrics.com.br/dashboard
https://app.vmetrics.com.br/setup
```

### **3. CONFIGURAR EMAIL TEMPLATES:**

#### **Invite User Template:**
1. Vá para **Authentication** → **Email Templates**
2. Selecione **Invite User**
3. Configure o template:

**Subject:**
```
Você foi convidado para o VMetrics
```

**Body (HTML):**
```html
<h2>Bem-vindo ao VMetrics!</h2>
<p>Você foi convidado para criar uma conta no VMetrics.</p>
<p>Clique no link abaixo para definir sua senha e acessar sua conta:</p>
<p><a href="{{ .ConfirmationURL }}">Definir Senha e Acessar Conta</a></p>
<p>Se você não solicitou este convite, pode ignorar este email.</p>
<p>Obrigado,<br>Equipe VMetrics</p>
```

### **4. CONFIGURAR SMTP (JÁ CONFIGURADO):**

✅ **Verificar se está configurado:**
- **Host:** `smtp.resend.com`
- **Port:** `465`
- **Username:** `resend`
- **Password:** `[SUA_API_KEY_DO_RESEND]`
- **Sender email:** `no-reply@vmetrics.com.br`
- **Sender name:** `vmetrics`

### **5. TESTAR CONFIGURAÇÃO:**

1. **Teste de convite manual:**
   - Vá para **Authentication** → **Users**
   - Clique em **Invite User**
   - Digite um email de teste
   - Verifique se o email é enviado com o link correto

2. **Teste de compra real:**
   - Faça uma compra via Stripe
   - Verifique se o webhook funciona
   - Verifique se o email é enviado
   - Teste o link de convite

### **6. VERIFICAR LOGS:**

- **Edge Functions:** Verificar logs do `stripe-webhook`
- **Authentication:** Verificar logs de convites
- **Email:** Verificar logs de envio

## 🎯 **RESULTADO ESPERADO:**

Após a configuração, o fluxo deve ser:

1. **Cliente compra** → 2. **Webhook envia convite** → 3. **Email enviado** → 4. **Cliente clica no link** → 5. **Redirecionado para `/setup-password`** → 6. **Define senha** → 7. **Redirecionado para `/login`** → 8. **Faz login** → 9. **Vai para dashboard ou `/setup`**

## ⚠️ **IMPORTANTE:**

- **Salve as configurações** após cada alteração
- **Teste com email real** para verificar o fluxo completo
- **Verifique os logs** se algo não funcionar
- **URLs devem ser exatas** (com https://)

## 🚀 **PRÓXIMOS PASSOS:**

Após configurar o Supabase, me avise para continuarmos com os testes!
