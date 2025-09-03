import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Verificar se há redirecionamento pendente
  const from = location.state?.from?.pathname || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Autenticação real com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Login bem-sucedido
        login(data.user)
        
        // Redirecionar para dashboard
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
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
                disabled={isLoading}
                required
              />
            </div>

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

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#3cd48f] hover:text-[#3cd48f]/80 underline"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-6">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Após o login, você será direcionado para o painel ou configuração
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm 