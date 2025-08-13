import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCurrencyStore } from './currency'

interface AuthState {
  apiKey: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setApiKey: (key: string) => Promise<void>
  logout: () => void
  testApiKey: (key: string) => Promise<boolean>
  syncWithSupabase: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setApiKey: async (key: string) => {
        console.log('[AUTH] Salvando API Key:', key)
        
        try {
          // Salvar no Supabase primeiro
          const { supabase } = await import('../lib/supabase')
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user?.id) {
            const { error } = await supabase
              .from('users')
              .update({ 
                api_key: key,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
            
            if (error) {
              console.error('❌ [AUTH] Erro ao salvar API Key no Supabase:', error)
              return
            }
            
            console.log('✅ [AUTH] API Key salva no Supabase com sucesso')
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
      logout: () => {
        console.log('[AUTH] Logout chamado. Limpando API Key.')
        set({ apiKey: null, isAuthenticated: false })
        setTimeout(() => {
          const persisted = localStorage.getItem('auth-storage')
          console.log('[AUTH] Conteúdo do localStorage após logout:', persisted)
        }, 100)
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
            set({ isLoading: false, isAuthenticated: true, error: null })
            return true
          } else {
            console.log('❌ [AUTH] API Key inválida')
            set({ isLoading: false, isAuthenticated: false, error: 'API Key inválida' })
            return false
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao testar API Key:', error)
          set({ 
            isLoading: false, 
            isAuthenticated: false, 
            error: 'Erro de conexão. Verifique sua API Key.' 
          })
          return false
        }
      },
      
      // Sincronizar estado com Supabase
      syncWithSupabase: async () => {
        try {
          const { supabase } = await import('../lib/supabase')
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user?.id) {
            // Verificar se tem API Key configurada
            const { data: profile } = await supabase
              .from('users')
              .select('api_key')
              .eq('id', user.id)
              .single()
            
            const hasApiKey = !!(profile?.api_key)
            
            set({
              isAuthenticated: true,
              apiKey: hasApiKey ? profile.api_key : null
            })
            
            console.log('✅ [AUTH] Estado sincronizado com Supabase:', { hasApiKey })
          } else {
            set({ isAuthenticated: false, apiKey: null })
            console.log('❌ [AUTH] Nenhum usuário autenticado no Supabase')
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao sincronizar com Supabase:', error)
          set({ isAuthenticated: false, apiKey: null })
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