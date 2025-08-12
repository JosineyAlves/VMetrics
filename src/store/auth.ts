import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCurrencyStore } from './currency'

interface AuthState {
  apiKey: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setApiKey: (key: string) => void
  logout: () => void
  testApiKey: (key: string) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setApiKey: (key: string) => {
        console.log('[AUTH] Salvando API Key:', key)
        set({ apiKey: key, isAuthenticated: true })
        
        // Detectar moeda automaticamente quando API Key for configurada
        const { detectCurrency } = useCurrencyStore.getState()
        detectCurrency(key)
        
        // Verificar se foi salvo no localStorage
        setTimeout(() => {
          const persisted = localStorage.getItem('auth-storage')
          console.log('[AUTH] Conteúdo atual do localStorage:', persisted)
        }, 100)
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
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: (state) => {
        console.log('[AUTH] Reidratando estado do auth-storage:', state)
      }
    }
  )
) 