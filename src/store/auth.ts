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
        // TESTE IMEDIATO - SEMPRE EXECUTAR
        console.log('🚨 TESTE IMEDIATO - FUNÇÃO CHAMADA!')
        console.log('🚨 API Key recebida:', key ? 'SIM' : 'NÃO')
        console.log('🚨 Hostname:', window.location.hostname)
        console.log('🚨 URL:', window.location.href)
        
        set({ isLoading: true, error: null })
        
        console.log('🔍 Iniciando teste de API key...')
        console.log('🔍 Hostname atual:', window.location.hostname)
        console.log('🔍 URL atual:', window.location.href)
        
        try {
          // Chaves de teste sempre funcionam
          if (key === 'kXlmMfpINGQqv4btkwRL' || key === 'test_key') {
            console.log('🔍 Chave de teste detectada')
            set({ isLoading: false, isAuthenticated: true })
            return true
          }
          
          // Em desenvolvimento local, simula sucesso para evitar CORS
          const isLocalDevelopment = window.location.hostname === 'localhost' || 
                                    window.location.hostname === '127.0.0.1'
          
          console.log('🔍 É desenvolvimento local?', isLocalDevelopment)
          
          if (isLocalDevelopment) {
            console.log('🔧 Modo desenvolvimento local detectado. Aceitando qualquer chave não vazia.')
            set({ isLoading: false, isAuthenticated: true })
            return true
          }
          
          // Em produção, testar via proxy
          console.log('🔍 Modo produção detectado. Testando via proxy...')
          console.log('🔍 URL do proxy:', '/api/settings')
          console.log('🔍 API Key fornecida:', key ? 'Sim' : 'Não')
          
          const response = await fetch('/api/settings?v=' + Date.now(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            }
          })
          
          console.log('🔍 Status da resposta:', response.status)
          console.log('🔍 OK?', response.ok)
          
          if (response.ok) {
            console.log('✅ API Key válida!')
            set({ isLoading: false, isAuthenticated: true })
            return true
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.log('❌ Erro na resposta:', errorData)
            set({ 
              isLoading: false, 
              error: errorData.error || 'API Key inválida',
              isAuthenticated: false 
            })
            return false
          }
          
        } catch (error) {
          console.error('❌ Erro ao testar API key:', error)
          console.error('❌ Tipo do erro:', typeof error)
          console.error('❌ Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido')
          set({ 
            isLoading: false, 
            error: 'Erro de conexão. Verifique sua API Key.',
            isAuthenticated: false 
          })
          return false
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
) 