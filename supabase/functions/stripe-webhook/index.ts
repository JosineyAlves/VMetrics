// 🚀 WEBHOOK COMPLETO - PROCESSAMENTO DE CANCELAMENTOS E EVENTOS
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
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object);
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

      // ✅ CORRIGIDO: Buscar usuário existente por email primeiro
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, email, stripe_customer_id')
        .eq('email', customerEmail)
        .single();
      
      let userId;
      
      if (existingUser) {
        // Usuário existe - atualizar stripe_customer_id se necessário
        userId = existingUser.id;
        console.log('✅ Usuário existente encontrado:', userId);
        
        // Atualizar stripe_customer_id se mudou
        if (existingUser.stripe_customer_id !== customerId) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId);
          
          if (updateError) {
            console.error('Error updating stripe_customer_id:', updateError);
          } else {
            console.log('✅ stripe_customer_id atualizado para:', customerId);
          }
        }
      } else {
        // Usuário não existe - criar novo
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
        
        userId = inviteData.user.id;
        console.log('✅ Novo usuário criado:', userId);
        console.log('✅ Email de convite enviado automaticamente via Supabase + Resend');
      }
      
      // Criar/atualizar plano do usuário
      const { error: planError } = await supabase.from('user_plans').upsert({
        user_id: userId,
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

// ✅ NOVA FUNÇÃO: Processar cancelamento de assinatura
async function handleSubscriptionDeleted(supabase, subscription) {
  console.log('🔄 [WEBHOOK] Processando cancelamento de assinatura:', subscription.id);
  try {
    const subscriptionId = subscription.id;
    const customerId = subscription.customer;

    // 1. Buscar plano do usuário pela subscription_id
    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (planError) {
      console.error('❌ [WEBHOOK] Erro ao buscar plano:', planError);
      return;
    }

    if (!userPlan) {
      console.log('⚠️ [WEBHOOK] Plano não encontrado para subscription:', subscriptionId);
      return;
    }

    // 2. Atualizar status do plano para 'canceled'
    const { error: updateError } = await supabase
      .from('user_plans')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('❌ [WEBHOOK] Erro ao atualizar plano:', updateError);
      return;
    }

    console.log('✅ [WEBHOOK] Plano cancelado com sucesso para user_id:', userPlan.user_id);

    // 3. Buscar dados do usuário para notificação
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userPlan.user_id)
      .single();

    if (userError) {
      console.error('❌ [WEBHOOK] Erro ao buscar usuário:', userError);
      return;
    }

    // 4. Enviar email de notificação (opcional)
    await sendCancellationNotificationEmail(user.email, user.full_name, subscription);

    // 5. Log do evento
    await logWebhookEvent(supabase, {
      event_type: 'subscription_canceled',
      subscription_id: subscriptionId,
      customer_id: customerId,
      user_id: userPlan.user_id,
      plan_type: userPlan.plan_type,
      cancellation_reason: subscription.cancellation_details?.reason || 'unknown'
    });

  } catch (error) {
    console.error('❌ [WEBHOOK] Erro em handleSubscriptionDeleted:', error);
  }
}

// ✅ NOVA FUNÇÃO: Processar atualização de assinatura
async function handleSubscriptionUpdated(supabase, subscription) {
  console.log('🔄 [WEBHOOK] Processando atualização de assinatura:', subscription.id);
  try {
    const subscriptionId = subscription.id;
    const status = subscription.status;

    // Mapear status do Stripe para status interno
    let internalStatus = 'active';
    if (status === 'canceled' || status === 'unpaid') {
      internalStatus = 'canceled';
    } else if (status === 'past_due') {
      internalStatus = 'past_due';
    } else if (status === 'trialing') {
      internalStatus = 'trialing';
    }

    // Atualizar status do plano
    const { error: updateError } = await supabase
      .from('user_plans')
      .update({
        status: internalStatus,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('❌ [WEBHOOK] Erro ao atualizar status do plano:', updateError);
      return;
    }

    console.log('✅ [WEBHOOK] Status do plano atualizado para:', internalStatus);

    // Log do evento
    await logWebhookEvent(supabase, {
      event_type: 'subscription_updated',
      subscription_id: subscriptionId,
      customer_id: subscription.customer,
      user_id: null,
      plan_type: null,
      new_status: internalStatus,
      old_status: status
    });

  } catch (error) {
    console.error('❌ [WEBHOOK] Erro em handleSubscriptionUpdated:', error);
  }
}

// ✅ NOVA FUNÇÃO: Processar pagamento bem-sucedido
async function handlePaymentSucceeded(supabase, invoice) {
  console.log('🔄 [WEBHOOK] Processando pagamento bem-sucedido:', invoice.id);
  try {
    if (invoice.subscription) {
      // Atualizar status do plano para ativo
      const { error: updateError } = await supabase
        .from('user_plans')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (updateError) {
        console.error('❌ [WEBHOOK] Erro ao reativar plano:', updateError);
        return;
      }

      console.log('✅ [WEBHOOK] Plano reativado com sucesso');

      // Log do evento
      await logWebhookEvent(supabase, {
        event_type: 'payment_succeeded',
        subscription_id: invoice.subscription,
        customer_id: invoice.customer,
        user_id: null,
        plan_type: null,
        invoice_id: invoice.id,
        amount: invoice.amount_paid
      });
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro em handlePaymentSucceeded:', error);
  }
}

// ✅ NOVA FUNÇÃO: Processar falha de pagamento
async function handlePaymentFailed(supabase, invoice) {
  console.log('🔄 [WEBHOOK] Processando falha de pagamento:', invoice.id);
  try {
    if (invoice.subscription) {
      // Atualizar status do plano para past_due
      const { error: updateError } = await supabase
        .from('user_plans')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (updateError) {
        console.error('❌ [WEBHOOK] Erro ao atualizar status do plano:', updateError);
        return;
      }

      console.log('✅ [WEBHOOK] Status do plano atualizado para past_due');

      // Log do evento
      await logWebhookEvent(supabase, {
        event_type: 'payment_failed',
        subscription_id: invoice.subscription,
        customer_id: invoice.customer,
        user_id: null,
        plan_type: null,
        invoice_id: invoice.id,
        amount: invoice.amount_due
      });
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro em handlePaymentFailed:', error);
  }
}

// ✅ NOVA FUNÇÃO: Enviar email de notificação de cancelamento
async function sendCancellationNotificationEmail(email, fullName, subscription) {
  try {
    // Aqui você pode integrar com seu serviço de email (Resend, SendGrid, etc.)
    console.log('📧 [WEBHOOK] Enviando email de cancelamento para:', email);
    
    // Exemplo de integração com Resend (se configurado)
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({
    //   from: 'noreply@seuapp.com',
    //   to: email,
    //   subject: 'Sua assinatura foi cancelada',
    //   html: `<h1>Olá ${fullName}</h1><p>Sua assinatura foi cancelada. Você pode reativar a qualquer momento.</p>`
    // });
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao enviar email:', error);
  }
}

// ✅ NOVA FUNÇÃO: Log de eventos do webhook
async function logWebhookEvent(supabase, eventData) {
  try {
    const { error } = await supabase
      .from('webhook_logs')
      .insert({
        event_type: eventData.event_type,
        subscription_id: eventData.subscription_id,
        customer_id: eventData.customer_id,
        user_id: eventData.user_id,
        plan_type: eventData.plan_type,
        metadata: eventData,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ [WEBHOOK] Erro ao logar evento:', error);
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro em logWebhookEvent:', error);
  }
}