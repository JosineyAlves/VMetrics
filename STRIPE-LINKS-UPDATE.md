# 🔗 Atualização dos Links do Stripe - VMetrics

## 📋 Status Atual

A landing page foi atualizada com:
- ✅ Preços corretos (Mensal: R$ 79,00, Trimestral: R$ 197,00)
- ✅ Features corretas para cada plano
- ✅ Sistema de descontos (17% OFF no plano trimestral)
- ✅ Links do Stripe configuráveis por ambiente
- ✅ Mesmo padrão visual da tela de faturas
- ✅ URLs reais do Stripe configuradas (teste e produção)

## 🚨 Ações Necessárias

### 1. Links de Produção ✅ CONFIGURADOS

Os links de produção já estão configurados e funcionando corretamente:

```typescript
// 🟢 LINKS DE PRODUÇÃO (Stripe Live Mode)
production: {
  monthly: 'https://buy.stripe.com/8x214oa7m2gP5t7e1K33W03',        // R$ 79,00
  quarterly: 'https://buy.stripe.com/8x2aEY0wM5t11cRaPy33W04'       // R$ 197,00
}
```

### 2. Como Funciona a Detecção de Ambiente

A aplicação detecta automaticamente o ambiente:
- **vmetrics.com.br** → Usa links de produção
- **localhost** ou outros → Usa links de teste

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

### Produção ✅ FUNCIONANDO
- **Mensal**: `https://buy.stripe.com/8x214oa7m2gP5t7e1K33W03`
- **Trimestral**: `https://buy.stripe.com/8x2aEY0wM5t11cRaPy33W04`

## 🚀 Deploy

As URLs já estão configuradas corretamente:

1. ✅ Links de teste funcionando
2. ✅ Links de produção funcionando
3. ✅ Detecção automática de ambiente
4. ✅ Pronto para deploy

## 📞 Suporte

Em caso de dúvidas sobre:
- Configuração do Stripe
- Links de pagamento
- Preços e planos
- Deploy da aplicação

Contatar a equipe de desenvolvimento.
