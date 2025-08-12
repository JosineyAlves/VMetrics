import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth'
import { ROUTES, getDefaultRoute, isProtectedRoute } from '../config/routes'
import LandingPage from './LandingPage'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import Dashboard from './Dashboard'
import Campaigns from './Campaigns'
import Conversions from './Conversions'
import Performance from './Performance'
import Funnel from './Funnel'
import Settings from './Settings'
import IntegrationApiKey from './IntegrationApiKey'
import OnboardingWelcome from './OnboardingWelcome'

const AppRouter: React.FC = () => {
  const { isAuthenticated, apiKey } = useAuthStore()
  const [currentRoute, setCurrentRoute] = useState<string>('/')
  const [isFirstAccess, setIsFirstAccess] = useState(false)

  // Detectar rota atual
  useEffect(() => {
    const path = window.location.pathname
    setCurrentRoute(path)
    
    // Verificar se é primeiro acesso (usuário recém-criado)
    const urlParams = new URLSearchParams(window.location.search)
    const isNewUser = urlParams.get('new_user') === 'true'
    setIsFirstAccess(isNewUser)
    
    console.log(`🌐 Rota atual: ${path} | Primeiro acesso: ${isNewUser}`)
  }, [])

  // Escutar mudanças de rota
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname
      setCurrentRoute(path)
      console.log(`🔄 Mudança de rota para: ${path}`)
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  // Verificar se usuário pode acessar rota protegida
  const canAccessProtectedRoute = (route: string): boolean => {
    if (!isAuthenticated) return false
    
    // Se não tem API Key, só pode acessar tela de integração
    if (!apiKey && route !== ROUTES.INTEGRATION_API_KEY) {
      return false
    }
    
    return true
  }

  // Renderizar componente baseado na rota
  const renderComponent = () => {
    // Rotas públicas
    if (currentRoute === ROUTES.LANDING_PAGE) {
      return <LandingPage />
    }

    if (currentRoute === ROUTES.LOGIN) {
      return <LoginForm />
    }

    if (currentRoute === ROUTES.SIGNUP) {
      return <SignupForm />
    }

    if (currentRoute === ROUTES.FORGOT_PASSWORD) {
      return <LoginForm showForgotPassword={true} />
    }

    // Rotas protegidas (requerem autenticação)
    if (isProtectedRoute(currentRoute)) {
      if (!canAccessProtectedRoute(currentRoute)) {
        // Redirecionar para rota apropriada
        const defaultRoute = getDefaultRoute(!!apiKey, isFirstAccess)
        console.log(`🚫 Acesso negado. Redirecionando para: ${defaultRoute}`)
        window.location.href = defaultRoute
        return null
      }

      // Renderizar componente baseado na rota
      switch (currentRoute) {
        case ROUTES.DASHBOARD:
          return <Dashboard />
        
        case ROUTES.CAMPAIGNS:
          return <Campaigns />
        
        case ROUTES.CONVERSIONS:
          return <Conversions />
        
        case ROUTES.PERFORMANCE:
          return <Performance />
        
        case ROUTES.FUNNEL:
          return <Funnel />
        
        case ROUTES.SETTINGS:
          return <Settings />
        
        case ROUTES.INTEGRATION_API_KEY:
          return <IntegrationApiKey />
        
        default:
          return <Dashboard />
      }
    }

    // Rota não encontrada - redirecionar para landing page
    console.log(`❌ Rota não encontrada: ${currentRoute}. Redirecionando para landing page.`)
    window.location.href = ROUTES.LANDING_PAGE
    return null
  }

  // Renderizar roteador
  return (
    <div className="app-router">
      {renderComponent()}
    </div>
  )
}

export default AppRouter
