import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, ArrowRight, Shield, Zap, Users, BarChart3, X } from 'lucide-react'
import { LANDING_PLANS, formatPrice, getMainPrice, hasDiscount, getMaxDiscount, getPlanStripeUrl } from '../config/plans'
import { APP_URLS } from '../config/urls'

const LandingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlanSelection = async (planType: string) => {
    setSelectedPlan(planType)
    setIsLoading(true)
    
    try {
      const plan = LANDING_PLANS[planType]
      if (!plan) {
        throw new Error(`Plano ${planType} não encontrado`)
      }

      // Obter link do Stripe baseado no ambiente
      const stripeUrl = getPlanStripeUrl(planType)
      
      // Redirecionar para checkout do Stripe
      if (stripeUrl && stripeUrl.includes('stripe.com')) {
        window.open(stripeUrl, '_blank')
      } else {
        console.error('❌ URL do Stripe inválida:', stripeUrl)
        alert('Erro: URL de checkout inválida. Entre em contato com o suporte.')
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
      title: 'Dashboard Integrado',
      description: 'Conexão direta com RedTrack para dados em tempo real'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Análise de Conversões',
      description: 'Tracking completo de funil e performance de campanhas'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Métricas Avançadas',
      description: 'ROI, CPA, CTR e mais de 50 métricas essenciais'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Relatórios Inteligentes',
      description: 'Visualizações 3D e comparações entre campanhas'
    }
  ]

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'Marketing Manager',
      company: 'TechCorp',
      content: 'VMetrics revolucionou nossa análise de campanhas do RedTrack. ROI aumentou 40%!',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Digital Marketing',
      company: 'StartupXYZ',
      content: 'Dashboard intuitivo que transforma dados do RedTrack em insights acionáveis.',
      rating: 5
    },
    {
      name: 'Roberto Santos',
      role: 'CEO',
      company: 'E-commerce Plus',
      content: 'Finalmente uma ferramenta que integra perfeitamente com RedTrack e oferece análises profundas.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3cd48f]/5 via-white to-[#3cd48f]/10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/assets/images/logo.svg" 
                alt="VMetrics Logo" 
                className="h-8 w-auto"
              />
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
                className="bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Ver Planos
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
              Dashboard integrado ao{' '}
              <span className="bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 bg-clip-text text-transparent">
                RedTrack
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              VMetrics é o dashboard inteligente que transforma dados do RedTrack em insights acionáveis. 
              Monitore campanhas, analise conversões e otimize ROI com métricas em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#pricing"
                className="bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Ver Planos
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </a>
              <a
                href={APP_URLS.DASHBOARD_APP}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Acessar Dashboard
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RedTrack Integration Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#3cd48f]/5 to-[#10b981]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Integração Nativa com RedTrack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conecte-se diretamente ao RedTrack e tenha acesso instantâneo a todos os dados 
              de suas campanhas, conversões e performance em tempo real.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3cd48f]/20 to-[#3cd48f]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-[#3cd48f]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Conexão Instantânea
              </h3>
              <p className="text-gray-600">
                Conecte-se ao RedTrack em segundos com sua API key. 
                Dados sincronizados automaticamente.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3cd48f]/20 to-[#3cd48f]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-[#3cd48f]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Métricas em Tempo Real
              </h3>
              <p className="text-gray-600">
                Acompanhe ROI, CPA, CTR e mais de 50 métricas 
                atualizadas em tempo real.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3cd48f]/20 to-[#3cd48f]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#3cd48f]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Análise de Funil
              </h3>
              <p className="text-gray-600">
                Visualize o funil completo de conversões com 
                análises 3D e comparações entre campanhas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore as principais funcionalidades que fazem do VMetrics 
              o dashboard mais completo para análise de campanhas RedTrack.
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
                <div className="w-16 h-16 bg-gradient-to-r from-[#3cd48f]/20 to-[#3cd48f]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-[#3cd48f]">
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
              Planos para todos os tamanhos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para seu negócio e comece a transformar 
              seus dados do RedTrack em insights acionáveis hoje mesmo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(LANDING_PLANS).map(([planType, plan], index) => {
              const mainPrice = getMainPrice(plan)
              const showDiscount = hasDiscount(plan)
              const maxDiscount = getMaxDiscount(plan)
              
              return (
                <motion.div
                  key={planType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg p-8 ${
                    plan.popular ? 'ring-2 ring-[#3cd48f] scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      Mais Popular
                    </div>
                  )}
                  
                  {showDiscount && (
                    <div className="bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                      {maxDiscount}% OFF
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {mainPrice ? formatPrice(mainPrice.amount, mainPrice.currency) : 'Sob consulta'}
                    </span>
                    {mainPrice && mainPrice.interval === 'month' && (
                      <span className="text-gray-600">/mês</span>
                    )}
                    {mainPrice && mainPrice.interval === 'quarter' && (
                      <span className="text-gray-600">/trimestre</span>
                    )}
                  </div>
                  
                  {showDiscount && mainPrice && mainPrice.originalAmount && (
                    <div className="mb-4">
                      <span className="text-gray-500 line-through">
                        {formatPrice(mainPrice.originalAmount, mainPrice.currency)}
                      </span>
                      <span className="text-green-600 font-semibold ml-2">
                        Economia de {formatPrice(mainPrice.originalAmount - mainPrice.amount, mainPrice.currency)}
                      </span>
                    </div>
                  )}
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        )}
                        <span className={`${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelection(planType)}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isLoading ? 'Carregando...' : (planType === 'enterprise' ? 'Falar com Vendas' : 'Começar Agora')}
                  </button>
                </motion.div>
              )
            })}
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
              otimizar suas campanhas através da integração nativa com RedTrack.
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para otimizar suas campanhas RedTrack?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a centenas de empresas que já estão usando VMetrics 
            para transformar dados do RedTrack em insights acionáveis e resultados reais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="bg-white text-[#3cd48f] px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Ver Planos
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </a>
            <a
              href={APP_URLS.DASHBOARD_APP}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#3cd48f] transition-colors"
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
                <img 
                  src="/assets/images/logo-white.svg" 
                  alt="VMetrics Logo" 
                  className="h-6 w-auto"
                />
              </div>
              <p className="text-gray-400">
                Dashboard nativo integrado ao RedTrack para otimização de campanhas de marketing digital.
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
