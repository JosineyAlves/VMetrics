import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using service role key (never expose this to the client)
// Required env vars (configure on Vercel):
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('[SUPABASE] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
}

const supabase = createClient(supabaseUrl || '', serviceRoleKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default supabase
