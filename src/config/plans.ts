// 🎯 Configuração dos Planos para Landing Page
// Sincronizado EXATAMENTE com os preços reais do Stripe e tela de faturas

import { getStripeLink } from './stripeLinks'

export interface PlanFeature {
  id: string
  text: string
  included: boolean
}

export interface PlanPrice {
  amount: number // em centavos
  currency: string
  interval: 'month' | 'quarter' | 'year'
  originalAmount?: number // para descontos
  discount?: number // percentual de desconto
  billingNote?: string // nota sobre cobrança
}

export interface Plan {
  id: string
  name: string
  description: string
  features: PlanFeature[]
  prices: PlanPrice[]
  popular?: boolean
  recommended?: boolean
  bestValue?: boolean
}

// Configuração dos planos atuais (sincronizada EXATAMENTE com Stripe)
export const LANDING_PLANS: Record<string, Plan> = {
  monthly: {
    id: 'monthly',
    name: 'Plano Mensal',
    description: 'Acesso completo ao vMetrics',
    popular: false,
    recommended: false,
    bestValue: false,
    features: [
      { id: 'dashboard', text: 'Dashboard integrado ao RedTrack', included: true },
      { id: 'metrics', text: 'Métricas avançadas (ROI, CPA, CTR)', included: true },
      { id: 'funnel', text: 'Análise de funil 3D', included: true },
      { id: 'campaigns', text: 'Campanhas ilimitadas', included: true },
      { id: 'support', text: 'Suporte por email', included: true },
      { id: 'comparison', text: 'Comparação entre campanhas', included: true }
    ],
    prices: [
      {
        amount: 7900, // R$ 79,00
        currency: 'brl',
        interval: 'month'
      }
    ]
  },
  
  quarterly: {
    id: 'quarterly',
    name: 'Plano Trimestral',
    description: 'Acesso completo ao vMetrics',
    popular: false,
    recommended: false,
    bestValue: true,
    features: [
      { id: 'dashboard', text: 'Dashboard integrado ao RedTrack', included: true },
      { id: 'metrics', text: 'Métricas avançadas (ROI, CPA, CTR)', included: true },
      { id: 'funnel', text: 'Análise de funil 3D', included: true },
      { id: 'campaigns', text: 'Campanhas ilimitadas', included: true },
      { id: 'support', text: 'Suporte por email', included: true },
      { id: 'comparison', text: 'Comparação entre campanhas', included: true }
    ],
    prices: [
      {
        amount: 19700, // R$ 197,00
        currency: 'brl',
        interval: 'quarter',
        originalAmount: 23700, // 3 × R$ 79,00
        discount: 17, // 17% de desconto
        billingNote: 'Cobrança a cada 3 meses: R$ 197,00'
      }
    ]
  }
}

// Função para obter o link do Stripe para um plano
export const getPlanStripeUrl = (planType: string): string => {
  return getStripeLink(planType as 'monthly' | 'quarterly')
}

// Função para formatar preços
export const formatPrice = (amount: number, currency: string = 'brl'): string => {
  if (amount === 0) return 'Sob consulta'
  
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  })
  
  return formatter.format(amount / 100) // Converter de centavos para reais
}

// Função para obter o preço principal de um plano
export const getMainPrice = (plan: Plan): PlanPrice | null => {
  // Priorizar preço mensal, depois trimestral
  const monthlyPrice = plan.prices.find(p => p.interval === 'month')
  if (monthlyPrice) return monthlyPrice
  
  const quarterlyPrice = plan.prices.find(p => p.interval === 'quarter')
  if (quarterlyPrice) return quarterlyPrice
  
  return plan.prices[0] || null
}

// Função para verificar se um plano tem desconto
export const hasDiscount = (plan: Plan): boolean => {
  return plan.prices.some(price => price.discount && price.discount > 0)
}

// Função para obter o maior desconto de um plano
export const getMaxDiscount = (plan: Plan): number => {
  const discounts = plan.prices
    .filter(price => price.discount && price.discount > 0)
    .map(price => price.discount!)
  
  return discounts.length > 0 ? Math.max(...discounts) : 0
}

// Função para obter a nota de cobrança
export const getBillingNote = (plan: Plan): string | null => {
  const price = getMainPrice(plan)
  return price?.billingNote || null
}

export default LANDING_PLANS
