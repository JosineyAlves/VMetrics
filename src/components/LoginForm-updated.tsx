import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthSupabaseStore } from '../store/authSupabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'
import { supabase } from '../lib/supabase'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  
  const { login } = useAuthSupabaseStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Verificar se há redirecionamento pendente
  const from = location.state?.from?.pathname || '/dashboard'

  // Verificar se há mensagem de sucesso do setup de senha
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Limpar a mensagem após 5 segundos
      setTimeout(() => setSuccessMessage(''), 5000)
    }
    
    // Preencher email se veio do setup de senha
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!email || !password) {
        setError('Por favor, preencha todos os campos')
        setIsLoading(false)
        return
      }

      // Autenticação real com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (error) {
        console.error('Erro de login:', error)
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Verifique sua caixa de entrada.')
        } else {
          setError('Erro ao fazer login. Tente novamente.')
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Login bem-sucedido
        await login(data.user.id)
        
        // Redirecionar baseado no status (o store já verifica se tem API key)
        const { hasApiKey } = useAuthSupabaseStore.getState()
        
        if (hasApiKey) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/setup', { replace: true })
        }
      }
    } catch (err) {
      console.error('Erro inesperado no login:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Por favor, digite seu email primeiro')
      return
    }

    setForgotPasswordLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://app.vmetrics.com.br/setup-password'
      })

      if (error) {
        console.error('Erro ao enviar email de redefinição:', error)
        setError('Erro ao enviar email de redefinição. Tente novamente.')
        setForgotPasswordLoading(false)
        return
      }

      setSuccessMessage('Email de redefinição enviado! Verifique sua caixa de entrada.')
      setIsForgotPassword(false)
    } catch (err) {
      console.error('Erro inesperado:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleSignupClick = () => {
    navigate('/signup')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="modern-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="gradient" />
            </div>
            <p className="text-[#1f1f1f]/70">
              Faça login na sua conta
            </p>
            <div className="mt-4 text-sm text-slate-500">
              <p>Novo por aqui? </p>
              <button 
                onClick={handleSignupClick}
                className="text-[#3cd48f] hover:text-[#3cd48f]/80 underline"
              >
                Criar conta
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="modern-input"
                disabled={isLoading || forgotPasswordLoading}
                required
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pr-10 modern-input"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            )}

            {!isForgotPassword ? (
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white py-3 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleForgotPassword}
                className="w-full bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white py-3 text-lg font-semibold"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Email de Redefinição'
                )}
              </Button>
            )}
          </form>

          {!isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-[#3cd48f] hover:text-[#3cd48f]/80 underline"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          {isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Voltar ao login
              </button>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-6">
              <p className="text-sm text-green-600 font-medium">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-6">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Após o login, você será direcionado para o dashboard ou configuração
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
