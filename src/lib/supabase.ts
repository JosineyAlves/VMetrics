import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: Log das variáveis para verificar
console.log('🔍 Debug - Variáveis de ambiente:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_URL:', import.meta.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada')

// Verificar se as variáveis estão configuradas
if (!supabaseUrl) {
  console.error('❌ Nenhuma URL do Supabase encontrada!')
  console.error('Variáveis disponíveis:', Object.keys(import.meta.env).filter(key => key.includes('SUPABASE')))
  throw new Error('❌ VITE_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_URL não configurada! Configure no Vercel Dashboard.')
}

if (!supabaseAnonKey) {
  console.error('❌ Nenhuma chave anônima do Supabase encontrada!')
  console.error('Variáveis disponíveis:', Object.keys(import.meta.env).filter(key => key.includes('SUPABASE')))
  throw new Error('❌ VITE_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada! Configure no Vercel Dashboard.')
}

// Cliente público (frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Cliente com service role (backend apenas)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          stripe_customer_id: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          is_active?: boolean
        }
      }
      user_plans: {
        Row: {
          id: string
          user_id: string
          plan_type: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          amount: number
          currency: string
          status: string | null
          invoice_date: string | null
          due_date: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          amount: number
          currency?: string
          status?: string | null
          invoice_date?: string | null
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          amount?: number
          currency?: string
          status?: string | null
          invoice_date?: string | null
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      webhook_logs: {
        Row: {
          id: string
          stripe_event_id: string | null
          event_type: string
          customer_email: string | null
          customer_id: string | null
          subscription_id: string | null
          plan_type: string | null
          status: string
          raw_data: any | null
          processed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          stripe_event_id?: string | null
          event_type: string
          customer_email?: string | null
          customer_id?: string | null
          subscription_id?: string | null
          plan_type?: string | null
          status?: string
          raw_data?: any | null
          processed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          stripe_event_id?: string | null
          event_type?: string
          customer_email?: string | null
          customer_id?: string | null
          subscription_id?: string | null
          plan_type?: string | null
          status?: string
          raw_data?: any | null
          processed_at?: string
          created_at?: string
        }
      }
    }
  }
}

// Tipos exportados
export type User = Database['public']['Tables']['users']['Row']
export type UserPlan = Database['public']['Tables']['user_plans']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type WebhookLog = Database['public']['Tables']['webhook_logs']['Row']

// Funções utilitárias
export const getSupabaseUrl = () => supabaseUrl
export const getSupabaseAnonKey = () => supabaseAnonKey
