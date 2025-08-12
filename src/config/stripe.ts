// Configuração do Stripe
export const STRIPE_CONFIG = {
  // Chaves de API (configuradas via variáveis de ambiente)
  publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Configurações de ambiente
  isProduction: process.env.NODE_ENV === 'production',
  
  // URLs de retorno
  successUrl: process.env.VITE_STRIPE_SUCCESS_URL || 'http://localhost:5173/success',
  cancelUrl: process.env.VITE_STRIPE_CANCEL_URL || 'http://localhost:5173/pricing',
  
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
  portalReturnUrl: process.env.VITE_STRIPE_PORTAL_RETURN_URL || 'http://localhost:5173/dashboard',
  
  // Configurações do servidor
  serverUrl: process.env.VITE_SERVER_URL || 'http://localhost:3001',
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
  
  const missingKeys = requiredKeys.filter(key => !process.env[key])
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ Chaves do Stripe não configuradas:', missingKeys)
    console.warn('Configure as variáveis de ambiente necessárias')
    return false
  }
  
  return true
}

// Validação específica para webhooks
export const validateWebhookConfig = () => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET não configurado')
    console.warn('Configure o webhook secret para receber eventos do Stripe')
    return false
  }
  
  return true
}

// Configuração de produtos e preços (SINCRONIZADA com Stripe)
export const STRIPE_PRODUCTS = {
  starter: {
    name: 'Plano Starter',
    description: 'Funcionalidades essenciais para começar',
    features: ['Até 10 campanhas', 'Relatórios básicos', 'Suporte por email'],
    stripeIds: {
      product: 'prod_PvrF2GjvBWFrqQ',
      prices: {
        monthly: 'price_1Rv5d9L6dVrVagX4T9MjZETw', // R$ 29,90
        yearly: null // Não configurado ainda
      }
    },
    prices: {
      monthly: {
        amount: 2990, // R$ 29,90
        currency: 'brl',
        interval: 'month'
      },
      yearly: {
        amount: 29900, // R$ 299,00 (2 meses grátis)
        currency: 'brl',
        interval: 'year'
      }
    }
  },
  pro: {
    name: 'Plano Pro',
    description: 'Funcionalidades avançadas para crescer',
    features: ['Campanhas ilimitadas', 'Relatórios avançados', 'Suporte prioritário', 'API personalizada'],
    stripeIds: {
      product: 'prod_PvrF2GjvBWFrqQ', // Usando o mesmo produto por enquanto
      prices: {
        monthly: 'price_1Rv5diL6dVrVagX4RVadte0b', // R$ 79,90
        yearly: null // Não configurado ainda
      }
    },
    prices: {
      monthly: {
        amount: 7990, // R$ 79,90
        currency: 'brl',
        interval: 'month'
      },
      yearly: {
        amount: 79900, // R$ 799,00 (2 meses grátis)
        currency: 'brl',
        interval: 'year'
      }
    }
  },
  enterprise: {
    name: 'Plano Enterprise',
    description: 'Solução personalizada para grandes empresas',
    features: ['Tudo do plano Pro', 'Suporte 24/7', 'Integrações customizadas', 'SLA garantido'],
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
