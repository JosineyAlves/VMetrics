# 🔗 Integração Supabase + Vercel + GitHub - Guia Completo

## 🎯 **OBJETIVO**
Configurar um pipeline completo de CI/CD onde:
- **GitHub** → Código fonte e versionamento
- **Supabase** → Banco de dados e autenticação
- **Vercel** → Deploy automático e hosting
- **Resultado**: Deploy automático a cada push para main

## 📋 **PRÉ-REQUISITOS**

✅ **Conta GitHub** com repositório do VMetrics  
✅ **Conta Supabase** com projeto criado  
✅ **Conta Vercel** conectada ao GitHub  
✅ **Projeto funcionando localmente**  

## 🚀 **PASSO 1: CONFIGURAR SUPABASE**

### **1.1 Criar Projeto no Supabase**
1. Acesse: [https://supabase.com](https://supabase.com)
2. **Login** com GitHub
3. **New Project** → `vmetrics-db`
4. **Database Password**: `vmetrics_2025_secure_db`
5. **Region**: `South America (São Paulo)`
6. **Pricing**: Free tier

### **1.2 Obter Credenciais**
1. **Settings** → **API**
2. Copie:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **1.3 Executar Migrações**
1. **SQL Editor** → Cole o conteúdo de `supabase-migrations.sql`
2. **Run** para criar tabelas e estrutura

### **1.4 Configurar Autenticação**
1. **Authentication** → **Settings**
2. **Site URL**: `https://vmetrics.com.br` (ou seu domínio)
3. **Redirect URLs**:
   - `https://vmetrics.com.br/auth/callback`
   - `http://localhost:5173/auth/callback`

## 🔗 **PASSO 2: CONECTAR GITHUB + VERCEL**

### **2.1 Conectar Contas**
1. **Vercel Dashboard** → **Settings** → **Integrations**
2. **GitHub** → **Connect**
3. Autorize acesso aos repositórios

### **2.2 Importar Projeto**
1. **New Project** → **Import Git Repository**
2. Selecione: `TrackView` (seu repositório)
3. **Framework Preset**: Vite
4. **Root Directory**: `./`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### **2.3 Configurar Variáveis de Ambiente**
1. **Settings** → **Environment Variables**
2. Adicione:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (já configurado)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51P2yvFL6dVrVagX4vr02IPi1zlchaO9YgmhNF7PlK4tn7QQUpzQdwQavnA8GfIQTcsuEN2PBusNZziQoT1ljB4ev006FJP20a6
STRIPE_SECRET_KEY=sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj
STRIPE_WEBHOOK_SECRET=whsec_i1iRo3NKiHAC4vvBXGFTOtIy5NN4lpc6
```

### **2.4 Configurar Auto-Deploy**
1. **Settings** → **Git**
2. **Production Branch**: `main`
3. **Auto-Deploy**: ✅ Ativado
4. **Preview Deployments**: ✅ Ativado

## 🔧 **PASSO 3: ATUALIZAR CONFIGURAÇÕES LOCAIS**

### **3.1 Atualizar .env.local**
```bash
# Copie env.example para .env.local
cp env.example .env.local

# Edite com suas credenciais reais
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **3.2 Atualizar .gitignore**
```gitignore
# Supabase
.env.local
.env.production
.env.staging

# Vercel
.vercel
```

### **3.3 Verificar package.json**
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "vercel-build": "npm run build",
    "supabase:test": "node test-supabase-connection.js"
  }
}
```

## 🧪 **PASSO 4: TESTAR INTEGRAÇÃO**

### **4.1 Testar Supabase Localmente**
```bash
# Instalar dependências
npm install

# Testar conexão
npm run supabase:test

# Build local
npm run build
```

### **4.2 Testar Deploy Automático**
```bash
# Commit e push
git add .
git commit -m "feat: Integração Supabase + Vercel"
git push origin main

# Verificar no Vercel Dashboard
# Deploy deve iniciar automaticamente
```

### **4.3 Verificar URLs**
- **Preview**: `https://trackview-git-main-username.vercel.app`
- **Production**: `https://trackview.vercel.app`

