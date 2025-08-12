import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'
import { APP_URLS } from '../config/urls'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { signIn, loading, error: authError, resetPassword } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Validar campos obrigatórios
      if (!email || !password) {
        setError('Por favor, preencha todos os campos')
        return
      }

      console.log('🔄 Tentando autenticar:', email)
      
      // Autenticação real com Supabase
      const result = await signIn(email, password)
      
      if (result.success) {
        console.log('✅ Login bem-sucedido via Supabase')
        // O hook useAuth já gerencia o estado de autenticação
        // O usuário será redirecionado automaticamente pelo App.tsx
      } else {
        setError(result.error || 'Erro ao fazer login')
      }
    } catch (err) {
      setError('Erro inesperado ao fazer login')
    }
  }

  // Função para reset de senha
  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu email para redefinir a senha')
      return
    }

    try {
      const result = await resetPassword(email)
      if (result.success) {
        alert('Email de redefinição enviado! Verifique sua caixa de entrada.')
      } else {
        setError(result.error || 'Erro ao enviar email de redefinição')
      }
    } catch (err) {
      setError('Erro ao solicitar redefinição de senha')
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
            <p className="text-slate-600">
              Faça login na sua conta VMetrics
            </p>
                                 <div className="mt-4 text-sm text-slate-500">
                       <p>Novo por aqui? </p>
                       <a 
                         href={APP_URLS.LANDING_PAGE} 
                         className="text-blue-600 hover:text-blue-700 underline"
                       >
                         Conheça nossos planos
                       </a>
                     </div>
                     
                     <div className="mt-2 text-sm text-slate-500">
                       <a 
                         href="#" 
                         onClick={(e) => {
                           e.preventDefault()
                           handleResetPassword()
                         }}
                         className="text-blue-600 hover:text-blue-700 underline"
                       >
                         Esqueci minha senha
                       </a>
                     </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="modern-input"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
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
                           disabled={loading}
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
                       className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                       disabled={loading}
                     >
                       {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

                             {(error || authError) && (
                     <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-6">
                       <p className="text-sm text-red-600 font-medium mb-2">{error || authError}</p>
                                     {(error || authError)?.includes('401') && (
                         <div className="mt-3">
                           <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                           <ul className="text-xs text-red-500 space-y-1">
                             <li>• Verifique se suas credenciais estão corretas</li>
                             <li>• A senha pode ter sido alterada</li>
                             <li>• Verifique se o email está correto</li>
                             <li>• Use a opção "Esqueci minha senha" se necessário</li>
                           </ul>
                         </div>
                       )}
                       {(error || authError)?.includes('403') && (
                         <div className="mt-3">
                           <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                           <ul className="text-xs text-red-500 space-y-1">
                             <li>• Verifique se sua conta está ativa</li>
                             <li>• Entre em contato com o suporte</li>
                           </ul>
                         </div>
                       )}
                       {(error || authError)?.includes('429') && (
                         <div className="mt-3">
                           <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                           <ul className="text-xs text-red-500 space-y-1">
                             <li>• Aguarde alguns minutos antes de tentar novamente</li>
                             <li>• Muitas tentativas de login</li>
                           </ul>
                         </div>
                       )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Sua API Key será salva localmente para facilitar o acesso futuro
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <a 
                href={APP_URLS.LANDING_PAGE} 
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Voltar à página principal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm 