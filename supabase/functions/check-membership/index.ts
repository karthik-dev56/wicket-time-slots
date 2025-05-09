
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-MEMBERSHIP] ${step}${detailsStr}`);
};

// Define membership benefits mapping
const MEMBERSHIP_BENEFITS = {
  basic: {
    discount: 10,
    benefits: [
      "10% off lane bookings",
      "Priority booking access",
      "Member-only events"
    ]
  },
  premium: {
    discount: 20,
    benefits: [
      "20% off all sessions (including bowling machine)",
      "1 free hour per week (normal lane)",
      "Discounts on coaching & events",
      "Access to members lounge"
    ]
  },
  junior: {
    discount: 15,
    benefits: [
      "15% off bookings",
      "Free weekly group training session",
      "Junior tournaments access"
    ]
  }
};

// Map price IDs to membership types
const PRICE_TO_MEMBERSHIP_TYPE: Record<string, string> = {
  "price_1ROLOLFWkFThYC8LdvkLxCWZ": "premium", // $80/month Premium membership
  "price_1ROLNOFWkFThYC8LPVBsNxwd": "basic",   // $30/month Basic membership
  "price_1ROLPJFWkFThYC8LjDLGJWkG": "junior",  // $20/month Junior membership
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    logStep("Supabase client created");

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    logStep("Auth token extracted");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("Authentication error", { message: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("User authentication failed - no email available");
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated", { userId: user.id });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    logStep("Stripe initialized");

    // Check if a Stripe customer exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ active: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Stripe customer found", { customerId });

    // Check if the customer has an active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      logStep("No active subscriptions found");
      return new Response(JSON.stringify({ active: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get the most recent active subscription
    const subscription = subscriptions.data[0];
    logStep("Active subscription found", { subscriptionId: subscription.id });

    // Extract membership type from the subscription's price ID
    let membershipType = "basic"; // Default fallback
    
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      logStep("Retrieved price ID from subscription", { priceId });
      
      if (PRICE_TO_MEMBERSHIP_TYPE[priceId]) {
        membershipType = PRICE_TO_MEMBERSHIP_TYPE[priceId];
        logStep("Determined membership type from price ID", { membershipType });
      } else {
        // If price ID not found in the mapping, check metadata or product information
        if (subscription.metadata.plan_type) {
          membershipType = subscription.metadata.plan_type;
          logStep("Using plan_type from metadata", { membershipType });
        } else {
          // Try to get product information to determine the plan
          try {
            const priceObj = await stripe.prices.retrieve(priceId);
            if (priceObj.product && typeof priceObj.product !== 'string') {
              const productId = priceObj.product.id;
              const product = await stripe.products.retrieve(productId);
              
              // Check product metadata or name to determine membership type
              if (product.metadata.plan_type) {
                membershipType = product.metadata.plan_type;
              } else if (product.name) {
                const name = product.name.toLowerCase();
                if (name.includes('premium')) membershipType = 'premium';
                else if (name.includes('junior')) membershipType = 'junior';
                else if (name.includes('basic')) membershipType = 'basic';
              }
              logStep("Determined membership type from product", { membershipType, productName: product.name });
            }
          } catch (e) {
            logStep("Error retrieving product info", { error: e.message });
          }
        }
      }
    }
    
    // Ensure the membership type is valid
    if (!MEMBERSHIP_BENEFITS[membershipType as keyof typeof MEMBERSHIP_BENEFITS]) {
      logStep("Invalid membership type, defaulting to basic", { membershipType });
      membershipType = "basic";
    }
    
    // Get membership benefits
    const benefits = MEMBERSHIP_BENEFITS[membershipType as keyof typeof MEMBERSHIP_BENEFITS].benefits;
    const discount = MEMBERSHIP_BENEFITS[membershipType as keyof typeof MEMBERSHIP_BENEFITS].discount;
    
    // Calculate renewal date
    const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();
    
    logStep("Membership details retrieved", { membershipType, discount, renewalDate });

    return new Response(
      JSON.stringify({
        active: true,
        membershipType,
        discount,
        benefits,
        renewalDate,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Membership check error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, active: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
