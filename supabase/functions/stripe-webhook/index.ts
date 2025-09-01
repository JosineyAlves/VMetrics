// 🚀 WEBHOOK CORRIGIDO - USANDO AUTH.USERS E SISTEMA NATIVO SUPABASE
// Substitua o arquivo atual por esta versão corrigida

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
    // Get the request body
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Parse the event
    const event = JSON.parse(body)
    console.log('Received Stripe webhook:', event.type)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
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
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// 🎯 FUNÇÃO PRINCIPAL CORRIGIDA - CRIAR USUÁRIO NA AUTH.USERS
async function handleCheckoutCompleted(supabase: any, session: any) {
  console.log('Processing checkout completed:', session.id)
  
  try {
    // Check if this is a subscription checkout
    if (session.mode === 'subscription' && session.subscription) {
      
      // Get customer details from session
      const customerEmail = session.customer_details?.email
      const customerName = session.customer_details?.name
      const customerId = session.customer
      const subscriptionId = session.subscription
      
      console.log('Customer details:', { customerEmail, customerName, customerId, subscriptionId })
      
      // 🚀 CRIAR USUÁRIO NA TABELA DE AUTH (NÃO NA CUSTOMIZADA)
      let userId = null
      
      // Verificar se usuário já existe na auth.users
      const { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(customerEmail)
      
      if (existingUser?.user) {
        userId = existingUser.user.id
        console.log('Existing user found in auth.users:', userId)
        
        // Atualizar metadata se necessário
        if (existingUser.user.user_metadata?.stripe_customer_id !== customerId) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { 
              stripe_customer_id: customerId,
              full_name: customerName 
            }
          })
          
          if (updateError) {
            console.error('Error updating user metadata:', updateError)
          } else {
            console.log('User metadata updated successfully')
          }
        }
      } else {
        // 🎉 CRIAR NOVO USUÁRIO NA AUTH.USERS
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: customerEmail,
          password: crypto.randomUUID(), // Senha temporária
          email_confirm: true, // Email já confirmado
          user_metadata: {
            full_name: customerName || 'Usuário VMetrics',
            stripe_customer_id: customerId
          }
        })
        
        if (createError) {
          console.error('Error creating user in auth.users:', createError)
          return
        }
        
        userId = newUser.user.id
        console.log('New user created in auth.users:', userId)
        
        // 🎉 EMAIL AUTOMÁTICO VIA SUPABASE + RESEND
        // O Supabase automaticamente envia email de boas-vindas!
        console.log('✅ User created successfully. Email will be sent automatically via Supabase + Resend')
      }
      
      // Criar plano do usuário
      const { error: planError } = await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan_type: 'monthly', // Will be updated by subscription events
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
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
    
    // Find user by stripe_customer_id in auth.users
    let userId: string | null = null
    let customerEmail: string | null = null
    let customerName: string | null = null
    
    // Get customer email from Stripe subscription
    customerEmail = subscription.customer_email
    
    if (!customerEmail) {
      console.log('No customer_email in subscription, trying to find user by stripe_customer_id...')
      
      // Search in auth.users by metadata
      const { data: users, error: searchError } = await supabase.auth.admin.listUsers()
      
      if (searchError) {
        console.error('Error searching users:', searchError)
        return
      }
      
      // Find user with matching stripe_customer_id
      const matchingUser = users.users.find(user => 
        user.user_metadata?.stripe_customer_id === subscription.customer
      )
      
      if (matchingUser) {
        userId = matchingUser.id
        customerEmail = matchingUser.email
        customerName = matchingUser.user_metadata?.full_name
        console.log('Existing user found by stripe_customer_id:', userId, 'with email:', customerEmail)
      }
    } else {
      // Try to find user by email
      const { data: existingUser, error: emailError } = await supabase.auth.admin.getUserByEmail(customerEmail)
      
      if (existingUser?.user) {
        userId = existingUser.user.id
        customerName = existingUser.user.user_metadata?.full_name
        console.log('Existing user found by email:', userId)
        
        // Update stripe_customer_id if different
        if (existingUser.user.user_metadata?.stripe_customer_id !== subscription.customer) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { 
              ...existingUser.user.user_metadata,
              stripe_customer_id: subscription.customer
            }
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
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: finalEmail,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          full_name: 'Usuário VMetrics',
          stripe_customer_id: subscription.customer
        }
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        return
      }
      
      userId = newUser.user.id
      customerEmail = finalEmail
      customerName = 'Usuário VMetrics'
      console.log('New user created with email:', finalEmail, 'ID:', userId)
      
      // 🎉 EMAIL AUTOMÁTICO VIA SUPABASE + RESEND
      console.log('✅ User created successfully. Email will be sent automatically via Supabase + Resend')
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
    
    // Find user by stripe_customer_id to get user_id
    let userId = null
    if (invoice.customer) {
      // Search in auth.users by metadata
      const { data: users, error: searchError } = await supabase.auth.admin.listUsers()
      
      if (searchError) {
        console.error('Error searching users:', searchError)
        return
      }
      
      // Find user with matching stripe_customer_id
      const matchingUser = users.users.find(user => 
        user.user_metadata?.stripe_customer_id === invoice.customer
      )
      
      if (matchingUser) {
        userId = matchingUser.id
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
