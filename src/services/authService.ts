import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [AUTH] Variáveis do Supabase não configuradas')
  console.error('❌ [AUTH] VITE_SUPABASE_URL:', supabaseUrl)
  console.error('❌ [AUTH] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Configurada' : 'Não configurada')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: any
  error?: string
  message?: string
}

export class AuthService {
  
  /**
   * Fazer login com email e senha
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 [AUTH] Tentando login para:', credentials.email)
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return {
          success: false,
          error: 'Configuração do Supabase não encontrada'
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      
      if (error) {
        console.error('❌ [AUTH] Erro no login:', error.message)
        return {
          success: false,
          error: this.getErrorMessage(error.message)
        }
      }
      
      if (data.user) {
        console.log('✅ [AUTH] Login bem-sucedido para:', data.user.email)
        return {
          success: true,
          user: data.user,
          message: 'Login realizado com sucesso'
        }
      }
      
      return {
        success: false,
        error: 'Usuário não encontrado'
      }
      
    } catch (error) {
      console.error('❌ [AUTH] Erro inesperado no login:', error)
      return {
        success: false,
        error: 'Erro interno do servidor'
      }
    }
  }
  
  /**
   * Verificar se usuário está autenticado
   */
  static async getCurrentUser(): Promise<any> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ [AUTH] Configuração do Supabase não encontrada')
        return null
      }
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ [AUTH] Erro ao obter usuário atual:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('❌ [AUTH] Erro ao obter usuário atual:', error)
      return null
    }
  }
  
  /**
   * Fazer logout
   */
  static async logout(): Promise<void> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ [AUTH] Configuração do Supabase não encontrada')
        return
      }
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ [AUTH] Erro no logout:', error)
      } else {
        console.log('✅ [AUTH] Logout realizado com sucesso')
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro inesperado no logout:', error)
    }
  }
  
  /**
   * Verificar se usuário tem API Key configurada
   */
  static async hasApiKey(userId: string): Promise<boolean> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ [AUTH] Configuração do Supabase não encontrada')
        return false
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('api_key')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('❌ [AUTH] Erro ao verificar API Key:', error)
        return false
      }
      
      return !!(data?.api_key)
      
    } catch (error) {
      console.error('❌ [AUTH] Erro ao verificar API Key:', error)
      return false
    }
  }
  
  /**
   * Salvar API Key do usuário
   */
  static async saveApiKey(userId: string, apiKey: string): Promise<boolean> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ [AUTH] Configuração do Supabase não encontrada')
        return false
      }
      
      const { error } = await supabase
        .from('users')
        .update({ 
          api_key: apiKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) {
        console.error('❌ [AUTH] Erro ao salvar API Key:', error)
        return false
      }
      
      console.log('✅ [AUTH] API Key salva com sucesso para usuário:', userId)
      return true
      
    } catch (error) {
      console.error('❌ [AUTH] Erro ao salvar API Key:', error)
      return false
    }
  }
  
  /**
   * Traduzir mensagens de erro do Supabase
   */
  private static getErrorMessage(supabaseError: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado',
      'User not found': 'Usuário não encontrado',
      'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos',
      'Network error': 'Erro de conexão. Verifique sua internet'
    }
    
    return errorMap[supabaseError] || supabaseError
  }
}

export default AuthService
