
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define price mapping
const PRICES = {
  bowlingMachine: 4500, // $45.00 in cents
  normalLane: 4000, // $40.00 in cents
  coaching: 6000 // $60.00 in cents
};

const Booking = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [pitchType, setPitchType] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [players, setPlayers] = useState<number>(1);
  const [isEarlyBird, setIsEarlyBird] = useState<boolean>(false);
  const [isWeekendPackage, setIsWeekendPackage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>("");
  const [membershipStatus, setMembershipStatus] = useState<any>(null);
  const [isFetchingMembership, setIsFetchingMembership] = useState<boolean>(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const { toast } = useToast();

  // Check membership status when component mounts
  useEffect(() => {
    const checkMembershipStatus = async () => {
      try {
        setIsFetchingMembership(true);
        const { data, error } = await supabase.functions.invoke('check-membership', {});
        
        if (error) throw error;
        
        setMembershipStatus(data);
        
        if (data?.active) {
          toast({
            title: `${data.membershipType.charAt(0).toUpperCase() + data.membershipType.slice(1)} Membership Active`,
            description: `Your ${data.discount}% discount will be applied to your booking.`,
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Error checking membership:', error);
        // Silently fail - we don't want to block booking if membership check fails
      } finally {
        setIsFetchingMembership(false);
      }
    };
    
    checkMembershipStatus();
  }, [toast]);

  // Fetch booked slots whenever date or pitchType changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!date || !pitchType) return;
      
      try {
        setIsLoadingSlots(true);
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('bookings')
          .select('time')
          .eq('date', formattedDate)
          .eq('pitch_type', 
            pitchType === 'bowlingMachine' ? 'Bowling Machine Lane' : 
            pitchType === 'normalLane' ? 'Normal Practice Lane' : 'Coaching Session'
          )
          .eq('status', 'upcoming');
          
        if (error) throw error;
        
        // Extract time slots that are already booked
        const booked = data.map(booking => booking.time);
        setBookedSlots(booked);
      } catch (error) {
        console.error('Error fetching booked slots:', error);
        toast({
          title: "Error",
          description: "Failed to fetch available time slots. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingSlots(false);
      }
    };
    
    fetchBookedSlots();
  }, [date, pitchType, toast]);

  // Check if the selected time is eligible for early bird discount
  useEffect(() => {
    if (date && timeSlot) {
      const dayOfWeek = date.getDay();
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
      
      const hourStr = timeSlot.split(':')[0].trim();
      const hour = parseInt(hourStr);
      const isPM = timeSlot.includes('PM');
      const is24Hour = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;
      
      // Early bird discount applies before 4 PM on weekdays
      setIsEarlyBird(isWeekday && is24Hour < 16);
    }
  }, [date, timeSlot]);

  // Automatically enable weekend package option for normal lanes on weekends
  useEffect(() => {
    if (date && pitchType === 'normalLane') {
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      setIsWeekendPackage(isWeekend);
    } else {
      setIsWeekendPackage(false);
    }
  }, [date, pitchType]);

  useEffect(() => {
    // Clear any previous errors when form fields change
    if (bookingError) {
      setBookingError("");
    }
  }, [date, pitchType, timeSlot, bookingError]);

  const validateBooking = () => {
    if (!date || !pitchType || !timeSlot) {
      toast({
        title: "Please complete all fields",
        description: "You need to select a date, pitch type, and time slot.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleBookingSubmit = async () => {
    if (!validateBooking()) return;
    
    try {
      setIsLoading(true);
      setBookingError("");
      
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
      
      // Get the actual pitch type name for storing in the database
      const pitchTypeName = 
        pitchType === 'bowlingMachine' ? 'Bowling Machine Lane' : 
        pitchType === 'normalLane' ? 'Normal Practice Lane' : 'Coaching Session';
      
      // Call our Supabase Edge Function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          pitchType: pitchTypeName,
          date: formattedDate,
          timeSlot,
          players,
          isEarlyBird,
          isWeekendPackage,
          membershipType: membershipStatus?.active ? membershipStatus.membershipType : null,
          membershipDiscount: membershipStatus?.active ? membershipStatus.discount : null,
        },
      });
      
      if (error) {
        throw new Error(error.message || 'Error creating checkout session');
      }
      
      if (!data?.url) {
        throw new Error('No checkout URL returned from server');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setBookingError(error.message || 'There was a problem processing your payment');
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate 30-minute time slots based on opening hours
  const generateTimeSlots = () => {
    const slots = [];
    const dayOfWeek = date ? date.getDay() : -1; // -1 if no date selected
    
    // Set start and end times based on day of week
    // Sunday = 0, Monday = 1, ..., Saturday = 6
    let startHour = 0;
    let endHour = 0;
    
    if (dayOfWeek === 0) {
      // Sunday
      startHour = 9;
      endHour = 20; // 8 PM
    } else {
      // Monday to Saturday
      startHour = 6;
      endHour = 23; // 11 PM
    }
    
    for (let hour = startHour; hour < endHour; hour++) {
      const isPM = hour >= 12;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const hourStr = `${hour12}:00 ${isPM ? 'PM' : 'AM'}`;
      const halfHourStr = `${hour12}:30 ${isPM ? 'PM' : 'AM'}`;
      
      // For full hour slots (e.g., 1:00 PM - 1:30 PM)
      slots.push(`${hourStr} - ${halfHourStr}`);
      
      // For half hour slots (e.g., 1:30 PM - 2:00 PM)
      if (hour < endHour - 1) {
        const nextHour = hour + 1;
        const nextIsPM = nextHour >= 12;
        const nextHour12 = nextHour === 0 ? 12 : nextHour > 12 ? nextHour - 12 : nextHour;
        const nextHourStr = `${nextHour12}:00 ${nextIsPM ? 'PM' : 'AM'}`;
        
        slots.push(`${halfHourStr} - ${nextHourStr}`);
      }
    }
    
    return slots;
  };

  // Calculate price with discounts
  const calculatePrice = () => {
    if (!pitchType) return "$0.00";
    
    let price = PRICES[pitchType as keyof typeof PRICES] / 100;
    
    // Apply membership discount if applicable
    if (membershipStatus?.active) {
      if (membershipStatus.membershipType === 'premium' || 
          (membershipStatus.membershipType === 'basic' && pitchType !== 'bowlingMachine') ||
          (membershipStatus.membershipType === 'junior')) {
        price = price * (1 - membershipStatus.discount / 100);
      }
    }
    
    // Apply group discount if 5+ players
    if (players >= 5) {
      price = price * 0.9; // 10% off
    }
    
    // Apply early bird discount if applicable
    if (isEarlyBird) {
      price = price * 0.85; // 15% off
    }
    
    // Apply weekend package if selected
    if (isWeekendPackage && pitchType === 'normalLane') {
      price = 70; // Fixed $70 for weekend package
    }
    
    // For premium members, check if this is their free weekly hour
    if (membershipStatus?.active && membershipStatus.membershipType === 'premium' && pitchType === 'normalLane') {
      // In a real app, we would check if they've used their free hour this week
      // For now, let's assume they haven't
      const hasFreeHourAvailable = true;
      if (hasFreeHourAvailable) {
        // Option to use free hour
        return "$0.00 (free hour)";
      }
    }
    
    return `$${price.toFixed(2)}`;
  };

  return (
    <Layout>
      <section className="py-16 bg-cricket-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-cricket-dark">Book Your Cricket Pitch</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Select your preferred pitch, date, and time slot to schedule your next cricket session
            </p>
          </div>
          
          {membershipStatus?.active && (
            <div className="max-w-lg mx-auto mb-8 bg-green-50 p-4 border border-green-200 rounded-md flex items-start">
              <Info className="text-green-600 mr-3 mt-1" />
              <div>
                <h3 className="font-medium text-green-800">
                  {membershipStatus.membershipType.charAt(0).toUpperCase() + membershipStatus.membershipType.slice(1)} Membership Benefits Active
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {membershipStatus.discount}% discount will be applied to eligible bookings.
                  {membershipStatus.membershipType === 'premium' && (
                    <span className="block mt-1">You also have 1 free hour of normal lane usage per week.</span>
                  )}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Booking Details</CardTitle>
                  <CardDescription>Choose a date, pitch type, and time slot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="pitch-type">Pitch Type</Label>
                    <Select value={pitchType} onValueChange={(value) => {
                      setPitchType(value);
                      setTimeSlot(""); // Reset time slot when pitch type changes
                    }}>
                      <SelectTrigger id="pitch-type">
                        <SelectValue placeholder="Select a pitch type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bowlingMachine">Bowling Machine Lane ($45.00/hour)</SelectItem>
                        <SelectItem value="normalLane">Normal Practice Lane ($40.00/hour)</SelectItem>
                        <SelectItem value="coaching">Coaching Session ($60.00/hour)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="border rounded-md p-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          setTimeSlot(""); // Reset time slot when date changes
                        }}
                        disabled={(date) => {
                          // Disable dates in the past
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          // Also disable dates more than 30 days in the future
                          const thirtyDaysFromNow = new Date();
                          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                          return date < today || date > thirtyDaysFromNow;
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time-slot">Time Slot (30-minute intervals)</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot} disabled={!date || !pitchType || isLoadingSlots}>
                      <SelectTrigger id="time-slot">
                        <SelectValue placeholder={isLoadingSlots ? "Loading available slots..." : "Select a time slot"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {date && pitchType && generateTimeSlots().map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <SelectItem 
                              key={slot} 
                              value={slot} 
                              disabled={isBooked}
                              className={isBooked ? "opacity-50 line-through" : ""}
                            >
                              {slot} {isBooked ? "(Booked)" : ""}
                            </SelectItem>
                          );
                        })}
                        {(!date || !pitchType) && (
                          <SelectItem value="placeholder" disabled>
                            Please select a date and pitch type first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {isLoadingSlots && (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading available slots...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="players">Number of Players</Label>
                    <Select 
                      value={players.toString()} 
                      onValueChange={(value) => setPlayers(parseInt(value))}
                    >
                      <SelectTrigger id="players">
                        <SelectValue placeholder="Select number of players" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'player' : 'players'}
                            {num >= 5 ? ' (10% group discount)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {pitchType === 'normalLane' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weekend-package" 
                        checked={isWeekendPackage}
                        onCheckedChange={(checked) => setIsWeekendPackage(checked as boolean)}
                        disabled={date && (date.getDay() === 0 || date.getDay() === 6)} // Disable on weekends - auto checked
                      />
                      <Label htmlFor="weekend-package">
                        Weekend Family Package (2 hours for $70)
                        {date && (date.getDay() === 0 || date.getDay() === 6) && 
                          <span className="text-sm text-gray-500 ml-2">(Auto-applied on weekends)</span>
                        }
                      </Label>
                    </div>
                  )}
                  
                  {isEarlyBird && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <p className="text-green-800 text-sm flex items-center">
                        <span className="mr-2 text-green-600">✓</span>
                        Early Bird Discount Applied (15% off before 4 PM on weekdays)
                      </p>
                    </div>
                  )}
                  
                  {players >= 5 && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <p className="text-green-800 text-sm flex items-center">
                        <span className="mr-2 text-green-600">✓</span>
                        Group Discount Applied (10% off for 5+ players)
                      </p>
                    </div>
                  )}
                  
                  {membershipStatus?.active && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <p className="text-green-800 text-sm flex items-center">
                        <span className="mr-2 text-green-600">✓</span>
                        {membershipStatus.membershipType.charAt(0).toUpperCase() + membershipStatus.membershipType.slice(1)} Membership Discount: {membershipStatus.discount}% off
                      </p>
                    </div>
                  )}
                  
                  {bookingError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {bookingError}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-cricket-green hover:bg-cricket-green-light" 
                    onClick={handleBookingSubmit}
                    disabled={isLoading || isFetchingMembership || !date || !pitchType || !timeSlot}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isFetchingMembership ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking membership...
                      </>
                    ) : 'Continue to Payment'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-500">Selected Pitch</p>
                    <p className="font-medium">
                      {pitchType === 'bowlingMachine' && 'Bowling Machine Lane'}
                      {pitchType === 'normalLane' && 'Normal Practice Lane'}
                      {pitchType === 'coaching' && 'Coaching Session'}
                      {!pitchType && 'No pitch selected'}
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {date ? format(date, 'PPP') : 'No date selected'}
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-500">Time Slot</p>
                    <p className="font-medium">
                      {timeSlot || 'No time slot selected'}
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-500">Players</p>
                    <p className="font-medium">
                      {players} {players === 1 ? 'player' : 'players'}
                      {players >= 5 && <span className="text-green-600 ml-2">(Group discount)</span>}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-500">Estimated Price</p>
                    <p className="font-bold text-xl text-cricket-green">
                      {calculatePrice()}
                    </p>
                    {(isEarlyBird || players >= 5 || isWeekendPackage || membershipStatus?.active) && (
                      <div className="text-sm text-gray-500 mt-1">
                        <p>Discounts applied:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          {isEarlyBird && <li>15% Early Bird Discount</li>}
                          {players >= 5 && <li>10% Group Discount</li>}
                          {isWeekendPackage && pitchType === 'normalLane' && <li>Weekend Family Package</li>}
                          {membershipStatus?.active && (
                            <li>
                              {membershipStatus.discount}% {membershipStatus.membershipType.charAt(0).toUpperCase() + membershipStatus.membershipType.slice(1)} Membership Discount
                              {membershipStatus.membershipType === 'premium' && pitchType === 'normalLane' && 
                                " (or free hour if available)"}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="font-medium text-yellow-800 mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm text-yellow-700">
                  <li>• Bookings can be canceled up to 24 hours before the scheduled time.</li>
                  <li>• Payment is required to confirm your booking.</li>
                  <li>• Please arrive 15 minutes before your scheduled time.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Booking;
