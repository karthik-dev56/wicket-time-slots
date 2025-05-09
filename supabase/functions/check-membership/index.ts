
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // Create Supabase client using the anon key for user authentication.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        active: false,
        message: "No membership found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    
    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(JSON.stringify({ 
        active: false,
        message: "No active membership" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get subscription details
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    
    // Determine membership type based on price
    let membershipType = "";
    const amount = price.unit_amount || 0;
    
    if (amount === 2000) {
      membershipType = "junior";
    } else if (amount === 3000) {
      membershipType = "basic";
    } else if (amount === 8000) {
      membershipType = "premium";
    }

    // Return membership details
    return new Response(JSON.stringify({ 
      active: true,
      membershipType,
      renewalDate: new Date(subscription.current_period_end * 1000).toISOString(),
      discount: membershipType === "basic" ? 10 : 
               membershipType === "premium" ? 20 : 
               membershipType === "junior" ? 15 : 0,
      benefits: membershipType === "basic" ? ["10% off lane bookings", "Priority booking access"] :
                membershipType === "premium" ? ["20% off all sessions", "1 free hour per week", "Discounts on coaching & events"] :
                membershipType === "junior" ? ["15% off bookings", "Free weekly group training session"] : []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Membership check error:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Error checking membership status" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
