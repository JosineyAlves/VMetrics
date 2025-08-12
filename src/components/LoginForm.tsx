import React, { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'
import { APP_URLS } from '../config/urls'

const LoginForm: React.FC = () => {
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { testApiKey, setApiKey, isLoading, error } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚨 FORM SUBMIT CHAMADO!')
    console.log('🚨 API Key no form:', apiKeyInput ? 'SIM' : 'NÃO')
    
    if (apiKeyInput.trim()) {
      console.log('🚨 CHAMANDO testApiKey...')
      const isValid = await testApiKey(apiKeyInput.trim())
      if (isValid) {
        setApiKey(apiKeyInput.trim())
      }
    } else {
      console.log('🚨 API Key vazia!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="modern-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="gradient" />
            </div>
            <p className="text-slate-600">
              Insira sua API Key para acessar o dashboard
            </p>
            <div className="mt-4 text-sm text-slate-500">
              <p>Novo por aqui? </p>
              <a 
                href={APP_URLS.LANDING_PAGE} 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Conheça nossos planos
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">
                API Key do RedTrack
              </label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showPassword ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Digite sua API Key..."
                  className="pr-10 modern-input"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
                {error.includes('401') && (
                  <div className="mt-3">
                    <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                    <ul className="text-xs text-red-500 space-y-1">
                      <li>• Verifique se a API Key está correta</li>
                      <li>• A API Key pode ter expirado - gere uma nova no RedTrack</li>
                      <li>• Certifique-se de que a API Key tem permissões adequadas</li>
                      <li>• Plano Solo pode ter acesso limitado - tente endpoints básicos primeiro</li>
                    </ul>
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-600 font-medium">🔍 Testando endpoint /report...</p>
                      <p className="text-xs text-blue-500">Usando endpoint /report que é mais compatível com planos básicos do RedTrack</p>
                    </div>
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-700 font-medium">⚠️ Informação do Plano:</p>
                      <p className="text-xs text-yellow-600">Plano Solo tem API access limitado. Considere upgrade para API completa.</p>
                    </div>
                  </div>
                )}
                {error.includes('403') && (
                  <div className="mt-3">
                    <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                    <ul className="text-xs text-red-500 space-y-1">
                      <li>• Verifique se a API Key tem permissões para acessar os dados</li>
                      <li>• Entre em contato com o administrador da conta RedTrack</li>
                    </ul>
                  </div>
                )}
                {error.includes('429') && (
                  <div className="mt-3">
                    <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                    <ul className="text-xs text-red-500 space-y-1">
                      <li>• Aguarde alguns minutos antes de tentar novamente</li>
                      <li>• Verifique o plano da sua conta RedTrack</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full modern-button"
              disabled={isLoading || !apiKeyInput.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                  Testando API Key...
                </>
              ) : (
                <>
                  🔑 Conectar ao RedTrack
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Sua API Key será salva localmente para facilitar o acesso futuro
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <a 
                href={APP_URLS.LANDING_PAGE} 
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Voltar à página principal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm 