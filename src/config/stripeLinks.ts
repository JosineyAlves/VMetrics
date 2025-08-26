// 🔗 Configuração dos Links do Stripe
// Separando links de teste e produção para facilitar manutenção

export const STRIPE_LINKS = {
  // 🔴 LINKS DE TESTE (Stripe Test Mode)
  test: {
    starter: 'https://buy.stripe.com/test_28o5kL8vB2Fj8wEUV',
    pro: 'https://buy.stripe.com/test_28o5kL8vB2Fj8wEUV',
    enterprise: 'https://buy.stripe.com/test_28o5kL8vB2Fj8wEUV'
  },
  
  // 🟢 LINKS DE PRODUÇÃO (Stripe Live Mode)
  production: {
    starter: 'https://buy.stripe.com/28o5kL8vB2Fj8wEUV', // ATUALIZAR COM URL REAL
    pro: 'https://buy.stripe.com/28o5kL8vB2Fj8wEUV',     // ATUALIZAR COM URL REAL
    enterprise: 'https://buy.stripe.com/28o5kL8vB2Fj8wEUV' // ATUALIZAR COM URL REAL
  }
}

// Função para obter os links baseado no ambiente
export const getStripeLinks = () => {
  const isProduction = import.meta.env.MODE === 'production' || 
                      import.meta.env.VITE_NODE_ENV === 'production' ||
                      window.location.hostname === 'vmetrics.com.br'
  
  return isProduction ? STRIPE_LINKS.production : STRIPE_LINKS.test
}

// Função para obter link específico de um plano
export const getStripeLink = (planType: 'starter' | 'pro' | 'enterprise') => {
  const links = getStripeLinks()
  return links[planType] || links.starter
}

export default STRIPE_LINKS
