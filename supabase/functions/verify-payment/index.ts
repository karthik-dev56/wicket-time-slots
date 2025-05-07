
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe with secret key from environment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Retrieve the session to check its payment status
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Return session details
    return new Response(
      JSON.stringify({
        success: session.payment_status === 'paid',
        status: session.payment_status,
        metadata: session.metadata,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Error verifying payment" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
