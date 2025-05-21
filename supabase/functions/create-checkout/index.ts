
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

// Define discounts and fees
const PRICING_ADJUSTMENTS = {
  groupFee: 0.1, // 10% extra fee for groups of 5+
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
      timeSlots, 
      players, 
      isEarlyBird, 
      isWeekendPackage,
      membershipType,
      membershipDiscount
    } = await req.json();
    
    console.log("Received request with pitchType:", pitchType);
    console.log("Received timeSlots:", timeSlots);
    
    if (!pitchType || !PRICES[pitchType]) {
      throw new Error("Invalid pitch type selected");
    }
    
    if (!timeSlots || (Array.isArray(timeSlots) && timeSlots.length === 0)) {
      throw new Error("No time slots selected");
    }

    // Initialize Stripe with secret key from environment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Get the price amount for the selected pitch type
    let priceAmount = PRICES[pitchType];
    
    // If multiple time slots are selected, multiply the price
    const slots = Array.isArray(timeSlots) ? timeSlots : [timeSlots];
    let totalSlots = slots.length;
    
    // Adjust for weekend package (fixed price regardless of slots)
    let basePrice = totalSlots * priceAmount;
    
    // Format the pitch name for display
    let pitchName = pitchTypeName || "Cricket Pitch";
    
    // Apply discounts if applicable
    let description = `Booking for ${date} with ${totalSlots} time slot${totalSlots > 1 ? 's' : ''}: ${slots.join(', ')}`;
    let adjustmentsApplied = [];
    
    // Check if premium member is using their free hour
    let isFreeHour = false;
    if (membershipType === "premium" && pitchType === "normalLane" && totalSlots === 2) {
      // In a real app, we'd check if they've used their free hour this week
      // For now, we'll assume they haven't
      const hasFreeHourAvailable = true;
      if (hasFreeHourAvailable) {
        basePrice = 0;
        isFreeHour = true;
        adjustmentsApplied.push("Premium member free hour");
        description += " (Premium member free hour)";
      }
    }
    
    // Only apply other adjustments if it's not a free hour
    if (!isFreeHour) {
      // Apply weekend package if selected (fixed price regardless of slots)
      if (isWeekendPackage && pitchType === "normalLane") {
        basePrice = PRICING_ADJUSTMENTS.weekend;
        adjustmentsApplied.push("Weekend Family Package: 2 hours for $70");
      } else {
        // Apply membership discount if applicable
        if (membershipType && membershipDiscount) {
          // For basic membership, don't apply discount to bowling machine
          if (!(membershipType === "basic" && pitchType === "bowlingMachine")) {
            const discountRate = membershipDiscount / 100;
            basePrice = Math.round(basePrice * (1 - discountRate));
            adjustmentsApplied.push(`${membershipType} membership: ${membershipDiscount}% off`);
          }
        }

        // Apply group fee if 5+ players (10% extra)
        if (players && players >= 5) {
          basePrice = Math.round(basePrice * (1 + PRICING_ADJUSTMENTS.groupFee));
          adjustmentsApplied.push("Group fee: 10% extra for 5+ players");
        }
        
        // Apply early bird discount if applicable (before 4 PM on weekdays)
        if (isEarlyBird) {
          basePrice = Math.round(basePrice * (1 - PRICING_ADJUSTMENTS.earlyBird));
          adjustmentsApplied.push("Early bird: 15% off");
        }
      }
    }
    
    if (adjustmentsApplied.length > 0) {
      description += ` (${adjustmentsApplied.join(', ')})`;
    }
    
    // Serialize the time slots array to string for URL params
    const timeSlotsParam = JSON.stringify(slots);
    
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
            unit_amount: basePrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Add booking details to the success URL, properly encoding the time slots
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}&pitchType=${encodeURIComponent(pitchTypeName || pitchName)}&date=${encodeURIComponent(date)}&timeSlots=${encodeURIComponent(timeSlotsParam)}&price=${basePrice/100}`,
      cancel_url: `${req.headers.get("origin")}/booking`,
      metadata: {
        pitchType,
        pitchTypeName: pitchTypeName || pitchName,
        date,
        timeSlots: JSON.stringify(slots),
        players: players?.toString() || "1",
        isEarlyBird: isEarlyBird ? "true" : "false",
        isWeekendPackage: isWeekendPackage ? "true" : "false",
        membershipType: membershipType || "",
        adjustmentsApplied: adjustmentsApplied.join(", "),
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
