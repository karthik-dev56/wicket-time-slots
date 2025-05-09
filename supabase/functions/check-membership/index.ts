
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

// Map price IDs to membership types - updated to include more potential price IDs
const PRICE_TO_MEMBERSHIP_TYPE: Record<string, string> = {
  "price_1ROLOLFWkFThYC8LdvkLxCWZ": "premium", // $80/month Premium membership
  "price_1ROLNOFWkFThYC8LPVBsNxwd": "basic",   // $30/month Basic membership
  "price_1ROLPJFWkFThYC8LjDLGJWkG": "junior"   // $20/month Junior membership
  // Adding common test price IDs for Premium subscriptions
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
    
    // Log the entire subscription object to debug
    logStep("Full subscription details", subscription);

    // Extract membership type from the subscription's price ID or other fields
    let membershipType = "basic"; // Default fallback
    
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      logStep("Retrieved price ID from subscription", { priceId });
      
      // First check: Direct price ID mapping
      if (PRICE_TO_MEMBERSHIP_TYPE[priceId]) {
        membershipType = PRICE_TO_MEMBERSHIP_TYPE[priceId];
        logStep("Determined membership type from price ID", { membershipType });
      } 
      // Second check: Subscription metadata
      else if (subscription.metadata && subscription.metadata.plan_type) {
        membershipType = subscription.metadata.plan_type;
        logStep("Using plan_type from subscription metadata", { membershipType });
      }
      // Third check: Price amount (Premium subscriptions typically cost more)
      else {
        try {
          const priceObj = await stripe.prices.retrieve(priceId);
          logStep("Retrieved price details", { 
            priceId, 
            unitAmount: priceObj.unit_amount,
            currency: priceObj.currency 
          });
          
          // Determine membership by price amount
          if (priceObj.unit_amount) {
            if (priceObj.unit_amount >= 7000) { // $70 or more for Premium
              membershipType = "premium";
              logStep("Determined Premium membership based on price amount", { amount: priceObj.unit_amount });
            } else if (priceObj.unit_amount >= 3000 && priceObj.unit_amount < 7000) { // $30-69 for Basic
              membershipType = "basic";
              logStep("Determined Basic membership based on price amount", { amount: priceObj.unit_amount });
            } else if (priceObj.unit_amount < 3000) { // Under $30 for Junior
              membershipType = "junior";
              logStep("Determined Junior membership based on price amount", { amount: priceObj.unit_amount });
            }
          }
          
          // Fourth check: Product information
          if (priceObj.product && typeof priceObj.product === 'string') {
            const product = await stripe.products.retrieve(priceObj.product);
            logStep("Retrieved product details", { 
              productId: product.id, 
              productName: product.name,
              metadata: product.metadata 
            });
            
            // Check product metadata
            if (product.metadata && product.metadata.membership_type) {
              membershipType = product.metadata.membership_type.toLowerCase();
              logStep("Using membership_type from product metadata", { membershipType });
            }
            // Check product name
            else if (product.name) {
              const name = product.name.toLowerCase();
              if (name.includes('premium')) {
                membershipType = 'premium';
                logStep("Determined Premium membership from product name", { name });
              } else if (name.includes('junior')) {
                membershipType = 'junior';
                logStep("Determined Junior membership from product name", { name });
              } else if (name.includes('basic')) {
                membershipType = 'basic';
                logStep("Determined Basic membership from product name", { name });
              }
            }
          }
        } catch (e) {
          logStep("Error retrieving product/price info", { error: e.message });
        }
      }
    }
    
    // FORCE PREMIUM for debugging - REMOVE IN PRODUCTION
    if (subscription.plan && subscription.plan.amount >= 7000) {
      membershipType = "premium";
      logStep("FORCED Premium membership based on plan amount", { amount: subscription.plan.amount });
    }
    
    // Ensure the membership type is valid and normalize to lowercase
    membershipType = membershipType.toLowerCase();
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

