// 🚀 WEBHOOK CORRIGIDO - USAR INVITE USER CORRETAMENTE
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }
    const event = JSON.parse(body);
    console.log('Received Stripe webhook:', event.type);
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    switch(event.type){
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
// FUNÇÃO PRINCIPAL - CALCULAR PLAN_TYPE DIRETAMENTE
async function handleCheckoutCompleted(supabase, session) {
  console.log('Processing checkout completed:', session.id);
  try {
    if (session.mode === 'subscription' && session.subscription) {
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      // CALCULAR PLAN_TYPE BASEADO NO PREÇO REAL DA SESSÃO
      let planType = 'monthly'; // padrão
      const priceAmount = session.amount_total || 0;
      if (priceAmount === 7900) {
        planType = 'monthly';
      } else if (priceAmount === 19700) {
        planType = 'quarterly';
      }
      console.log('Detected plan type from session:', planType, 'Price amount:', priceAmount);
      console.log('Customer details:', {
        customerEmail,
        customerName,
        customerId,
        subscriptionId,
        planType
      });
      // USAR INVITE USER (ENVIA EMAIL AUTOMATICAMENTE)
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(customerEmail, {
        data: {
          full_name: customerName || 'Usuário vmetrics',
          stripe_customer_id: customerId
        }
      });
      if (inviteError) {
        console.error('Error inviting user:', inviteError);
        return;
      }
      console.log('User invited successfully:', inviteData.user.id);
      console.log('✅ Email de convite enviado automaticamente via Supabase + Resend');
      // Criar plano do usuário com plan_type correto
      const { error: planError } = await supabase.from('user_plans').upsert({
        user_id: inviteData.user.id,
        plan_type: planType,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }, {
        onConflict: 'stripe_subscription_id'
      });
      if (planError) {
        console.error('Error creating user plan:', planError);
        return;
      }
      console.log('User plan created/updated successfully with plan type:', planType);
    }
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
  }
}
// Handle subscription creation - SIMPLIFICADO (opcional)
async function handleSubscriptionCreated(supabase, subscription) {
  console.log('Processing subscription created:', subscription.id);
  console.log('Subscription processed by handleCheckoutCompleted - no action needed');
// Não faz nada - tudo é feito no handleCheckoutCompleted
}
