import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import { ROUTES, navigateTo } from '../config/routes'

const IntegrationApiKey: React.FC = () => {
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  const { testApiKey, setApiKey: setAuthApiKey } = useAuthStore()

  const handleApiKeyValidation = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira sua API Key')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      const isValidKey = await testApiKey(apiKey.trim())
      
      if (isValidKey) {
        setIsValid(true)
        setAuthApiKey(apiKey.trim())
        
        // Aguardar um pouco para mostrar sucesso
        setTimeout(() => {
          navigateTo(ROUTES.DASHBOARD)
        }, 1500)
        
      } else {
        setError('API Key inválida. Verifique e tente novamente.')
        setIsValid(false)
      }
    } catch (err) {
      setError('Erro ao validar API Key. Tente novamente.')
      setIsValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSkip = () => {
    // Permitir pular configuração da API Key (para desenvolvimento)
    console.log('⚠️ Configuração da API Key pulada')
    navigateTo(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Configure sua API Key
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              Para começar a usar o VMetrics, você precisa conectar sua conta RedTrack
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Zap className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">Como obter sua API Key</h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3">1</span>
                    Acesse sua conta RedTrack
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3">2</span>
                    Vá em <strong>Settings → API</strong>
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3">3</span>
                    Clique em <strong>Generate New Key</strong>
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3">4</span>
                    Copie a chave gerada
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key do RedTrack *
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua API Key aqui"
                className="text-lg"
                disabled={isValidating || isValid}
              />
              <p className="text-sm text-gray-500 mt-2">
                Sua API Key será salva de forma segura e usada para conectar ao RedTrack
              </p>
            </div>

            {apiKey && (
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleApiKeyValidation}
                  disabled={isValidating || isValid}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                      Validando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Validar API Key
                    </>
                  )}
                </Button>

                {isValid && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">API Key válida! Redirecionando...</span>
                  </div>
                )}

                {apiKey && !isValid && !isValidating && error && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-4 pt-6">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
              >
                Configurar depois
              </Button>

              <Button
                onClick={handleApiKeyValidation}
                disabled={!apiKey.trim() || isValidating || isValid}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    Configurando...
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
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

export default IntegrationApiKey
