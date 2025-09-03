# 🔧 **CONFIGURAÇÃO SUPABASE CORRIGIDA**

## ❌ **PROBLEMAS IDENTIFICADOS:**

### **1. TOKEN DUPLICADO:**
- **URL com problema:** `&redirect_to=https://app.vmetrics.com.br/setup-password&redirect_to=https://app.vmetrics.com.br/setup-password`
- **Causa:** Configuração incorreta no Supabase

### **2. TOKEN EXPIRADO:**
- **Erro:** `One-time token not found`
- **Causa:** Token de convite expira muito rapidamente

## ✅ **SOLUÇÕES IMPLEMENTADAS:**

### **1. WEBHOOK CORRIGIDO:**
- ✅ **Removido:** Parâmetro `redirectTo` duplicado
- ✅ **Resultado:** Email enviado sem redirecionamento forçado

### **2. PÁGINA DE REDIRECIONAMENTO INTELIGENTE:**
- ✅ **Criada:** `/invite-redirect` para processar convites
- ✅ **Funcionalidade:** Redireciona automaticamente baseado no status do usuário

## 🚀 **CONFIGURAÇÃO NECESSÁRIA NO SUPABASE:**

### **1. URL Configuration:**
1. **Acesse:** [Dashboard Supabase](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**
2. **Configure:**
   - **Site URL:** `https://app.vmetrics.com.br`
   - **Redirect URLs:** 
     ```
     https://app.vmetrics.com.br/invite-redirect
     https://app.vmetrics.com.br/setup-password
     https://app.vmetrics.com.br/login
     https://app.vmetrics.com.br/dashboard
     https://app.vmetrics.com.br/setup
     ```

### **2. Email Template:**
1. **Acesse:** **Authentication** → **Email Templates** → **Invite User**
2. **Atualize o template:**
   ```html
   <h2>Bem-vindo ao VMetrics!</h2>
   <p>Você foi convidado para criar uma conta no VMetrics.</p>
   <p>Clique no link abaixo para definir sua senha e acessar sua conta:</p>
   <p><a href="{{ .ConfirmationURL }}">Definir Senha e Acessar Conta</a></p>
   <p>Se você não solicitou este convite, pode ignorar este email.</p>
   <p>Obrigado,<br>Equipe VMetrics</p>
   ```

### **3. Configurações de Token:**
1. **Acesse:** **Authentication** → **Settings**
2. **Configure:**
   - **JWT expiry:** `3600` (1 hora)
   - **Refresh token expiry:** `2592000` (30 dias)

## 🎯 **FLUXO CORRIGIDO:**

### **NOVO FLUXO:**
1. **Cliente compra** → 2. **Webhook envia convite** → 3. **Email enviado** → 4. **Cliente clica no link** → 5. **Redirecionado para `/invite-redirect`** → 6. **Página processa convite** → 7. **Redireciona para `/setup-password`** → 8. **Define senha** → 9. **Redirecionado para `/login`** → 10. **Faz login** → 11. **Vai para dashboard ou `/setup`**

### **VANTAGENS:**
- ✅ **Sem duplicação** de parâmetros
- ✅ **Redirecionamento inteligente** baseado no status do usuário
- ✅ **Tratamento de erros** melhorado
- ✅ **Fluxo mais robusto** e confiável

## ⚠️ **PRÓXIMOS PASSOS:**

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
4. **Verificar redirecionamento** para `/invite-redirect`
5. **Verificar redirecionamento** para `/setup-password`
6. **Definir senha** na página
7. **Fazer login** e verificar redirecionamento

## 🔍 **VERIFICAÇÕES:**

### **Logs Esperados:**
```
User invited successfully: [USER_ID]
✅ Email de convite enviado automaticamente via Supabase + Resend
```

### **URL Esperada no Email:**
```
https://fkqkwhzjvpzycfkbnqaq.supabase.co/auth/v1/verify?token=[TOKEN]&type=invite
```

### **Redirecionamento Esperado:**
```
https://app.vmetrics.com.br/invite-redirect?token=[TOKEN]&type=invite
```

## 🎉 **APÓS CORREÇÃO:**

**O fluxo de onboarding funcionará perfeitamente:**
- ✅ Email enviado automaticamente
- ✅ Link redireciona para página correta
- ✅ Página processa convite inteligentemente
- ✅ Usuário define senha
- ✅ Redirecionamento para login
- ✅ Login funciona corretamente
- ✅ Redirecionamento inteligente pós-login

**Problema resolvido!** 🚀
