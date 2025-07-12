import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    (set) => ({
      apiKey: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setApiKey: (key: string) => set({ apiKey: key, isAuthenticated: true }),
      logout: () => set({ apiKey: null, isAuthenticated: false }),
      testApiKey: async (key: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Chaves de teste válidas
          if (key === 'kXlmMfpINGQqv4btkwRL' || key === 'test_key') {
            set({ apiKey: key, isAuthenticated: true, isLoading: false, error: null })
            return true
          }
          
          // Verificar se está em desenvolvimento ou produção
          const isDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.hostname.includes('localhost')
          
          const isVercel = window.location.hostname.includes('vercel.app')
          
          // Em desenvolvimento ou Vercel, aceita qualquer chave não vazia
          if (isDevelopment || isVercel) {
            if (key.trim().length > 0) {
              set({ 
                apiKey: key, 
                isAuthenticated: true, 
                isLoading: false, 
                error: null 
              })
              console.log('🔧 Modo demo detectado. Usando dados simulados.')
              return true
            } else {
              set({ 
                isLoading: false, 
                error: 'API Key não pode estar vazia.' 
              })
              return false
            }
          }
          
          // Em produção real (não Vercel), testa com a API real
          const response = await fetch('https://api.redtrack.io/me/settings', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            set({ apiKey: key, isAuthenticated: true, isLoading: false, error: null })
            return true
          } else {
            set({ 
              isLoading: false, 
              error: 'API Key inválida. Verifique se a chave está correta.' 
            })
            return false
          }
        } catch (error) {
          console.error('Erro ao testar API key:', error)
          
          // Em desenvolvimento ou Vercel, aceita a chave mesmo com erro de CORS
          const isDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.hostname.includes('localhost')
          
          const isVercel = window.location.hostname.includes('vercel.app')
          
          if ((isDevelopment || isVercel) && key.trim().length > 0) {
            set({ 
              apiKey: key, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            })
            console.log('🔧 Modo demo detectado. Usando dados simulados.')
            return true
          }
          
          set({ 
            isLoading: false, 
            error: 'Erro de conexão. Em modo demo, qualquer chave não vazia é aceita.' 
          })
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
) 