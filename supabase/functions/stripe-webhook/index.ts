// 🚀 WEBHOOK SIMPLIFICADO - FLUXO DIRETO SEM TOKENS COMPLEXOS
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

// 🎯 FUNÇÃO PRINCIPAL SIMPLIFICADA - CRIAR USUÁRIO DIRETAMENTE
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
        // 🚀 CRIAR USUÁRIO DIRETAMENTE (SEM CONVITE)
        const randomPassword = generateRandomPassword()
        
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
              email: customerEmail,
          password: randomPassword, // Senha temporária
          email_confirm: true, // Email já confirmado
          user_metadata: {
              full_name: customerName || 'Usuário VMetrics',
              stripe_customer_id: customerId,
            is_paying_customer: true
          }
            })
          
        if (userError) {
          console.error('Error creating user:', userError)
            return
          }
          
        userId = userData.user.id
        console.log('User created successfully:', userId)
        
        // 🚀 ENVIAR EMAIL DE BOAS-VINDAS
        await sendWelcomeEmail(supabase, customerEmail, customerName)
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
      
      // 🚀 CRIAR USUÁRIO DIRETAMENTE (SEM CONVITE)
      const randomPassword = generateRandomPassword()
      
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: finalEmail,
        password: randomPassword, // Senha temporária
        email_confirm: true, // Email já confirmado
        user_metadata: {
          full_name: 'Usuário VMetrics',
          stripe_customer_id: subscription.customer,
          is_paying_customer: true
        }
        })
      
      if (userError) {
        console.error('Error creating user:', userError)
        return
      }
      
      userId = userData.user.id
      customerEmail = finalEmail
      customerName = 'Usuário VMetrics'
      console.log('User created successfully with email:', finalEmail, 'ID:', userId)
      
      // 🚀 ENVIAR EMAIL DE BOAS-VINDAS
      await sendWelcomeEmail(supabase, finalEmail, customerName)
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

// 🚀 FUNÇÃO PARA GERAR SENHA ALEATÓRIA
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// 🚀 FUNÇÃO PARA ENVIAR EMAIL DE BOAS-VINDAS
async function sendWelcomeEmail(supabase: any, email: string, name: string) {
  try {
    // Usar a função de email do Supabase
    const { error } = await supabase.functions.invoke('send-email-resend', {
      body: {
        to: email,
        subject: 'Bem-vindo ao VMetrics! Sua compra foi processada',
        html: `
          <h2>Bem-vindo ao VMetrics!</h2>
          <p>Olá ${name}, sua compra foi processada com sucesso!</p>
          <p>Para acessar sua conta:</p>
          <ol>
            <li>Acesse: <a href="https://app.vmetrics.com.br/login">https://app.vmetrics.com.br/login</a></li>
            <li>Use seu email: ${email}</li>
            <li>Clique em "Esqueci minha senha" para definir uma nova senha</li>
          </ol>
          <p>Obrigado,<br>Equipe VMetrics</p>
        `
      }
      })
      
    if (error) {
      console.error('Error sending welcome email:', error)
    } else {
      console.log('Welcome email sent successfully to:', email)
    }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error)
  }
}