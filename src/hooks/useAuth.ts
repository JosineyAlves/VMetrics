import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  stripe_customer_id?: string
  is_active: boolean
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar sessão atual
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao obter sessão:', error)
          setError(error.message)
        } else if (session) {
          setSession(session)
          await loadUserProfile(session.user)
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError('Erro inesperado ao verificar sessão')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Carregar perfil do usuário do banco
  const loadUserProfile = async (supabaseUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao carregar perfil:', error)
        setError(error.message)
        return
      }

      if (profile) {
        setUser(profile)
      } else {
        // Criar perfil se não existir
        await createUserProfile(supabaseUser)
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      setError('Erro ao carregar perfil do usuário')
    }
  }

  // Criar perfil do usuário
  const createUserProfile = async (supabaseUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          full_name: supabaseUser.user_metadata?.full_name || null,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar perfil:', error)
        setError(error.message)
        return
      }

      setUser(profile)
    } catch (err) {
      console.error('Erro ao criar perfil:', err)
      setError('Erro ao criar perfil do usuário')
    }
  }

  // Login com email/senha
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Verificar se o usuário tem plano ativo
        const { data: userPlan, error: planError } = await supabase
          .from('user_plans')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('status', 'active')
          .single()
        
        if (planError && planError.code !== 'PGRST116') {
          console.error('Erro ao verificar plano:', planError)
        }
        
        // Verificar se tem API Key configurada
        const { data: apiKeyData, error: apiKeyError } = await supabase
          .from('users')
          .select('redtrack_api_key')
          .eq('id', data.user.id)
          .single()
        
        if (apiKeyError && apiKeyError.code !== 'PGRST116') {
          console.error('Erro ao verificar API Key:', apiKeyError)
        }
        
        const hasApiKey = apiKeyData?.redtrack_api_key && apiKeyData.redtrack_api_key.trim() !== ''
        const hasActivePlan = userPlan && userPlan.status === 'active'
        
        return { 
          success: true, 
          data,
          hasApiKey,
          hasActivePlan,
          userPlan: userPlan || null
        }
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Cadastro com email/senha
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(null)
      setSession(null)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Reset de senha
  const resetPassword = async (email: string) => {
    try {
      setError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Atualizar perfil
  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      setError(null)

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(data)
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Verificar se usuário tem plano ativo
  const hasActivePlan = () => {
    return user?.stripe_customer_id !== null
  }

  return {
    // Estado
    user,
    session,
    loading,
    error,
    
    // Métodos
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    hasActivePlan,
    
    // Utilitários
    isAuthenticated: !!user,
    isGuest: !user && !loading
  }
}
