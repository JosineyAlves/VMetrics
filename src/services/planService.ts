import { STRIPE_PRODUCTS } from '../config/stripe'

export interface UserPlan {
  id: string
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  planType: 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  features: string[]
  createdAt: Date
  updatedAt: Date
}

export interface PlanActivationResult {
  success: boolean
  message: string
  userPlan?: UserPlan
  error?: string
}

export class PlanService {
  private userPlans: Map<string, UserPlan> = new Map()

  /**
   * Ativa um plano para um usuário baseado no webhook do Stripe
   */
  async activateUserPlan(
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    planType: string,
    subscriptionData: any
  ): Promise<PlanActivationResult> {
    try {
      console.log(`🚀 [PLAN] Ativando plano ${planType} para customer ${stripeCustomerId}`)

      // 1. Validar tipo de plano
      if (!this.isValidPlanType(planType)) {
        throw new Error(`Tipo de plano inválido: ${planType}`)
      }

      // 2. Buscar ou criar usuário
      const userId = await this.findOrCreateUserId(stripeCustomerId)
      if (!userId) {
        throw new Error('Não foi possível identificar o usuário')
      }

      // 3. Verificar se já existe um plano ativo
      const existingPlan = await this.getUserActivePlan(userId)
      if (existingPlan) {
        console.log(`🔄 [PLAN] Usuário já possui plano ativo: ${existingPlan.planType}`)
        await this.updateExistingPlan(existingPlan.id, planType, subscriptionData)
      } else {
        console.log(`✨ [PLAN] Criando novo plano para usuário`)
        await this.createNewPlan(userId, stripeCustomerId, stripeSubscriptionId, planType, subscriptionData)
      }

      // 4. Ativar recursos do plano
      await this.activatePlanFeatures(userId, planType)

      // 5. Enviar confirmação
      await this.sendPlanActivationConfirmation(userId, planType)

      console.log(`✅ [PLAN] Plano ${planType} ativado com sucesso para usuário ${userId}`)

      return {
        success: true,
        message: `Plano ${planType} ativado com sucesso`,
        userPlan: await this.getUserActivePlan(userId)
      }

    } catch (error) {
      console.error(`❌ [PLAN] Erro ao ativar plano:`, error)
      return {
        success: false,
        message: 'Erro ao ativar plano',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Atualiza um plano existente
   */
  async updateUserPlan(
    stripeSubscriptionId: string,
    planType: string,
    subscriptionData: any
  ): Promise<PlanActivationResult> {
    try {
      console.log(`🔄 [PLAN] Atualizando plano para subscription ${stripeSubscriptionId}`)

      // 1. Buscar plano existente
      const existingPlan = await this.getPlanBySubscriptionId(stripeSubscriptionId)
      if (!existingPlan) {
        throw new Error('Plano não encontrado')
      }

      // 2. Atualizar dados do plano
      const updatedPlan = await this.updatePlanData(existingPlan.id, planType, subscriptionData)

      // 3. Atualizar recursos
      await this.updatePlanFeatures(existingPlan.userId, planType)

      console.log(`✅ [PLAN] Plano atualizado com sucesso`)

      return {
        success: true,
        message: 'Plano atualizado com sucesso',
        userPlan: updatedPlan
      }

    } catch (error) {
      console.error(`❌ [PLAN] Erro ao atualizar plano:`, error)
      return {
        success: false,
        message: 'Erro ao atualizar plano',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Cancela um plano de usuário
   */
  async cancelUserPlan(stripeSubscriptionId: string): Promise<PlanActivationResult> {
    try {
      console.log(`❌ [PLAN] Cancelando plano para subscription ${stripeSubscriptionId}`)

      // 1. Buscar plano existente
      const existingPlan = await this.getPlanBySubscriptionId(stripeSubscriptionId)
      if (!existingPlan) {
        throw new Error('Plano não encontrado')
      }

      // 2. Marcar como cancelado
      await this.markPlanAsCanceled(existingPlan.id)

      // 3. Desativar recursos premium
      await this.deactivatePremiumFeatures(existingPlan.userId)

      // 4. Enviar notificação de cancelamento
      await this.sendPlanCancellationNotification(existingPlan.userId)

      console.log(`✅ [PLAN] Plano cancelado com sucesso`)

      return {
        success: true,
        message: 'Plano cancelado com sucesso'
      }

    } catch (error) {
      console.error(`❌ [PLAN] Erro ao cancelar plano:`, error)
      return {
        success: false,
        message: 'Erro ao cancelar plano',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Busca plano ativo de um usuário
   */
  async getUserActivePlan(userId: string): Promise<UserPlan | null> {
    // TODO: Implementar busca no banco de dados
    // Por enquanto, retorna null
    return null
  }

  /**
   * Busca plano por ID de subscription do Stripe
   */
  async getPlanBySubscriptionId(stripeSubscriptionId: string): Promise<UserPlan | null> {
    // TODO: Implementar busca no banco de dados
    // Por enquanto, retorna null
    return null
  }

  // Métodos auxiliares privados
  private isValidPlanType(planType: string): boolean {
    return Object.keys(STRIPE_PRODUCTS).includes(planType)
  }

  private async findOrCreateUserId(stripeCustomerId: string): Promise<string | null> {
    // TODO: Implementar busca/criação de usuário no banco
    // Por enquanto, retorna um ID mock
    return `user_${Date.now()}`
  }

  private async createNewPlan(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    planType: string,
    subscriptionData: any
  ): Promise<void> {
    // TODO: Implementar criação no banco de dados
    console.log(`📝 [PLAN] Criando novo plano no banco de dados`)
  }

  private async updateExistingPlan(
    planId: string,
    planType: string,
    subscriptionData: any
  ): Promise<void> {
    // TODO: Implementar atualização no banco de dados
    console.log(`📝 [PLAN] Atualizando plano existente no banco de dados`)
  }

  private async updatePlanData(
    planId: string,
    planType: string,
    subscriptionData: any
  ): Promise<UserPlan> {
    // TODO: Implementar atualização no banco de dados
    console.log(`📝 [PLAN] Atualizando dados do plano no banco de dados`)
    
    // Mock de retorno
    return {
      id: planId,
      userId: 'mock_user_id',
      stripeCustomerId: 'mock_customer_id',
      stripeSubscriptionId: 'mock_subscription_id',
      planType: planType as 'starter' | 'pro' | 'enterprise',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      features: STRIPE_PRODUCTS[planType as keyof typeof STRIPE_PRODUCTS]?.features || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  private async markPlanAsCanceled(planId: string): Promise<void> {
    // TODO: Implementar marcação como cancelado no banco
    console.log(`📝 [PLAN] Marcando plano como cancelado no banco de dados`)
  }

  private async activatePlanFeatures(userId: string, planType: string): Promise<void> {
    const plan = STRIPE_PRODUCTS[planType as keyof typeof STRIPE_PRODUCTS]
    if (!plan) return

    console.log(`🚀 [PLAN] Ativando recursos para plano ${planType}:`, plan.features)
    
    // TODO: Implementar ativação de recursos específicos
    // - Limites de campanhas
    // - Recursos premium
    // - Permissões especiais
  }

  private async updatePlanFeatures(userId: string, planType: string): Promise<void> {
    console.log(`🔄 [PLAN] Atualizando recursos para plano ${planType}`)
    
    // TODO: Implementar atualização de recursos
    // - Remover recursos antigos
    // - Adicionar novos recursos
  }

  private async deactivatePremiumFeatures(userId: string): Promise<void> {
    console.log(`🔒 [PLAN] Desativando recursos premium para usuário ${userId}`)
    
    // TODO: Implementar desativação de recursos premium
    // - Limitar campanhas
    // - Remover permissões especiais
    // - Manter acesso básico até fim do período
  }

  private async sendPlanActivationConfirmation(userId: string, planType: string): Promise<void> {
    console.log(`📧 [PLAN] Enviando confirmação de ativação para usuário ${userId}`)
    
    // TODO: Implementar envio de email
    // - Template de boas-vindas
    // - Detalhes do plano
    // - Próximos passos
  }

  private async sendPlanCancellationNotification(userId: string): Promise<void> {
    console.log(`📧 [PLAN] Enviando notificação de cancelamento para usuário ${userId}`)
    
    // TODO: Implementar envio de email
    // - Confirmação de cancelamento
    // - Data de término do acesso
    // - Opções de reativação
  }
}

export const planService = new PlanService()
