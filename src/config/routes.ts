// Configuração de rotas da aplicação
export const ROUTES = {
  // Rotas públicas
  LANDING_PAGE: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Rotas do dashboard (requerem autenticação)
  DASHBOARD: '/dashboard',
  CAMPAIGNS: '/campaigns',
  CONVERSIONS: '/conversions',
  PERFORMANCE: '/performance',
  FUNNEL: '/funnel',
  SETTINGS: '/settings',
  
  // Rotas de integração
  INTEGRATION_API_KEY: '/integration-api-key',
  INTEGRATION_REDTRACK: '/integration-redtrack',
  
  // Rotas de onboarding
  ONBOARDING_WELCOME: '/onboarding/welcome',
  ONBOARDING_SETUP: '/onboarding/setup',
  ONBOARDING_COMPLETE: '/onboarding/complete'
} as const

// Tipos para as rotas
export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]

// Configuração de rotas protegidas (requerem autenticação)
export const PROTECTED_ROUTES: RoutePath[] = [
  ROUTES.DASHBOARD,
  ROUTES.CAMPAIGNS,
  ROUTES.CONVERSIONS,
  ROUTES.PERFORMANCE,
  ROUTES.FUNNEL,
  ROUTES.SETTINGS,
  ROUTES.INTEGRATION_API_KEY,
  ROUTES.INTEGRATION_REDTRACK
]

// Configuração de rotas públicas
export const PUBLIC_ROUTES: RoutePath[] = [
  ROUTES.LANDING_PAGE,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD
]

// Verificar se uma rota é protegida
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.includes(path as RoutePath)
}

// Verificar se uma rota é pública
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.includes(path as RoutePath)
}

// Obter rota padrão baseada no status do usuário
export const getDefaultRoute = (hasApiKey: boolean, isFirstAccess: boolean): RoutePath => {
  if (isFirstAccess) {
    return ROUTES.ONBOARDING_WELCOME
  }
  
  if (!hasApiKey) {
    return ROUTES.INTEGRATION_API_KEY
  }
  
  return ROUTES.DASHBOARD
}

// Redirecionar para rota específica
export const redirectTo = (path: RoutePath): void => {
  window.location.href = path
}

// Navegar para rota específica (sem reload)
export const navigateTo = (path: RoutePath): void => {
  window.history.pushState({}, '', path)
  // Disparar evento para notificar mudança de rota
  window.dispatchEvent(new PopStateEvent('popstate'))
}
