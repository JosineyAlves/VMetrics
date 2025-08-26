// 🎯 Configuração dos Planos para Landing Page
// Sincronizado com os preços reais do Stripe e tela de faturas

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
}

export interface Plan {
  id: string
  name: string
  description: string
  features: PlanFeature[]
  prices: PlanPrice[]
  popular?: boolean
  recommended?: boolean
}

// Configuração dos planos atuais (sincronizada com Stripe)
export const LANDING_PLANS: Record<string, Plan> = {
  starter: {
    id: 'starter',
    name: 'Plano Starter',
    description: 'Ideal para começar com análise de campanhas RedTrack',
    popular: false,
    recommended: false,
    features: [
      { id: 'dashboard', text: 'Dashboard integrado ao RedTrack', included: true },
      { id: 'metrics', text: 'Métricas básicas (ROI, CPA, CTR)', included: true },
      { id: 'funnel', text: 'Análise de funil básica', included: true },
      { id: 'campaigns', text: 'Até 5 campanhas', included: true },
      { id: 'support', text: 'Suporte por email', included: true },
      { id: 'comparison', text: 'Comparação entre campanhas', included: false },
      { id: 'advanced_metrics', text: 'Métricas avançadas', included: false },
      { id: 'unlimited_campaigns', text: 'Campanhas ilimitadas', included: false }
    ],
    prices: [
      {
        amount: 2990, // R$ 29,90
        currency: 'brl',
        interval: 'month'
      }
    ]
  },
  
  pro: {
    id: 'pro',
    name: 'Plano Pro',
    description: 'Solução completa para profissionais de marketing',
    popular: true,
    recommended: true,
    features: [
      { id: 'dashboard', text: 'Dashboard integrado ao RedTrack', included: true },
      { id: 'metrics', text: 'Métricas avançadas (ROI, CPA, CTR)', included: true },
      { id: 'funnel', text: 'Análise de funil 3D', included: true },
      { id: 'campaigns', text: 'Campanhas ilimitadas', included: true },
      { id: 'support', text: 'Suporte prioritário por email', included: true },
      { id: 'comparison', text: 'Comparação entre campanhas', included: true },
      { id: 'advanced_metrics', text: 'Métricas avançadas', included: true },
      { id: 'unlimited_campaigns', text: 'Campanhas ilimitadas', included: true }
    ],
    prices: [
      {
        amount: 7900, // R$ 79,00
        currency: 'brl',
        interval: 'month'
      },
      {
        amount: 19700, // R$ 197,00
        currency: 'brl',
        interval: 'quarter',
        originalAmount: 23700, // 3 × R$ 79,00
        discount: 17 // 17% de desconto
      }
    ]
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Plano Enterprise',
    description: 'Solução personalizada para grandes empresas',
    popular: false,
    recommended: false,
    features: [
      { id: 'dashboard', text: 'Dashboard integrado ao RedTrack', included: true },
      { id: 'metrics', text: 'Métricas avançadas (ROI, CPA, CTR)', included: true },
      { id: 'funnel', text: 'Análise de funil 3D', included: true },
      { id: 'campaigns', text: 'Campanhas ilimitadas', included: true },
      { id: 'support', text: 'Suporte dedicado 24/7', included: true },
      { id: 'comparison', text: 'Comparação entre campanhas', included: true },
      { id: 'advanced_metrics', text: 'Métricas avançadas', included: true },
      { id: 'unlimited_campaigns', text: 'Campanhas ilimitadas', included: true },
      { id: 'custom_integration', text: 'Integração personalizada', included: true },
      { id: 'dedicated_account_manager', text: 'Gerente de conta dedicado', included: true }
    ],
    prices: [
      {
        amount: 0, // Preço sob consulta
        currency: 'brl',
        interval: 'month'
      }
    ]
  }
}

// Função para obter o link do Stripe para um plano
export const getPlanStripeUrl = (planType: string): string => {
  return getStripeLink(planType as 'starter' | 'pro' | 'enterprise')
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

export default LANDING_PLANS
