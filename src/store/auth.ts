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
        console.log('🚀 [AUTH] INICIANDO setApiKey com:', key)
        
        try {
          // 1. Verificar se há uma sessão ativa PRIMEIRO
          console.log('🔍 [AUTH] Verificando sessão...')
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('❌ [AUTH] Erro ao verificar sessão:', sessionError)
            throw new Error('Erro ao verificar sessão')
          }
          
          if (!session) {
            console.error('❌ [AUTH] Nenhuma sessão ativa encontrada')
            throw new Error('Usuário não autenticado. Faça login novamente.')
          }
          
          console.log('✅ [AUTH] Sessão ativa encontrada:', session.user.email)
          console.log('🔍 [AUTH] User ID:', session.user.id)
          
          // 2. Salvar no localStorage primeiro (instantâneo)
          console.log('💾 [AUTH] Salvando no localStorage...')
          localStorage.setItem('vmetrics_api_key', key)
          set({ apiKey: key, isAuthenticated: true })
          console.log('✅ [AUTH] Salvo no localStorage e estado')
          
          // 3. Salvar no banco de dados
          console.log('🗄️ [AUTH] Iniciando UPDATE na tabela profiles...')
          console.log('🔍 [AUTH] Query:', {
            table: 'profiles',
            data: { api_key: key },
            filter: { id: session.user.id }
          })
          
          const { error, data } = await supabase
            .from('profiles')
            .update({ api_key: key })
            .eq('id', session.user.id)
            .select() // Adicionar select para ver o que foi retornado
          
          console.log('📊 [AUTH] Resultado do UPDATE:', { error, data })
          
          if (error) {
            console.error('❌ [AUTH] Erro ao salvar no banco:', error)
            throw new Error(`Erro ao salvar no banco: ${error.message}`)
          } else {
            console.log('✅ [AUTH] API Key salva no banco com sucesso')
            console.log('📋 [AUTH] Dados retornados:', data)
          }
          
          console.log('🎉 [AUTH] setApiKey concluído com sucesso')
          
        } catch (error) {
          console.error('💥 [AUTH] ERRO COMPLETO em setApiKey:', error)
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

            // 2. Buscar API Key do banco de dados (prioridade)
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
