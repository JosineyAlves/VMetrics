import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { LANDING_PLANS, formatPrice, getMainPrice, hasDiscount, getMaxDiscount, getBillingNote, getPlanStripeUrl } from '../config/plans';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planType: string) => {
    setSelectedPlan(planType);
    setIsLoading(true);
    
    try {
      const plan = LANDING_PLANS[planType];
      if (!plan) {
        throw new Error(`Plano ${planType} não encontrado`);
      }

      // Obter link do Stripe baseado no ambiente
      const stripeUrl = getPlanStripeUrl(planType);
      
      // Redirecionar para checkout do Stripe
      if (stripeUrl && stripeUrl.includes('stripe.com')) {
        window.open(stripeUrl, '_blank');
      } else {
        console.error('❌ URL do Stripe inválida:', stripeUrl);
        alert('Erro: URL de checkout inválida. Entre em contato com o suporte.');
      }
    } catch (error) {
      console.error('❌ Erro ao abrir checkout:', error);
      alert('Erro ao abrir checkout. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#1f1f1f] mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-[#1f1f1f]/70 max-w-3xl mx-auto">
            Acesse todas as funcionalidades do VMetrics e maximize o potencial das suas campanhas
          </p>
        </div>


        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(LANDING_PLANS).map(([planType, plan]) => {
            const mainPrice = getMainPrice(plan);
            const hasPlanDiscount = hasDiscount(plan);
            const maxDiscount = getMaxDiscount(plan);
            const billingNote = getBillingNote(plan);
            const isPopular = plan.bestValue || plan.recommended;
            const isLoading = selectedPlan === planType;

            return (
              <div
                key={planType}
                className={`relative bg-white/90 rounded-2xl shadow-lg border-2 p-8 transition-all duration-300 hover:shadow-xl ${
                  isPopular 
                    ? 'border-[#3cd48f] ring-2 ring-[#3cd48f] ring-opacity-50' 
                    : 'border-[#e2e8f0] hover:border-[#3cd48f]/20'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#3cd48f] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {plan.bestValue ? 'Melhor Valor' : 'Recomendado'}
                    </span>
                  </div>
                )}

                {hasPlanDiscount && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      -{maxDiscount}%
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#1f1f1f] mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-[#1f1f1f]/70 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-[#3cd48f]">
                      {mainPrice ? formatPrice(mainPrice.amount, mainPrice.currency) : 'Sob consulta'}
                    </span>
                    <span className="text-xl text-[#1f1f1f]/70 ml-1">
                      {mainPrice?.interval === 'month' ? '/mês' : mainPrice?.interval === 'quarter' ? '/trimestre' : ''}
                    </span>
                  </div>
                  {billingNote && (
                    <p className="text-sm text-[#1f1f1f]/60 mt-2">{billingNote}</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-center">
                      <Check className="h-5 w-5 text-[#3cd48f] mr-3 flex-shrink-0" />
                      <span className="text-[#1f1f1f]/80">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(planType)}
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center ${
                    isPopular
                      ? 'bg-[#3cd48f] text-white hover:bg-[#3cd48f]/90 shadow-lg shadow-[#3cd48f]/25'
                      : 'bg-[#1f1f1f] text-white hover:bg-[#1f1f1f]/90'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      Escolher Plano
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="bg-[#3cd48f]/10 rounded-2xl p-8 max-w-2xl mx-auto border border-[#3cd48f]/20">
            <h3 className="text-xl font-semibold text-[#1f1f1f] mb-4">
              Precisa de ajuda para adquirir o plano?
            </h3>
            <p className="text-[#1f1f1f]/70 mb-6">
              Está com dúvidas sobre qual plano escolher ou precisa de suporte para finalizar sua assinatura? Nossa equipe está pronta para ajudar!
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.open('mailto:suporte@vmetrics.com.br', '_blank')}
                className="px-6 py-3 bg-[#3cd48f] text-white rounded-xl hover:bg-[#3cd48f]/90 transition-colors shadow-lg shadow-[#3cd48f]/25"
              >
                Falar com Suporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
