// 🌐 Configuração de URLs da aplicação VMetrics

// URLs base
const LANDING_PAGE_URL = (import.meta as any).env?.VITE_APP_URL || 'https://vmetrics.com.br'
const DASHBOARD_APP_URL = (import.meta as any).env?.VITE_DASHBOARD_URL || 'https://app.vmetrics.com.br'
const LOCALHOST_URL = 'http://localhost:5173'

export const APP_URLS = {
  // URLs principais
  LANDING_PAGE: LANDING_PAGE_URL,
  DASHBOARD_APP: DASHBOARD_APP_URL,
  
  // URLs de desenvolvimento
  LOCALHOST: LOCALHOST_URL,
  
  // URLs do Stripe
  STRIPE_SUCCESS: `${DASHBOARD_APP_URL}/success`,
  STRIPE_CANCEL: `${LANDING_PAGE_URL}/pricing`,
  STRIPE_PORTAL_RETURN: `${DASHBOARD_APP_URL}/dashboard`,
  
  // URLs de autenticação
  AUTH_CALLBACK: `${DASHBOARD_APP_URL}/auth/callback`,
  AUTH_RESET_PASSWORD: `${DASHBOARD_APP_URL}/auth/reset-password`,
  
  // URLs de suporte
  SUPPORT: `${LANDING_PAGE_URL}/support`,
  DOCS: `${LANDING_PAGE_URL}/docs`,
  
  // URLs sociais
  GITHUB: 'https://github.com/vmetrics',
  LINKEDIN: 'https://linkedin.com/company/vmetrics',
  TWITTER: 'https://twitter.com/vmetrics'
} as const

// Função para detectar se está na URL do dashboard
export const isDashboardApp = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const hostname = window.location.hostname
  return hostname === 'app.vmetrics.com.br' || hostname === 'localhost'
}

// Função para detectar se está na URL da landing page
export const isLandingPage = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const hostname = window.location.hostname
  return hostname === 'vmetrics.com.br' || hostname === 'www.vmetrics.com.br'
}

// Função para obter a URL base atual
export const getCurrentBaseUrl = (): string => {
  if (typeof window === 'undefined') return APP_URLS.LANDING_PAGE
  
  const hostname = window.location.hostname
  
  if (hostname === 'app.vmetrics.com.br') {
    return APP_URLS.DASHBOARD_APP
  } else if (hostname === 'vmetrics.com.br' || hostname === 'www.vmetrics.com.br') {
    return APP_URLS.LANDING_PAGE
  } else if (hostname === 'localhost') {
    return APP_URLS.LOCALHOST
  }
  
  return APP_URLS.LANDING_PAGE
}

// Função para redirecionar para o dashboard
export const redirectToDashboard = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = APP_URLS.DASHBOARD_APP
  }
}

// Função para redirecionar para a landing page
export const redirectToLandingPage = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = APP_URLS.LANDING_PAGE
  }
}

// Função para obter URL de callback baseada no ambiente
export const getAuthCallbackUrl = (): string => {
  if (isDashboardApp()) {
    return APP_URLS.AUTH_CALLBACK
  }
  return APP_URLS.LOCALHOST + '/auth/callback'
}

// Função para obter URL de reset de senha baseada no ambiente
export const getResetPasswordUrl = (): string => {
  if (isDashboardApp()) {
    return APP_URLS.AUTH_RESET_PASSWORD
  }
  return APP_URLS.LOCALHOST + '/auth/reset-password'
}

export default APP_URLS
