
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define price mapping for direct price creation
const PRICES = {
  premium: 7500, // $75.00 in cents
  training: 5000, // $50.00 in cents
  casual: 3500 // $35.00 in cents
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
    
    // Get the price amount for the selected pitch type
    const priceAmount = PRICES[pitchType as keyof typeof PRICES];
    if (!priceAmount) {
      throw new Error("Invalid pitch type selected");
    }
    
    // Format the pitch name for display
    const pitchName = pitchType.charAt(0).toUpperCase() + pitchType.slice(1) + " Cricket Pitch";
    
    // Create a Checkout session with inline price creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pitchName,
              description: `Booking for ${date} at ${timeSlot}`,
            },
            unit_amount: priceAmount,
          },
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
