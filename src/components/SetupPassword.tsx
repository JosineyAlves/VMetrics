import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'
import { supabase } from '../lib/supabase'

const SetupPassword: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [tokenType, setTokenType] = useState<'invite' | 'recovery' | null>(null)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // ✅ VERIFICAR SE HÁ TOKEN DE CONVITE OU REDEFINIÇÃO NA URL
  useEffect(() => {
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    
    // ✅ ACEITAR AMBOS: invite E recovery
    if (!token || (type !== 'invite' && type !== 'recovery')) {
      setError('Link inválido ou expirado')
      return
    }

    setTokenType(type as 'invite' | 'recovery')

    // Verificar se o token é válido e obter email do usuário
    const verifyToken = async () => {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as 'invite' | 'recovery' // ✅ USAR O TIPO CORRETO
        })

        if (error) {
          console.error('Erro ao verificar token:', error)
          setError('Link inválido ou expirado')
          return
        }

        if (data.user?.email) {
          setUserEmail(data.user.email)
        }
      } catch (err) {
        console.error('Erro ao verificar token:', err)
        setError('Erro ao processar link')
      }
    }

    verifyToken()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validações
    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    try {
      const token = searchParams.get('token')
      
      if (!token || !tokenType) {
        setError('Token não encontrado')
        setIsLoading(false)
        return
      }

      // ✅ PROCESSAR CONVITE OU REDEFINIÇÃO DE SENHA
      if (tokenType === 'invite') {
        // Aceitar o convite e definir a senha
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'invite'
        })

        if (error) {
          console.error('Erro ao aceitar convite:', error)
          setError('Erro ao processar convite. Tente novamente.')
          setIsLoading(false)
          return
        }
      } else if (tokenType === 'recovery') {
        // ✅ PROCESSAR REDEFINIÇÃO DE SENHA
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        })

        if (error) {
          console.error('Erro ao verificar token de redefinição:', error)
          setError('Erro ao processar redefinição de senha. Tente novamente.')
          setIsLoading(false)
          return
        }
      }

      // Atualizar a senha do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('Erro ao definir senha:', updateError)
        setError('Erro ao definir senha. Tente novamente.')
        setIsLoading(false)
        return
      }

      // Sucesso!
      setSuccess(true)
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Senha definida com sucesso! Faça login para continuar.',
            email: userEmail 
          }
        })
      }, 2000)

    } catch (err) {
      console.error('Erro ao processar setup de senha:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  // ✅ TÍTULO DINÂMICO BASEADO NO TIPO DE TOKEN
  const getTitle = () => {
    if (tokenType === 'recovery') {
      return 'Redefinir Senha'
    }
    return 'Definir Senha'
  }

  const getDescription = () => {
    if (tokenType === 'recovery') {
      return 'Redefina sua senha para acessar sua conta VMetrics'
    }
    return 'Defina sua senha para acessar sua conta VMetrics'
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="modern-card p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="xl" variant="gradient" />
              </div>
              <h1 className="text-2xl font-bold text-[#1f1f1f] mb-2">
                Senha Definida!
              </h1>
              <p className="text-[#1f1f1f]/70">
                Sua senha foi {tokenType === 'recovery' ? 'redefinida' : 'definida'} com sucesso. Você será redirecionado para o login.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  {tokenType === 'recovery' ? 'Senha redefinida com sucesso!' : 'Conta configurada com sucesso!'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500 mb-4">
                Redirecionando para o login...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#3cd48f] h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="modern-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="gradient" />
            </div>
            <h1 className="text-2xl font-bold text-[#1f1f1f] mb-2">
              {getTitle()}
            </h1>
            <p className="text-[#1f1f1f]/70">
              {getDescription()}
            </p>
            {userEmail && (
              <p className="text-sm text-slate-500 mt-2">
                Conta: <span className="font-medium">{userEmail}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                {tokenType === 'recovery' ? 'Nova Senha' : 'Nova Senha'}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
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
              <p className="text-xs text-slate-500 mt-1">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="pr-10 modern-input"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white py-3 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                  {tokenType === 'recovery' ? 'Redefinindo senha...' : 'Definindo senha...'}
                </>
              ) : (
                tokenType === 'recovery' ? 'Redefinir Senha' : 'Definir Senha'
              )}
            </Button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-6">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={handleBackToLogin}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Voltar para o login
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Após {tokenType === 'recovery' ? 'redefinir' : 'definir'} sua senha, você poderá fazer login e acessar sua conta
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupPassword