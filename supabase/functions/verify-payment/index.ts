
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

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
    // Get request body
    const { sessionId, pitchType, date, timeSlot, price } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, error: "No session ID provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // For now, we're using the data passed from the client
    // In production, you would verify with Stripe using the Stripe API
    
    // Use the booking data passed from the client
    const bookingMetadata = {
      pitchType: pitchType || "Bowling Machine Lane",
      date: date || new Date().toISOString().split("T")[0],
      timeSlot: timeSlot || "3:00 PM - 4:00 PM",
      userId: user.id,
      price: price || 45.00
    };

    // Store booking in database
    const { data: bookingData, error: bookingError } = await supabase.from("bookings").insert({
      user_id: user.id,
      pitch_type: bookingMetadata.pitchType,
      date: bookingMetadata.date,
      time: bookingMetadata.timeSlot,
      price: bookingMetadata.price,
      booking_date: new Date().toISOString(),
      status: 'upcoming'
    }).select();

    if (bookingError) {
      console.error("Error storing booking:", bookingError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to store booking data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: "Complete",
        metadata: bookingMetadata,
        booking: bookingData?.[0] || null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
