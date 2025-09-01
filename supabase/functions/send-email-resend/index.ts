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

// Send email via Resend API
async function sendEmailViaResend(emailData: {
  from: string
  to: string
  subject: string
  html: string
  text: string
}) {
  try {
    console.log(`📧 Sending email via Resend API:`)
    console.log(`   From: ${emailData.from}`)
    console.log(`   To: ${emailData.to}`)
    console.log(`   Subject: ${emailData.subject}`)
    
    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable not set')
    }
    
    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailData.from,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Resend API error: ${errorData.message || response.statusText}`)
    }
    
    const result = await response.json()
    
    console.log(`✅ Email sent successfully via Resend API`)
    console.log(`📧 Resend response:`, result)
    
    return {
      success: true,
      message: 'Email sent successfully via Resend API',
      provider: 'resend',
      resend_id: result.id,
      sent_at: new Date().toISOString()
    }
    
  } catch (error) {
    console.error(`❌ Error sending email via Resend API:`, error)
    return {
      success: false,
      error: error.message,
      provider: 'resend'
    }
  }
}