## 🔄 **PASSO 5: CONFIGURAR WEBHOOKS STRIPE**

### **5.1 Atualizar URL do Webhook**
1. **Stripe Dashboard** → **Webhooks**
2. **Edit** o webhook existente
3. **Endpoint URL**: `https://vmetrics.com.br/api/webhooks/stripe`
4. **Save changes**

### **5.2 Testar Webhook**
1. **Stripe Dashboard** → **Webhooks** → **Send test webhook**
2. Evento: `checkout.session.completed`
3. Verificar logs no Supabase

## 🌐 **PASSO 6: CONFIGURAR DOMÍNIO**

### **6.1 Adicionar Domínio no Vercel**
1. **Settings** → **Domains**
2. **Add Domain**: `vmetrics.com.br`
3. **Configure DNS** conforme instruções

### **6.2 Atualizar Supabase**
1. **Authentication** → **Settings**
2. **Site URL**: `https://vmetrics.com.br`
3. **Redirect URLs**: `https://vmetrics.com.br/auth/callback`

## 📊 **PASSO 7: MONITORAMENTO**

### **7.1 Vercel Analytics**
- **Performance**: Core Web Vitals
- **Deployments**: Status e logs
- **Functions**: API routes

### **7.2 Supabase Dashboard**
- **Database**: Queries e performance
- **Authentication**: Logins e usuários
- **Logs**: Webhooks e eventos

### **7.3 GitHub Actions (Opcional)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

## 🚨 **TROUBLESHOOTING**

### **Erro de Build no Vercel**
```bash
# Verificar localmente
npm run build

# Verificar dependências
npm install

# Verificar TypeScript
npx tsc --noEmit
```

### **Erro de Conexão Supabase**
```bash
# Testar conexão
npm run supabase:test

# Verificar variáveis de ambiente
echo $VITE_SUPABASE_URL
```

### **Erro de CORS**
- ✅ **Vercel**: Resolve automaticamente
- ❌ **Local**: Configurar proxy no vite.config.ts

### **Erro de Autenticação**
1. Verificar **Redirect URLs** no Supabase
2. Verificar **Site URL** no Supabase
3. Verificar **Environment Variables** no Vercel

## 🎯 **CHECKLIST DE VERIFICAÇÃO**

### **Supabase**
- [ ] Projeto criado
- [ ] Tabelas criadas
- [ ] Autenticação configurada
- [ ] RLS habilitado
- [ ] Políticas criadas

### **Vercel**
- [ ] Projeto importado
- [ ] GitHub conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Auto-deploy ativado
- [ ] Build funcionando

### **GitHub**
- [ ] Repositório público/privado configurado
- [ ] Branch main como padrão
- [ ] Push protection configurado
- [ ] Secrets configurados (se necessário)

### **Integração**
- [ ] Deploy automático funcionando
- [ ] Supabase conectando
- [ ] Stripe webhooks funcionando
- [ ] Autenticação funcionando
- [ ] Banco sincronizando

## 🚀 **PRÓXIMOS PASSOS**

1. **✅ Configurar Supabase**
2. **✅ Conectar Vercel + GitHub**
3. **✅ Testar deploy automático**
4. **✅ Configurar domínio**
5. **✅ Testar autenticação**
6. **✅ Testar webhooks Stripe**
7. **✅ Monitorar performance**

## 📱 **URLS IMPORTANTES**

- **GitHub**: `https://github.com/username/TrackView`
- **Vercel**: `https://vercel.com/dashboard`
- **Supabase**: `https://supabase.com/dashboard`
- **Stripe**: `https://dashboard.stripe.com/webhooks`
- **VMetrics**: `https://vmetrics.com.br`

---

**🎉 Com essa integração, você terá um pipeline completo de CI/CD funcionando automaticamente!**

**Cada push para main → Deploy automático → Supabase sincronizado → Stripe funcionando!**
