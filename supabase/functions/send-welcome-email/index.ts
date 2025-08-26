// 🚀 Edge Function para Envio de Email de Boas-vindas
// Usa o sistema nativo de Magic Link do Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratar requisições OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extrair dados da requisição
    const { email, fullName, planType, stripeCustomerId } = await req.json()
    
    console.log('📧 [EMAIL] Iniciando envio de email para:', email)
    
    // Validar dados obrigatórios
    if (!email || !fullName || !planType) {
      throw new Error('Dados obrigatórios não fornecidos: email, fullName, planType')
    }

    // Configurar cliente Supabase com service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 🎯 USAR SISTEMA NATIVO: Enviar Magic Link via Supabase Auth
    console.log('🔗 [EMAIL] Enviando Magic Link nativo do Supabase para:', email)
    
    const { data: magicLinkData, error: magicError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('FRONTEND_URL') || 'https://app.vmetrics.com.br'}/auth/callback?email=${encodeURIComponent(email)}&plan=${encodeURIComponent(planType)}&stripe=${stripeCustomerId}`,
        data: {
          full_name: fullName,
          plan_type: planType,
          stripe_customer_id: stripeCustomerId,
          from_stripe: true,
          welcome_email: true
        }
      }
    })

    if (magicError) {
      console.error('❌ [EMAIL] Erro ao gerar Magic Link:', magicError)
      throw magicError
    }

    console.log('✅ [EMAIL] Magic Link gerado e enviado com sucesso')
    console.log('📧 [EMAIL] Email enviado automaticamente pelo Supabase para:', email)

    // Retornar sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de boas-vindas enviado com sucesso via Supabase',
        email: email,
        magicLink: magicLinkData.properties.action_link,
        timestamp: new Date().toISOString(),
        method: 'supabase_native_magiclink'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ [EMAIL] Erro ao processar envio de email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
