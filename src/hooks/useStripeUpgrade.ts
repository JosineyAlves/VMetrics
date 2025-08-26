import { useState } from 'react'

interface StripeUpgradeResponse {
  success: boolean
  subscription: {
    id: string
    status: string
    current_period_start: number
    current_period_end: number
    items: Array<{
      price_id: string
      product_id: string
    }>
  }
  message: string
}

export function useStripeUpgrade() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const upgradeSubscription = async (
    subscriptionId: string, 
    newPriceId: string, 
    customerId: string
  ) => {
    if (!subscriptionId || !newPriceId || !customerId) {
      setError('Todos os parâmetros são obrigatórios')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('🔄 [HOOK-UPGRADE] Iniciando upgrade direto...')
      console.log('🔄 [HOOK-UPGRADE] Subscription:', subscriptionId)
      console.log('🔄 [HOOK-UPGRADE] Novo preço:', newPriceId)

      const response = await fetch('/api/stripe-upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subscriptionId, 
          newPriceId, 
          customerId 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao fazer upgrade')
      }

      const data: StripeUpgradeResponse = await response.json()
      
      console.log('✅ [HOOK-UPGRADE] Upgrade realizado com sucesso!')
      console.log('✅ [HOOK-UPGRADE] Nova assinatura:', data.subscription)

      setSuccess(true)
      
      // Retornar dados para uso externo
      return data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ [HOOK-UPGRADE] Erro ao fazer upgrade:', errorMessage)
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const resetState = () => {
    setError(null)
    setSuccess(false)
  }

  return {
    upgradeSubscription,
    isLoading,
    error,
    success,
    resetState
  }
}
