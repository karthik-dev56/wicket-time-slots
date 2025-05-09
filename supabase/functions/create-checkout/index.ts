
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define price mapping for direct price creation
const PRICES = {
  bowlingMachine: 4500, // $45.00 in cents
  normalLane: 4000, // $40.00 in cents
  coaching: 6000 // $60.00 in cents
};

// Define discounts
const DISCOUNTS = {
  groupDiscount: 0.1, // 10% discount for groups of 5+
  earlyBird: 0.15, // 15% off before 4 PM on weekdays
  weekend: 7000, // $70 for 2 hours (Weekend Family Package)
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pitchType, date, timeSlot, players, isEarlyBird, isWeekendPackage } = await req.json();
    
    if (!pitchType) {
      throw new Error("Pitch type is required");
    }

    // Initialize Stripe with secret key from environment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Get the price amount for the selected pitch type
    let priceAmount = PRICES[pitchType as keyof typeof PRICES];
    if (!priceAmount) {
      throw new Error("Invalid pitch type selected");
    }
    
    // Format the pitch name for display
    let pitchName;
    switch (pitchType) {
      case "bowlingMachine":
        pitchName = "Bowling Machine Lane";
        break;
      case "normalLane":
        pitchName = "Normal Practice Lane";
        break;
      case "coaching":
        pitchName = "Coaching Session";
        break;
      default:
        pitchName = "Cricket Pitch";
    }
    
    // Apply discounts if applicable
    let description = `Booking for ${date} at ${timeSlot}`;
    
    // Apply group discount if 5+ players
    if (players && players >= 5) {
      priceAmount = Math.round(priceAmount * (1 - DISCOUNTS.groupDiscount));
      description += ` (Group discount applied: 10% off)`;
    }
    
    // Apply early bird discount if applicable (before 4 PM on weekdays)
    if (isEarlyBird) {
      priceAmount = Math.round(priceAmount * (1 - DISCOUNTS.earlyBird));
      description += ` (Early bird discount applied: 15% off)`;
    }
    
    // Apply weekend package if selected
    if (isWeekendPackage && pitchType === "normalLane") {
      priceAmount = DISCOUNTS.weekend;
      description += ` (Weekend Family Package: 2 hours for $70)`;
    }
    
    // Create a Checkout session with inline price creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pitchName,
              description: description,
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
        players: players?.toString() || "1",
        isEarlyBird: isEarlyBird ? "true" : "false",
        isWeekendPackage: isWeekendPackage ? "true" : "false",
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
