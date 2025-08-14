import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight } from 'lucide-react'

const SetupRedirect: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, apiKey } = useAuthStore()

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      })
      return
    }

    // Se não tiver API Key, redirecionar para setup
    if (!apiKey) {
      navigate('/setup', { replace: true })
      return
    }

    // Se tudo estiver configurado, redirecionar para dashboard
    navigate('/dashboard', { replace: true })
  }, [isAuthenticated, apiKey, navigate, location])

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

