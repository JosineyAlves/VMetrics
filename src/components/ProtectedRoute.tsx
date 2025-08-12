import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { ROUTES } from '../config/routes'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireApiKey?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireApiKey = false 
}) => {
  const { isAuthenticated, apiKey } = useAuthStore()
  const location = useLocation()

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Se precisar de API Key mas não tiver, redirecionar para integração
  if (requireApiKey && (!apiKey || apiKey === 'demo_key')) {
    return <Navigate to={ROUTES.INTEGRATION} replace />
  }

  // Se tudo estiver ok, renderizar o componente
  return <>{children}</>
}

export default ProtectedRoute
