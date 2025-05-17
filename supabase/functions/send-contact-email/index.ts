
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request data
    const formData: ContactFormData = await req.json();
    const { firstName, lastName, email, subject, message } = formData;

    if (!firstName || !lastName || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Prepare data for Resend API
    const fullName = `${firstName} ${lastName}`;
    const fixedRecipientEmail = "prokarthik1889@gmail.com"; // Fixed recipient email
    
    // Send email via Resend - to the fixed recipient from the user's email
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fullName} <onboarding@resend.dev>`, // Show sender's name but use verified domain
        reply_to: email, // Set reply-to as the user's email
        to: [fixedRecipientEmail], // Fixed recipient
        subject: `Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br />')}</p>
        `,
      }),
    });

    const resendData = await resendResponse.json();
    
    // Also send a confirmation email to the user
    const confirmationResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ravenhall Cricket Centre <onboarding@resend.dev>',
        to: [email], // Send to the user's email
        subject: 'We\'ve received your message',
        html: `
          <h2>Thank you for contacting us, ${firstName}!</h2>
          <p>We have received your message about "${subject}" and will get back to you as soon as possible.</p>
          <p>For your records, below is a copy of your message:</p>
          <blockquote>${message.replace(/\n/g, '<br />')}</blockquote>
          <p>Best regards,<br>The Ravenhall Indoor Cricket Centre Team</p>
          <p style="color: #666; font-size: 12px;">Unit 2/56 Barretta Rd<br>Ravenhall VIC 3023<br>Australia<br>Phone: +61 490 703 772</p>
        `,
      }),
    });
    
    const confirmationData = await confirmationResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        mainEmail: resendData, 
        confirmationEmail: confirmationData 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
