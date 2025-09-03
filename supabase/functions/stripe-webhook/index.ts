// 🚀 WEBHOOK CORRIGIDO - USANDO FUNÇÕES RPC PARA AUTH.USERS
// Versão que funciona com Edge Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    const event = JSON.parse(body)
    console.log('Received Stripe webhook:', event.type)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabase, event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

// 🎯 FUNÇÃO PRINCIPAL CORRIGIDA - USANDO RPC FUNCTIONS
async function handleCheckoutCompleted(supabase: any, session: any) {
  console.log('Processing checkout completed:', session.id)
  
  try {
    if (session.mode === 'subscription' && session.subscription) {
      const customerEmail = session.customer_details?.email
      const customerName = session.customer_details?.name
      const customerId = session.customer
      const subscriptionId = session.subscription
      
      console.log('Customer details:', { customerEmail, customerName, customerId, subscriptionId })
      
      // 🚀 BUSCAR USUÁRIO USANDO RPC FUNCTION
      let userId = null
      
      // Verificar se usuário já existe por email
      const { data: existingUser, error: userError } = await supabase
        .rpc('find_user_by_email', { user_email: customerEmail })
      
      if (userError) {
        console.error('Error searching user by email:', userError)
        return
      }
      
      if (existingUser && existingUser.length > 0) {
        const user = existingUser[0]
        userId = user.user_id
        console.log('Existing user found:', userId)
        
        // Atualizar metadata se necessário
        if (user.stripe_customer_id !== customerId) {
          const { error: updateError } = await supabase
            .rpc('update_user_metadata', {
              user_id: userId,
              stripe_customer_id: customerId,
              full_name: customerName
            })
          
          if (updateError) {
            console.error('Error updating user metadata:', updateError)
          } else {
            console.log('User metadata updated successfully')
          }
        }
      } else {
        // 🚀 USAR INVITE USER (ENVIA EMAIL AUTOMATICAMENTE)
        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
          customerEmail,
          {
            data: {
              full_name: customerName || 'Usuário VMetrics',
              stripe_customer_id: customerId
            }
          }
        )

        if (inviteError) {
          console.error('Error inviting user:', inviteError)
          return
        }

        userId = inviteData.user.id
        console.log('User invited successfully:', userId)
        console.log('✅ Email de convite enviado automaticamente via Supabase + Resend')
      }
      
      // Criar plano do usuário
      const { error: planError } = await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan_type: 'monthly',
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }, {
          onConflict: 'stripe_subscription_id'
        })
        
      if (planError) {
        console.error('Error creating user plan:', planError)
        return
      }
      
      console.log('User plan created/updated successfully')
    }
    
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(supabase: any, subscription: any) {
  console.log('Processing subscription created:', subscription.id)
  
  try {
    // Determine plan type based on price amount
    let planType = 'monthly'
    const priceAmount = subscription.items?.data?.[0]?.price?.unit_amount || 0
    
    console.log('Price amount from subscription:', priceAmount)
    
    // Map price amounts to plan types
    if (priceAmount === 7900) { // R$ 79,00 - Plano Mensal
      planType = 'monthly'
    } else if (priceAmount === 19700) { // R$ 197,00 - Plano Trimestral
      planType = 'quarterly'
    } else {
      planType = 'monthly' // Fallback para monthly
    }
    
    console.log('Detected plan type:', planType)
    
    // Find user by stripe_customer_id using RPC
    let userId: string | null = null
    let customerEmail: string | null = null
    let customerName: string | null = null
    
    // Get customer email from Stripe subscription
    customerEmail = subscription.customer_email
    
    if (!customerEmail) {
      console.log('No customer_email in subscription, trying to find user by stripe_customer_id...')
      
      // Search by stripe_customer_id using RPC
      const { data: userByStripeId, error: searchError } = await supabase
        .rpc('find_user_by_stripe_id', { stripe_id: subscription.customer })
      
      if (searchError) {
        console.error('Error searching users:', searchError)
        return
      }
      
      if (userByStripeId && userByStripeId.length > 0) {
        const user = userByStripeId[0]
        userId = user.user_id
        customerEmail = user.user_email
        customerName = user.full_name
        console.log('Existing user found by stripe_customer_id:', userId, 'with email:', customerEmail)
      }
    } else {
      // Try to find user by email using RPC
      const { data: userByEmail, error: emailError } = await supabase
        .rpc('find_user_by_email', { user_email: customerEmail })
      
      if (emailError) {
        console.error('Error searching user by email:', emailError)
        return
      }
      
      if (userByEmail && userByEmail.length > 0) {
        const user = userByEmail[0]
        userId = user.user_id
        customerName = user.full_name
        console.log('Existing user found by email:', userId)
        
        // Update stripe_customer_id if different
        if (user.stripe_customer_id !== subscription.customer) {
          const { error: updateError } = await supabase
            .rpc('update_user_metadata', {
              user_id: userId,
              stripe_customer_id: subscription.customer,
              full_name: customerName
            })
          
          if (updateError) {
            console.error('Error updating stripe_customer_id:', updateError)
          } else {
            console.log('Updated stripe_customer_id for existing user')
          }
        }
      }
    }
    
    // If still no user found, create a new one
    if (!userId) {
      console.log('No existing user found, creating new user...')
      
      // Try to get a meaningful email
      const finalEmail = customerEmail || `stripe_${subscription.customer}@vmetrics.com.br`
      
      // 🚀 USAR INVITE USER (ENVIA EMAIL AUTOMATICAMENTE)
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        finalEmail,
        {
          data: {
            full_name: 'Usuário VMetrics',
            stripe_customer_id: subscription.customer
          }
        }
      )

      if (inviteError) {
        console.error('Error inviting user:', inviteError)
        return
      }

      userId = inviteData.user.id
      customerEmail = finalEmail
      customerName = 'Usuário VMetrics'
      console.log('User invited successfully with email:', finalEmail, 'ID:', userId)
      console.log('✅ Email de convite enviado automaticamente via Supabase + Resend')
    }
    
    // First, check if user already has an active plan
    console.log('Checking existing plans for user:', userId)
    
    const { data: existingPlans, error: plansError } = await supabase
      .from('user_plans')
      .select('id, plan_type, status')
      .eq('user_id', userId)
      .eq('status', 'active')
    
    if (plansError) {
      console.error('Error checking existing plans:', plansError)
      return
    }
    
    console.log('Existing active plans found:', existingPlans?.length || 0)
    
    // If user has active plans, deactivate them first
    if (existingPlans && existingPlans.length > 0) {
      console.log('Deactivating existing plans...')
      
      const { error: deactivateError } = await supabase
        .from('user_plans')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')
      
      if (deactivateError) {
        console.error('Error deactivating existing plans:', deactivateError)
        return
      }
      
      console.log('Existing plans deactivated successfully')
    }
    
    // Now create the new plan
    console.log('Creating new plan for user:', userId, 'with subscription:', subscription.id)
    
    const { error: insertError } = await supabase
      .from('user_plans')
      .insert({
        user_id: userId,
        plan_type: planType,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      })
    
    if (insertError) {
      console.error('Error creating user plan:', insertError)
      return
    }
    
    console.log('User plan created successfully with plan type:', planType)
    
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Processing subscription updated:', subscription.id)
  
  try {
    // Determine plan type based on price amount
    let planType = 'monthly'
    const priceAmount = subscription.items?.data?.[0]?.price?.unit_amount || 0
    
    console.log('Price amount from subscription update:', priceAmount)
    
    // Map price amounts to plan types
    if (priceAmount === 7900) { // R$ 79,00 - Plano Mensal
      planType = 'monthly'
    } else if (priceAmount === 19700) { // R$ 197,00 - Plano Trimestral
      planType = 'quarterly'
    } else {
      planType = 'monthly' // Fallback para monthly
    }
    
    console.log('Detected plan type:', planType)
    
    // Use UPSERT to handle subscription updates
    const { error } = await supabase
      .from('user_plans')
      .upsert({
        plan_type: planType,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      }, {
        onConflict: 'stripe_subscription_id'
      })
      
    if (error) {
      console.error('Error updating subscription:', error)
      return
    }
    
    console.log('Subscription updated successfully with plan type:', planType)
    
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  console.log('Processing subscription deleted:', subscription.id)
  
  try {
    // Update user plan status to cancelled
    const { error } = await supabase
      .from('user_plans')
      .update({
        status: 'cancelled',
        updated_at: new Date()
      })
      .eq('stripe_subscription_id', subscription.id)
      
    if (error) {
      console.error('Error updating subscription status:', error)
      return
    }
    
    console.log('Subscription marked as cancelled')
    
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(supabase: any, invoice: any) {
  console.log('Processing invoice payment succeeded:', invoice.id)
  
  try {
    // Check if invoice already exists
    const { data: existingInvoice, error: checkError } = await supabase
      .from('invoices')
      .select('id')
      .eq('stripe_invoice_id', invoice.id)
      .single()
    
    if (existingInvoice) {
      console.log('Invoice already exists, skipping duplicate:', invoice.id)
      return
    }
    
    // Find user by stripe_customer_id using RPC
    let userId = null
    if (invoice.customer) {
      const { data: userByStripeId, error: searchError } = await supabase
        .rpc('find_user_by_stripe_id', { stripe_id: invoice.customer })
      
      if (searchError) {
        console.error('Error searching users:', searchError)
        return
      }
      
      if (userByStripeId && userByStripeId.length > 0) {
        userId = userByStripeId[0].user_id
        console.log('Found user for invoice:', userId)
      } else {
        console.log('User not found for customer:', invoice.customer)
      }
    }
    
    // Log the successful payment
    const { error } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: invoice.customer,
        stripe_subscription_id: invoice.subscription,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'paid',
        period_start: new Date(invoice.period_start * 1000),
        period_end: new Date(invoice.period_end * 1000)
      })
      
    if (error) {
      console.error('Error logging invoice:', error)
      return
    }
    
    console.log('Invoice logged successfully with user_id:', userId)
    
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error)
  }
}
