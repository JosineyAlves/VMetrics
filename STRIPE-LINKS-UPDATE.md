# 🔗 Atualização dos Links do Stripe - VMetrics

## 📋 Status Atual

A landing page foi atualizada com:
- ✅ Preços corretos (Mensal: R$ 79,00, Trimestral: R$ 197,00)
- ✅ Features corretas para cada plano
- ✅ Sistema de descontos (17% OFF no plano trimestral)
- ✅ Links do Stripe configuráveis por ambiente
- ✅ Mesmo padrão visual da tela de faturas
- ✅ URLs reais do Stripe configuradas

## 🚨 Ações Necessárias

### 1. Links de Produção (Opcional)

Os links de produção já estão configurados como placeholder. Quando for para produção, editar o arquivo `src/config/stripeLinks.ts`:

```typescript
// 🟢 LINKS DE PRODUÇÃO (Stripe Live Mode)
production: {
  monthly: 'https://buy.stripe.com/SEU_LINK_REAL_MENSAL',      // ATUALIZAR
  quarterly: 'https://buy.stripe.com/SEU_LINK_REAL_TRIMESTRAL'  // ATUALIZAR
}
```

### 2. Como Obter os Links de Produção

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Vá em **Produtos** → **Links de pagamento**
3. Crie ou edite os links para cada plano:
   - **Mensal**: R$ 79,00/mês
   - **Trimestral**: R$ 197,00/mês
4. Copie as URLs geradas e cole no arquivo de configuração

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

### Plano Mensal (R$ 79,00/mês)
- Dashboard integrado ao RedTrack
- Métricas avançadas (ROI, CPA, CTR)
- Análise de funil 3D
- Campanhas ilimitadas
- Suporte por email
- Comparação entre campanhas

### Plano Trimestral (R$ 197,00/mês)
- Dashboard integrado ao RedTrack
- Métricas avançadas (ROI, CPA, CTR)
- Análise de funil 3D
- Campanhas ilimitadas
- Suporte por email
- Comparação entre campanhas
- **Desconto**: 17% OFF
- **Cobrança**: A cada 3 meses (R$ 591,00)

## 🔗 Links do Stripe Configurados

### Teste (Atual)
- **Mensal**: `https://buy.stripe.com/test_8x214oa7m2gP5t7e1K33W03`
- **Trimestral**: `https://buy.stripe.com/test_8x2aEY0wM5t11cRaPy33W04`

### Produção (Placeholder)
- **Mensal**: `https://buy.stripe.com/8x214oa7m2gP5t7e1K33W03`
- **Trimestral**: `https://buy.stripe.com/8x2aEY0wM5t11cRaPy33W04`

## 🚀 Deploy

Após atualizar os links (se necessário):

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
