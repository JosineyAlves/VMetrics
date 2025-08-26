// 🚀 Página de Cadastro para Usuários do Stripe
// Permite que usuários que compraram planos criem suas contas

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthService } from '../services/authService'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

interface LocationState {
  email: string
  planType: string
  stripeCustomerId: string
  fromStripe: boolean
}

export const SignupStripe: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dados do Stripe vindos do estado da navegação
  const stripeData = location.state as LocationState
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    email: stripeData?.email || '',
    fullName: '',
    password: '',
    confirmPassword: ''
  })
  
  // Verificar se veio do Stripe
  useEffect(() => {
    if (!stripeData?.fromStripe || !stripeData?.email) {
      console.error('❌ [SIGNUP] Acesso inválido: não veio do Stripe')
      navigate('/')
      return
    }
    
    console.log('✅ [SIGNUP] Usuário veio do Stripe:', stripeData)
  }, [stripeData, navigate])
  
  // Se não veio do Stripe, não mostrar nada
  if (!stripeData?.fromStripe) {
    return null
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validações
    if (!formData.fullName.trim()) {
      setError('Nome completo é obrigatório')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem')
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log('🚀 [SIGNUP] Criando conta para usuário do Stripe:', formData.email)
      
      // Criar conta usando o serviço de autenticação
      const result = await AuthService.createStripeAccount(
        formData.email,
        formData.password,
        formData.fullName,
        stripeData.planType,
        stripeData.stripeCustomerId
      )
      
      if (result.success && result.user) {
        console.log('✅ [SIGNUP] Conta criada com sucesso, redirecionando para setup')
        
        // Redirecionar para setup para configurar API key do RedTrack
        navigate('/setup', {
          state: {
            email: formData.email,
            planType: stripeData.planType,
            stripeCustomerId: stripeData.stripeCustomerId,
            fromSignup: true
          }
        })
      } else {
        setError(result.error || 'Erro ao criar conta')
      }
      
    } catch (error) {
      console.error('❌ [SIGNUP] Erro ao criar conta:', error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const getPlanDisplayName = (planType: string) => {
    return planType === 'monthly' ? 'Mensal' : 'Trimestral'
  }
  
  const getPlanPrice = (planType: string) => {
    return planType === 'monthly' ? 'R$ 79,00' : 'R$ 197,00'
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Bem-vindo ao VMetrics!
          </h1>
          <p className="text-gray-600">
            Complete seu cadastro para acessar o dashboard
          </p>
        </div>
        
        {/* Card do Plano */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Plano {getPlanDisplayName(stripeData.planType)}
              </h3>
              <p className="text-gray-600">
                {getPlanPrice(stripeData.planType)}/mês
              </p>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ✅ Ativo
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email (somente leitura) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3cd48f] focus:border-[#3cd48f] bg-gray-50 text-gray-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Email confirmado via Stripe
              </p>
            </div>
            
            {/* Nome Completo */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3cd48f] focus:border-[#3cd48f]"
                  placeholder="Digite seu nome completo"
                />
              </div>
            </div>
            
            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3cd48f] focus:border-[#3cd48f]"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            
            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3cd48f] focus:border-[#3cd48f]"
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>
            
            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Botão de Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3cd48f] hover:bg-[#10b981] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3cd48f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Criando conta...
                  </>
                ) : (
                  '🚀 Criar Conta e Continuar'
                )}
              </button>
            </div>
          </form>
          
          {/* Informações adicionais */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Próximos passos
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Após criar sua conta, você será direcionado para:</p>
              <ol className="mt-2 space-y-1 text-left max-w-xs mx-auto">
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-[#3cd48f] text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
                  Configurar API key do RedTrack
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-[#3cd48f] text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
                  Acessar o dashboard
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupStripe
