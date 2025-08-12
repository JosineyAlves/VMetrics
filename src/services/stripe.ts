import Stripe from 'stripe'
import { STRIPE_CONFIG, validateStripeConfig } from '../config/stripe'

// Inicializar cliente Stripe
const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2023-10-16', // Versão mais recente da API
  typescript: true
})

// Validação da configuração
if (!validateStripeConfig()) {
  console.warn('⚠️ Stripe não configurado corretamente. Algumas funcionalidades podem não funcionar.')
}

export class StripeService {
  private stripe: Stripe

  constructor() {
    this.stripe = stripe
  }

  // ===== CUSTOMERS =====
  
  /**
   * Criar um novo cliente no Stripe
   */
  async createCustomer(data: {
    email: string
    name?: string
    metadata?: Record<string, string>
  }): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: data.metadata,
        description: `Cliente VMetrics - ${data.email}`
      })

      console.log('✅ Cliente Stripe criado:', customer.id)
      return customer
    } catch (error) {
      console.error('❌ Erro ao criar cliente Stripe:', error)
      throw error
    }
  }

  /**
   * Buscar cliente por ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.retrieve(customerId) as Stripe.Customer
    } catch (error) {
      console.error('❌ Erro ao buscar cliente Stripe:', error)
      throw error
    }
  }

  /**
   * Buscar cliente por email
   */
  async getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    try {
      const customers = await this.stripe.customers.list({
        email: email,
        limit: 1
      })

      return customers.data[0] || null
    } catch (error) {
      console.error('❌ Erro ao buscar cliente por email:', error)
      throw error
    }
  }

  /**
   * Atualizar cliente
   */
  async updateCustomer(customerId: string, data: Partial<Stripe.CustomerUpdateParams>): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.update(customerId, data)
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente Stripe:', error)
      throw error
    }
  }

  // ===== PRODUCTS =====
  
  /**
   * Criar produto no Stripe
   */
  async createProduct(data: {
    name: string
    description?: string
    metadata?: Record<string, string>
  }): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create({
        name: data.name,
        description: data.description,
        metadata: data.metadata,
        active: true
      })

      console.log('✅ Produto Stripe criado:', product.id)
      return product
    } catch (error) {
      console.error('❌ Erro ao criar produto Stripe:', error)
      throw error
    }
  }

  /**
   * Criar preço para um produto
   */
  async createPrice(data: {
    productId: string
    amount: number
    currency: string
    interval: 'month' | 'year'
    metadata?: Record<string, string>
  }): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create({
        product: data.productId,
        unit_amount: data.amount,
        currency: data.currency,
        recurring: {
          interval: data.interval
        },
        metadata: data.metadata,
        active: true
      })

      console.log('✅ Preço Stripe criado:', price.id)
      return price
    } catch (error) {
      console.error('❌ Erro ao criar preço Stripe:', error)
      throw error
    }
  }

  /**
   * Listar todos os produtos
   */
  async listProducts(): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.list({
        active: true,
        limit: 100
      })

      return products.data
    } catch (error) {
      console.error('❌ Erro ao listar produtos Stripe:', error)
      throw error
    }
  }

  /**
   * Listar preços de um produto
   */
  async listPrices(productId: string): Promise<Stripe.Price[]> {
    try {
      const prices = await this.stripe.prices.list({
        product: productId,
        active: true
      })

      return prices.data
    } catch (error) {
      console.error('❌ Erro ao listar preços Stripe:', error)
      throw error
    }
  }

  // ===== SUBSCRIPTIONS =====
  
  /**
   * Criar assinatura
   */
  async createSubscription(data: {
    customerId: string
    priceId: string
    trialPeriodDays?: number
    metadata?: Record<string, string>
  }): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        trial_period_days: data.trialPeriodDays || STRIPE_CONFIG.trialPeriodDays,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: data.metadata
      })

      console.log('✅ Assinatura Stripe criada:', subscription.id)
      return subscription
    } catch (error) {
      console.error('❌ Erro ao criar assinatura Stripe:', error)
      throw error
    }
  }

  /**
   * Buscar assinatura por ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId)
    } catch (error) {
      console.error('❌ Erro ao buscar assinatura Stripe:', error)
      throw error
    }
  }

  /**
   * Listar assinaturas de um cliente
   */
  async listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        limit: 100
      })

      return subscriptions.data
    } catch (error) {
      console.error('❌ Erro ao listar assinaturas do cliente:', error)
      throw error
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
    try {
      if (cancelAtPeriodEnd) {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        })
      } else {
        return await this.stripe.subscriptions.cancel(subscriptionId)
      }
    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura Stripe:', error)
      throw error
    }
  }

  // ===== CHECKOUT =====
  
  /**
   * Criar sessão de checkout
   */
  async createCheckoutSession(data: {
    customerId: string
    priceId: string
    successUrl?: string
    cancelUrl?: string
    metadata?: Record<string, string>
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: data.customerId,
        payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
        line_items: [{
          price: data.priceId,
          quantity: 1
        }],
        mode: STRIPE_CONFIG.checkoutMode,
        success_url: data.successUrl || STRIPE_CONFIG.successUrl,
        cancel_url: data.cancelUrl || STRIPE_CONFIG.cancelUrl,
        metadata: data.metadata,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        }
      })

      console.log('✅ Sessão de checkout criada:', session.id)
      return session
    } catch (error) {
      console.error('❌ Erro ao criar sessão de checkout:', error)
      throw error
    }
  }

  // ===== CUSTOMER PORTAL =====
  
  /**
   * Criar sessão do portal do cliente
   */
  async createPortalSession(data: {
    customerId: string
    returnUrl?: string
  }): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: data.customerId,
        return_url: data.returnUrl || STRIPE_CONFIG.portalReturnUrl
      })

      console.log('✅ Sessão do portal criada:', session.id)
      return session
    } catch (error) {
      console.error('❌ Erro ao criar sessão do portal:', error)
      throw error
    }
  }

  // ===== INVOICES =====
  
  /**
   * Listar faturas de um cliente
   */
  async listCustomerInvoices(customerId: string): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit: 100
      })

      return invoices.data
    } catch (error) {
      console.error('❌ Erro ao listar faturas do cliente:', error)
      throw error
    }
  }

  // ===== UTILITIES =====
  
  /**
   * Verificar se o Stripe está configurado
   */
  isConfigured(): boolean {
    return validateStripeConfig()
  }

  /**
   * Obter configuração atual
   */
  getConfig() {
    return STRIPE_CONFIG
  }
}

// Instância singleton do serviço
export const stripeService = new StripeService()

export default stripeService
