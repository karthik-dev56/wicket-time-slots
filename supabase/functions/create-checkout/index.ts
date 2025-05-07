
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define price mapping
const PRICE_IDS = {
  premium: 'price_1RJJYvFWkFThYC8L5j9jYX8Z',
  training: 'price_1RJJZvFWkFThYC8LX9j2YxZ9',
  casual: 'price_1RJJaRFWkFThYC8L5j9jYX8Z'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pitchType, date, timeSlot } = await req.json();
    
    if (!pitchType) {
      throw new Error("Pitch type is required");
    }

    // Initialize Stripe with secret key from environment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Get the price ID for the selected pitch type
    const priceId = PRICE_IDS[pitchType as keyof typeof PRICE_IDS];
    if (!priceId) {
      throw new Error("Invalid pitch type selected");
    }
    
    // Create a Checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/booking`,
      metadata: {
        pitchType,
        date,
        timeSlot,
      },
    });

    // Optional: Store booking in Supabase
    // This could be expanded to store the booking in a bookings table
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Error creating checkout session" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
