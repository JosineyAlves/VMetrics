import React, { useState } from 'react'
import { sendWelcomeEmail, testEmailSend } from '../services/emailServiceResend'

export default function EmailTest() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [planType, setPlanType] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestEmail = async () => {
    setLoading(true)
    setResult(null)

    try {
      const result = await sendWelcomeEmail({
        customerEmail: email,
        customerName: name,
        planType,
        signupUrl: `https://app.vmetrics.com.br/auth/signup?token=test-token-${Date.now()}`
      })

      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro inesperado ao enviar email'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const result = await testEmailSend()
      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro inesperado no teste'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🧪 Teste de Envio de Email
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email do Cliente
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@exemplo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Cliente
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do Cliente"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Plano
          </label>
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleTestEmail}
            disabled={loading || !email}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : '📧 Enviar Email de Teste'}
          </button>

          <button
            onClick={handleQuickTest}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Testando...' : '⚡ Teste Rápido'}
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-md ${
            result.success 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              <span className="text-xl mr-2">
                {result.success ? '✅' : '❌'}
              </span>
              <span className="font-medium">
                {result.success ? 'Sucesso!' : 'Erro!'}
              </span>
            </div>
            <p className="mt-2">{result.message}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">📋 Instruções:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Email de Teste:</strong> Envia um email real para o endereço informado</li>
            <li>• <strong>Teste Rápido:</strong> Testa a conexão com o serviço de email</li>
            <li>• Verifique o console do navegador para logs detalhados</li>
            <li>• Emails são enviados via Resend API através do Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
