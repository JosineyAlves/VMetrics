import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, ArrowRight, Shield, Zap, Users, BarChart3 } from 'lucide-react'
import { STRIPE_PRODUCTS } from '../config/stripe'
import { APP_URLS } from '../config/urls'

const LandingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Links diretos do Stripe - ATUALIZAR COM SUAS URLs REAIS
  const STRIPE_CHECKOUT_LINKS = {
  starter: 'https://buy.stripe.com/test_14A7sM1AQ8FddZD0aU33W01', // Plano Starter
  pro: 'https://buy.stripe.com/test_8x200k0wM6x53kZ5ve33W02',     // Plano Pro
  enterprise: 'https://buy.stripe.com/test_8x200k0wM6x53kZ5ve33W02' // Plano Enterprise (mesmo do Pro por enquanto)
}

  const handlePlanSelection = async (planType: string) => {
    setSelectedPlan(planType)
    setIsLoading(true)
    
    try {
      // Redirecionar para checkout do Stripe
      const checkoutUrl = STRIPE_CHECKOUT_LINKS[planType as keyof typeof STRIPE_CHECKOUT_LINKS]
      if (checkoutUrl) {
        // Verificar se a URL é válida
        if (checkoutUrl.includes('stripe.com')) {
          window.open(checkoutUrl, '_blank')
        } else {
          console.error('❌ URL do Stripe inválida:', checkoutUrl)
          alert('Erro: URL de checkout inválida. Entre em contato com o suporte.')
        }
      } else {
        console.error('❌ URL não encontrada para o plano:', planType)
        alert('Erro: Plano não configurado. Entre em contato com o suporte.')
      }
    } catch (error) {
      console.error('❌ Erro ao abrir checkout:', error)
      alert('Erro ao abrir checkout. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analytics Avançados',
      description: 'Métricas detalhadas de performance de campanhas'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Gestão de Campanhas',
      description: 'Controle total sobre suas campanhas de marketing'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Automação Inteligente',
      description: 'Otimização automática baseada em dados reais'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Segurança Enterprise',
      description: 'Proteção de dados com padrões internacionais'
    }
  ]

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'Marketing Manager',
      company: 'TechCorp',
      content: 'VMetrics revolucionou nossa forma de analisar campanhas. ROI aumentou 40%!',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Digital Marketing',
      company: 'StartupXYZ',
      content: 'Interface intuitiva e relatórios que realmente fazem sentido para o negócio.',
      rating: 5
    },
    {
      name: 'Roberto Santos',
      role: 'CEO',
      company: 'E-commerce Plus',
      content: 'Finalmente uma ferramenta que une simplicidade com poder analítico.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VMetrics
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={APP_URLS.DASHBOARD_APP}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </a>
              <a
                href="#pricing"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Começar Agora
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforme seus{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                dados em resultados
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              VMetrics é a plataforma completa de analytics que conecta dados de campanhas, 
              conversões e performance em um dashboard inteligente e acionável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#pricing"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </a>
              <a
                href={APP_URLS.DASHBOARD_APP}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Ver Demo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher VMetrics?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma combina simplicidade com poder analítico para 
              transformar dados complexos em insights acionáveis.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos que crescem com você
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para seu negócio e comece a transformar 
              seus dados em resultados hoje mesmo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(STRIPE_PRODUCTS).map(([planType, plan], index) => (
              <motion.div
                key={planType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg p-8 ${
                  planType === 'pro' ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {planType === 'pro' && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Mais Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    R$ {plan.price}
                  </span>
                  <span className="text-gray-600">/mês</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePlanSelection(planType)}
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    planType === 'pro'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isLoading ? 'Carregando...' : 'Começar Agora'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Empresas de todos os tamanhos confiam no VMetrics para 
              impulsionar seus resultados de marketing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para transformar seus dados?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já estão usando VMetrics 
            para impulsionar seus resultados de marketing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </a>
            <a
              href={APP_URLS.DASHBOARD_APP}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Acessar Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VMetrics</span>
              </div>
              <p className="text-gray-400">
                Transformando dados em resultados para empresas de todos os tamanhos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VMetrics. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
