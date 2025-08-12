# 🔑 Configuração do Arquivo .env

## 📋 **PASSO A PASSO PARA CONFIGURAR**

### 1. **Copiar arquivo de exemplo**
```bash
cp env.example .env
```

### 2. **Editar o arquivo .env**
Abra o arquivo `.env` e configure as seguintes variáveis:

```env
# Configurações do Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51P2yvFL6dVrVagX4vr02IPi1zlchaO9YgmhNF7PlK4tn7QQUpzQdwQavnA8GfIQTcsuEN2PBusNZziQoT1ljB4ev006FJP20a6
STRIPE_SECRET_KEY=sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui

# URLs de retorno do Stripe
VITE_STRIPE_SUCCESS_URL=http://localhost:5173/success
VITE_STRIPE_CANCEL_URL=http://localhost:5173/pricing
VITE_STRIPE_PORTAL_RETURN_URL=http://localhost:5173/dashboard

# Configurações do servidor
VITE_SERVER_URL=http://localhost:3001

# Configurações do RedTrack
REDTRACK_API_KEY=sua_chave_api_redtrack_aqui
REDTRACK_BASE_URL=https://app.redtrack.io/api/v1

# Configurações do ambiente
NODE_ENV=development
```

### 3. **⚠️ IMPORTANTE**
- O arquivo `.env` NÃO será commitado no GitHub (está no .gitignore)
- Mantenha suas chaves secretas seguras
- Nunca compartilhe o arquivo `.env` com outras pessoas

### 4. **Testar a configuração**
```bash
# Terminal 1: Servidor backend
npm run dev:server

# Terminal 2: Frontend
npm run dev
```

### 5. **Verificar integração**
- Acesse: `http://localhost:5173/settings?tab=billing`
- Verifique se os planos estão carregando com preços corretos
- Teste o botão "Fazer Upgrade" do plano Pro

## 🎯 **DADOS REAIS IMPLEMENTADOS**

### **Produtos Stripe:**
- **Plano Starter**: `prod_PvrF2GjvBWFrqQ`
- **Preço R$ 29,90**: `price_1Rv5d9L6dVrVagX4T9MjZETw`
- **Preço R$ 79,90**: `price_1Rv5diL6dVrVagX4RVadte0b`

### **Chaves Stripe:**
- **Publicável**: `pk_test_51P2yvFL6dVrVagX4vr02IPi1zlchaO9YgmhNF7PlK4tn7QQUpzQdwQavnA8GfIQTcsuEN2PBusNZziQoT1ljB4ev006FJP20a6`
- **Secreta**: `sk_test_51P2yvFL6dVrVagX4CJAKUsJvyC5HS3O50E8PFIdsVIqXxRD15LfKB9isOiLrX2w6n0sEjRrBAfYJZjlTDf1WQ4jd00mD4NN9Aj`

## 🚀 **PRÓXIMOS PASSOS**

1. ✅ Configurar arquivo `.env`
2. ✅ Testar integração local
3. 🔄 Configurar webhook no Stripe Dashboard
4. 🚀 Fazer deploy para produção

---

**📞 Suporte**: Se encontrar problemas, verifique os logs do servidor e console do navegador.
