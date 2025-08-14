import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Shield, Zap, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import { APP_URLS } from '../config/urls'
import { AnimatePresence } from 'framer-motion'

interface SignupFormProps {
  email?: string
  planType?: string
  onSuccess?: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({ email, planType, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: email || '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiKey, setApiKey] = useState('')
  const [isApiKeyValid, setIsApiKeyValid] = useState(false)
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false)

  const { testApiKey, setApiKey: setAuthApiKey } = useAuthStore()
  const navigate = useNavigate()

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Empresa é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validação da API Key
  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setIsApiKeyValid(false)
      return
    }

    setIsApiKeyLoading(true)
    try {
      const isValid = await testApiKey(apiKey.trim())
      setIsApiKeyValid(isValid)
      
      if (isValid) {
        setAuthApiKey(apiKey.trim())
        // Redirecionar para o setup após sucesso
        navigate('/setup', { replace: true })
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      setIsApiKeyValid(false)
    } finally {
      setIsApiKeyLoading(false)
    }
  }

  // Próximo passo
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2)
    }
  }

  // Voltar passo
  const handlePrevStep = () => {
    setStep(1)
  }

  // Finalizar cadastro
  const handleFinishSignup = async () => {
    if (!apiKey.trim()) {
      return
    }

    await validateApiKey()
  }

  // Atualizar campo
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Renderizar passo 1 - Informações pessoais
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold text-[#1f1f1f] mb-2">
           Complete seu cadastro
         </h2>
         <p className="text-[#1f1f1f]/70">
           {planType ? `Plano selecionado: ${planType.toUpperCase()}` : 'Configure sua conta VMetrics'}
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
                     <label className="block text-sm font-medium text-[#1f1f1f] mb-2">
             Nome *
           </label>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            className={errors.firstName ? 'border-red-500' : ''}
            placeholder="Seu nome"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
                     <label className="block text-sm font-medium text-[#1f1f1f] mb-2">
             Sobrenome *
           </label>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            className={errors.lastName ? 'border-red-500' : ''}
            placeholder="Seu sobrenome"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
                 <label className="block text-sm font-medium text-[#1f1f1f] mb-2">
           Email *
         </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
          placeholder="seu@email.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
                 <label className="block text-sm font-medium text-[#1f1f1f] mb-2">
           Empresa *
         </label>
        <Input
          type="text"
          value={formData.company}
          onChange={(e) => handleFieldChange('company', e.target.value)}
          className={errors.company ? 'border-red-500' : ''}
          placeholder="Nome da sua empresa"
        />
        {errors.company && (
          <p className="text-red-500 text-sm mt-1">{errors.company}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Telefone
        </label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
                     <label className="block text-sm font-medium text-[#1f1f1f] mb-2">
             Senha *
           </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
                     <label className="block text-sm font-medium text-[#1f1f1f] mb-2">
             Confirmar Senha *
           </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              placeholder="Confirme sua senha"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

             <Button
         onClick={handleNextStep}
         className="w-full bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white py-3 text-lg font-semibold"
       >
        Continuar
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  )

  // Renderizar passo 2 - Configuração da API
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Configure sua API Key
        </h2>
        <p className="text-gray-600">
          Conecte sua conta RedTrack para começar a usar o VMetrics
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Como obter sua API Key</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Acesse sua conta RedTrack</li>
              <li>2. Vá em <strong>Settings → API</strong></li>
              <li>3. Clique em <strong>Generate New Key</strong></li>
              <li>4. Copie a chave gerada</li>
            </ol>
          </div>
        </div>
      </div>

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
        />
        <p className="text-sm text-gray-500 mt-1">
          Sua API Key será salva de forma segura e usada para conectar ao RedTrack
        </p>
      </div>

      {apiKey && (
        <div className="flex items-center space-x-3">
          <Button
            onClick={validateApiKey}
            disabled={isApiKeyLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isApiKeyLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Testando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Testar API Key
              </>
            )}
          </Button>

          {isApiKeyValid && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">API Key válida!</span>
            </div>
          )}

          {apiKey && !isApiKeyValid && !isApiKeyLoading && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">API Key inválida</span>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          onClick={handlePrevStep}
          variant="outline"
          className="flex-1"
        >
          Voltar
        </Button>

                 <Button
           onClick={handleFinishSignup}
           disabled={!apiKey.trim() || isApiKeyLoading}
           className="flex-1 bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white"
         >
          {isApiKeyLoading ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
              Configurando...
            </>
          ) : (
            <>
              Finalizar Cadastro
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Já tem uma conta? </p>
                 <a 
           href={APP_URLS.DASHBOARD_APP} 
           className="text-[#3cd48f] hover:text-[#3cd48f]/80 underline"
         >
           Fazer login
         </a>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${
                step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {step === 1 ? renderStep1() : renderStep2()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SignupForm
