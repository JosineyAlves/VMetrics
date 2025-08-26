import { useState } from 'react'

interface StripePortalResponse {
  url: string
  sessionId: string
}

export function useStripePortal() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openCustomerPortal = async (customerId: string) => {
    if (!customerId) {
      setError('Customer ID é obrigatório')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔗 [HOOK] Abrindo Customer Portal para customer:', customerId)

      const response = await fetch('/api/stripe-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao abrir Customer Portal')
      }

      const data: StripePortalResponse = await response.json()
      
      console.log('✅ [HOOK] Customer Portal aberto com sucesso:', data.sessionId)

      // Redirecionar para o Customer Portal
      window.location.href = data.url

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ [HOOK] Erro ao abrir Customer Portal:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    openCustomerPortal,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}

