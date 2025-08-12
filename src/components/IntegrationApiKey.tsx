import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Key, CheckCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'
import { ROUTES } from '../config/routes'
import { useAuthStore } from '../store/auth'

const IntegrationApiKey: React.FC = () => {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setApiKey: setAuthApiKey } = useAuthStore()

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setApiKey(value)
    setError('')
    setIsValid(false)
  }

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira sua API Key')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // TODO: Implementar validação real da API Key
      // Por enquanto, simular validação
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular sucesso
      setIsValid(true)
      setAuthApiKey(apiKey.trim())
      
      // Redirecionar para dashboard após validação
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD)
      }, 1000)
      
    } catch (err) {
      setError('Erro ao validar API Key. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // Permitir pular configuração da API Key por enquanto
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="gradient" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configure sua API Key
            </h1>
            <p className="text-gray-600">
              Conecte sua conta RedTrack para começar a usar o VMetrics
            </p>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-3">Como obter sua API Key</h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                    Acesse sua conta RedTrack
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                    Vá em <strong>Settings → API</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                    Clique em <strong>Generate New Key</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                    Copie a chave gerada
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                API Key do RedTrack
              </label>
              <div className="relative">
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Cole sua API Key aqui"
                  className="pr-10"
                  disabled={isLoading}
                />
                <Key className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Sua API Key será salva de forma segura e usada para conectar ao RedTrack
              </p>
            </div>

            {/* Status da validação */}
            {isValid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">API Key válida! Redirecionando para o dashboard...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-4">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Configurar Depois
              </Button>

              <Button
                onClick={validateApiKey}
                disabled={!apiKey.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    Validando...
                  </>
                ) : (
                  <>
                    Validar e Continuar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Informações adicionais */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Por que preciso da API Key?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Acessar dados das suas campanhas</li>
                    <li>• Visualizar métricas de performance</li>
                    <li>• Analisar conversões e ROI</li>
                    <li>• Gerar relatórios personalizados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationApiKey
