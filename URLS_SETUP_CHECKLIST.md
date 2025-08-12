# ✅ CHECKLIST DE CONFIGURAÇÃO - URLs Separadas VMetrics

## 🎯 **OBJETIVO**
Configurar sistema de URLs separadas funcionando perfeitamente:
- **vmetrics.com.br** → Landing page
- **app.vmetrics.com.br** → Dashboard

## 📋 **CHECKLIST COMPLETO**

### **1. 🚀 VERCEL**
- [ ] Projeto importado do GitHub
- [ ] Domínio **vmetrics.com.br** adicionado
- [ ] Domínio **app.vmetrics.com.br** adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] Auto-deploy ativado
- [ ] Build funcionando sem erros

**Comandos de verificação:**
```bash
# Verificar status do projeto
vercel ls

# Verificar domínios
vercel domains ls

# Verificar variáveis de ambiente
vercel env ls
```

### **2. 🗄️ SUPABASE**
- [ ] Projeto criado
- [ ] Tabelas criadas (users, user_plans, invoices, webhook_logs)
- [ ] Site URL: `https://app.vmetrics.com.br`
- [ ] Redirect URLs configuradas:
  - [ ] `https://app.vmetrics.com.br/auth/callback`
  - [ ] `https://vmetrics.com.br`
  - [ ] `http://localhost:5173/auth/callback`
- [ ] RLS (Row Level Security) habilitado
- [ ] Políticas de segurança criadas

**Verificação:**
```bash
# Testar conexão
npm run supabase:test

# Verificar no dashboard
https://supabase.com/dashboard/project/[SEU_PROJETO]
```

### **3. 🔗 CLOUDFLARE**
- [ ] Domínio **vmetrics.com.br** adicionado
- [ ] Registro A configurado: `@ → 76.76.19.36`
- [ ] Registro CNAME configurado: `app → cname.vercel-dns.com`
- [ ] Registro CNAME configurado: `www → cname.vercel-dns.com`
- [ ] Proxy ativado (laranja) em todos os registros
- [ ] SSL/TLS: Full (strict)
- [ ] HSTS habilitado
- [ ] Always Use HTTPS ativado

**Verificação:**
```bash
# Testar DNS
nslookup vmetrics.com.br
nslookup app.vmetrics.com.br

# Testar SSL
https://www.ssllabs.com/ssltest/
```

### **4. 💳 STRIPE**
- [ ] Webhook atualizado: `https://app.vmetrics.com.br/api/webhooks/stripe`
- [ ] URLs de sucesso: `https://app.vmetrics.com.br/success`
- [ ] URLs de cancelamento: `https://vmetrics.com.br/pricing`
- [ ] Webhook testado e funcionando
- [ ] Eventos configurados:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`

**Verificação:**
```bash
# Testar webhook
npm run stripe:webhook-test

# Verificar logs no Stripe Dashboard
```

### **5. 🔧 CÓDIGO LOCAL**
- [ ] `vercel.json` atualizado com domínios
- [ ] `src/config/urls.ts` criado e configurado
- [ ] `src/components/LandingPage.tsx` criado
- [ ] `src/App.tsx` atualizado com roteamento
- [ ] `src/components/LoginForm.tsx` atualizado com links
- [ ] Build local funcionando: `npm run build`

**Verificação:**
```bash
# Verificar build
npm run build

# Verificar integração
npm run integration:check

# Testar localmente
npm run dev
```

### **6. 🌐 TESTES DE FUNCIONAMENTO**
- [ ] **https://vmetrics.com.br** → Mostra landing page
- [ ] **https://app.vmetrics.com.br** → Mostra dashboard/login
- [ ] **http://vmetrics.com.br** → Redireciona para https
- [ ] **http://app.vmetrics.com.br** → Redireciona para https
- [ ] Links entre páginas funcionando
- [ ] Checkout Stripe funcionando
- [ ] Login/autenticação funcionando
- [ ] Dashboard carregando corretamente

**Comandos de teste:**
```bash
# Testar URLs
curl -I https://vmetrics.com.br
curl -I https://app.vmetrics.com.br

# Verificar redirecionamentos
curl -I http://vmetrics.com.br
curl -I http://app.vmetrics.com.br
```

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **DNS não propagou**
```
Solução: Aguardar até 24 horas, verificar registros
```

### **SSL não funciona**
```
Solução: Verificar modo SSL no Cloudflare, aguardar certificado
```

### **Subdomínio não funciona**
```
Solução: Verificar CNAME, proxy ativado, aguardar propagação
```

### **Build falha no Vercel**
```
Solução: Verificar dependências, variáveis de ambiente
```

### **Supabase não conecta**
```
Solução: Verificar credenciais, RLS, políticas
```

## 🎉 **RESULTADO FINAL**

Quando tudo estiver configurado:
- ✅ **Landing Page**: https://vmetrics.com.br (vendas/planos)
- ✅ **Dashboard**: https://app.vmetrics.com.br (aplicação)
- ✅ **SSL**: Funcionando em ambos
- ✅ **Performance**: Otimizada pelo Cloudflare
- ✅ **Integração**: Stripe + Supabase funcionando
- ✅ **Deploy**: Automático via Vercel

## 📱 **PRÓXIMOS PASSOS APÓS CONFIGURAÇÃO**

1. **🧪 Testar fluxo completo:**
   - Landing page → Checkout → Dashboard

2. **📊 Monitorar performance:**
   - Vercel Analytics
   - Cloudflare Analytics
   - Supabase Logs

3. **🔒 Configurar segurança adicional:**
   - Rate limiting
   - DDoS protection
   - Backup automático

4. **📈 Otimizar:**
   - Core Web Vitals
   - SEO
   - Acessibilidade

---

**🎯 Status: [ ] CONFIGURAÇÃO INCOMPLETA | [x] CONFIGURAÇÃO COMPLETA**
