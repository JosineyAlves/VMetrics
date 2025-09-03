import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { useCurrencyStore } from './currency'

interface AuthState {
  apiKey: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: any | null
  login: (userData: any) => void
  setApiKey: (key: string) => void
  logout: () => void
  testApiKey: (key: string) => Promise<{ success: boolean; error?: string }>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
      login: (userData: any) => {
        console.log('[AUTH] Login realizado:', userData)
        set({ 
          isAuthenticated: true, 
          user: userData,
          error: null 
        })
      },
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
      logout: async () => {
        console.log('[AUTH] Logout chamado. Limpando API Key.')
        
        // Fazer logout do Supabase
        await supabase.auth.signOut()
        
        set({ apiKey: null, isAuthenticated: false, user: null })
        setTimeout(() => {
          const persisted = localStorage.getItem('auth-storage')
          console.log('[AUTH] Conteúdo do localStorage após logout:', persisted)
        }, 100)
      },
      testApiKey: async (key: string) => {
        console.log('🔍 Iniciando teste de API key...')
        set({ isLoading: true, error: null })
        
        try {
          // Chaves de teste sempre funcionam
          if (key === 'kXlmMfpINGQqv4btkwRL' || key === 'test_key' || key === 'yY6GLcfv5E6cWnWDt3KP') {
            console.log('🔍 Chave de teste detectada')
            set({ isLoading: false, isAuthenticated: true })
            return { success: true }
          }
          
          // Em produção, testar via proxy
          // Tentar validar usando /conversions (mais compatível com trial)
          let url = '/api/conversions?v=' + Date.now() + '&api_key=' + encodeURIComponent(key) + '&date_from=2024-01-01&date_to=2024-12-31';
          let endpointTested = '/conversions';
          let response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          // Se /conversions não existir, tentar /campaigns como fallback
          if (response.status === 404) {
            url = '/api/campaigns?v=' + Date.now() + '&api_key=' + encodeURIComponent(key);
            endpointTested = '/campaigns';
            response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }

          console.log('[DEBUG] Endpoint de validação testado:', endpointTested);
          console.log('[DEBUG] Status da resposta:', response.status);
          
          if (response.ok) {
            const responseData = await response.json().catch(() => ({}))
            // Se a resposta for um array (mesmo vazio) ou objeto esperado, considerar sucesso
            if ((Array.isArray(responseData) || (typeof responseData === 'object' && responseData !== null))) {
              console.log('✅ API Key válida!');
              set({ 
                apiKey: key,
                isLoading: false, 
                isAuthenticated: true,
                error: null
              });
              return { success: true };
            } else {
              // Caso a resposta seja um objeto de erro explícito
              let errorMessage = responseData.error || 'API Key inválida';
              if (responseData.status) {
                errorMessage = `Erro ${responseData.status}: ${errorMessage}`;
              }
              set({ 
                isLoading: false, 
                error: errorMessage
                // NÃO alterar isAuthenticated aqui - manter o usuário logado
              });
              return { success: false, error: errorMessage };
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.log('❌ Erro na resposta:', errorData)
            
            // Processar erro com mais detalhes baseado no status HTTP
            let errorMessage = 'Erro ao conectar ao RedTrack'
            
            if (response.status === 401) {
              errorMessage = 'API Key inválida ou expirada'
            } else if (response.status === 403) {
              errorMessage = 'Conta bloqueada ou sem permissão de acesso'
            } else if (response.status === 429) {
              errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos'
            } else if (response.status >= 500) {
              errorMessage = 'Erro interno do RedTrack. Tente novamente mais tarde'
            } else if (errorData.error) {
              errorMessage = errorData.error
            } else if (errorData.status) {
              errorMessage = `Erro ${errorData.status}: ${errorMessage}`
            }
            
            set({ 
              isLoading: false, 
              error: errorMessage
              // NÃO alterar isAuthenticated aqui - manter o usuário logado
            })
            return { success: false, error: errorMessage }
          }
          
        } catch (error) {
          console.error('❌ Erro ao testar API key:', error)
          
          let errorMessage = 'Erro de conexão. Verifique sua API Key.'
          
          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
              errorMessage = 'Erro de conexão com o RedTrack. Verifique sua internet.'
            } else {
              errorMessage = error.message
            }
          }
          
          set({ 
            isLoading: false, 
            error: errorMessage
            // NÃO alterar isAuthenticated aqui - manter o usuário logado
          })
          return { success: false, error: errorMessage }
        }
      },
      initializeAuth: async () => {
        try {
          // Verificar se há uma sessão ativa
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('[AUTH] Erro ao verificar sessão:', error)
            return
          }
          
          if (session?.user) {
            console.log('[AUTH] Sessão encontrada:', session.user.email)
            set({ 
              isAuthenticated: true, 
              user: session.user,
              error: null 
            })
          } else {
            console.log('[AUTH] Nenhuma sessão ativa encontrada')
            set({ 
              isAuthenticated: false, 
              user: null,
              error: null 
            })
          }
        } catch (error) {
          console.error('[AUTH] Erro ao inicializar auth:', error)
          set({ 
            isAuthenticated: false, 
            user: null,
            error: 'Erro ao verificar autenticação' 
          })
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