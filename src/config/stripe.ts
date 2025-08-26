// Configuração do Stripe
export const STRIPE_CONFIG = {
  // Chaves de API (configuradas via variáveis de ambiente)
  publishableKey: (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: (import.meta as any).env?.STRIPE_SECRET_KEY || '',
  webhookSecret: (import.meta as any).env?.STRIPE_WEBHOOK_SECRET || '',
  
  // Configurações de ambiente
  isProduction: (import.meta as any).env?.MODE === 'production',
  
  // URLs de retorno
  successUrl: (import.meta as any).env?.VITE_STRIPE_SUCCESS_URL || 'http://localhost:5173/success',
  cancelUrl: (import.meta as any).env?.VITE_STRIPE_CANCEL_URL || 'http://localhost:5173/pricing',
  
  // Configurações de moeda padrão
  defaultCurrency: 'brl',
  
  // Configurações de webhook
  webhookEndpoint: '/api/webhooks/stripe',
  webhookEvents: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.created',
    'customer.updated'
  ],
  
  // Configurações de checkout
  checkoutMode: 'subscription' as const,
  paymentMethodTypes: ['card'] as const,
  
  // Configurações de assinatura
  trialPeriodDays: 14,
  
  // Configurações de faturamento
  billingCycleAnchor: 'now' as const,
  prorationBehavior: 'create_prorations' as const,
  
  // Configurações de portal do cliente
  portalReturnUrl: (import.meta as any).env?.VITE_STRIPE_PORTAL_RETURN_URL || 'http://localhost:5173/dashboard',
  
  // Configurações do servidor
  serverUrl: (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:3001',
  apiEndpoints: {
    checkout: '/api/stripe/create-checkout-session',
    portal: '/api/stripe/create-portal-session',
    webhook: '/api/webhooks/stripe'
  }
}

// Tipos para configuração
export type StripeConfig = typeof STRIPE_CONFIG

// Validação de configuração
export const validateStripeConfig = () => {
  const requiredKeys = [
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY'
  ]
  
  const missingKeys = requiredKeys.filter(key => !(import.meta as any).env?.[key])
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ Chaves do Stripe não configuradas:', missingKeys)
    console.warn('Configure as variáveis de ambiente necessárias')
    return false
  }
  
  return true
}

// Validação específica para webhooks
export const validateWebhookConfig = () => {
  if (!(import.meta as any).env?.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET não configurado')
    console.warn('Configure o webhook secret para receber eventos do Stripe')
    return false
  }
  
  return true
}

// Configuração de produtos e preços (SINCRONIZADA com Stripe)
export const STRIPE_PRODUCTS = {
  // Plano com desconto durante o beta
  monthly: {
    name: 'Plano Mensal',
    description: 'Acesso completo ao vMetrics com desconto promocional',
    features: [
      'Dashboard integrado ao RedTrack',
      'Métricas avançadas (ROI, CPA, CTR)',
      'Análise de funil 3D',
      'Campanhas ilimitadas',
      'Suporte por email',
      'Comparação entre campanhas'
    ],
    stripeIds: {
      product: 'prod_PvrF2GjvBWFrqQ', // Usar produto existente
      prices: {
        monthly: 'price_1Rv5d9L6dVrVagX4T9MjZETw', // R$ 63,20 (será atualizado)
        yearly: null
      }
    },
    prices: {
      monthly: {
        amount: 6320, // R$ 63,20 (20% desconto vs R$ 79)
        currency: 'brl',
        interval: 'month',
        originalPrice: 7900, // R$ 79,00 (preço final)
        discount: 20 // 20% de desconto durante beta
      },
      yearly: {
        amount: 63200, // R$ 632,00 (20% desconto vs R$ 790)
        currency: 'brl',
        interval: 'year',
        originalPrice: 79000, // R$ 790,00 (preço final)
        discount: 20 // 20% de desconto durante beta
      }
    }
  },
  // Plano trimestral com desconto durante o beta
  quarterly: {
    name: 'Plano Trimestral',
    description: 'Acesso completo ao vMetrics com desconto promocional',
    features: [
      'Dashboard integrado ao RedTrack',
      'Métricas avançadas (ROI, CPA, CTR)',
      'Análise de funil 3D',
      'Campanhas ilimitadas',
      'Suporte por email',
      'Comparação entre campanhas'
    ],
    stripeIds: {
      product: 'prod_PvrF2GjvBWFrqQ', // Usar produto existente
      prices: {
        quarterly: 'price_quarterly_new', // R$ 157,60 (será criado)
        yearly: null
      }
    },
    prices: {
      quarterly: {
        amount: 15760, // R$ 157,60 (20% desconto vs R$ 197)
        currency: 'brl',
        interval: 'month',
        billingInterval: 3, // Cobrança a cada 3 meses
        totalAmount: 47280, // R$ 472,80 (3 × R$ 157,60)
        originalPrice: 19700, // R$ 197,00 (preço final)
        discount: 20 // 20% de desconto durante beta
      },
      yearly: {
        amount: 157600, // R$ 1.576,00 (20% desconto vs R$ 1.970)
        currency: 'brl',
        interval: 'year',
        originalPrice: 197000, // R$ 1.970,00 (preço final)
        discount: 20 // 20% de desconto durante beta
      }
    }
  }
}

export default STRIPE_CONFIG
