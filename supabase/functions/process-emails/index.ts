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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Process pending emails
    const result = await processPendingEmails(supabase)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing emails:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Process pending emails via MailerSend
async function processPendingEmails(supabase: any) {
  try {
    console.log('🚀 Starting email processing...')
    
    // Get pending emails
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10) // Process 10 at a time
    
    if (fetchError) {
      throw new Error(`Error fetching pending emails: ${fetchError.message}`)
    }
    
    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('✅ No pending emails to process')
      return { 
        success: true, 
        message: 'No pending emails to process',
        processed: 0 
      }
    }
    
    console.log(`📧 Processing ${pendingEmails.length} pending emails...`)
    
    let processed = 0
    let failed = 0
    
    for (const email of pendingEmails) {
      try {
        // Get MailerSend API token
        const { data: tokenData, error: tokenError } = await supabase
          .from('private.keys')
          .select('value')
          .eq('key', 'MAILERSEND_API_TOKEN')
          .single()
        
        if (tokenError || !tokenData?.value) {
          throw new Error('MailerSend API token not found')
        }
        
        const apiToken = tokenData.value
        
        // Extract template data
        const providerResponse = email.provider_response
        const templateId = providerResponse?.template_id
        const variables = providerResponse?.variables
        
        if (!templateId) {
          throw new Error('Template ID not found in provider response')
        }
        
        // Prepare MailerSend API request
        const mailerSendPayload = {
          from: {
            email: email.sender
          },
          to: [
            {
              email: email.recipient
            }
          ],
          template_id: templateId,
          variables: [
            {
              email: email.recipient,
              substitutions: variables || {}
            }
          ]
        }
        
        // Send email via MailerSend API
        const response = await fetch('https://api.mailersend.com/v1/email', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mailerSendPayload)
        })
        
        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`MailerSend API error: ${response.status} - ${errorData}`)
        }
        
        const responseData = await response.json()
        
        // Update email status to sent
        const { error: updateError } = await supabase
          .from('messages')
          .update({
            status: 'sent',
            sent_at: new Date(),
            provider_response: {
              ...providerResponse,
              mailersend_response: responseData,
              sent_at: new Date().toISOString(),
              status: 'sent'
            }
          })
          .eq('id', email.id)
        
        if (updateError) {
          console.error(`Error updating email ${email.id}:`, updateError)
        }
        
        console.log(`✅ Email sent successfully to: ${email.recipient}`)
        processed++
        
      } catch (emailError) {
        console.error(`❌ Failed to process email ${email.id}:`, emailError)
        
        // Update email status to failed
        await supabase
          .from('messages')
          .update({
            status: 'failed',
            provider_response: {
              ...email.provider_response,
              error: emailError.message,
              failed_at: new Date().toISOString(),
              status: 'failed'
            }
          })
          .eq('id', email.id)
        
        failed++
      }
    }
    
    console.log(`🎉 Email processing completed: ${processed} sent, ${failed} failed`)
    
    return {
      success: true,
      message: 'Email processing completed',
      processed,
      failed,
      total: pendingEmails.length
    }
    
  } catch (error) {
    console.error('❌ Error in processPendingEmails:', error)
    throw error
  }
}
