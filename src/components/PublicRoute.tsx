import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { ROUTES } from '../config/routes'

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  // Se estiver autenticado e tentar acessar rota pública, redirecionar para dashboard
  if (isAuthenticated) {
    // Se veio de uma rota protegida, voltar para ela
    const from = location.state?.from?.pathname
    if (from && from !== ROUTES.LOGIN) {
      return <Navigate to={from} replace />
    }
    
    // Senão, ir para dashboard
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  // Se não estiver autenticado, mostrar a rota pública
  return <>{children}</>
}

export default PublicRoute
