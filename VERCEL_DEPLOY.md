# 🚀 Deploy no Vercel - Guia Completo

## 📋 Pré-requisitos

✅ **Projeto funcionando localmente**
✅ **Build bem-sucedido** (`npm run build`)
✅ **Conta GitHub** (para repositório)
✅ **Conta Vercel** (gratuita)

## 🎯 Opção 1: Deploy via Interface Web (Recomendado)

### Passo 1: Preparar o Repositório
```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Deploy ready"
git push origin main
```

### Passo 2: Acessar Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"New Project"**

### Passo 3: Importar Projeto
1. Selecione seu repositório `MyDash`
2. O Vercel detectará automaticamente:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Passo 4: Configurar
- **Project Name**: `mydash` (ou o nome que preferir)
- **Framework Preset**: Vite
- **Root Directory**: `./` (deixe vazio)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Passo 5: Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Acesse: `https://seu-projeto.vercel.app`

## 🔧 Opção 2: Deploy via CLI

### Passo 1: Instalar CLI
```bash
npm install -g vercel
```

### Passo 2: Login
```bash
vercel login
```
- Siga as instruções no navegador
- Autorize o Vercel

### Passo 3: Deploy
```bash
# Deploy de desenvolvimento
vercel

# Deploy de produção
vercel --prod
```

### Passo 4: Configurar
- **Project Name**: `mydash`
- **Directory**: `./` (atual)
- **Override Settings**: `N` (não)

## 🌐 Opção 3: Deploy Automático (GitHub)

### Passo 1: Conectar GitHub
1. No Vercel, vá em **Settings** → **Git**
2. Conecte sua conta GitHub
3. Selecione o repositório

### Passo 2: Configurar Auto-Deploy
- **Branch**: `main`
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Passo 3: Testar
```bash
# Faça uma mudança
git add .
git commit -m "Test auto-deploy"
git push origin main
```
- O Vercel fará deploy automático

## 🔧 Configurações Avançadas

### Variáveis de Ambiente (Opcional)
```bash
# No Vercel Dashboard
Settings → Environment Variables

# Adicione se necessário:
REDTRACK_API_URL=https://api.redtrack.io
```

### Domínio Customizado
1. **Vercel Dashboard** → **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

## 🚨 Troubleshooting

### Erro de Build
```bash
# Verifique se o build funciona localmente
npm run build

# Se houver erros, corrija antes do deploy
```

### Erro de CORS
- ✅ **Em produção**: Funciona automaticamente
- ❌ **Em localhost**: Problema de CORS
- **Solução**: Deploy no Vercel resolve

### Erro de Dependências
```bash
# Verifique package.json
npm install
npm run build
```

## 📊 Monitoramento

### Vercel Analytics
- **Performance**: Core Web Vitals
- **Visitas**: Analytics automático
- **Erros**: Logs em tempo real

### Logs de Deploy
- **Vercel Dashboard** → **Deployments**
- Clique no deploy para ver logs

## 🎯 Teste Pós-Deploy

### 1. Verificar Funcionalidades
- ✅ Login com API key
- ✅ Dashboard carregando
- ✅ Navegação funcionando
- ✅ Filtros aplicando

### 2. Testar API Real
1. **Acesse sua conta RedTrack**
2. **Copie sua API Key real**
3. **Cole no dashboard em produção**
4. **Verifique se dados reais aparecem**

### 3. Performance
- **Lighthouse Score**: >90
- **Load Time**: <3s
- **Mobile**: Responsivo

## 🔄 Deploy Contínuo

### Configurar Auto-Deploy
1. **Vercel Dashboard** → **Settings** → **Git**
2. **Auto-Deploy**: Ativado
3. **Branch**: `main`

### Workflow
```bash
# Desenvolvimento
git add .
git commit -m "Nova feature"
git push origin main
# → Deploy automático em staging

# Produção
# Merge para main → Deploy automático
```

## 📱 URLs Importantes

### Desenvolvimento
- **Local**: `http://localhost:3001`
- **Preview**: `https://seu-projeto-git-username.vercel.app`

### Produção
- **Main**: `https://seu-projeto.vercel.app`
- **Custom**: `https://seu-dominio.com`

## 🎉 Próximos Passos

1. **Deploy bem-sucedido** ✅
2. **Teste com API real** 🔄
3. **Configure domínio** 🌐
4. **Monitore performance** 📊
5. **Compartilhe com clientes** 🚀

---

**🎯 Seu dashboard estará online e funcionando com dados reais do RedTrack!** 