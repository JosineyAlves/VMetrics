import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCurrencyStore } from './currency'
import { supabase } from '../lib/supabase'

interface AuthState {
  apiKey: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  userId: string | null
  userEmail: string | null
  setApiKey: (key: string) => void
  logout: () => void
  testApiKey: (key: string) => Promise<boolean>
  syncWithSupabase: () => Promise<void>
  checkAuthStatus: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      userId: null,
      userEmail: null,
      
      // Sincronizar com Supabase
      syncWithSupabase: async () => {
        try {
          console.log('🔄 [AUTH] Sincronizando com Supabase...')
          
          // Verificar sessão atual
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('❌ [AUTH] Erro ao obter sessão:', error)
            set({ isAuthenticated: false, userId: null, userEmail: null })
            return
          }
          
          if (session?.user) {
            console.log('✅ [AUTH] Usuário autenticado no Supabase:', session.user.email)
            
            // Verificar se tem API Key configurada
            const { data: profile } = await supabase
              .from('profiles')
              .select('redtrack_api_key')
              .eq('id', session.user.id)
              .single()
            
            const hasApiKey = !!(profile?.redtrack_api_key)
            
            set({
              isAuthenticated: true,
              userId: session.user.id,
              userEmail: session.user.email,
              apiKey: hasApiKey ? profile.redtrack_api_key : null
            })
            
            console.log('✅ [AUTH] Estado sincronizado:', { 
              isAuthenticated: true, 
              userId: session.user.id, 
              hasApiKey 
            })
          } else {
            console.log('❌ [AUTH] Nenhuma sessão ativa no Supabase')
            set({ isAuthenticated: false, userId: null, userEmail: null, apiKey: null })
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao sincronizar com Supabase:', error)
          set({ isAuthenticated: false, userId: null, userEmail: null, apiKey: null })
        }
      },
      
      // Verificar status de autenticação
      checkAuthStatus: async () => {
        await get().syncWithSupabase()
      },
      
      setApiKey: async (key: string) => {
        console.log('[AUTH] Salvando API Key:', key)
        
        try {
          // Salvar no Supabase
          const { userId } = get()
          if (userId) {
            const { error } = await supabase
              .from('profiles')
              .update({ redtrack_api_key: key })
              .eq('id', userId)
            
            if (error) {
              console.error('❌ [AUTH] Erro ao salvar API Key no Supabase:', error)
              return
            }
          }
          
          // Atualizar estado local
          set({ apiKey: key, isAuthenticated: true })
          
          // Detectar moeda automaticamente quando API Key for configurada
          const { detectCurrency } = useCurrencyStore.getState()
          detectCurrency(key)
          
          console.log('✅ [AUTH] API Key salva com sucesso')
        } catch (error) {
          console.error('❌ [AUTH] Erro ao salvar API Key:', error)
        }
      },
      
      logout: async () => {
        console.log('[AUTH] Logout chamado. Limpando estado.')
        
        try {
          // Fazer logout no Supabase
          await supabase.auth.signOut()
          
          // Limpar estado local
          set({ 
            apiKey: null, 
            isAuthenticated: false, 
            userId: null, 
            userEmail: null 
          })
          
          console.log('✅ [AUTH] Logout realizado com sucesso')
        } catch (error) {
          console.error('❌ [AUTH] Erro no logout:', error)
        }
      },
      
      testApiKey: async (key: string) => {
        console.log('🔍 [AUTH] Testando API Key...')
        set({ isLoading: true, error: null })
        
        try {
          // Testar API Key via RedTrack
          const response = await fetch('/api/campaigns', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            }
          })
          
          if (response.ok) {
            console.log('✅ [AUTH] API Key válida!')
            set({ isLoading: false, error: null })
            return true
          } else {
            console.log('❌ [AUTH] API Key inválida')
            set({ isLoading: false, error: 'API Key inválida' })
            return false
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao testar API Key:', error)
          set({ 
            isLoading: false, 
            error: 'Erro de conexão. Verifique sua API Key.' 
          })
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: (state) => {
        console.log('[AUTH] Reidratando estado do auth-storage:', state)
        // Sincronizar com Supabase após reidratação
        if (state) {
          setTimeout(() => {
            state.syncWithSupabase()
          }, 100)
        }
      }
    }
  )
) 