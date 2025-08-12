import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { stripeService } from '../services/stripe'
import { STRIPE_PRODUCTS } from '../config/stripe'

// Tipos para os dados do Stripe
export interface StripeProduct {
  id: string
  name: string
  description: string
  features: string[]
  stripeIds: {
    product: string | null
    prices: {
      monthly?: string | null
      yearly?: string | null
      custom?: string | null
    }
  }
  prices: {
    monthly?: StripePrice
    yearly?: StripePrice
    custom?: StripePrice
  }
  metadata?: Record<string, string>
}

export interface StripePrice {
  id: string
  amount: number
  currency: string
  interval: 'month' | 'year' | 'custom'
  metadata?: Record<string, string>
}

export interface StripeSubscription {
  id: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  trial_end?: number
  product: StripeProduct
  price: StripePrice
  metadata?: Record<string, string>
}

export interface StripeInvoice {
  id: string
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

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  metadata?: Record<string, string>
}

// Estado do store
interface StripeState {
  // Estado de carregamento
  loading: boolean
  error: string | null
  
  // Dados do Stripe
  products: StripeProduct[]
  prices: StripePrice[]
  subscriptions: StripeSubscription[]
  invoices: StripeInvoice[]
  customer: StripeCustomer | null
  
  // Estado de checkout
  checkoutLoading: boolean
  checkoutError: string | null
  
  // Estado do portal
  portalLoading: boolean
  portalError: string | null
  
  // Ações
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Produtos e preços
  loadProducts: () => Promise<void>
  setProducts: (products: StripeProduct[]) => void
  
  // Assinaturas
  loadSubscriptions: (customerId: string) => Promise<void>
  setSubscriptions: (subscriptions: StripeSubscription[]) => void
  
  // Faturas
  loadInvoices: (customerId: string) => Promise<void>
  setInvoices: (invoices: StripeInvoice[]) => void
  
  // Cliente
  setCustomer: (customer: StripeCustomer | null) => void
  
  // Checkout
  setCheckoutLoading: (loading: boolean) => void
  setCheckoutError: (error: string | null) => void
  
  // Portal
  setPortalLoading: (loading: boolean) => void
  setPortalError: (error: string | null) => void
  
  // Reset
  reset: () => void
}

// Estado inicial
const initialState = {
  loading: false,
  error: null,
  products: [],
  prices: [],
  subscriptions: [],
  invoices: [],
  customer: null,
  checkoutLoading: false,
  checkoutError: null,
  portalLoading: false,
  portalError: null
}

