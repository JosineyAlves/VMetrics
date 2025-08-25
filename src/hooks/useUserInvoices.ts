import { useState, useEffect } from 'react'

interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  created: string
  due_date: string
  description: string
  invoice_pdf: string
  hosted_invoice_url: string
  formatted_amount: string
  status_text: string
  status_color: 'green' | 'yellow' | 'red' | 'gray'
}

interface UserInvoicesData {
  invoices: Invoice[]
  user: {
    id: string
    email: string
    stripe_customer_id: string
  } | null
  plan: {
    type: string
    status: string
    subscription_id: string
  } | null
}

export const useUserInvoices = (email: string) => {
  const [invoicesData, setInvoicesData] = useState<UserInvoicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserInvoices = async () => {
    if (!email) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 [USE-USER-INVOICES] Carregando faturas para:', email)
      
      const response = await fetch(`/api/user-invoices?email=${encodeURIComponent(email)}`)
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [USE-USER-INVOICES] Dados recebidos:', data)
      
      setInvoicesData(data)
      
    } catch (err) {
      console.error('❌ [USE-USER-INVOICES] Erro:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const refreshInvoices = () => {
    loadUserInvoices()
  }

  useEffect(() => {
    loadUserInvoices()
  }, [email])

  return {
    invoicesData,
    loading,
    error,
    refreshInvoices,
    invoices: invoicesData?.invoices || [],
    hasInvoices: (invoicesData?.invoices || []).length > 0,
    user: invoicesData?.user || null,
    plan: invoicesData?.plan || null
  }
}
