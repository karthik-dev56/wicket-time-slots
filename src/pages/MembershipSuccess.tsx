
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const MembershipSuccess = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [membershipDetails, setMembershipDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const verifyMembership = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('session_id');
        const planType = queryParams.get('plan');
        
        if (!sessionId || !planType) {
          setError('Missing session information');
          setIsLoading(false);
          return;
        }

        // Check membership status using edge function
        const { data, error } = await supabase.functions.invoke('check-membership', {});
        
        if (error) {
          throw new Error(error.message);
        }

        setMembershipDetails(data);
      } catch (err: any) {
        setError(err.message || 'Failed to verify membership');
        toast({
          title: "Verification Error",
          description: err.message || 'Failed to verify membership',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyMembership();
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
                ) : membershipDetails?.active ? (
                  <CheckCircle className="h-16 w-16 text-cricket-green" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {isLoading ? 'Processing Membership...' : 
                 membershipDetails?.active ? 'Membership Activated!' : 
                 'Membership Verification Failed'}
              </CardTitle>
              <CardDescription>
                {isLoading ? 'Please wait while we verify your membership' : 
                 membershipDetails?.active ? 'Thank you for becoming a member' : 
                 'There was an issue verifying your membership'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {isLoading ? (
                <p>Checking membership status...</p>
              ) : membershipDetails?.active ? (
                <>
                  <p className="mb-4">
                    Congratulations! You are now a {membershipDetails.membershipType.charAt(0).toUpperCase() + membershipDetails.membershipType.slice(1)} member. 
                    Your membership benefits will be automatically applied to your bookings.
                  </p>
                  <div className="mt-6 bg-gray-50 p-4 rounded-md text-left">
                    <h3 className="font-medium mb-2">Your Membership Benefits:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {membershipDetails.benefits.map((benefit: string, index: number) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm text-gray-600">
                      Membership renews: {new Date(membershipDetails.renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                </>
              ) : (
                <p>
                  {error || "We couldn't verify your membership. Please contact our support team."}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Link to="/booking">
                <Button className="bg-cricket-green hover:bg-cricket-green-light">
                  Book a Pitch Now
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipSuccess;
