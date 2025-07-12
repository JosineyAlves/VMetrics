# 🚀 Guia de Deploy - TrackView Dashboard

## 📋 Visão Geral

Este guia mostra como fazer deploy do TrackView Dashboard em diferentes plataformas gratuitas para testar a integração real com a API do RedTrack.

## 🎯 Por que Deploy?

- **Teste real da API**: Sem restrições de CORS
- **Demonstração**: Compartilhar com clientes
- **Performance**: CDN global
- **Domínio público**: Acesso de qualquer lugar

## 🏆 Vercel (Recomendado)

### Vantagens
- ✅ Deploy automático do GitHub
- ✅ Domínio gratuito `.vercel.app`
- ✅ CDN global
- ✅ SSL automático
- ✅ Preview deployments

### Passos

1. **Instale Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel --prod
```

4. **Acesse**: `https://seu-projeto.vercel.app`

### Deploy Automático (GitHub)

1. **Push para GitHub**:
```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

2. **Conecte no Vercel**:
- Acesse [vercel.com](https://vercel.com)
- Conecte sua conta GitHub
- Importe o repositório
- Deploy automático!

## 🌐 Netlify

### Vantagens
- ✅ Interface visual
- ✅ Formulários gratuitos
- ✅ Funções serverless
- ✅ Domínio `.netlify.app`

### Passos

1. **Build local**:
```bash
npm run build
```

2. **Deploy manual**:
- Acesse [netlify.com](https://netlify.com)
- Arraste a pasta `dist` para o Netlify
- Pronto!

3. **Deploy automático**:
- Conecte GitHub
- Configure build command: `npm run build`
- Configure publish directory: `dist`

## 📚 GitHub Pages

### Vantagens
- ✅ Totalmente gratuito
- ✅ Integração nativa
- ✅ Domínio `.github.io`

### Passos

1. **Instale gh-pages**:
```bash
npm install --save-dev gh-pages
```

2. **Configure package.json**:
```json
{
  "homepage": "https://seu-usuario.github.io/seu-repo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Deploy**:
```bash
npm run deploy
```

## 🔥 Firebase Hosting

### Vantagens
- ✅ Google Cloud
- ✅ Performance otimizada
- ✅ Domínio `.web.app`

### Passos

1. **Instale Firebase CLI**:
```bash
npm install -g firebase-tools
```

2. **Login**:
```bash
firebase login
```

3. **Inicialize**:
```bash
firebase init hosting
```

4. **Deploy**:
```bash
firebase deploy
```

## 🔧 Configuração Pós-Deploy

### 1. Teste a API Real

Após o deploy, teste com uma API key real do RedTrack:

1. **Acesse sua conta RedTrack**
2. **Vá em**: Tools → Integrações → General
3. **Copie sua API Key**
4. **Cole no dashboard** em produção
5. **Verifique se os dados reais aparecem**

### 2. Variáveis de Ambiente (Opcional)

Para maior segurança, configure variáveis de ambiente:

**Vercel**:
```bash
vercel env add REDTRACK_API_URL
```

**Netlify**:
- Site settings → Environment variables

### 3. Domínio Customizado

**Vercel**:
```bash
vercel domains add seu-dominio.com
```

**Netlify**:
- Site settings → Domain management

## 🚨 Troubleshooting

### Erro de Build
```bash
# Limpe cache
npm run build -- --force
# Verifique dependências
npm install
```

### CORS em Produção
- ✅ Vercel: Funciona automaticamente
- ✅ Netlify: Funciona automaticamente
- ❌ Localhost: Problema de CORS

### API Key não funciona
1. **Verifique a chave** no RedTrack
2. **Teste em produção** (não localhost)
3. **Verifique permissões** da conta

## 📊 Monitoramento

### Vercel Analytics
- Performance automática
- Core Web Vitals
- Relatórios detalhados

### Netlify Analytics
- Visitas e páginas
- Performance
- Erros 404

## 🎯 Próximos Passos

1. **Deploy em Vercel**
2. **Teste com API real**
3. **Configure domínio customizado**
4. **Monitore performance**
5. **Compartilhe com clientes**

---

**🎉 Seu dashboard estará online e funcionando com dados reais do RedTrack!** 