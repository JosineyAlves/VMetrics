// Configuração de rotas para o VMetrics
export const ROUTES = {
  // Rotas públicas (landing page)
  LANDING: '/',
  
  // Rotas de autenticação
  LOGIN: '/login',
  SIGNUP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Rotas do dashboard
  DASHBOARD: '/dashboard',
  INTEGRATION: '/integration-api-key',
  
  // Rotas de campanhas e analytics
  CAMPAIGNS: '/campaigns',
  CONVERSIONS: '/conversions',
  PERFORMANCE: '/performance',
  FUNNEL: '/funnel',
  SETTINGS: '/settings'
} as const

// Tipos para as rotas
export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]

// Configuração de navegação
export const NAVIGATION = {
  public: [
    { path: ROUTES.LANDING, label: 'Início' },
    { path: ROUTES.LOGIN, label: 'Login' },
    { path: ROUTES.SIGNUP, label: 'Criar Conta' }
  ],
  private: [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { path: ROUTES.CAMPAIGNS, label: 'Campanhas', icon: '📈' },
    { path: ROUTES.CONVERSIONS, label: 'Conversões', icon: '🎯' },
    { path: ROUTES.PERFORMANCE, label: 'Performance', icon: '⚡' },
    { path: ROUTES.FUNNEL, label: 'Funil', icon: '🔄' },
    { path: ROUTES.SETTINGS, label: 'Configurações', icon: '⚙️' }
  ]
}

// Verificar se uma rota é pública
export const isPublicRoute = (path: string): boolean => {
  return Object.values(ROUTES).includes(path as RoutePath) && 
         !path.startsWith('/dashboard') && 
         path !== ROUTES.INTEGRATION
}

// Verificar se uma rota é de autenticação
export const isAuthRoute = (path: string): boolean => {
  return [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.FORGOT_PASSWORD].includes(path as RoutePath)
}

// Verificar se uma rota é do dashboard
export const isDashboardRoute = (path: string): boolean => {
  return path.startsWith('/dashboard') || 
         [ROUTES.CAMPAIGNS, ROUTES.CONVERSIONS, ROUTES.PERFORMANCE, ROUTES.FUNNEL, ROUTES.SETTINGS].includes(path as RoutePath)
}
