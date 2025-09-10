import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface AuthState {
  apiKey: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: any | null
  login: (userData: any) => void
  setApiKey: (key: string) => void
  logout: () => void
  testApiKey: (key: string) => Promise<boolean>
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
      setApiKey: async (key: string) => {
        console.log('[AUTH] Salvando API Key:', key)
        
        try {
          // 1. Salvar no localStorage primeiro (instantâneo)
          localStorage.setItem('vmetrics_api_key', key)
          set({ apiKey: key, isAuthenticated: true })
          console.log('[AUTH] API Key salva no localStorage e estado atualizado')
          
          // 2. Salvar no banco de dados (obrigatório)
          console.log('[AUTH] Obtendo usuário autenticado...')
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            console.log('[AUTH] Usuário encontrado:', user.id)
            console.log('[AUTH] Salvando API Key no banco de dados...')
            const { error } = await supabase
              .from('profiles')
              .update({ api_key: key })
              .eq('id', user.id)
            
            if (error) {
              console.error('[AUTH] Erro ao salvar no banco:', error)
              throw new Error(`Erro ao salvar no banco: ${error.message}`)
            } else {
              console.log('[AUTH] API Key salva no banco com sucesso')
            }
          } else {
            console.error('[AUTH] Usuário não autenticado, não é possível salvar no banco')
            throw new Error('Usuário não autenticado')
          }
          
          console.log('[AUTH] Processo de salvamento concluído com sucesso')
        } catch (error) {
          console.error('[AUTH] Erro ao salvar API Key:', error)
          set({ error: 'Erro ao salvar API Key' })
          throw error
        }
      },
      logout: async () => {
        console.log('[AUTH] Logout chamado. Limpando API Key.')
        
        // Fazer logout do Supabase
        await supabase.auth.signOut()
        
        // Limpar localStorage
        localStorage.removeItem('vmetrics_api_key')
        
        set({ apiKey: null, isAuthenticated: false, user: null })
        setTimeout(() => {
          const persisted = localStorage.getItem('auth-storage')
          console.log('[AUTH] Conteúdo do localStorage após logout:', persisted)
        }, 100)
      },
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
          if (key === 'kXlmMfpINGQqv4btkwRL' || key === 'test_key' || key === 'yY6GLcfv5E6cWnWDt3KP') {
            console.log('🔍 Chave de teste detectada')
            set({ isLoading: false, isAuthenticated: true })
            return true
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
          console.log('[DEBUG] URL de validação:', url);
          console.log('[DEBUG] Chave enviada:', key);
          console.log('🔍 Status da resposta:', response.status);
          console.log('🔍 OK?', response.ok);
          
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
              return true;
            } else {
              // Caso a resposta seja um objeto de erro explícito
              let errorMessage = responseData.error || 'API Key inválida';
              if (responseData.status) {
                errorMessage = `Erro ${responseData.status}: ${errorMessage}`;
              }
              set({ 
                isLoading: false, 
                error: errorMessage,
                isAuthenticated: false 
              });
              return false;
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.log('❌ Erro na resposta:', errorData)
            
            // Processar erro com mais detalhes
            let errorMessage = errorData.error || 'API Key inválida'
            
            // Adicionar código de status se disponível
            if (errorData.status) {
              errorMessage = `Erro ${errorData.status}: ${errorMessage}`
            }
            
            set({ 
              isLoading: false, 
              error: errorMessage,
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
      },
      initializeAuth: async () => {
        set({ isLoading: true })
        
        try {
          // 1. Verificar se há uma sessão ativa PRIMEIRO
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('[AUTH] Erro ao verificar sessão:', error)
            set({ isLoading: false })
            return
          }
          
          if (session?.user) {
            console.log('[AUTH] Sessão encontrada:', session.user.email)
            
            set({ 
              isAuthenticated: true, 
              user: session.user,
              error: null 
            })

            // 2. Verificar se já há uma API Key definida (não sobrescrever)
            const currentState = get()
            if (currentState.apiKey) {
              console.log('[AUTH] API Key já definida, não sobrescrevendo:', currentState.apiKey)
              set({ isLoading: false })
              return
            }

            // 3. Buscar API Key do banco de dados apenas se não há API Key definida
            console.log('[AUTH] Buscando API Key do banco de dados...')
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('api_key')
                .eq('id', session.user.id)
                .single()
              
              if (profileError) {
                console.error('[AUTH] Erro ao buscar perfil:', profileError)
                // Se não conseguir buscar do banco, tentar localStorage como fallback
                const storedApiKey = localStorage.getItem('vmetrics_api_key')
                if (storedApiKey) {
                  console.log('[AUTH] Usando API Key do localStorage como fallback:', storedApiKey)
                  set({ apiKey: storedApiKey })
                }
              } else if (profile?.api_key) {
                console.log('[AUTH] API Key encontrada no banco:', profile.api_key)
                set({ apiKey: profile.api_key })
                // Salvar no localStorage para próximas vezes
                localStorage.setItem('vmetrics_api_key', profile.api_key)
              } else {
                // Se não há API Key no banco, tentar localStorage
                const storedApiKey = localStorage.getItem('vmetrics_api_key')
                if (storedApiKey) {
                  console.log('[AUTH] API Key encontrada no localStorage:', storedApiKey)
                  set({ apiKey: storedApiKey })
                  // Sincronizar com banco em background
                  try {
                    await supabase
                      .from('profiles')
                      .update({ api_key: storedApiKey })
                      .eq('id', session.user.id)
                    console.log('[AUTH] API Key sincronizada com banco')
                  } catch (syncError) {
                    console.error('[AUTH] Erro ao sincronizar:', syncError)
                  }
                }
              }
            } catch (dbError) {
              console.error('[AUTH] Erro ao buscar do banco:', dbError)
              // Fallback para localStorage
              const storedApiKey = localStorage.getItem('vmetrics_api_key')
              if (storedApiKey) {
                console.log('[AUTH] Usando API Key do localStorage como fallback:', storedApiKey)
                set({ apiKey: storedApiKey })
              }
            }
          } else {
            console.log('[AUTH] Nenhuma sessão ativa encontrada')
            // Se não há sessão, tentar localStorage como último recurso
            const storedApiKey = localStorage.getItem('vmetrics_api_key')
            if (storedApiKey) {
              console.log('[AUTH] Usando API Key do localStorage (sem sessão):', storedApiKey)
              set({ apiKey: storedApiKey })
            } else {
              set({ 
                isAuthenticated: false, 
                user: null,
                apiKey: null,
                error: null 
              })
            }
          }
        } catch (error) {
          console.error('[AUTH] Erro ao inicializar auth:', error)
          set({ 
            isAuthenticated: false, 
            user: null,
            apiKey: null,
            error: 'Erro ao verificar autenticação' 
          })
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user
        // NÃO salvar apiKey no localStorage - sempre buscar do banco
      }),
      onRehydrateStorage: (state) => {
        console.log('[AUTH] Reidratando estado do auth-storage:', state)
        // NÃO chamar initializeAuth aqui - isso causa hooks condicionais
        // A inicialização será feita no App.tsx
      }
    }
  )
)
