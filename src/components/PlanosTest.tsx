import React from 'react'
import { STRIPE_PRODUCTS } from '../config/stripe'
import { Button } from './ui/button'
import { CheckCircle } from 'lucide-react'

const PlanosTest: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🧪 **Teste dos Novos Planos**
        </h1>
        <p className="text-gray-600">
          Verificando se os novos planos estão sendo exibidos corretamente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plano Mensal */}
        <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              {STRIPE_PRODUCTS.monthly.name}
            </h4>
            <div className="text-3xl font-bold text-[#3cd48f] mb-1">
              R$ {(STRIPE_PRODUCTS.monthly.prices.monthly.amount / 100).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-gray-600">por mês</div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="line-through text-gray-400">
                R$ {(STRIPE_PRODUCTS.monthly.prices.monthly.originalPrice / 100).toFixed(2).replace('.', ',')}
              </span>
              <span className="text-green-600 font-medium ml-2">
                {STRIPE_PRODUCTS.monthly.prices.monthly.discount}% de desconto
              </span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            {STRIPE_PRODUCTS.monthly.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            className="w-full rounded-xl bg-[#3cd48f] hover:bg-[#3cd48f]/90 text-white"
          >
            Testar Plano Mensal
          </Button>
        </div>

        {/* Plano Trimestral */}
        <div className="border-2 border-[#3cd48f] rounded-2xl p-6 bg-[#3cd48f]/10 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-[#3cd48f] text-white px-3 py-1 rounded-full text-xs font-medium">
              Melhor Valor
            </span>
          </div>
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              {STRIPE_PRODUCTS.quarterly.name}
            </h4>
            <div className="text-3xl font-bold text-[#3cd48f] mb-1">
              R$ {(STRIPE_PRODUCTS.quarterly.prices.quarterly.amount / 100).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-gray-600">por mês</div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="line-through text-gray-400">
                R$ {(STRIPE_PRODUCTS.quarterly.prices.quarterly.originalPrice / 100).toFixed(2).replace('.', ',')}
              </span>
              <span className="text-green-600 font-medium ml-2">
                {STRIPE_PRODUCTS.quarterly.prices.quarterly.discount}% de desconto
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Cobrança a cada 3 meses: R$ {(STRIPE_PRODUCTS.quarterly.prices.quarterly.totalAmount / 100).toFixed(2).replace('.', ',')}
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            {STRIPE_PRODUCTS.quarterly.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            className="w-full font-semibold rounded-xl bg-[#3cd48f] hover:bg-[#3cd48f]/90 text-white"
          >
            Testar Plano Trimestral
          </Button>
        </div>

        {/* Plano Pro (Referência) */}
        <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-gray-800 mb-2">
              {STRIPE_PRODUCTS.pro.name}
            </h4>
            <div className="text-3xl font-bold text-gray-600 mb-1">
              R$ {(STRIPE_PRODUCTS.pro.prices.monthly.amount / 100).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-gray-600">por mês</div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="text-gray-600 font-medium">
                Preço final (pós-beta)
              </span>
            </div>
          </div>
          <ul className="space-y-3 mb-6">
            {STRIPE_PRODUCTS.pro.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            variant="outline"
            className="w-full rounded-xl border-gray-300 text-gray-600"
            disabled
          >
            Disponível Pós-Beta
          </Button>
        </div>
      </div>

      {/* Informações de Debug */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Informações de Debug</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Plano Mensal:</h4>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(STRIPE_PRODUCTS.monthly, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Plano Trimestral:</h4>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(STRIPE_PRODUCTS.quarterly, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanosTest
