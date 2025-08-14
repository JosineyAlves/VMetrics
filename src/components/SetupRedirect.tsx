import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight } from 'lucide-react'
import RedTrackService from '../services/redtrackService'

const SetupRedirect: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, apiKey, user } = useAuthStore()

  useEffect(() => {
    const checkApiKeyStatus = async () => {
      // Se não estiver autenticado, redirecionar para login
      if (!isAuthenticated) {
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        })
        return
      }

      // Se não tiver usuário, aguardar
      if (!user?.id) {
        return
      }

      try {
        // Verificar se já existe API Key no Supabase
        const result = await RedTrackService.checkExistingApiKey(user.id)
        
        if (result.success && result.apiKey) {
          // Já tem API Key configurada, ir para dashboard
          console.log('✅ API Key já configurada, redirecionando para dashboard')
          navigate('/dashboard', { replace: true })
        } else {
          // Não tem API Key, ir para configuração
          console.log('❌ API Key não configurada, redirecionando para setup')
          navigate('/api-setup', { replace: true })
        }
      } catch (error) {
        console.error('Erro ao verificar API Key:', error)
        // Em caso de erro, ir para configuração
        navigate('/api-setup', { replace: true })
      }
    }

    checkApiKeyStatus()
  }, [isAuthenticated, user, navigate, location])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
          <ArrowRight className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Configurando sua conta...
        </h2>
        <p className="text-gray-600">
          Aguarde enquanto preparamos tudo para você
        </p>
      </motion.div>
    </div>
  )
}

export default SetupRedirect