// Store principal
export const useStripeStore = create<StripeState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Setters básicos
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),
        
        // Produtos e preços
        loadProducts: async () => {
          try {
            set({ loading: true, error: null })
            
            // Usar produtos configurados com IDs reais do Stripe
            const configuredProducts: StripeProduct[] = [
              {
                id: 'prod_starter',
                name: STRIPE_PRODUCTS.starter.name,
                description: STRIPE_PRODUCTS.starter.description,
                features: STRIPE_PRODUCTS.starter.features,
                stripeIds: STRIPE_PRODUCTS.starter.stripeIds,
                prices: {
                  monthly: {
                    id: STRIPE_PRODUCTS.starter.stripeIds.prices.monthly || 'price_starter_monthly',
                    amount: STRIPE_PRODUCTS.starter.prices.monthly.amount,
                    currency: STRIPE_PRODUCTS.starter.prices.monthly.currency,
                    interval: 'month' as const
                  },
                  yearly: {
                    id: STRIPE_PRODUCTS.starter.stripeIds.prices.yearly || 'price_starter_yearly',
                    amount: STRIPE_PRODUCTS.starter.prices.yearly.amount,
                    currency: STRIPE_PRODUCTS.starter.prices.yearly.currency,
                    interval: 'year' as const
                  }
                }
              },
              {
                id: 'prod_pro',
                name: STRIPE_PRODUCTS.pro.name,
                description: STRIPE_PRODUCTS.pro.description,
                features: STRIPE_PRODUCTS.pro.features,
                stripeIds: STRIPE_PRODUCTS.pro.stripeIds,
                prices: {
                  monthly: {
                    id: STRIPE_PRODUCTS.pro.stripeIds.prices.monthly || 'price_pro_monthly',
                    amount: STRIPE_PRODUCTS.pro.prices.monthly.amount,
                    currency: STRIPE_PRODUCTS.pro.prices.monthly.currency,
                    interval: 'month' as const
                  },
                  yearly: {
                    id: STRIPE_PRODUCTS.pro.stripeIds.prices.yearly || 'price_pro_yearly',
                    amount: STRIPE_PRODUCTS.pro.prices.yearly.amount,
                    currency: STRIPE_PRODUCTS.pro.prices.yearly.currency,
                    interval: 'year' as const
                  }
                }
              },
              {
                id: 'prod_enterprise',
                name: STRIPE_PRODUCTS.enterprise.name,
                description: STRIPE_PRODUCTS.enterprise.description,
                features: STRIPE_PRODUCTS.enterprise.features,
                stripeIds: STRIPE_PRODUCTS.enterprise.stripeIds,
                prices: {
                  custom: {
                    id: STRIPE_PRODUCTS.enterprise.stripeIds.prices.custom || 'price_enterprise_custom',
                    amount: STRIPE_PRODUCTS.enterprise.prices.custom.amount,
                    currency: STRIPE_PRODUCTS.enterprise.prices.custom.currency,
                    interval: 'custom' as const
                  }
                }
              }
            ]
            
            set({ products: configuredProducts, loading: false })
            console.log('✅ Produtos carregados com IDs reais do Stripe:', configuredProducts.length)
            
            // Log dos produtos configurados
            configuredProducts.forEach(product => {
              console.log(`📦 ${product.name}:`, {
                productId: product.stripeIds.product,
                monthlyPrice: product.stripeIds.prices.monthly,
                yearlyPrice: product.stripeIds.prices.yearly
              })
            })
            
          } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error)
            set({ 
              error: 'Erro ao carregar produtos', 
              loading: false 
            })
          }
        },
        
        setProducts: (products: StripeProduct[]) => set({ products }),
        
        // Assinaturas
        loadSubscriptions: async (customerId: string) => {
          try {
            set({ loading: true, error: null })
            
            if (!stripeService.isConfigured()) {
              console.warn('⚠️ Stripe não configurado, usando dados mockados')
              // TODO: Implementar quando Stripe estiver configurado
              set({ loading: false })
              return
            }
            
            const subscriptions = await stripeService.listCustomerSubscriptions(customerId)
            // TODO: Transformar dados do Stripe para o formato local
            set({ loading: false })
          } catch (error) {
            console.error('❌ Erro ao carregar assinaturas:', error)
            set({ 
              error: 'Erro ao carregar assinaturas', 
              loading: false 
            })
          }
        },
        
        setSubscriptions: (subscriptions: StripeSubscription[]) => set({ subscriptions }),
        
        // Faturas
        loadInvoices: async (customerId: string) => {
          try {
            set({ loading: true, error: null })
            
            if (!stripeService.isConfigured()) {
              console.warn('⚠️ Stripe não configurado, usando dados mockados')
              // TODO: Implementar quando Stripe estiver configurado
              set({ loading: false })
              return
            }
            
            const invoices = await stripeService.listCustomerInvoices(customerId)
            // TODO: Transformar dados do Stripe para o formato local
            set({ loading: false })
          } catch (error) {
            console.error('❌ Erro ao carregar faturas:', error)
            set({ 
              error: 'Erro ao carregar faturas', 
              loading: false 
            })
          }
        },
        
        setInvoices: (invoices: StripeInvoice[]) => set({ invoices }),
        
        // Cliente
        setCustomer: (customer: StripeCustomer | null) => set({ customer }),
        
        // Checkout
        setCheckoutLoading: (loading: boolean) => set({ checkoutLoading: loading }),
        setCheckoutError: (error: string | null) => set({ checkoutError: error }),
        
        // Portal
        setPortalLoading: (loading: boolean) => set({ portalLoading: loading }),
        setPortalError: (error: string | null) => set({ portalError: error }),
        
        // Reset
        reset: () => set(initialState)
      }),
      {
        name: 'stripe-store',
        partialize: (state) => ({
          products: state.products,
          customer: state.customer
        })
      }
    ),
    {
      name: 'stripe-store'
    }
  )
)

export default useStripeStore
