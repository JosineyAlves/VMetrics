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

// Handle checkout session completed
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
      
      // Check if user already exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
        
      let userId = existingUser?.id
      
      if (!userId) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: customerEmail,
            full_name: customerName || 'Usuário VMetrics',
            stripe_customer_id: customerId,
            is_active: true
          })
          .select('id')
          .single()
          
        if (createError) {
          console.error('Error creating user:', createError)
          return
        }
        
        userId = newUser.id
        console.log('New user created:', userId)
      }
      
      // Use UPSERT to handle both new plans and upgrades
      const { error: planError } = await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan_type: 'starter', // Will be updated by subscription events
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }, {
          onConflict: 'stripe_subscription_id'
        })
        
      if (planError) {
        console.error('Error updating user plan:', planError)
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
    // Determine plan type based on product ID
    let planType = 'starter'
    if (subscription.items?.data?.[0]?.price?.product) {
      const productId = subscription.items.data[0].price.product
      
      console.log('Product ID from subscription:', productId)
      
      // Map product IDs to plan types
      if (productId.includes('pro') || productId.includes('price_pro') || productId === 'prod_PvrF2GjvBWFrqQ') {
        planType = 'pro'
      } else if (productId.includes('enterprise') || productId.includes('price_enterprise')) {
        planType = 'enterprise'
      }
    }
    
    console.log('Detected plan type for new subscription:', planType)
    
    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single()
      
    let userId = existingUser?.id
    
    if (!userId) {
      console.log('User not found, creating new user for customer:', subscription.customer)
      // Create new user if not exists
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'user@example.com', // Will be updated when we have customer details
          full_name: 'Usuário VMetrics',
          stripe_customer_id: subscription.customer,
          is_active: true
        })
        .select('id')
        .single()
        
      if (createError) {
        console.error('Error creating user:', createError)
        return
      }
      
      userId = newUser.id
      console.log('New user created:', userId)
    }
    
    // Use UPSERT to handle both new plans and upgrades
    console.log('Upserting plan for user:', userId, 'with subscription:', subscription.id)
    
    const { error: upsertError } = await supabase
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan_type: planType,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date()
      }, {
        onConflict: 'stripe_subscription_id' // Use subscription ID as conflict resolution
      })
    
    if (upsertError) {
      console.error('Error upserting user plan:', upsertError)
      return
    }
    
    console.log('User plan upserted successfully with plan type:', planType)
    
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Processing subscription updated:', subscription.id)
  
  try {
    // Determine plan type based on product ID
    let planType = 'starter'
    if (subscription.items?.data?.[0]?.price?.product) {
      const productId = subscription.items.data[0].price.product
      
      console.log('Product ID from subscription update:', productId)
      
      // Map product IDs to plan types
      if (productId.includes('pro') || productId.includes('price_pro') || productId === 'prod_PvrF2GjvBWFrqQ') {
        planType = 'pro'
      } else if (productId.includes('enterprise') || productId.includes('price_enterprise')) {
        planType = 'enterprise'
      }
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
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date()
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
    // Log the successful payment
    const { error } = await supabase
      .from('invoices')
      .upsert({
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
    
    console.log('Invoice logged successfully')
    
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error)
  }
}
