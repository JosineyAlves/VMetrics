# 🌐 Configuração Cloudflare para VMetrics

## 🎯 **OBJETIVO**
Configurar DNS e SSL para as URLs separadas:
- **vmetrics.com.br** → Landing page
- **app.vmetrics.com.br** → Dashboard

## 📋 **PASSO A PASSO**

### **1. Acessar Cloudflare Dashboard**
```
1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio: vmetrics.com.br
3. Vá para a aba "DNS"
```

### **2. Configurar Registros DNS**

#### **2.1 Registro A (Raiz)**
```
Tipo: A
Nome: @ (ou deixar vazio)
Endereço IPv4: 76.76.19.36
Proxy: ✅ Ativado (laranja)
TTL: Auto
```

#### **2.2 Registro CNAME (Subdomínio app)**
```
Tipo: CNAME
Nome: app
Conteúdo: cname.vercel-dns.com
Proxy: ✅ Ativado (laranja)
TTL: Auto
```

#### **2.3 Registro CNAME (www)**
```
Tipo: CNAME
Nome: www
Conteúdo: cname.vercel-dns.com
Proxy: ✅ Ativado (laranja)
TTL: Auto
```

### **3. Configurar SSL/TLS**

#### **3.1 SSL/TLS Overview**
```
Mode: Full (strict)
Edge Certificates:
✅ Always Use HTTPS
✅ Minimum TLS Version: 1.2
✅ Opportunistic Encryption
✅ TLS 1.3
✅ Automatic HTTPS Rewrites
```

#### **3.2 HSTS (HTTP Strict Transport Security)**
```
✅ Enable HSTS
Max Age: 31536000 (1 ano)
✅ Apply HSTS policy to subdomains
✅ Preload
```

### **4. Configurar Page Rules**

#### **4.1 Landing Page (vmetrics.com.br)**
```
URL: vmetrics.com.br/*
Configurações:
✅ Always Use HTTPS
✅ Cache Level: Standard
✅ Browser Cache TTL: 4 hours
```

#### **4.2 Dashboard App (app.vmetrics.com.br)**
```
URL: app.vmetrics.com.br/*
Configurações:
✅ Always Use HTTPS
✅ Cache Level: Bypass
✅ Browser Cache TTL: 0 seconds
```

### **5. Configurar Firewall**

#### **5.1 Security Level**
```
Security Level: Medium
Challenge Passage: 30 minutes
```

#### **5.2 WAF (Web Application Firewall)**
```
✅ Enable WAF
✅ Enable Managed Rules
✅ Enable OWASP Rules
```

### **6. Configurar Performance**

#### **6.1 Speed**
```
✅ Auto Minify: CSS, JavaScript, HTML
✅ Brotli: ✅
✅ Rocket Loader: ✅
```

#### **6.2 Caching**
```
✅ Development Mode: ❌ (desativar em produção)
Browser Cache TTL: 4 hours
```

## 🔍 **VERIFICAÇÃO**

### **1. Testar DNS**
```bash
# Verificar se os registros estão propagando
nslookup vmetrics.com.br
nslookup app.vmetrics.com.br

# Deve retornar IPs do Vercel
```

### **2. Testar SSL**
```bash
# Verificar certificados SSL
https://www.ssllabs.com/ssltest/
- vmetrics.com.br
- app.vmetrics.com.br
```

### **3. Testar Redirecionamentos**
```bash
# Testar URLs
- https://vmetrics.com.br → Landing page
- https://app.vmetrics.com.br → Dashboard
- http://vmetrics.com.br → Redirecionar para https
- http://app.vmetrics.com.br → Redirecionar para https
```

## 🚨 **TROUBLESHOOTING**

### **Erro: DNS não propagou**
```
1. Aguardar até 24 horas
2. Verificar se os registros estão corretos
3. Limpar cache do DNS local
4. Usar DNS público (8.8.8.8, 1.1.1.1)
```

### **Erro: SSL não funciona**
```
1. Verificar se o modo SSL está "Full (strict)"
2. Aguardar propagação do certificado
3. Verificar se o Vercel está configurado
```

### **Erro: Subdomínio não funciona**
```
1. Verificar se o CNAME está correto
2. Verificar se o proxy está ativado
3. Aguardar propagação DNS
```

## 📱 **URLS FINAIS**

Após a configuração:
- **🌐 Landing Page**: https://vmetrics.com.br
- **📊 Dashboard**: https://app.vmetrics.com.br
- **🔒 SSL**: ✅ Ativo em ambos
- **⚡ Performance**: ✅ Otimizado pelo Cloudflare

## 🎉 **RESULTADO**

Com essas configurações, você terá:
- ✅ DNS configurado corretamente
- ✅ SSL funcionando em ambos os domínios
- ✅ Performance otimizada pelo Cloudflare
- ✅ Segurança reforçada
- ✅ URLs separadas funcionando perfeitamente
