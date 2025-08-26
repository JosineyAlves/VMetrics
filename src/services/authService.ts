// 🔐 Serviço de Autenticação Inteligente
// Gerencia o fluxo de cadastro e autenticação após compra no Stripe

import { supabase } from '../lib/supabase'

export interface AuthState {
  isAuthenticated: boolean
  user: any | null
  needsSetup: boolean
  isLoading: boolean
  fromStripe: boolean
  stripeData?: {
    email: string
    planType: string
    stripeCustomerId: string
  }
}

export interface StripeAuthData {
  email: string
  planType: string
  stripeCustomerId: string
}

export class AuthService {
  /**
   * Verifica se o usuário precisa configurar a API key do RedTrack
   */
  static async checkUserSetup(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('redtrack_api_key')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('❌ [AUTH] Erro ao verificar setup do usuário:', error)
        return false
      }
      
      return !!(data?.redtrack_api_key)
    } catch (error) {
      console.error('❌ [AUTH] Erro ao verificar setup:', error)
      return false
    }
  }

  /**
   * Processa callback de autenticação após clicar no link do email
   */
  static async handleAuthCallback(email: string, planType: string, stripeCustomerId: string): Promise<AuthState> {
    try {
      console.log('🔐 [AUTH] Processando callback de autenticação para:', email)
      
      // Verificar se usuário já está logado
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser) {
        console.log('✅ [AUTH] Usuário já autenticado:', currentUser.id)
        
        // Verificar se precisa de setup
        const needsSetup = !(await this.checkUserSetup(currentUser.id))
        
        return {
          isAuthenticated: true,
          user: currentUser,
          needsSetup,
          isLoading: false,
          fromStripe: true,
          stripeData: { email, planType, stripeCustomerId }
        }
      }
      
      // Usuário não logado, verificar se já existe na base
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, stripe_customer_id')
        .eq('email', email)
        .single()
      
      if (existingUser && existingUser.stripe_customer_id === stripeCustomerId) {
        console.log('✅ [AUTH] Usuário existe na base, redirecionando para cadastro')
        
        return {
          isAuthenticated: false,
          user: null,
          needsSetup: true,
          isLoading: false,
          fromStripe: true,
          stripeData: { email, planType, stripeCustomerId }
        }
      }
      
      // Usuário não existe ou dados não batem
      console.log('❌ [AUTH] Usuário não encontrado ou dados inválidos')
      
      return {
        isAuthenticated: false,
        user: null,
        needsSetup: true,
        isLoading: false,
        fromStripe: false,
        stripeData: undefined
      }
      
    } catch (error) {
      console.error('❌ [AUTH] Erro ao processar callback:', error)
      
      return {
        isAuthenticated: false,
        user: null,
        needsSetup: true,
        isLoading: false,
        fromStripe: false,
        stripeData: undefined
      }
    }
  }

  /**
   * Cria conta para usuário que veio do Stripe
   */
  static async createStripeAccount(email: string, password: string, fullName: string, planType: string, stripeCustomerId: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('🔐 [AUTH] Criando conta para usuário do Stripe:', email)
      
      // Criar conta de autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            plan_type: planType,
            stripe_customer_id: stripeCustomerId,
            from_stripe: true
          }
        }
      })
      
      if (authError) {
        console.error('❌ [AUTH] Erro ao criar conta de autenticação:', authError)
        return { success: false, error: authError.message }
      }
      
      if (authData.user) {
        console.log('✅ [AUTH] Conta criada com sucesso:', authData.user.id)
        
        // Atualizar dados do usuário na tabela users
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            is_active: true
          })
          .eq('email', email)
        
        if (updateError) {
          console.error('⚠️ [AUTH] Aviso: Erro ao atualizar dados do usuário:', updateError)
        }
        
        return { success: true, user: authData.user }
      }
      
      return { success: false, error: 'Falha ao criar usuário' }
      
    } catch (error) {
      console.error('❌ [AUTH] Erro ao criar conta do Stripe:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verifica se o usuário veio do Stripe
   */
  static async checkStripeOrigin(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.user_metadata?.from_stripe) {
        return true
      }
      
      // Verificar também na tabela users
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()
      
      return !!(userData?.stripe_customer_id)
      
    } catch (error) {
      console.error('❌ [AUTH] Erro ao verificar origem do Stripe:', error)
      return false
    }
  }

  /**
   * Obtém dados do usuário atual
   */
  static async getCurrentUser(): Promise<any | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('❌ [AUTH] Erro ao obter usuário atual:', error)
      return null
    }
  }

  /**
   * Faz logout do usuário
   */
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
      console.log('✅ [AUTH] Usuário deslogado com sucesso')
    } catch (error) {
      console.error('❌ [AUTH] Erro ao fazer logout:', error)
    }
  }

  /**
   * Verifica se o usuário precisa completar o setup
   */
  static async checkSetupRequired(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false
      
      return !(await this.checkUserSetup(user.id))
    } catch (error) {
      console.error('❌ [AUTH] Erro ao verificar setup:', error)
      return false
    }
  }
}

export default AuthService
