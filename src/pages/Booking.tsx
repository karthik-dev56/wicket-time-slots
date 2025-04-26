import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Booking = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [pitchType, setPitchType] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const { toast } = useToast();

  const handleBookingSubmit = () => {
    if (!date || !pitchType || !timeSlot) {
      toast({
        title: "Please complete all fields",
        description: "You need to select a date, pitch type, and time slot.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Booking Request Submitted",
      description: `Your booking for ${pitchType} on ${format(date, 'PPP')} at ${timeSlot} has been received.`,
    });
    
    // Reset form
    setDate(undefined);
    setPitchType("");
    setTimeSlot("");
  };

  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM',
    '8:00 PM - 9:00 PM',
  ];

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
                    <Select value={pitchType} onValueChange={setPitchType}>
                      <SelectTrigger id="pitch-type">
                        <SelectValue placeholder="Select a pitch type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">Premium Match Pitch (£75/hour)</SelectItem>
                        <SelectItem value="training">Training Pitch (£50/hour)</SelectItem>
                        <SelectItem value="casual">Casual Play Pitch (£35/hour)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="border rounded-md p-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
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
                    <Label htmlFor="time-slot">Time Slot</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger id="time-slot">
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-cricket-green hover:bg-cricket-green-light" 
                    onClick={handleBookingSubmit}
                  >
                    Continue to Payment
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
                      {pitchType === 'premium' && 'Premium Match Pitch'}
                      {pitchType === 'training' && 'Training Pitch'}
                      {pitchType === 'casual' && 'Casual Play Pitch'}
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
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-500">Estimated Price</p>
                    <p className="font-bold text-xl text-cricket-green">
                      {pitchType === 'premium' && '$75.00'}
                      {pitchType === 'training' && '$50.00'}
                      {pitchType === 'casual' && '$35.00'}
                      {!pitchType && '$0.00'}
                    </p>
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
