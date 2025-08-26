import { supabase } from '../lib/supabase'
import { STRIPE_PRODUCTS } from '../config/stripe'

export interface StripeSubscription {
  subscription_id: string
  customer_id: string
  subscription_status: string
  current_period_start: string
  current_period_end: string
  currency: string
  created_at: string
  customer_email: string
  customer_name: string
  product_name: string
  price_amount: number
  price_currency: string
  billing_interval: string
}

export interface StripeCheckout {
  session_id: string
  customer_id: string
  subscription_id: string
  payment_status: string
  created_at: string
  customer_email: string
  customer_name: string
}

export interface StripeInvoice {
  invoice_id: string
  customer_id: string
  subscription_id: string
  invoice_status: string
  amount: number
  currency: string
  period_start: string
  period_end: string
  created_at: string
  customer_email: string
}

export class StripeWrapperService {
  
  /**
   * Buscar assinatura ativa de um usuário por email
   */
  async getUserSubscription(email: string): Promise<StripeSubscription | null> {
    try {
      console.log(`🔍 [WRAPPER] Buscando assinatura para: ${email}`)
      
      const { data, error } = await supabase
        .rpc('get_user_subscription', { user_email: email })
      
      if (error) {
        console.error('❌ [WRAPPER] Erro ao buscar assinatura:', error)
        return null
      }
      
      if (data && data.length > 0) {
        const subscription = data[0]
        console.log(`✅ [WRAPPER] Assinatura encontrada: ${subscription.plan_type}`)
        return this.mapToStripeSubscription(subscription)
      }
      
      console.log(`ℹ️ [WRAPPER] Nenhuma assinatura ativa encontrada para: ${email}`)
      return null
      
    } catch (error) {
      console.error('❌ [WRAPPER] Erro ao buscar assinatura:', error)
      return null
    }
  }

  /**
   * Buscar todas as assinaturas ativas
   */
  async getAllActiveSubscriptions(): Promise<StripeSubscription[]> {
    try {
      console.log(`🔍 [WRAPPER] Buscando todas as assinaturas ativas`)
      
      const { data, error } = await supabase
        .from('vmetrics_subscriptions')
        .select('*')
        .eq('subscription_status', 'active')
      
      if (error) {
        console.error('❌ [WRAPPER] Erro ao buscar assinaturas:', error)
        return []
      }
      
      console.log(`✅ [WRAPPER] ${data?.length || 0} assinaturas encontradas`)
      return data?.map(this.mapToStripeSubscription) || []
      
    } catch (error) {
      console.error('❌ [WRAPPER] Erro ao buscar assinaturas:', error)
      return []
    }
  }

  /**
   * Buscar checkout de um usuário específico
   */
  async getUserCheckout(email: string): Promise<StripeCheckout | null> {
    try {
      console.log(`🔍 [WRAPPER] Buscando checkout para: ${email}`)
      
      const { data, error } = await supabase
        .from('vmetrics_checkouts')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null
        }
        console.error('❌ [WRAPPER] Erro ao buscar checkout:', error)
        return null
      }
      
