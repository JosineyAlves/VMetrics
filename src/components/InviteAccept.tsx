import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'

const InviteAccept: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')
  const type = searchParams.get('type')

  useEffect(() => {
    // Verificar se é um convite válido
    if (type !== 'invite' || !token) {
      navigate('/login')
    }
  }, [type, token, navigate])

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      // Aceitar convite e definir senha
      const { data, error: acceptError } = await supabase.auth.verifyOtp({
        token_hash: token!,
        type: 'invite'
      })

      if (acceptError) {
        setError(acceptError.message)
        return
      }

      if (data.user) {
        // Atualizar senha
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        })

        if (updateError) {
          setError(updateError.message)
          return
        }

        // Redirecionar para login
        navigate('/login', { 
          replace: true,
          state: { message: 'Senha definida com sucesso! Faça login para continuar.' }
        })
      }
    } catch (err) {
      console.error('Error accepting invite:', err)
      setError('Erro ao aceitar convite. Tente novamente.')
    } finally {
      setIsLoading(false)
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
            <h2 className="text-2xl font-bold text-[#1f1f1f] mb-2">
              Bem-vindo ao VMetrics! 🚀
            </h2>
            <p className="text-[#1f1f1f]/70">
              Defina sua senha para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleAcceptInvite} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                Nova Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="modern-input"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                className="modern-input"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3cd48f] to-[#3cd48f]/80 hover:from-[#3cd48f]/90 hover:to-[#3cd48f]/70 text-white py-3 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                  Definindo senha...
                </>
              ) : (
                'Definir Senha e Acessar'
              )}
            </Button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-6">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Após definir sua senha, você será redirecionado para a tela de login
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteAccept
