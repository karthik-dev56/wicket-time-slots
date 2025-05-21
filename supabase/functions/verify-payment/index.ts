
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
    // Get request body with all booking details
    const { sessionId, pitchType, date, timeSlots, price } = await req.json();
    
    console.log("Verify payment received:", { sessionId, pitchType, date, timeSlots, price });
    
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
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    if (!user) {
      console.error("No user found");
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse time slots properly
    let timeSlotsArray: string[] = [];
    
    if (timeSlots) {
      if (Array.isArray(timeSlots)) {
        timeSlotsArray = timeSlots;
      } else if (typeof timeSlots === 'string') {
        // Handle timeSlots as a JSON string (from URL parameters)
        try {
          const parsed = JSON.parse(timeSlots);
          timeSlotsArray = Array.isArray(parsed) ? parsed : [timeSlots];
        } catch (e) {
          // If it's not valid JSON, treat it as a single time slot
          timeSlotsArray = [timeSlots];
        }
      }
    }
    
    console.log("Processed time slots:", timeSlotsArray);
    
    // Check if we have valid time slots
    if (!timeSlotsArray.length) {
      console.error("No time slots provided");
      return new Response(
        JSON.stringify({ success: false, error: "No time slots provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if any of the time slots are already booked
    for (const timeSlot of timeSlotsArray) {
      const { data: existingBookings, error: bookingCheckError } = await supabase
        .from("bookings")
        .select("*")
        .eq("date", date)
        .eq("time", timeSlot)
        .eq("pitch_type", pitchType)
        .eq("status", "upcoming");
        
      if (bookingCheckError) {
        console.error("Error checking existing bookings:", bookingCheckError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to check availability" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      if (existingBookings && existingBookings.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `The time slot "${timeSlot}" has been booked by someone else. Please select a different time.`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
        );
      }
    }

    // In production, you would verify with Stripe using the Stripe API
    // For now, use the booking details passed from the client
    const bookingMetadata = {
      pitchType: pitchType || "Bowling Machine Lane",
      date: date || new Date().toISOString().split("T")[0],
      timeSlots: timeSlotsArray,
      userId: user.id,
      price: price || 45.00
    };

    console.log("Booking data prepared:", bookingMetadata);

    // Store bookings in database (one entry per time slot)
    const bookingEntries = timeSlotsArray.map(timeSlot => ({
      user_id: user.id,
      pitch_type: bookingMetadata.pitchType,
      date: bookingMetadata.date,
      time: timeSlot,
      price: bookingMetadata.price / timeSlotsArray.length, // Divide price among slots
      booking_date: new Date().toISOString(),
      status: 'upcoming'
    }));
    
    console.log("Booking entries to insert:", bookingEntries);
    
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingEntries)
      .select();

    if (bookingError) {
      console.error("Error storing booking:", bookingError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to store booking data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Booking successful, returning data");
    
    return new Response(
      JSON.stringify({
        success: true,
        status: "Complete",
        metadata: bookingMetadata,
        bookings: bookingData || []
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
