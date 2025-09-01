import { stripeService } from './stripe'
import { STRIPE_CONFIG } from '../config/stripe'
import { planService } from './planService'

// Tipos para eventos do webhook
export interface WebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

export interface CheckoutSession {
  id: string
  customer: string
  subscription?: string
  metadata?: Record<string, string>
}

export interface Subscription {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  trial_end?: number
  items: {
    data: Array<{
      price: {
        id: string
        product: string
      }
      quantity: number
    }>
  }
  metadata?: Record<string, string>
}

export interface Invoice {
  id: string
  customer: string
  subscription?: string
  amount_paid: number
  amount_due: number
  currency: string
  status: string
  created: number
  due_date?: number
  hosted_invoice_url?: string
  invoice_pdf?: string
  metadata?: Record<string, string>
}

export interface Customer {
  id: string
  email: string
  name?: string
  metadata?: Record<string, string>
}

// Classe para gerenciar webhooks
export class WebhookService {
  
  /**
   * Processar evento de webhook
   */
  async processEvent(event: WebhookEvent): Promise<void> {
    try {
      console.log(`🔄 Processando webhook: ${event.type}`)
      
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as CheckoutSession)
          break
          
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Subscription)
          break
          
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Subscription)
          break
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object as Subscription)
          break
          
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Invoice)
          break
          
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Invoice)
          break
          
        case 'customer.created':
          await this.handleCustomerCreated(event.data.object as Customer)
          break
          
        case 'customer.updated':
          await this.handleCustomerUpdated(event.data.object as Customer)
          break
          
        default:
          console.log(`ℹ️ Evento não tratado: ${event.type}`)
      }
    } catch (error) {
      console.error(`❌ Erro ao processar webhook ${event.type}:`, error)
      throw error
    }
  }

  /**
   * Handler para checkout concluído
   */
  private async handleCheckoutCompleted(session: CheckoutSession): Promise<void> {
    console.log('✅ [WEBHOOK] Checkout completado:', session.id)
    
    try {
      // Extrair informações da sessão
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string
      
      if (!customerId || !subscriptionId) {
        console.warn('⚠️ [WEBHOOK] Sessão sem customer ou subscription ID')
        return
      }

      // Buscar detalhes da assinatura
      const subscription = await stripeService.getSubscription(subscriptionId)
      if (!subscription) {
        console.error('❌ [WEBHOOK] Assinatura não encontrada:', subscriptionId)
        return
      }

      // Identificar tipo de plano
      const priceId = subscription.items.data[0]?.price.id
      const planType = this.getPlanTypeFromPriceId(priceId)
      
      if (!planType) {
        console.error('❌ [WEBHOOK] Tipo de plano não identificado para price:', priceId)
        return
      }

      // Ativar plano no sistema
      const result = await planService.activateUserPlan(
        customerId,
        subscriptionId,
        planType,
        subscription
      )

      if (result.success) {
        console.log('✅ [WEBHOOK] Plano ativado com sucesso:', result.message)
      } else {
        console.error('❌ [WEBHOOK] Erro ao ativar plano:', result.error)
      }

        } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao processar checkout:', error)
    }
  }
    }
  }

  /**
   * Handler para assinatura criada
   */
  private async handleSubscriptionCreated(subscription: Subscription): Promise<void> {
    console.log('🚀 [WEBHOOK] Nova assinatura criada:', subscription.id)
    
    try {
      const customerId = subscription.customer as string
      const priceId = subscription.items.data[0]?.price.id
      const planType = this.getPlanTypeFromPriceId(priceId)
      
      if (!planType) {
        console.error('❌ [WEBHOOK] Tipo de plano não identificado para price:', priceId)
        return
      }

      // Ativar plano no sistema
      const result = await planService.activateUserPlan(
        customerId,
        subscription.id,
        planType,
        subscription
      )

      if (result.success) {
        console.log('✅ [WEBHOOK] Assinatura ativada com sucesso:', result.message)
      } else {
        console.error('❌ [WEBHOOK] Erro ao ativar assinatura:', result.error)
      }

    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao processar nova assinatura:', error)
    }
  }

  /**
   * Handler para assinatura atualizada
   */
  private async handleSubscriptionUpdated(subscription: Subscription): Promise<void> {
    console.log('🔄 [WEBHOOK] Assinatura atualizada:', subscription.id)
    
    try {
      const priceId = subscription.items.data[0]?.price.id
      const planType = this.getPlanTypeFromPriceId(priceId)
      
      if (!planType) {
        console.error('❌ [WEBHOOK] Tipo de plano não identificado para price:', priceId)
        return
      }

      // Atualizar plano no sistema
      const result = await planService.updateUserPlan(
        subscription.id,
        planType,
        subscription
      )

      if (result.success) {
        console.log('✅ [WEBHOOK] Plano atualizado com sucesso:', result.message)
      } else {
        console.error('❌ [WEBHOOK] Erro ao atualizar plano:', result.error)
      }

    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao processar assinatura atualizada:', error)
    }
  }

  /**
   * Handler para assinatura cancelada
   */
  private async handleSubscriptionCanceled(subscription: Subscription): Promise<void> {
    console.log('❌ [WEBHOOK] Assinatura cancelada:', subscription.id)
    
    try {
      // Cancelar plano no sistema
      const result = await planService.cancelUserPlan(subscription.id)

      if (result.success) {
        console.log('✅ [WEBHOOK] Plano cancelado com sucesso:', result.message)
      } else {
        console.error('❌ [WEBHOOK] Erro ao cancelar plano:', result.error)
      }

    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao processar assinatura cancelada:', error)
    }
  }

  /**
   * Handler para pagamento realizado
   */
  private async handlePaymentSucceeded(invoice: Invoice): Promise<void> {
    console.log('✅ Pagamento realizado:', invoice.id)
    
    try {
      // Buscar informações do cliente
      const customer = await stripeService.getCustomer(invoice.customer)
      
      // TODO: Implementar lógica de negócio
      // - Confirmar renovação de assinatura
      // - Enviar recibo por email
      // - Atualizar métricas de receita
      
      console.log('✅ Pagamento processado para:', customer.email)
      
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error)
      throw error
    }
  }

  /**
   * Handler para pagamento falhou
   */
  private async handlePaymentFailed(invoice: Invoice): Promise<void> {
    console.log('❌ Pagamento falhou:', invoice.id)
    
    try {
      // Buscar informações do cliente
      const customer = await stripeService.getCustomer(invoice.customer)
      
      // TODO: Implementar lógica de negócio
      // - Enviar email de falha de pagamento
      // - Iniciar processo de recuperação
      // - Atualizar status da assinatura
      
      console.log('✅ Falha de pagamento processada para:', customer.email)
      
    } catch (error) {
      console.error('❌ Erro ao processar falha de pagamento:', error)
      throw error
    }
  }

  /**
   * Handler para cliente criado
   */
  private async handleCustomerCreated(customer: Customer): Promise<void> {
    console.log('✅ Cliente criado:', customer.id)
    
    try {
      // TODO: Implementar lógica de negócio
      // - Criar conta no sistema
      // - Enviar email de boas-vindas
      // - Configurar trial se aplicável
      
      console.log('✅ Cliente processado:', customer.email)
      
    } catch (error) {
      console.error('❌ Erro ao processar cliente criado:', error)
      throw error
    }
  }

  /**
   * Handler para cliente atualizado
   */
  private async handleCustomerUpdated(customer: Customer): Promise<void> {
    console.log('🔄 Cliente atualizado:', customer.id)
    
    try {
      // TODO: Implementar lógica de negócio
      // - Sincronizar informações
      // - Atualizar perfil do usuário
      // - Registrar mudanças
      
      console.log('✅ Cliente atualizado:', customer.email)
      
    } catch (error) {
      console.error('❌ Erro ao processar cliente atualizado:', error)
      throw error
    }
  }

  /**
   * Verificar se o webhook está configurado
   */
  isWebhookConfigured(): boolean {
    return !!STRIPE_CONFIG.webhookSecret
  }

  /**
   * Obter eventos suportados
   */
  getSupportedEvents(): string[] {
    return STRIPE_CONFIG.webhookEvents
  }

  /**
   * Identificar tipo de plano baseado no ID do preço
   */
  private getPlanTypeFromPriceId(priceId: string): string | null {
    if (!priceId) return null

    // Mapear IDs de preço para tipos de plano
    const priceToPlanMap: Record<string, string> = {
      'price_1Rv5d9L6dVrVagX4T9MjZETw': 'starter',  // R$ 29,90
      'price_1Rv5diL6dVrVagX4RVadte0b': 'pro'       // R$ 79,90
    }

    return priceToPlanMap[priceId] || null
  }
}

// Instância singleton do serviço
export const webhookService = new WebhookService()

export default webhookService

import { sendWelcomeEmail } from './emailService'
        // Enviar email de boas-vindas após checkout
        await this.sendWelcomeEmailAfterCheckout(session)
