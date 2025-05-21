
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define membership plan products and prices
const MEMBERSHIP_PLANS = {
  basic: {
    name: "Basic Membership",
    price: 3000, // $30.00 in cents
    benefits: "10% off lane bookings, Priority booking access"
  },
  premium: {
    name: "Premium Membership",
    price: 8000, // $80.00 in cents
    benefits: "20% off all sessions, 1 free hour per week, Discounts on coaching & events"
  },
  junior: {
    name: "Junior Membership",
    price: 2000, // $20.00 in cents
    benefits: "15% off bookings, Free weekly group training session"
  }
};

// Helper for detailed logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const reqBody = await req.json();
    const { planType } = reqBody;
    
    if (!planType || !MEMBERSHIP_PLANS[planType]) {
      throw new Error("Invalid membership plan selected");
    }
    
    logStep("Plan type validated", { planType });

    // Create Supabase client
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
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      // Create a new customer if none exists
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    }

    // Get plan details
    const plan = MEMBERSHIP_PLANS[planType];
    logStep("Plan details retrieved", { plan });

    // Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.benefits,
            },
            unit_amount: plan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get("origin")}/membership-success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
      cancel_url: `${req.headers.get("origin")}/#membership-plans`,
      locale: 'en', // Use English language
      billing_address_collection: 'auto', // Collect billing address
      // Use the payment_method_options to set the default country to Australia
      payment_method_options: {
        card: {
          setup_future_usage: 'off' // Needed to set payment_method_options without error
        }
      },
      payment_method_data: {
        billing_details: {
          address: {
            country: 'AU'
          }
        }
      },
      metadata: {
        user_id: user.id,
        plan_type: planType
      },
    });
    
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Subscription error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
