import { supabase } from '../lib/supabase'
import { stripeWrapperService } from './stripeWrapperService'
import type { StripeSubscription } from './stripeWrapperService'

export interface CheckoutSession {
  id: string
  url: string
  customer_email?: string
  customer_name?: string
  plan_type: 'starter' | 'pro' | 'enterprise'
  price_id: string
  success_url: string
  cancel_url: string
}

export interface CheckoutResult {
  success: boolean
  session_id?: string
  checkout_url?: string
  error?: string
}

export class CheckoutService {
  private static instance: CheckoutService

  public static getInstance(): CheckoutService {
    if (!CheckoutService.instance) {
      CheckoutService.instance = new CheckoutService()
    }
    return CheckoutService.instance
  }

  /**
   * Cria uma sessão de checkout para um plano específico
   */
  async createCheckoutSession(
    planType: 'starter' | 'pro' | 'enterprise',
    customerEmail?: string,
    customerName?: string
  ): Promise<CheckoutResult> {
    try {
      // Determinar o price_id baseado no tipo de plano
      const priceId = this.getPriceIdForPlan(planType)
      
      if (!priceId) {
        return {
          success: false,
          error: 'Preço não encontrado para o plano especificado'
        }
      }

      // Criar sessão de checkout via Stripe
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          customer_email: customerEmail,
          customer_name: customerName,
          plan_type: planType,
          success_url: `${window.location.origin}/dashboard?success=true`,
          cancel_url: `${window.location.origin}/pricing?cancelled=true`
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout')
      }

      const result = await response.json()
      
      if (result.success && result.session_id) {
        return {
          success: true,
          session_id: result.session_id,
          checkout_url: result.checkout_url
        }
      } else {
        return {
          success: false,
          error: result.error || 'Erro desconhecido ao criar checkout'
        }
      }

    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Verifica o status de uma sessão de checkout
   */
  async checkCheckoutStatus(sessionId: string): Promise<{
    status: string
    customer_id?: string
    subscription_id?: string
    error?: string
  }> {
    try {
      // Buscar dados da sessão via Stripe Wrapper
      const { data: checkoutData, error } = await supabase
        .from('stripe.checkout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) {
        throw error
      }

      if (!checkoutData) {
        return { status: 'not_found' }
      }

      return {
        status: checkoutData.attrs->>'payment_status' || 'unknown',
        customer_id: checkoutData.customer,
        subscription_id: checkoutData.subscription
      }

    } catch (error) {
      console.error('Erro ao verificar status do checkout:', error)
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Busca dados de assinatura de um usuário
   */
  async getUserSubscription(userEmail: string): Promise<StripeSubscription | null> {
    try {
      const subscription = await stripeWrapperService.getUserSubscription(userEmail)
      return subscription
    } catch (error) {
      console.error('Erro ao buscar assinatura do usuário:', error)
      return null
    }
  }

  /**
   * Redireciona para o portal do cliente do Stripe
   */
  async redirectToCustomerPortal(customerId: string): Promise<string | null> {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          return_url: `${window.location.origin}/dashboard`
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessão do portal')
      }

      const result = await response.json()
      
      if (result.success && result.url) {
        return result.url
      } else {
        throw new Error(result.error || 'Erro ao criar portal')
      }

    } catch (error) {
      console.error('Erro ao redirecionar para portal:', error)
      return null
    }
  }

  /**
   * Obtém o price_id correto para cada tipo de plano
   */
  private getPriceIdForPlan(planType: 'starter' | 'pro' | 'enterprise'): string | null {
    const priceMap = {
      starter: 'price_1Rv5d9L6dVrVagX4T9MjZETw', // R$ 29,90
      pro: 'price_1Rv5diL6dVrVagX4RVadte0b',     // R$ 79,90
      enterprise: null // Não configurado ainda
    }

    return priceMap[planType] || null
  }

  /**
   * Verifica se um usuário tem uma assinatura ativa
   */
  async hasActiveSubscription(userEmail: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userEmail)
      return subscription !== null && subscription.subscription_status === 'active'
    } catch (error) {
      console.error('Erro ao verificar assinatura ativa:', error)
      return false
    }
  }

  /**
   * Obtém o tipo de plano ativo de um usuário
   */
  async getActivePlanType(userEmail: string): Promise<'starter' | 'pro' | 'enterprise' | null> {
    try {
      const subscription = await this.getUserSubscription(userEmail)
      if (!subscription) return null

      // Mapear o nome do produto para o tipo de plano
      const productName = subscription.product_name?.toLowerCase() || ''
      
      if (productName.includes('pro')) return 'pro'
      if (productName.includes('enterprise')) return 'enterprise'
      return 'starter'
    } catch (error) {
      console.error('Erro ao obter tipo de plano:', error)
      return null
    }
  }
}

// Exportar instância singleton
export const checkoutService = CheckoutService.getInstance()



