import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'

export const useApiKeySync = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const { apiKey, setApiKey } = useAuthStore()

  useEffect(() => {
    // Sincronizar API Key do localStorage se necessário
    const storedApiKey = localStorage.getItem('redtrack_api_key')
    if (storedApiKey && storedApiKey !== apiKey) {
      setApiKey(storedApiKey)
    }
  }, [apiKey, setApiKey])

  return {
    isSyncing,
    setIsSyncing
  }
}


