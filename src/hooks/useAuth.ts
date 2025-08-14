import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  apiKey: string | null
  user: any | null
  login: (apiKey: string) => void
  logout: () => void
  setApiKey: (apiKey: string) => void
  testApiKey: (apiKey: string) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      apiKey: null,
      user: null,
      
      login: (apiKey: string) => {
        set({
          isAuthenticated: true,
          apiKey,
          user: { apiKey } // Simular dados do usuário
        })
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          apiKey: null,
          user: null
        })
        // Limpar localStorage
        localStorage.removeItem('auth-storage')
      },
      
      setApiKey: (apiKey: string) => {
        set({
          isAuthenticated: true,
          apiKey,
          user: { apiKey }
        })
      },
      
      testApiKey: async (apiKey: string): Promise<boolean> => {
        try {
          // Simular validação da API Key
          // TODO: Implementar validação real com a API
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Por enquanto, aceitar qualquer API Key não vazia
          const isValid = apiKey.trim().length > 0
          
          if (isValid) {
            get().login(apiKey)
          }
          
          return isValid
        } catch (error) {
          console.error('Erro ao testar API Key:', error)
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        apiKey: state.apiKey,
        user: state.user
      })
    }
  )
)
