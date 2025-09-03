import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  
  const navigate = useNavigate()

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setEmailSent(true)
    } catch (err) {
      setError('Erro ao enviar email de reset. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="modern-card p-8 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="gradient" />
            </div>
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1f1f1f] mb-4">
              Email Enviado!
            </h2>
            <p className="text-[#1f1f1f]/70 mb-6">
              Enviamos um link de redefinição de senha para <strong>{email}</strong>. 
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white py-3 text-lg font-semibold"
              >
                Voltar para o Login
              </Button>
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                  setError('')
                }}
                className="text-sm text-[#3cd48f] hover:text-[#3cd48f]/80 underline"
              >
                Enviar para outro email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="modern-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="gradient" />
            </div>
            <h2 className="text-2xl font-bold text-[#1f1f1f] mb-2">
              Esqueci minha senha
            </h2>
            <p className="text-[#1f1f1f]/70">
              Digite seu email para receber um link de redefinição de senha
            </p>
          </div>

          <form onSubmit={handleSendResetEmail} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="modern-input"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white py-3 text-lg font-semibold"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Link de Reset'
              )}
            </Button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-6">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-[#3cd48f] hover:text-[#3cd48f]/80 underline"
            >
              ← Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
