// 🔗 Configuração dos Links do Stripe
// Separando links de teste e produção para facilitar manutenção

export const STRIPE_LINKS = {
  // 🔴 LINKS DE TESTE (Stripe Test Mode)
  test: {
    monthly: 'https://buy.stripe.com/test_8x214oa7m2gP5t7e1K33W03',    // R$ 79,00
    quarterly: 'https://buy.stripe.com/test_8x2aEY0wM5t11cRaPy33W04'  // R$ 197,00
  },
  
  // 🟢 LINKS DE PRODUÇÃO (Stripe Live Mode)
  production: {
    monthly: 'https://buy.stripe.com/8x214oa7m2gP5t7e1K33W03',        // R$ 79,00
    quarterly: 'https://buy.stripe.com/8x2aEY0wM5t11cRaPy33W04'       // R$ 197,00
  }
}

// Função para obter os links baseado no ambiente
export const getStripeLinks = () => {
  // Verificar se está em produção baseado no hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'vmetrics.com.br' || hostname === 'www.vmetrics.com.br') {
      return STRIPE_LINKS.production
    }
  }
  
  // Por padrão, usar links de teste
  return STRIPE_LINKS.test
}

// Função para obter link específico de um plano
export const getStripeLink = (planType: 'monthly' | 'quarterly') => {
  const links = getStripeLinks()
  return links[planType] || links.monthly
}

export default STRIPE_LINKS