      console.log(`✅ [WRAPPER] Checkout encontrado: ${data.session_id}`)
      return this.mapToStripeCheckout(data)
      
    } catch (error) {
      console.error('❌ [WRAPPER] Erro ao buscar checkout:', error)
      return null
    }
  }

  /**
   * Buscar faturas de um usuário
   */
  async getUserInvoices(email: string): Promise<StripeInvoice[]> {
    try {
      console.log(`🔍 [WRAPPER] Buscando faturas para: ${email}`)
      
      const { data, error } = await supabase
        .from('vmetrics_invoices')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ [WRAPPER] Erro ao buscar faturas:', error)
        return []
      }
      
      console.log(`✅ [WRAPPER] ${data?.length || 0} faturas encontradas`)
      return data?.map(this.mapToStripeInvoice) || []
      
    } catch (error) {
      console.error('❌ [WRAPPER] Erro ao buscar faturas:', error)
      return []
    }
  }

  /**
   * Verificar se usuário tem plano ativo
   */
  async hasActivePlan(email: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(email)
      return subscription !== null && subscription.subscription_status === 'active'
    } catch (error) {
      console.error('❌ [WRAPPER] Erro ao verificar plano:', error)
      return false
    }
  }

  /**
   * Buscar dados de receita (para relatórios)
   */
  async getRevenueData(period: 'month' | 'year' = 'month'): Promise<{
    total_revenue: number
    subscription_count: number
    currency: string
  }> {
    try {
      console.log(`🔍 [WRAPPER] Buscando dados de receita para período: ${period}`)
      
      let dateFilter: string
      if (period === 'month') {
        dateFilter = `created_at >= NOW() - INTERVAL '1 month'`
      } else {
        dateFilter = `created_at >= NOW() - INTERVAL '1 year'`
      }
      
      const { data, error } = await supabase
        .from('vmetrics_subscriptions')
        .select('price_amount, price_currency')
        .eq('subscription_status', 'active')
        .filter('created_at', 'gte', dateFilter)
      
      if (error) {
        console.error('❌ [WRAPPER] Erro ao buscar dados de receita:', error)
        return { total_revenue: 0, subscription_count: 0, currency: 'BRL' }
      }
      
      const totalRevenue = data?.reduce((sum, item) => sum + (item.price_amount || 0), 0) || 0
      const subscriptionCount = data?.length || 0
      const currency = data?.[0]?.price_currency || 'BRL'
      
      console.log(`✅ [WRAPPER] Receita total: ${totalRevenue} ${currency}`)
      
      return {
        total_revenue: totalRevenue,
        subscription_count: subscriptionCount,
        currency
      }
      
    } catch (error) {
      console.error('❌ [WRAPPER] Erro ao buscar dados de receita:', error)
      return { total_revenue: 0, subscription_count: 0, currency: 'BRL' }
    }
  }

  /**
   * Sincronizar dados do Stripe com o banco local
   */
  async syncStripeData(): Promise<{
    success: boolean
    message: string
    synced_count: number
  }> {
    try {
      console.log(`🔄 [WRAPPER] Iniciando sincronização de dados do Stripe`)
      
      // Buscar todas as assinaturas ativas
      const subscriptions = await this.getAllActiveSubscriptions()
      
      let syncedCount = 0
      
      for (const subscription of subscriptions) {
        try {
          // Verificar se usuário existe
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', subscription.customer_id)
            .single()
          
          if (!existingUser) {
            // Criar usuário se não existir
            const { data: newUser, error: userError } = await supabase
              .from('users')
              .insert({
                email: subscription.customer_email,
                full_name: subscription.customer_name || 'Usuário VMetrics',
                stripe_customer_id: subscription.customer_id,
                is_active: true
              })
              .select('id')
              .single()
            
            if (userError) {
              console.error(`❌ [WRAPPER] Erro ao criar usuário:`, userError)
              continue
            }
            
            console.log(`✅ [WRAPPER] Usuário criado: ${newUser.id}`)
          }
          
          // Sincronizar plano
          const { error: planError } = await supabase
            .from('user_plans')
            .upsert({
              stripe_subscription_id: subscription.subscription_id,
              stripe_customer_id: subscription.customer_id,
              plan_type: this.getPlanTypeFromProduct(subscription.product_name),
              status: subscription.subscription_status,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end
            }, {
              onConflict: 'stripe_subscription_id'
            })
          
          if (planError) {
            console.error(`❌ [WRAPPER] Erro ao sincronizar plano:`, planError)
            continue
          }
          
          syncedCount++
          console.log(`✅ [WRAPPER] Plano sincronizado: ${subscription.subscription_id}`)
          
        } catch (error) {
          console.error(`❌ [WRAPPER] Erro ao processar assinatura ${subscription.subscription_id}:`, error)
        }
      }
      
      console.log(`✅ [WRAPPER] Sincronização concluída: ${syncedCount} itens processados`)
      
      return {
        success: true,
        message: `Sincronização concluída com sucesso`,
        synced_count: syncedCount
      }
      
    } catch (error) {
      console.error('❌ [WRAPPER] Erro na sincronização:', error)
      return {
        success: false,
        message: 'Erro na sincronização',
        synced_count: 0
      }
    }
  }

  // Métodos auxiliares privados
  private mapToStripeSubscription(data: any): StripeSubscription {
    return {
      subscription_id: data.subscription_id || data.id,
      customer_id: data.customer_id || data.customer,
      subscription_status: data.subscription_status || data.status,
      current_period_start: data.current_period_start,
      current_period_end: data.current_period_end,
      currency: data.currency,
      created_at: data.created_at,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      product_name: data.product_name,
      price_amount: data.price_amount || 0,
      price_currency: data.price_currency || 'BRL',
      billing_interval: data.billing_interval || 'month'
    }
  }

  private mapToStripeCheckout(data: any): StripeCheckout {
    return {
      session_id: data.session_id || data.id,
      customer_id: data.customer_id || data.customer,
      subscription_id: data.subscription_id || data.subscription,
      payment_status: data.payment_status,
      created_at: data.created_at,
      customer_email: data.customer_email,
      customer_name: data.customer_name
    }
  }

  private mapToStripeInvoice(data: any): StripeInvoice {
    return {
      invoice_id: data.invoice_id || data.id,
      customer_id: data.customer_id || data.customer,
      subscription_id: data.subscription_id || data.subscription,
      invoice_status: data.invoice_status || data.status,
      amount: data.amount || 0,
      currency: data.currency,
      period_start: data.period_start,
      period_end: data.period_end,
      created_at: data.created_at,
      customer_email: data.customer_email
    }
  }

  private getPlanTypeFromProduct(productName: string): string {
    const name = productName.toLowerCase()
    if (name.includes('starter')) return 'starter'
    if (name.includes('pro')) return 'pro'
    if (name.includes('enterprise')) return 'enterprise'
    return 'starter'
  }

  /**
   * Verificar se o Stripe Wrapper está configurado
   */
  async isWrapperConfigured(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('vmetrics_subscriptions')
        .select('subscription_id')
        .limit(1)
      
      return !error && data !== null
    } catch (error) {
      return false
    }
  }
}

// Instância singleton do serviço
export const stripeWrapperService = new StripeWrapperService()

export default stripeWrapperService

