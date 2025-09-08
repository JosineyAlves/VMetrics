import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth'
import { supabase } from '../lib/supabase'

/**
 * Hook para sincronizar API Key entre banco de dados e localStorage
 * Resolve o problema de timing após login
 */
export const useApiKeySync = () => {
  const { apiKey, setApiKey, isAuthenticated, user } = useAuthStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number>(0)

  useEffect(() => {
    const syncApiKey = async () => {
      // Só sincronizar se:
      // 1. Usuário está autenticado
      // 2. Há um usuário
      // 3. Não há API Key carregada OU passou mais de 30 segundos desde a última sincronização
      if (!isAuthenticated || !user) return
      
      const now = Date.now()
      const timeSinceLastSync = now - lastSyncTime
      
      // Evitar sincronizações muito frequentes
      if (apiKey && timeSinceLastSync < 30000) return
      
      setIsSyncing(true)
      console.log('[API-KEY-SYNC] Iniciando sincronização...')
      
      try {
        // Buscar API Key do banco de dados
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('api_key')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('[API-KEY-SYNC] Erro ao buscar perfil:', error)
          return
        }
        
        if (profile?.api_key) {
          console.log('[API-KEY-SYNC] API Key encontrada no banco:', profile.api_key)
          
          // Só atualizar se a API Key for diferente da atual
          if (apiKey !== profile.api_key) {
            setApiKey(profile.api_key)
            console.log('[API-KEY-SYNC] API Key atualizada do banco')
          }
          
          // Sincronizar com localStorage
          localStorage.setItem('vmetrics_api_key', profile.api_key)
          setLastSyncTime(now)
        } else {
          console.log('[API-KEY-SYNC] Nenhuma API Key encontrada no banco')
          
          // Se não há API Key no banco, tentar localStorage como fallback
          const storedApiKey = localStorage.getItem('vmetrics_api_key')
          if (storedApiKey && !apiKey) {
            console.log('[API-KEY-SYNC] Usando API Key do localStorage:', storedApiKey)
            setApiKey(storedApiKey)
            
            // Sincronizar com banco em background
            try {
              await supabase
                .from('profiles')
                .update({ api_key: storedApiKey })
                .eq('id', user.id)
              console.log('[API-KEY-SYNC] API Key sincronizada com banco')
            } catch (syncError) {
              console.error('[API-KEY-SYNC] Erro ao sincronizar com banco:', syncError)
            }
          }
        }
      } catch (error) {
        console.error('[API-KEY-SYNC] Erro na sincronização:', error)
      } finally {
        setIsSyncing(false)
      }
    }

    // Sincronizar imediatamente quando o hook é montado
    syncApiKey()
    
    // Sincronizar novamente após 2 segundos (para casos de login recente)
    const timeoutId = setTimeout(syncApiKey, 2000)
    
    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, user, apiKey, setApiKey, lastSyncTime])

  return { isSyncing }
}
