import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, from = 'VMetrics <noreply@vmetrics.com.br>' } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, html' 
      });
    }

    // Prepare email data for Supabase Edge Function
    const emailData = {
      from,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '') // Convert HTML to text
    };

    // Send email using Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-email-resend', {
      body: { emailData }
    });

    if (error) {
      console.error('❌ Error sending email via Supabase:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    console.log('✅ Email sent successfully via Supabase:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully via Supabase',
      data 
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
