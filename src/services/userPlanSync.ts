import { stripeService } from './stripe'
import { planService } from './planService'

export interface UserPlanStatus {
  name: string
  price: string
  period: string
  features: string[]
  status: 'active' | 'inactive' | 'loading' | 'error'
  nextBilling: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export class UserPlanSyncService {
  /**
   * Sincroniza o plano atual do usuário com o Stripe
   */
  async syncUserPlan(userId: string): Promise<UserPlanStatus> {
    try {
      console.log(`🔄 [SYNC] Sincronizando plano para usuário: ${userId}`)

      // 1. Buscar plano ativo no sistema
      const currentPlan = await planService.getUserActivePlan(userId)
      
      if (currentPlan && currentPlan.status === 'active') {
        console.log(`✅ [SYNC] Plano ativo encontrado: ${currentPlan.planType}`)
        return this.formatPlanStatus(currentPlan)
      }

      // 2. Se não há plano ativo, verificar se há assinatura no Stripe
      // TODO: Implementar busca por email do usuário no Stripe
      console.log(`ℹ️ [SYNC] Nenhum plano ativo encontrado, verificando Stripe...`)
      
      // Por enquanto, retorna status de usuário sem plano
      return {
        name: 'Nenhum plano ativo',
        price: 'Gratuito',
        period: 'mês',
        features: ['Acesso básico'],
        status: 'inactive',
        nextBilling: 'N/A'
      }

    } catch (error) {
      console.error(`❌ [SYNC] Erro ao sincronizar plano:`, error)
      return {
        name: 'Erro ao carregar',
        price: 'Erro',
        period: 'mês',
        features: ['Erro ao carregar recursos'],
        status: 'error',
        nextBilling: 'Erro'
      }
    }
  }

  /**
   * Busca plano por email do usuário no Stripe
   */
  async findPlanByEmail(email: string): Promise<UserPlanStatus | null> {
    try {
      console.log(`🔍 [SYNC] Buscando plano por email: ${email}`)

      // 1. Buscar cliente no Stripe por email
      const customers = await stripeService.searchCustomers(email)
      
      if (!customers || customers.length === 0) {
        console.log(`ℹ️ [SYNC] Nenhum cliente encontrado para email: ${email}`)
        return null
      }

      const customer = customers[0]
      console.log(`✅ [SYNC] Cliente encontrado: ${customer.id}`)

      // 2. Buscar assinaturas ativas do cliente
      const subscriptions = await stripeService.getCustomerSubscriptions(customer.id)
      
      if (!subscriptions || subscriptions.length === 0) {
        console.log(`ℹ️ [SYNC] Nenhuma assinatura ativa para cliente: ${customer.id}`)
        return null
      }

      const subscription = subscriptions[0]
      console.log(`✅ [SYNC] Assinatura ativa encontrada: ${subscription.id}`)

      // 3. Identificar tipo de plano
      const priceId = subscription.items.data[0]?.price.id
      const planType = this.getPlanTypeFromPriceId(priceId)
      
      if (!planType) {
        console.error(`❌ [SYNC] Tipo de plano não identificado para price: ${priceId}`)
        return null
      }

      // 4. Retornar status do plano
      return {
        name: this.getPlanName(planType),
        price: this.getPlanPrice(planType),
        period: 'mês',
        features: this.getPlanFeatures(planType),
        status: 'active',
        nextBilling: new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR'),
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id
      }

    } catch (error) {
      console.error(`❌ [SYNC] Erro ao buscar plano por email:`, error)
      return null
    }
  }

  /**
   * Atualiza o plano do usuário após receber webhook
   */
  async updateUserPlanFromWebhook(
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    planType: string
  ): Promise<void> {
    try {
      console.log(`🔄 [SYNC] Atualizando plano do usuário via webhook`)
      
      // 1. Buscar ou criar usuário
      const userId = await this.findOrCreateUserId(stripeCustomerId)
      if (!userId) {
        throw new Error('Não foi possível identificar o usuário')
      }

      // 2. Ativar plano no sistema
      const result = await planService.activateUserPlan(
        stripeCustomerId,
        stripeSubscriptionId,
        planType,
        { status: 'active' }
      )

      if (result.success) {
        console.log(`✅ [SYNC] Plano atualizado com sucesso: ${result.message}`)
      } else {
        console.error(`❌ [SYNC] Erro ao atualizar plano: ${result.error}`)
      }

    } catch (error) {
      console.error(`❌ [SYNC] Erro ao atualizar plano via webhook:`, error)
    }
  }

  // Métodos auxiliares privados
  private formatPlanStatus(plan: any): UserPlanStatus {
    return {
      name: plan.name || 'Plano Ativo',
      price: plan.price || 'Preço não disponível',
      period: plan.period || 'mês',
      features: plan.features || [],
      status: plan.status || 'active',
      nextBilling: plan.nextBilling || 'N/A',
      stripeCustomerId: plan.stripeCustomerId,
      stripeSubscriptionId: plan.stripeSubscriptionId
    }
  }

  private getPlanTypeFromPriceId(priceId: string): string | null {
    if (!priceId) return null

    const priceToPlanMap: Record<string, string> = {
      'price_1Rv5d9L6dVrVagX4T9MjZETw': 'starter',  // R$ 29,90
      'price_1Rv5diL6dVrVagX4RVadte0b': 'pro'       // R$ 79,90
    }

    return priceToPlanMap[priceId] || null
  }

  private getPlanName(planType: string): string {
    const planNames: Record<string, string> = {
      'starter': 'Plano Starter',
      'pro': 'Plano Pro',
      'enterprise': 'Plano Enterprise'
    }
    return planNames[planType] || 'Plano Desconhecido'
  }

  private getPlanPrice(planType: string): string {
    const planPrices: Record<string, string> = {
      'starter': 'R$ 29,90',
      'pro': 'R$ 79,90',
      'enterprise': 'Sob consulta'
    }
    return planPrices[planType] || 'Preço não disponível'
  }

  private getPlanFeatures(planType: string): string[] {
    const planFeatures: Record<string, string[]> = {
      'starter': ['Até 5 campanhas', 'Relatórios básicos', 'Suporte por email'],
      'pro': ['Campanhas ilimitadas', 'Relatórios avançados', 'Suporte prioritário', 'Integrações'],
      'enterprise': ['Tudo do Pro', 'Suporte 24/7', 'SLA garantido', 'Integrações customizadas']
    }
    return planFeatures[planType] || ['Recursos básicos']
  }

  private async findOrCreateUserId(stripeCustomerId: string): Promise<string | null> {
    // TODO: Implementar busca/criação de usuário no banco
    // Por enquanto, retorna um ID mock
    return `user_${Date.now()}`
  }
}

export const userPlanSyncService = new UserPlanSyncService()

