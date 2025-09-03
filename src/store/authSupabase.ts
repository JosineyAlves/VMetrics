import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface AuthSupabaseState {
  isAuthenticated: boolean
  user: any | null
  userPlan: any | null
  hasApiKey: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (userId: string) => Promise<void>
  logout: () => Promise<void>
  checkUserPlan: (userId: string) => Promise<boolean>
  setApiKey: (apiKey: string) => void
  clearError: () => void
}

export const useAuthSupabaseStore = create<AuthSupabaseState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      userPlan: null,
      hasApiKey: false,
      isLoading: false,
      error: null,

      login: async (userId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Buscar dados do usuário
          const { data: user, error: userError } = await supabase.auth.getUser()
          
          if (userError) {
            console.error('Erro ao buscar usuário:', userError)
            set({ error: 'Erro ao buscar dados do usuário', isLoading: false })
            return
          }

          // Buscar plano do usuário
          const { data: userPlan, error: planError } = await supabase
            .from('user_plans')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (planError && planError.code !== 'PGRST116') {
            console.error('Erro ao buscar plano do usuário:', planError)
          }

          // Verificar se tem API key configurada
          // TODO: Implementar verificação real da API key
          const hasApiKey = true // Por enquanto, assumir que tem API key

          set({
            isAuthenticated: true,
            user: user.user,
            userPlan: userPlan,
            hasApiKey: hasApiKey,
            isLoading: false,
            error: null
          })

          console.log('Login realizado com sucesso:', {
            userId,
            hasApiKey,
            userPlan: userPlan ? 'Encontrado' : 'Não encontrado'
          })

        } catch (error) {
          console.error('Erro no login:', error)
          set({ 
            error: 'Erro inesperado no login', 
            isLoading: false 
          })
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut()
          
          if (error) {
            console.error('Erro ao fazer logout:', error)
          }

          set({
            isAuthenticated: false,
            user: null,
            userPlan: null,
            hasApiKey: false,
            error: null
          })

          console.log('Logout realizado com sucesso')
        } catch (error) {
          console.error('Erro no logout:', error)
        }
      },

      checkUserPlan: async (userId: string) => {
        try {
          const { data: userPlan, error } = await supabase
            .from('user_plans')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error('Erro ao verificar plano do usuário:', error)
            return false
          }

          const hasPlan = !!userPlan
          set({ userPlan, hasApiKey: hasPlan })
          
          return hasPlan
        } catch (error) {
          console.error('Erro ao verificar plano:', error)
          return false
        }
      },

      setApiKey: (apiKey: string) => {
        set({ hasApiKey: true })
        console.log('API Key configurada:', apiKey)
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-supabase-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        userPlan: state.userPlan,
        hasApiKey: state.hasApiKey
      })
    }
  )
)
