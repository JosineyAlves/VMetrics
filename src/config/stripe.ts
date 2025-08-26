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
        monthly: 'price_1Rv5d9L6dVrVagX4T9MjZETw', // R$ 47 (será atualizado)
        yearly: null
      }
    },
    prices: {
      monthly: {
        amount: 4700, // R$ 47,00 (40% desconto vs R$ 79)
        currency: 'brl',
        interval: 'month',
        originalPrice: 7990, // R$ 79,90 (preço final)
        discount: 40 // 40% de desconto
      },
      yearly: {
        amount: 47000, // R$ 470,00 (40% desconto vs R$ 799)
        currency: 'brl',
        interval: 'year',
        originalPrice: 79900, // R$ 799,00 (preço final)
        discount: 40 // 40% de desconto
      }
    }
  },
  // Plano trimestral com desconto adicional
  quarterly: {
    name: 'Plano Trimestral',
    description: 'Acesso completo ao vMetrics com máximo desconto',
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
        quarterly: 'price_quarterly_new', // R$ 38 (será criado)
        yearly: null
      }
    },
    prices: {
      quarterly: {
        amount: 3800, // R$ 38,00 (52% desconto vs R$ 79 + 20% vs mensal)
        currency: 'brl',
        interval: 'month',
        billingInterval: 3, // Cobrança a cada 3 meses
        totalAmount: 11400, // R$ 114,00 (3 × R$ 38)
        originalPrice: 7990, // R$ 79,90 (preço final)
        discount: 52, // 52% de desconto total
        additionalDiscount: 20 // 20% adicional vs plano mensal
      },
      yearly: {
        amount: 38000, // R$ 380,00 (52% desconto vs R$ 799)
        currency: 'brl',
        interval: 'year',
        originalPrice: 79900, // R$ 799,00 (preço final)
        discount: 52 // 52% de desconto total
      }
    }
  },
  // Planos finais (pós-beta)
  pro: {
    name: 'Plano Pro',
    description: 'Acesso completo ao vMetrics',
    features: [
      'Dashboard integrado ao RedTrack',
      'Métricas avançadas (ROI, CPA, CTR)',
      'Análise de funil 3D',
      'Campanhas ilimitadas',
      'Suporte prioritário',
      'Comparação entre campanhas'
    ],
    stripeIds: {
      product: 'prod_PvrF2GjvBWFrqQ',
      prices: {
        monthly: 'price_1Rv5diL6dVrVagX4RVadte0b', // R$ 79,90
        yearly: null
      }
    },
    prices: {
      monthly: {
        amount: 7990, // R$ 79,90 (preço final)
        currency: 'brl',
        interval: 'month'
      },
      yearly: {
        amount: 79900, // R$ 799,00 (preço final)
        currency: 'brl',
        interval: 'year'
      }
    }
  },
  enterprise: {
    name: 'Plano Enterprise',
    description: 'Solução personalizada para grandes empresas',
    features: [
      'Tudo do plano Pro',
      'Suporte 24/7',
      'Integrações customizadas',
      'SLA garantido',
      'Onboarding dedicado',
      'Relatórios personalizados'
    ],
    stripeIds: {
      product: null, // Não configurado ainda
      prices: {
        custom: null // Sob consulta
      }
    },
    prices: {
      custom: {
        amount: 0, // Sob consulta
        currency: 'brl',
        interval: 'custom'
      }
    }
  }
}

export default STRIPE_CONFIG
