import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Plano Mensal',
      price: 'R$ 79',
      period: '/mês',
      description: 'Acesso completo a todas as funcionalidades',
      features: [
        'Dashboard completo',
        'Relatórios avançados',
        'Suporte prioritário',
        'API access',
        'Exportação de dados'
      ],
      popular: false,
      stripePriceId: 'price_monthly' // Substitua pelo ID real do Stripe
    },
    {
      name: 'Plano Trimestral',
      price: 'R$ 197',
      period: '/trimestre',
      description: 'Melhor custo-benefício com desconto',
      features: [
        'Tudo do plano mensal',
        'Desconto de 17%',
        'Suporte prioritário',
        'Relatórios customizados',
        'Integração avançada'
      ],
      popular: true,
      stripePriceId: 'price_quarterly' // Substitua pelo ID real do Stripe
    }
  ];

  const handleSelectPlan = (planName: string) => {
    // Aqui você pode implementar a lógica de checkout
    console.log('Plano selecionado:', planName);
    // Por enquanto, redirecionar para dashboard (você pode implementar checkout depois)
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acesse todas as funcionalidades do TrackView e maximize o potencial das suas campanhas
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-xl text-gray-600 ml-1">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Escolher Plano
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="bg-blue-50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Precisa de ajuda para escolher?
            </h3>
            <p className="text-gray-600 mb-6">
              Nossa equipe está pronta para ajudar você a encontrar o plano ideal para suas necessidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar ao Dashboard
              </button>
              <button
                onClick={() => window.open('mailto:suporte@vmetrics.com.br', '_blank')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
