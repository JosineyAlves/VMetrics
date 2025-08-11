import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/auth'

function getUrlParams() {
  const hash = window.location.hash.replace(/^#/, '')
  const search = window.location.search.replace(/^\?/, '')
  const params = new URLSearchParams(hash || search)
  return params
}

const AuthCallback: React.FC = () => {
  const setUser = useAuthStore((s) => s.setUser)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('Processando login no VMetrics...')

  useEffect(() => {
    const handle = async () => {
      try {
        const params = getUrlParams()
        const code = params.get('code')
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession({ code })
          if (error) throw error
          const email = data.session?.user?.email || null
          setUser(email)
          setStatus('success')
          setMessage('Login efetuado com sucesso! Redirecionando para o VMetrics...')
          setTimeout(() => window.location.replace('/'), 800)
          return
        }
        // fallback: tentar obter sessão atual
        const { data } = await supabase.auth.getSession()
        const email = data.session?.user?.email || null
        if (email) {
          setUser(email)
          setStatus('success')
          setMessage('Sessão válida! Redirecionando para o VMetrics...')
          setTimeout(() => window.location.replace('/'), 800)
        } else {
          setStatus('error')
          setMessage('Não foi possível validar sua sessão.')
        }
      } catch (err: any) {
        setStatus('error')
        setMessage(err?.message || 'Erro ao processar login no VMetrics.')
      }
    }
    handle()
  }, [setUser])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="modern-card p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <div className="w-10 h-10 text-white text-2xl">🔐</div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Autenticando no VMetrics...</h1>
          <p className={`text-slate-600 ${status === 'error' ? 'text-red-600' : ''}`}>{message}</p>
        </div>
      </div>
    </div>
  )
}

export default AuthCallback


