# 📧 Configuração de Templates de Email do Supabase

## 🎯 **Sistema Nativo de Email**

O VMetrics agora usa o **sistema nativo de email do Supabase** em vez de SMTP customizado, oferecendo:

- ✅ **Templates pré-configurados** e personalizáveis
- ✅ **Sem configuração adicional** de SMTP
- ✅ **Rate limits conhecidos** e documentados
- ✅ **Integração nativa** com autenticação

## 🔧 **Configuração no Dashboard do Supabase**

### **1. Acessar Configurações de Email**
```
Dashboard Supabase → Authentication → Email Templates
```

### **2. Personalizar Template "Magic Link"**

#### **Assunto do Email:**
```
🎉 Bem-vindo ao VMetrics! Complete seu cadastro
```

#### **Conteúdo HTML:**
```html
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3cd48f 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
        🎉 Bem-vindo ao VMetrics!
      </h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 20px;">
      <p style="font-size: 18px; margin-bottom: 30px;">
        Olá <strong>{{ .FullName }}</strong>,
      </p>
      
      <p>Parabéns! Sua assinatura foi ativada com sucesso e você agora tem acesso ao VMetrics.</p>
      
      <!-- Plano Info -->
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3cd48f;">
        <div style="font-weight: 600; color: #3cd48f; font-size: 16px;">
          📋 Plano: {{ .PlanType }}
        </div>
        <div>💰 Valor: {{ .PlanPrice }}/mês</div>
        <div>🚀 Status: Ativo</div>
      </div>
      
      <p><strong>Agora você precisa completar seu cadastro para acessar o dashboard:</strong></p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" 
           style="background-color: #3cd48f; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
          🚀 Completar Cadastro
        </a>
      </div>
      
      <!-- Steps -->
      <div style="margin: 30px 0;">
        <h3 style="color: #333;">📋 O que acontece depois?</h3>
        
        <div style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
          <span style="background-color: #3cd48f; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 10px;">1</span>
          <strong>Complete seu cadastro</strong> clicando no botão acima
        </div>
        
        <div style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
          <span style="background-color: #3cd48f; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 10px;">2</span>
          <strong>Configure sua API key do RedTrack</strong> para integração
        </div>
        
        <div style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
          <span style="background-color: #3cd48f; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 10px;">3</span>
          <strong>Acesse o dashboard</strong> e comece a usar o VMetrics
        </div>
      </div>
      
      <p><strong>💡 Dica:</strong> Guarde este email para referência futura.</p>
      
      <p><strong>❓ Precisa de ajuda?</strong></p>
      <p>Entre em contato conosco: <a href="mailto:suporte@vmetrics.com.br" style="color: #3cd48f; font-weight: 600;">suporte@vmetrics.com.br</a></p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 5px 0; color: #6c757d; font-size: 14px;"><strong>VMetrics</strong> - Dashboard integrado ao RedTrack</p>
      <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">Este email foi enviado automaticamente após sua compra</p>
      <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">Se você não fez esta compra, entre em contato conosco imediatamente</p>
    </div>
    
  </div>
</div>
```

### **3. Personalizar Template "Confirm Signup"**

#### **Assunto do Email:**
```
✅ Conta criada com sucesso! Configure sua API key
```

#### **Conteúdo HTML:**
```html
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3cd48f 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
        🎉 Conta Criada com Sucesso!
      </h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 20px;">
      <p style="font-size: 18px; margin-bottom: 30px;">
        Olá <strong>{{ .FullName }}</strong>,
      </p>
      
      <p>Sua conta no VMetrics foi criada com sucesso! Agora você precisa configurar sua API key do RedTrack para começar a usar o dashboard.</p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" 
           style="background-color: #3cd48f; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
          ⚙️ Configurar API Key
        </a>
      </div>
      
      <!-- Info -->
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3cd48f;">
        <h3 style="margin-top: 0; color: #3cd48f;">🔑 O que é a API Key do RedTrack?</h3>
        <p>A API Key é sua chave de acesso para conectar o VMetrics ao seu painel do RedTrack. Ela permite que o sistema acesse seus dados de campanhas e métricas.</p>
      </div>
      
      <p><strong>❓ Precisa de ajuda?</strong></p>
      <p>Entre em contato conosco: <a href="mailto:suporte@vmetrics.com.br" style="color: #3cd48f; font-weight: 600;">suporte@vmetrics.com.br</a></p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 5px 0; color: #6c757d; font-size: 14px;"><strong>VMetrics</strong> - Dashboard integrado ao RedTrack</p>
    </div>
    
  </div>
</div>
```

## 📋 **Variáveis Disponíveis nos Templates**

### **Magic Link:**
- `{{ .ConfirmationURL }}` - Link para completar cadastro
- `{{ .FullName }}` - Nome do usuário
- `{{ .PlanType }}` - Tipo do plano (Mensal/Trimestral)
- `{{ .PlanPrice }}` - Preço do plano

### **Confirm Signup:**
- `{{ .ConfirmationURL }}` - Link para configurar API key
- `{{ .FullName }}` - Nome do usuário

## 🚀 **Como Funciona Agora**

1. **Cliente compra** na landing page
2. **Webhook do Stripe** chama Edge Function
3. **Edge Function** gera Magic Link nativo do Supabase
4. **Supabase envia email** automaticamente com template personalizado
5. **Cliente clica** no link do email
6. **Sistema redireciona** para cadastro ou setup
7. **Após setup**, vai para dashboard

## ⚠️ **Rate Limits do Supabase**

- **Magic Link**: 60 emails por hora por usuário
- **Confirm Signup**: 60 emails por hora por usuário
- **Reset Password**: 60 emails por hora por usuário

Para produção com alto volume, considere:
- **SMTP customizado** (SendGrid, Mailgun, etc.)
- **Serviços de email transacional** (Resend, Postmark, etc.)

## 🔧 **Configuração Adicional**

### **Habilitar/Desabilitar Templates:**
```
Dashboard → Authentication → Email Templates → Toggle individual templates
```

### **Configurar Remetente:**
```
Dashboard → Authentication → Settings → Site URL & Redirect URLs
```

### **Monitorar Envios:**
```
Dashboard → Authentication → Users → Ver logs de autenticação
```
