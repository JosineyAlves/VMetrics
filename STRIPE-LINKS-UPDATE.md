# 🔗 Atualização dos Links do Stripe - VMetrics

## 📋 Status Atual

A landing page foi atualizada com:
- ✅ Preços corretos (Starter: R$ 29,90, Pro: R$ 79,00, Enterprise: Sob consulta)
- ✅ Features corretas para cada plano
- ✅ Sistema de descontos (17% OFF no plano trimestral Pro)
- ✅ Links do Stripe configuráveis por ambiente
- ✅ Mesmo padrão visual da tela de faturas

## 🚨 Ações Necessárias

### 1. Atualizar Links de Produção

Editar o arquivo `src/config/stripeLinks.ts` e substituir as URLs de placeholder:

```typescript
// 🟢 LINKS DE PRODUÇÃO (Stripe Live Mode)
production: {
  starter: 'https://buy.stripe.com/SEU_LINK_REAL_STARTER',     // ATUALIZAR
  pro: 'https://buy.stripe.com/SEU_LINK_REAL_PRO',            // ATUALIZAR  
  enterprise: 'https://buy.stripe.com/SEU_LINK_REAL_ENTERPRISE' // ATUALIZAR
}
```

### 2. Como Obter os Links Reais

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Vá em **Produtos** → **Links de pagamento**
3. Crie ou edite os links para cada plano:
   - **Starter**: R$ 29,90/mês
   - **Pro**: R$ 79,00/mês
   - **Enterprise**: Preço sob consulta
4. Copie as URLs geradas e cole no arquivo de configuração

### 3. Verificar Configuração

Após atualizar, verificar se:
- ✅ Os preços estão corretos na landing page
- ✅ Os links redirecionam para o Stripe correto
- ✅ O ambiente de produção está usando os links corretos
- ✅ Os planos estão sincronizados com o banco de dados

## 🔧 Estrutura dos Arquivos

```
src/config/
├── plans.ts          # Configuração dos planos e preços
├── stripeLinks.ts    # Links do Stripe por ambiente
└── urls.ts           # URLs da aplicação

src/components/
└── LandingPage.tsx   # Landing page com preços atualizados
```

## 📊 Planos Configurados

### Starter (R$ 29,90/mês)
- Dashboard integrado ao RedTrack
- Métricas básicas (ROI, CPA, CTR)
- Análise de funil básica
- Até 5 campanhas
- Suporte por email

### Pro (R$ 79,00/mês)
- Dashboard integrado ao RedTrack
- Métricas avançadas (ROI, CPA, CTR)
- Análise de funil 3D
- Campanhas ilimitadas
- Suporte prioritário por email
- Comparação entre campanhas
- **Desconto trimestral**: R$ 197,00 (17% OFF)

### Enterprise (Sob consulta)
- Todos os recursos do Pro
- Integração personalizada
- Gerente de conta dedicado
- Suporte 24/7

## 🚀 Deploy

Após atualizar os links:

1. Fazer commit das alterações
2. Fazer deploy para produção
3. Testar os links na landing page
4. Verificar se o redirecionamento está funcionando

## 📞 Suporte

Em caso de dúvidas sobre:
- Configuração do Stripe
- Links de pagamento
- Preços e planos
- Deploy da aplicação

Contatar a equipe de desenvolvimento.
