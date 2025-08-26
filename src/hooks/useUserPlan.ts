import { useState, useEffect } from 'react'

interface UserPlan {
  id: string
  plan_type: 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  stripe_subscription_id: string
  stripe_customer_id: string
  current_period_start: string
  current_period_end: string
  name: string
  price: string
  period: string
  features: string[]
  nextBilling: string | null
}

interface UserPlanData {
  plan: UserPlan | null
  user: {
    id: string
    email: string
    stripe_customer_id: string
  } | null
}

export const useUserPlan = (email: string) => {
  const [planData, setPlanData] = useState<UserPlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserPlan = async () => {
    if (!email) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 [USE-USER-PLAN] Carregando plano para:', email)
      
      const response = await fetch(`/api/user-plan?email=${encodeURIComponent(email)}`)
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [USE-USER-PLAN] Dados recebidos:', data)
      
      setPlanData(data)
      
    } catch (err) {
      console.error('❌ [USE-USER-PLAN] Erro:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const refreshPlan = () => {
    loadUserPlan()
  }

  useEffect(() => {
    loadUserPlan()
  }, [email])

  return {
    planData,
    loading,
    error,
    refreshPlan,
    hasActivePlan: planData?.plan?.status === 'active',
    planType: planData?.plan?.plan_type || null,
    planName: planData?.plan?.name || 'Nenhum plano ativo',
    planPrice: planData?.plan?.price || 'Gratuito',
    planFeatures: planData?.plan?.features || ['Acesso básico'],
    planStatus: planData?.plan?.status || 'inactive'
  }
}

