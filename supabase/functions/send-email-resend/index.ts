import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { emailData } = await req.json()
    
    // Send email via Resend API
    const result = await sendEmailViaResend(emailData)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Send email via Supabase Resend Integration
async function sendEmailViaResend(emailData: {
  from: string
  to: string
  subject: string
  html: string
  text: string
}) {
  try {
    console.log(`📧 Sending email via Supabase Resend Integration:`)
    console.log(`   From: ${emailData.from}`)
    console.log(`   To: ${emailData.to}`)
    console.log(`   Subject: ${emailData.subject}`)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Send email using Supabase's native Resend integration
    const { data, error } = await supabase.functions.invoke('resend', {
      body: {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      }
    })
    
    if (error) {
      throw new Error(`Supabase Resend integration error: ${error.message}`)
    }
    
    console.log(`✅ Email sent successfully via Supabase Resend Integration`)
    console.log(`📧 Supabase response:`, data)
    
    return {
      success: true,
      message: 'Email sent successfully via Supabase Resend Integration',
      provider: 'supabase-resend',
      data: data,
      sent_at: new Date().toISOString()
    }
    
  } catch (error) {
    console.error(`❌ Error sending email via Supabase Resend Integration:`, error)
    return {
      success: false,
      error: error.message,
      provider: 'supabase-resend'
    }
  }
}
