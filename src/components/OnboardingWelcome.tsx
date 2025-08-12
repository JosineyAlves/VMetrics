import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Zap, Shield, Users } from 'lucide-react'
import { Button } from './ui/button'
import { ROUTES, navigateTo } from '../config/routes'

const OnboardingWelcome: React.FC = () => {
  const handleContinue = () => {
    navigateTo(ROUTES.INTEGRATION_API_KEY)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Bem-vindo ao VMetrics!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sua conta foi criada com sucesso! Agora vamos configurar tudo para você começar a usar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 rounded-xl bg-blue-50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conta Ativa</h3>
              <p className="text-gray-600">Sua assinatura está ativa e funcionando perfeitamente</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-purple-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Próximo Passo</h3>
              <p className="text-gray-600">Configure sua API Key do RedTrack para começar</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-green-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Suporte</h3>
              <p className="text-gray-600">Nossa equipe está pronta para ajudar você</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">O que acontece agora?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mt-0.5">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Configurar API Key</p>
                    <p className="text-sm text-gray-600">Conecte sua conta RedTrack</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mt-0.5">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Acessar Dashboard</p>
                    <p className="text-sm text-gray-600">Visualize suas métricas</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mt-0.5">3</div>
                  <div>
                    <p className="font-medium text-gray-900">Analisar Dados</p>
                    <p className="text-sm text-gray-600">Gere insights valiosos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center mt-0.5">4</div>
                  <div>
                    <p className="font-medium text-gray-900">Otimizar Campanhas</p>
                    <p className="text-sm text-gray-600">Melhore seus resultados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
          >
            Começar Configuração
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="mt-6 text-sm text-gray-500">
            <p>Precisa de ajuda? </p>
            <a 
              href="mailto:suporte@vmetrics.com.br" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Entre em contato conosco
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OnboardingWelcome
