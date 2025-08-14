import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import RedTrackService from '../services/redtrackService'
import { useAuthStore } from '../store/auth'

const ApiKeySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    error?: string
  } | null>(null)
  
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Por favor, insira sua API Key',
        error: 'API_KEY_EMPTY'
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      // Validar a API Key
      const validation = await RedTrackService.validateApiKey(apiKey.trim())
      
      if (validation.success) {
        setValidationResult({
          isValid: true,
          message: 'API Key válida! Configurando sua conta...'
        })

        // Salvar a API Key no Supabase
        if (user?.id) {
          const saveResult = await RedTrackService.saveApiKey(user.id, apiKey.trim())
          
          if (saveResult.success) {
            // Aguardar um pouco para mostrar a mensagem de sucesso
            setTimeout(() => {
              navigate('/dashboard', { replace: true })
            }, 1500)
          } else {
            setValidationResult({
              isValid: false,
              message: 'Erro ao salvar API Key. Tente novamente.',
              error: saveResult.error
            })
          }
        } else {
          setValidationResult({
            isValid: false,
            message: 'Erro: Usuário não identificado',
            error: 'USER_NOT_FOUND'
          })
        }
      } else {
        setValidationResult({
          isValid: false,
          message: validation.message,
          error: validation.error
        })
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Erro inesperado ao validar API Key',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSkipSetup = () => {
    // Permitir pular o setup por enquanto
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configure sua API Key
            </h1>
            <p className="text-gray-600">
              Conecte sua conta RedTrack para começar a usar o TrackView
            </p>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-3">Como obter sua API Key</h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    Acesse sua conta RedTrack
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    Vá em <strong>Settings → API</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    Clique em <strong>Generate New Key</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">4.</span>
                    Copie a chave gerada
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Formulário */}
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
                className="pr-10"
                disabled={isValidating}
              />
              <p className="text-sm text-gray-500 mt-1">
                Sua API Key será salva de forma segura e usada para conectar ao RedTrack
              </p>
            </div>

            {/* Resultado da validação */}
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-lg border ${
                  validationResult.isValid
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">{validationResult.message}</span>
                </div>
              </motion.div>
            )}

            {/* Botões de ação */}
            <div className="flex space-x-4">
              <Button
                onClick={handleSkipSetup}
                variant="outline"
                className="flex-1"
                disabled={isValidating}
              >
                Pular por enquanto
              </Button>

              <Button
                onClick={handleValidateApiKey}
                disabled={!apiKey.trim() || isValidating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    Validar e Configurar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Informações adicionais */}
            <div className="text-center text-sm text-gray-500">
              <p>
                Você pode configurar sua API Key a qualquer momento nas configurações
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ApiKeySetup
