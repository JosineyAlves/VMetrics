import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, AlertCircle, ArrowRight, Info, Key, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import Logo from './ui/Logo'

const ApiKeySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const { testApiKey, setApiKey: setAuthApiKey } = useAuthStore()
  const navigate = useNavigate()

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    // Reset connection state when user types
    if (connectionResult !== 'idle') {
      setConnectionResult('idle')
      setErrorMessage('')
    }
  }

  const handleConnectToRedTrack = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Por favor, insira uma API Key')
      return
    }

    setIsConnecting(true)
    setErrorMessage('')
    setConnectionResult('idle')
    
    try {
      // Testar a API Key
      const result = await testApiKey(apiKey.trim())
      
      if (result.success) {
        // Salvar API Key no store
        setAuthApiKey(apiKey.trim())
        setConnectionResult('success')
        setErrorMessage('')
        
        // Redirecionar para dashboard após sucesso
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 1500)
      } else {
        setConnectionResult('error')
        setErrorMessage(result.error || 'API Key inválida ou conta bloqueada. Verifique sua conta RedTrack e tente novamente.')
      }
    } catch (error) {
      setConnectionResult('error')
      // Capturar mensagem de erro específica do RedTrack
      const errorMsg = error instanceof Error ? error.message : 'Erro ao conectar ao RedTrack'
      setErrorMessage(`Erro de conexão: ${errorMsg}`)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3cd48f]/5 via-white to-[#3cd48f]/10 py-12 px-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="xl" variant="gradient" />
            </div>
                         <h1 className="text-3xl font-bold text-[#1f1f1f] mb-3">
               Configure sua API Key
             </h1>
             <p className="text-[#1f1f1f]/70 text-lg">
               Conecte sua conta RedTrack para começar a usar o TrackView
             </p>
          </div>

                     {/* Setup Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#3cd48f] text-white flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="text-sm font-medium text-[#1f1f1f]">Obter API Key</span>
              </div>
              <div className="w-16 h-1 bg-[#3cd48f]"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#3cd48f] text-white flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="text-sm font-medium text-[#1f1f1f]">Conectar</span>
              </div>
              <div className="w-16 h-1 bg-[#3cd48f]"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#3cd48f] text-white flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="text-sm font-medium text-[#1f1f1f]">Dashboard</span>
              </div>
            </div>
          </div>

                     {/* Instructions */}
           <div className="bg-[#3cd48f]/10 border border-[#3cd48f]/20 rounded-lg p-6 mb-8">
             <div className="flex items-start space-x-4">
               <Info className="w-6 h-6 text-[#3cd48f] mt-1 flex-shrink-0" />
               <div>
                 <h3 className="font-semibold text-[#1f1f1f] mb-3 text-lg">
                   Como obter sua API Key do RedTrack
                 </h3>
                 <ol className="text-[#1f1f1f]/80 space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                                         Acesse sua conta RedTrack em <a href="https://redtrack.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#3cd48f]">redtrack.io</a>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    Vá em <strong>Settings → API</strong> no menu lateral
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    Clique em <strong>Generate New Key</strong> ou use uma chave existente
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">4.</span>
                    Copie a chave gerada (formato: xxxxxxxxxxxxxxxxxxxx)
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-[#1f1f1f] mb-2">
                API Key do RedTrack *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Cole sua API Key aqui"
                  className={`pl-10 pr-4 py-3 text-lg ${
                    connectionResult === 'success' ? 'border-green-500 bg-green-50' :
                    connectionResult === 'error' ? 'border-red-500 bg-red-50' : ''
                  }`}
                  disabled={isConnecting}
                />
              </div>
              
              {connectionResult === 'success' && (
                <div className="flex items-center text-green-600 mt-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Conectado com sucesso! Redirecionando...</span>
                </div>
              )}
              
              {connectionResult === 'error' && (
                <div className="flex items-center text-red-600 mt-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{errorMessage}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500">
              <Shield className="w-4 h-4 inline mr-1" />
              Sua API Key será salva de forma segura e usada para conectar ao RedTrack
            </p>
          </div>

          {/* Connect Button */}
          <div className="mb-6">
            <Button
              onClick={handleConnectToRedTrack}
              disabled={!apiKey.trim() || isConnecting}
              className="w-full bg-[#3cd48f] hover:bg-[#3cd48f]/90 text-white py-3 text-lg font-semibold"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Conectando ao RedTrack...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Conectar ao RedTrack
                </>
              )}
            </Button>
          </div>

          {/* Security Note */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                                 <p className="font-medium text-[#1f1f1f] mb-1">Segurança da API Key</p>
                 <p>
                   Sua API Key é armazenada localmente e nunca é compartilhada. 
                   Ela é usada apenas para conectar ao RedTrack e buscar dados das suas campanhas.
                 </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ApiKeySetup
