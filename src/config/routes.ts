// 🛣️ Configuração centralizada de rotas da aplicação

export const ROUTES = {
  // Rotas públicas
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  
  // Rotas de setup
  SETUP: '/setup',
  
  // Rotas do dashboard
  DASHBOARD: '/dashboard',
  CAMPAIGNS: '/campaigns',
  CONVERSIONS: '/conversions',
  PERFORMANCE: '/performance',
  FUNNEL: '/funnel',
  SETTINGS: '/settings',
  
  // Rotas de autenticação
  AUTH_CALLBACK: '/auth/callback',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  
  // Rotas de pagamento
  STRIPE_SUCCESS: '/success',
  STRIPE_CANCEL: '/cancel',
  STRIPE_PORTAL: '/billing'
} as const

// Tipos para as rotas
export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]

// Configuração das rotas protegidas
export const PROTECTED_ROUTES: RoutePath[] = [
  ROUTES.SETUP,
  ROUTES.DASHBOARD,
  ROUTES.CAMPAIGNS,
  ROUTES.CONVERSIONS,
  ROUTES.PERFORMANCE,
  ROUTES.FUNNEL,
  ROUTES.SETTINGS
]

// Configuração das rotas públicas
export const PUBLIC_ROUTES: RoutePath[] = [
  ROUTES.LANDING,
  ROUTES.LOGIN,
  ROUTES.SIGNUP
]

// Verificar se uma rota é protegida
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.includes(path as RoutePath)
}

// Verificar se uma rota é pública
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.includes(path as RoutePath)
}

// Obter título da rota
export const getRouteTitle = (path: string): string => {
  const titles: Record<RoutePath, string> = {
    [ROUTES.LANDING]: 'TrackView - Analytics Inteligente',
    [ROUTES.LOGIN]: 'Login - TrackView',
    [ROUTES.SIGNUP]: 'Criar Conta - TrackView',
    [ROUTES.SETUP]: 'Configuração - TrackView',
    [ROUTES.DASHBOARD]: 'Dashboard - TrackView',
    [ROUTES.CAMPAIGNS]: 'Campanhas - TrackView',
    [ROUTES.CONVERSIONS]: 'Conversões - TrackView',
    [ROUTES.PERFORMANCE]: 'Performance - TrackView',
    [ROUTES.FUNNEL]: 'Funil - TrackView',
    [ROUTES.SETTINGS]: 'Configurações - TrackView',
    [ROUTES.AUTH_CALLBACK]: 'Autenticação - TrackView',
    [ROUTES.AUTH_RESET_PASSWORD]: 'Redefinir Senha - TrackView',
    [ROUTES.STRIPE_SUCCESS]: 'Pagamento Confirmado - TrackView',
    [ROUTES.STRIPE_CANCEL]: 'Pagamento Cancelado - TrackView',
    [ROUTES.STRIPE_PORTAL]: 'Faturamento - TrackView'
  }
  
  return titles[path as RoutePath] || 'TrackView'
}

// Obter descrição da rota
export const getRouteDescription = (path: string): string => {
  const descriptions: Record<RoutePath, string> = {
    [ROUTES.LANDING]: 'Plataforma de analytics inteligente para campanhas de marketing digital',
    [ROUTES.LOGIN]: 'Acesse sua conta TrackView',
    [ROUTES.SIGNUP]: 'Crie sua conta TrackView e comece a analisar suas campanhas',
    [ROUTES.SETUP]: 'Configure sua conta e API Key para começar',
    [ROUTES.DASHBOARD]: 'Visão geral e KPIs das suas campanhas',
    [ROUTES.CAMPAIGNS]: 'Análise detalhada de campanhas e performance',
    [ROUTES.CONVERSIONS]: 'Log completo de conversões e eventos',
    [ROUTES.PERFORMANCE]: 'Análises avançadas e relatórios',
    [ROUTES.FUNNEL]: 'Funil de conversão e análise de jornada',
    [ROUTES.SETTINGS]: 'Configurações da conta e preferências',
    [ROUTES.AUTH_CALLBACK]: 'Processando autenticação',
    [ROUTES.AUTH_RESET_PASSWORD]: 'Redefina sua senha de forma segura',
    [ROUTES.STRIPE_SUCCESS]: 'Pagamento processado com sucesso',
    [ROUTES.STRIPE_CANCEL]: 'Pagamento cancelado ou falhou',
    [ROUTES.STRIPE_PORTAL]: 'Gerencie seu plano e faturamento'
  }
  
  return descriptions[path as RoutePath] || 'TrackView - Analytics Inteligente'
}

export default ROUTES
