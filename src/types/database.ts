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
          redtrack_api_key: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          is_active?: boolean
          redtrack_api_key?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          is_active?: boolean
          redtrack_api_key?: string | null
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
    }
  }
}

// Tipos exportados
export type User = Database['public']['Tables']['users']['Row']
export type UserPlan = Database['public']['Tables']['user_plans']['Row']
