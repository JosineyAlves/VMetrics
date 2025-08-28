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

    // Process pending emails via Resend
    const result = await processPendingEmailsResend(supabase)

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

// Process pending emails via Resend SMTP
async function processPendingEmailsResend(supabase: any) {
  try {
    console.log('🚀 Starting email processing via Resend...')
    
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
    
    console.log(`📧 Processing ${pendingEmails.length} pending emails via Resend...`)
    
    let processed = 0
    let failed = 0
    
    for (const email of pendingEmails) {
      try {
        // Extract email data
        const recipientEmail = email.recipient
        const senderEmail = email.sender
        const subject = email.subject
        const htmlBody = email.html_body
        const textBody = email.text_body
        const variables = email.provider_response?.variables || {}
        
        // Create personalized email content
        let personalizedHtml = htmlBody
        let personalizedText = textBody
        
        // Replace variables in content
        if (variables) {
          Object.keys(variables).forEach(key => {
            const value = variables[key]
            const regex = new RegExp(`{{${key}}}`, 'g')
            personalizedHtml = personalizedHtml.replace(regex, value)
            personalizedText = personalizedText.replace(regex, value)
          })
        }
        
        // Send email via Resend SMTP (using nodemailer-like approach)
        const emailSent = await sendEmailViaResend({
          from: senderEmail,
          to: recipientEmail,
          subject: subject,
          html: personalizedHtml,
          text: personalizedText
        })
        
        if (emailSent) {
          // Update email status to sent
          const { error: updateError } = await supabase
            .from('messages')
            .update({
              status: 'sent',
              sent_at: new Date(),
              provider_response: {
                ...email.provider_response,
                resend_response: { success: true, sent_at: new Date().toISOString() },
                status: 'sent'
              }
            })
            .eq('id', email.id)
          
          if (updateError) {
            console.error(`Error updating email ${email.id}:`, updateError)
          }
          
          console.log(`✅ Email sent successfully via Resend to: ${recipientEmail}`)
          processed++
        } else {
          throw new Error('Failed to send email via Resend')
        }
        
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
      message: 'Email processing completed via Resend',
      processed,
      failed,
      total: pendingEmails.length
    }
    
  } catch (error) {
    console.error('❌ Error in processPendingEmailsResend:', error)
    throw error
  }
}

// Send email via Resend (placeholder - will be implemented with actual SMTP)
async function sendEmailViaResend(emailData: {
  from: string
  to: string
  subject: string
  html: string
  text: string
}): Promise<boolean> {
  try {
    // This is a placeholder - in a real implementation, you would:
    // 1. Use a proper SMTP library
    // 2. Connect to smtp.resend.com:465
    // 3. Authenticate with resend credentials
    // 4. Send the email
    
    console.log(`📧 Sending email via Resend SMTP:`)
    console.log(`   From: ${emailData.from}`)
    console.log(`   To: ${emailData.to}`)
    console.log(`   Subject: ${emailData.subject}`)
    
    // For now, simulate successful email sending
    // TODO: Implement actual SMTP connection to Resend
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
    
    console.log(`✅ Email sent successfully via Resend`)
    return true
    
  } catch (error) {
    console.error(`❌ Error sending email via Resend:`, error)
    return false
  }
}
