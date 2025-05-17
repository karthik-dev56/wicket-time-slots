
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
  basic: 0.1, // 10% for basic membership
  premium: 0.2, // 20% for premium membership
  junior: 0.15, // 15% for junior membership
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      pitchType, 
      pitchTypeName,
      date, 
      timeSlot, 
      players, 
      isEarlyBird, 
      isWeekendPackage,
      membershipType,
      membershipDiscount
    } = await req.json();
    
    console.log("Received request with pitchType:", pitchType);
    
    if (!pitchType || !PRICES[pitchType]) {
      throw new Error("Invalid pitch type selected");
    }

    // Initialize Stripe with secret key from environment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Get the price amount for the selected pitch type
    let priceAmount = PRICES[pitchType];
    
    // Format the pitch name for display
    let pitchName = pitchTypeName || "Cricket Pitch";
    
    // Apply discounts if applicable
    let description = `Booking for ${date} at ${timeSlot}`;
    let discountsApplied = [];
    
    // Check if premium member is using their free hour
    let isFreeHour = false;
    if (membershipType === "premium" && pitchType === "normalLane") {
      // In a real app, we'd check if they've used their free hour this week
      // For now, we'll assume they haven't
      const hasFreeHourAvailable = true;
      if (hasFreeHourAvailable) {
        priceAmount = 0;
        isFreeHour = true;
        discountsApplied.push("Premium member free hour");
        description += " (Premium member free hour)";
      }
    }
    
    // Only apply other discounts if it's not a free hour
    if (!isFreeHour) {
      // Apply membership discount if applicable
      if (membershipType && membershipDiscount) {
        // For basic membership, don't apply discount to bowling machine
        if (!(membershipType === "basic" && pitchType === "bowlingMachine")) {
          const discountRate = membershipDiscount / 100;
          const originalPrice = priceAmount;
          priceAmount = Math.round(priceAmount * (1 - discountRate));
          discountsApplied.push(`${membershipType} membership: ${membershipDiscount}% off`);
        }
      }

      // Apply group discount if 5+ players
      if (players && players >= 5) {
        const originalPrice = priceAmount;
        priceAmount = Math.round(priceAmount * (1 - DISCOUNTS.groupDiscount));
        discountsApplied.push("Group discount: 10% off");
      }
      
      // Apply early bird discount if applicable (before 4 PM on weekdays)
      if (isEarlyBird) {
        const originalPrice = priceAmount;
        priceAmount = Math.round(priceAmount * (1 - DISCOUNTS.earlyBird));
        discountsApplied.push("Early bird: 15% off");
      }
      
      // Apply weekend package if selected
      if (isWeekendPackage && pitchType === "normalLane") {
        priceAmount = DISCOUNTS.weekend;
        discountsApplied.push("Weekend Family Package: 2 hours for $70");
      }
    }
    
    if (discountsApplied.length > 0) {
      description += ` (${discountsApplied.join(', ')})`;
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
      // Add booking details to the success URL
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}&pitchType=${encodeURIComponent(pitchTypeName || pitchName)}&date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(timeSlot)}&price=${priceAmount/100}`,
      cancel_url: `${req.headers.get("origin")}/booking`,
      metadata: {
        pitchType,
        pitchTypeName: pitchTypeName || pitchName,
        date,
        timeSlot,
        players: players?.toString() || "1",
        isEarlyBird: isEarlyBird ? "true" : "false",
        isWeekendPackage: isWeekendPackage ? "true" : "false",
        membershipType: membershipType || "",
        discountsApplied: discountsApplied.join(", "),
        isFreeHour: isFreeHour ? "true" : "false"
      },
    });

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
