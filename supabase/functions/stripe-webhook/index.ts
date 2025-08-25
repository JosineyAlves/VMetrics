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

    // Verify the webhook signature (optional but recommended)
    // const event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET'))

    // For now, let's parse the body directly
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
      
      // Get customer details
      const { data: customerData, error: customerError } = await supabase
        .from('stripe.customers')
        .select('*')
        .eq('id', session.customer)
        .single()
        
      if (customerError) {
        console.error('Error fetching customer:', customerError)
        return
      }
      
      // Get subscription details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('stripe.subscriptions')
        .select('*')
        .eq('id', session.subscription)
        .single()
        
      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError)
        return
      }
      
      // Determine plan type based on product
      const { data: productData, error: productError } = await supabase
        .from('stripe.products')
        .select('*')
        .eq('id', subscriptionData.attrs->>'items'->0->>'price'->>'product')
        .single()
        
      if (productError) {
        console.error('Error fetching product:', productError)
        return
      }
      
      let planType = 'starter'
      if (productData.attrs->>'name'?.includes('pro')) {
        planType = 'pro'
      } else if (productData.attrs->>'name'?.includes('enterprise')) {
        planType = 'enterprise'
      }
      
      // Check if user already exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', session.customer)
        .single()
        
      let userId = existingUser?.id
      
      if (!userId) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: customerData.attrs->>'email',
            full_name: customerData.attrs->>'name' || 'Usuário VMetrics',
            stripe_customer_id: session.customer,
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
      
      // Create or update user plan
      const { error: planError } = await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan_type: planType,
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          status: 'active',
          current_period_start: new Date(subscriptionData.attrs->>'current_period_start' * 1000),
          current_period_end: new Date(subscriptionData.attrs->>'current_period_end' * 1000)
        })
        
      if (planError) {
        console.error('Error updating user plan:', planError)
        return
      }
      
      console.log('User plan updated successfully')
      
      // TODO: Send welcome email
      // await sendWelcomeEmail(customerData.attrs->>'email', planType)
    }
    
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Processing subscription updated:', subscription.id)
  
  try {
    // Update user plan status
    const { error } = await supabase
      .from('user_plans')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date()
      })
      .eq('stripe_subscription_id', subscription.id)
      
    if (error) {
      console.error('Error updating subscription:', error)
      return
    }
    
    console.log('Subscription updated successfully')
    
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
