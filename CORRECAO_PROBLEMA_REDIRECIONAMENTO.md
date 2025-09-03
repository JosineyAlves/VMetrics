# 🔧 **CORREÇÃO DO PROBLEMA DE REDIRECIONAMENTO**

## ❌ **PROBLEMA IDENTIFICADO:**

### **1. TOKEN EXPIRADO:**
- **Erro:** `error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`
- **Causa:** Token de convite expirou antes do usuário clicar

### **2. REDIRECIONAMENTO INCORRETO:**
- **URL esperada:** `https://app.vmetrics.com.br/setup-password`
- **URL atual:** `https://app.vmetrics.com.br` (sem parâmetros)
- **Problema:** Supabase não está redirecionando para `/setup-password`

## ✅ **SOLUÇÕES IMPLEMENTADAS:**

### **1. WEBHOOK ATUALIZADO:**
- ✅ **Arquivo:** `supabase/functions/stripe-webhook/index.ts`
- ✅ **Mudança:** Usando `inviteUserByEmail` com `redirectTo`
- ✅ **Resultado:** Email enviado com redirecionamento correto

### **2. CONFIGURAÇÃO SUPABASE NECESSÁRIA:**

#### **A. URL Configuration:**
1. **Acesse:** [Dashboard Supabase](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**
2. **Configure:**
   - **Site URL:** `https://app.vmetrics.com.br/setup-password`
   - **Redirect URLs:** Adicione todas as URLs necessárias

#### **B. Email Template:**
1. **Acesse:** **Authentication** → **Email Templates** → **Invite User**
2. **Atualize o template:**
   ```html
   <h2>Bem-vindo ao VMetrics!</h2>
   <p>Você foi convidado para criar uma conta no VMetrics.</p>
   <p>Clique no link abaixo para definir sua senha e acessar sua conta:</p>
   <p><a href="{{ .ConfirmationURL }}&redirect_to=https://app.vmetrics.com.br/setup-password">Definir Senha e Acessar Conta</a></p>
   <p>Se você não solicitou este convite, pode ignorar este email.</p>
   <p>Obrigado,<br>Equipe VMetrics</p>
   ```

## 🚀 **PRÓXIMOS PASSOS:**

### **1. DEPLOY DO WEBHOOK ATUALIZADO:**
```bash
supabase functions deploy stripe-webhook
```

### **2. CONFIGURAR SUPABASE:**
- Siga as instruções acima
- Salve todas as configurações

### **3. TESTAR NOVO FLUXO:**
1. **Fazer nova compra** via Stripe
2. **Verificar email** recebido
3. **Clicar no link** do email
4. **Verificar redirecionamento** para `/setup-password`
5. **Definir senha** na página
6. **Fazer login** e verificar redirecionamento

## 🎯 **RESULTADO ESPERADO:**

### **FLUXO CORRIGIDO:**
1. **Cliente compra** → 2. **Webhook envia convite** → 3. **Email enviado** → 4. **Cliente clica no link** → 5. **Redirecionado para `/setup-password`** → 6. **Define senha** → 7. **Redirecionado para `/login`** → 8. **Faz login** → 9. **Vai para dashboard ou `/setup`**

## ⚠️ **IMPORTANTE:**

- **Deploy o webhook** antes de testar
- **Configure o Supabase** com as URLs corretas
- **Teste com email real** para verificar o fluxo completo
- **Verifique os logs** se algo não funcionar

## 🔍 **VERIFICAÇÕES:**

### **Logs Esperados:**
```
User invited successfully: [USER_ID]
✅ Email de convite enviado automaticamente via Supabase + Resend
```

### **URL Esperada no Email:**
```
https://fkqkwhzjvpzycfkbnqaq.supabase.co/auth/v1/verify?token=[TOKEN]&type=invite&redirect_to=https://app.vmetrics.com.br/setup-password
```

### **Redirecionamento Esperado:**
```
https://app.vmetrics.com.br/setup-password?token=[TOKEN]&type=invite
```

## 🎉 **APÓS CORREÇÃO:**

**O fluxo de onboarding funcionará perfeitamente:**
- ✅ Email enviado automaticamente
- ✅ Link redireciona para página correta
- ✅ Usuário define senha
- ✅ Redirecionamento para login
- ✅ Login funciona corretamente
- ✅ Redirecionamento inteligente pós-login

**Problema resolvido!** 🚀

