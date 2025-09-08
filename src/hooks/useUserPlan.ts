import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { supabase } from '../lib/supabase'

interface UserPlan {
  id: string
  plan_type: 'starter' | 'pro' | 'enterprise' | 'monthly' | 'quarterly'
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
  invoice?: any // Adicionar propriedade invoice opcional
}

export const useUserPlan = () => {
  const { user } = useAuthStore()
  const [planData, setPlanData] = useState<UserPlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserPlan = async () => {
    if (!user?.id) {
      console.log('🔍 [USE-USER-PLAN] Usuário não logado, aguardando...')
      setLoading(false)
      setPlanData(null)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 [USE-USER-PLAN] Carregando plano para user_id:', user.id)
      
      // Usar Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('user-plan', {
        body: { user_id: user.id }
      })
      
      if (functionError) {
        throw new Error(`Erro na Edge Function: ${functionError.message}`)
      }
      
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
  }, [user?.id])

  // Valores padrão para quando não há plano
  const defaultPlan = {
    hasActivePlan: false,
    planType: null,
    planName: 'Nenhum plano ativo',
    planPrice: 'Gratuito',
    planFeatures: ['Acesso básico ao dashboard'],
    planStatus: 'inactive'
  }

  return {
    planData,
    loading,
    error,
    refreshPlan,
    hasActivePlan: planData?.plan?.status === 'active' || false,
    planType: planData?.plan?.plan_type || defaultPlan.planType,
    planName: planData?.plan?.name || defaultPlan.planName,
    planPrice: planData?.plan?.price || defaultPlan.planPrice,
    planFeatures: planData?.plan?.features || defaultPlan.planFeatures,
    planStatus: planData?.plan?.status || defaultPlan.planStatus
  }
}