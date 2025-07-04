
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const BookingSuccess = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [verificationError, setVerificationError] = useState('');
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all query parameters from the URL
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('session_id');
        
        // Get booking details from URL query parameters if they exist
        const pitchType = queryParams.get('pitchType');
        const date = queryParams.get('date');
        
        // Get timeSlots - parse the JSON string from URL parameter
        const timeSlotsParam = queryParams.get('timeSlots');
        let timeSlots = [];
        
        if (timeSlotsParam) {
          try {
            timeSlots = JSON.parse(timeSlotsParam);
            console.log("Parsed time slots:", timeSlots);
          } catch (e) {
            console.error("Error parsing time slots:", e);
            // Fallback - try to use it as a single string
            timeSlots = [timeSlotsParam];
          }
        }
        
        const price = queryParams.get('price') ? parseFloat(queryParams.get('price')!) : undefined;
        
        if (!sessionId) {
          setVerificationError('No session ID found in URL');
          setIsLoading(false);
          return;
        }
        
        console.log("Verifying payment with:", { 
          sessionId, 
          pitchType, 
          date, 
          timeSlots, 
          price 
        });
        
        // Call our verify-payment function with all booking details
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { 
            sessionId,
            pitchType,
            date,
            timeSlots,
            price
          },
        });
        
        console.log("Verification response:", data, error);
        
        if (error) {
          console.error("Verification function error:", error);
          throw new Error(error.message || "Error connecting to verification service");
        }
        
        if (!data) {
          throw new Error("No data returned from verification service");
        }
        
        setPaymentVerified(data.success);
        setPaymentStatus(data.status || "Unknown");
        setBookingDetails(data.metadata);
        
        if (data.success) {
          toast({
            title: "Booking Successful",
            description: "Your cricket pitch has been booked successfully!",
            variant: "default"
          });
        } else {
          throw new Error(data.error || "Payment verification failed");
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setVerificationError(error.message || 'Failed to verify payment');
        
        toast({
          title: "Verification Failed",
          description: error.message || "Failed to verify payment",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyPayment();
  }, [location, toast]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {isLoading ? (
                  <Loader2 className="h-16 w-16 text-cricket-green animate-spin" />
                ) : paymentVerified ? (
                  <CheckCircle className="h-16 w-16 text-cricket-green" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {isLoading ? 'Verifying Payment...' : 
                 paymentVerified ? 'Booking Successful!' : 'Payment Verification Failed'}
              </CardTitle>
              <CardDescription>
                {isLoading ? 'Please wait while we verify your payment' : 
                 paymentVerified ? 'Your cricket pitch has been booked successfully' : 
                 'There was an issue verifying your payment'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {isLoading ? (
                <p>Checking payment status...</p>
              ) : paymentVerified ? (
                <>
                  <p className="mb-4">
                    Thank you for your payment. We have sent the booking details to your email.
                  </p>
                  {bookingDetails && (
                    <div className="mt-4 text-left bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Booking Details:</h3>
                      <p><strong>Pitch Type:</strong> {bookingDetails.pitchType}</p>
                      <p><strong>Date:</strong> {bookingDetails.date}</p>
                      <p><strong>Time Slots:</strong></p>
                      <ul className="list-disc pl-5">
                        {bookingDetails.timeSlots && bookingDetails.timeSlots.map((slot: string, index: number) => (
                          <li key={`time-slot-${index}`}>{slot}</li>
                        ))}
                      </ul>
                      <p><strong>Payment Status:</strong> {paymentStatus}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    If you have any questions about your booking, please contact our support team.
                  </p>
                </>
              ) : (
                <>
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{verificationError || "Payment verification failed"}</AlertDescription>
                  </Alert>
                  <p>
                    Please contact our support team if you believe this is an error, or try booking again.
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              {!paymentVerified && !isLoading && (
                <Link to="/booking">
                  <Button variant="outline">Try Again</Button>
                </Link>
              )}
              <Link to="/">
                <Button className="bg-cricket-green hover:bg-cricket-green-light">
                  Return to Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookingSuccess;
