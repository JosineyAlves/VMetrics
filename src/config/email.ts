// Configurações para o sistema de email do VMetrics
export const EMAIL_CONFIG = {
  // Templates de email
  templates: {
    welcome: {
      subject: 'Bem-vindo ao VMetrics! Sua conta foi criada com sucesso',
      title: 'Bem-vindo ao VMetrics! 🎉',
      subtitle: 'Sua conta foi criada e está pronta para uso'
    },
    planUpgrade: {
      subject: 'Plano atualizado com sucesso no VMetrics',
      title: 'Plano atualizado! 🚀',
      subtitle: 'Seu plano foi atualizado e novos recursos estão disponíveis'
    },
    planConfirmation: {
      subject: 'Confirmação de assinatura - VMetrics',
      title: 'Assinatura confirmada! ✅',
      subtitle: 'Seu plano está ativo e funcionando'
    }
  },

  // Configurações do Supabase
  supabase: {
    // URL da Edge Function para envio de emails
    emailFunctionUrl: '/functions/v1/send-email',
    
    // Configurações de email
    from: {
      name: 'VMetrics',
      email: 'noreply@vmetrics.com.br'
    },
    
    // Configurações de resposta
    replyTo: 'suporte@vmetrics.com.br'
  },

  // Links importantes
  links: {
    login: 'https://app.vmetrics.com.br/login',
    dashboard: 'https://app.vmetrics.com.br/dashboard',
    support: 'https://vmetrics.com.br/suporte',
    docs: 'https://docs.vmetrics.com.br'
  },

  // Configurações de branding
  branding: {
    primaryColor: '#3cd48f',
    logoUrl: 'https://vmetrics.com.br/logo.png',
    companyName: 'VMetrics',
    companyAddress: 'São Paulo, SP - Brasil'
  }
}

// Tipos de email que podem ser enviados
export type EmailType = 'welcome' | 'planUpgrade' | 'planConfirmation' | 'passwordReset' | 'accountVerification'

// Interface para dados do usuário
export interface EmailUserData {
  email: string
  fullName: string
  planType?: string
  planName?: string
  planPrice?: string
  loginUrl?: string
}

// Interface para dados do plano
export interface EmailPlanData {
  planType: string
  planName: string
  planPrice: string
  features: string[]
  nextBilling?: string
  status: 'active' | 'canceled' | 'past_due'
}

