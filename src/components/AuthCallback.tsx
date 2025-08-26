// 🔐 Componente de Callback de Autenticação
// Processa o retorno do link mágico enviado por email após compra

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthService } from '../services/authService'
import { LoadingSpinner } from './ui/LoadingSpinner'

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        console.log('🔐 [CALLBACK] Iniciando processamento do callback de autenticação')
        
        // Extrair parâmetros da URL
        const email = searchParams.get('email')
        const planType = searchParams.get('plan')
        const stripeCustomerId = searchParams.get('stripe')
        
        console.log('🔐 [CALLBACK] Parâmetros recebidos:', { email, planType, stripeCustomerId })
        
        // Validar parâmetros obrigatórios
        if (!email || !planType || !stripeCustomerId) {
          throw new Error('Parâmetros de autenticação inválidos ou incompletos')
        }
        
        // Processar callback de autenticação
        console.log('🔐 [CALLBACK] Processando autenticação para:', email)
        const authState = await AuthService.handleAuthCallback(email, planType, stripeCustomerId)
        
        console.log('🔐 [CALLBACK] Estado de autenticação:', authState)
        
        if (authState.isAuthenticated) {
          // Usuário já autenticado
          if (authState.needsSetup) {
            console.log('🔐 [CALLBACK] Usuário autenticado, redirecionando para setup')
            navigate('/setup', { 
              state: { 
                email, 
                planType,
                stripeCustomerId,
                fromAuth: true 
              } 
            })
          } else {
            console.log('🔐 [CALLBACK] Usuário já configurado, redirecionando para dashboard')
            navigate('/dashboard')
          }
        } else if (authState.fromStripe) {
          // Usuário veio do Stripe, redirecionar para cadastro
          console.log('🔐 [CALLBACK] Usuário do Stripe, redirecionando para cadastro')
          navigate('/signup', { 
            state: { 
              email, 
              planType,
              stripeCustomerId,
              fromStripe: true 
            } 
          })
        } else {
          // Dados inválidos ou usuário não encontrado
          console.error('🔐 [CALLBACK] Dados inválidos ou usuário não encontrado')
          setError('Link de acesso inválido ou expirado. Entre em contato com o suporte.')
        }
        
      } catch (error) {
        console.error('❌ [CALLBACK] Erro no callback de autenticação:', error)
        setError('Falha na autenticação. Tente novamente ou entre em contato com o suporte.')
      } finally {
        setIsProcessing(false)
      }
    }
    
    processAuthCallback()
  }, [searchParams, navigate])
  
  // Mostrar loading enquanto processa
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Processando autenticação...
          </h2>
          <p className="mt-2 text-gray-600">
            Aguarde enquanto verificamos seus dados
          </p>
        </div>
      </div>
    )
  }
  
  // Mostrar erro se houver
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro na Autenticação
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Voltar ao Início
            </button>
            
            <button
              onClick={() => navigate('/contact')}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Contatar Suporte
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}

export default AuthCallback
