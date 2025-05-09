
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';

export const MembershipStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [membershipDetails, setMembershipDetails] = useState<any>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const checkMembership = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { data, error } = await supabase.functions.invoke('check-membership', {});
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Membership check response:', data);
      setMembershipDetails(data);
    } catch (err: any) {
      console.error('Error checking membership:', err);
      setError(err.message || 'Failed to verify membership status');
      toast({
        title: "Membership Check Failed",
        description: err.message || 'Could not retrieve your membership information',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkMembership();
  }, []);

  const getMembershipColor = (type: string) => {
    switch(type) {
      case 'premium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'junior': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getMembershipTitle = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + ' Membership';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Checking Membership Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Please wait while we verify your membership status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Membership Check Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={checkMembership}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!membershipDetails?.active) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Membership</CardTitle>
          <CardDescription>Unlock benefits by subscribing to one of our membership plans</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            As a member, you can enjoy discounts on bookings, special access to facilities, and more.
          </p>
          <Button asChild className="bg-cricket-green hover:bg-cricket-green-light">
            <Link to="/#membership-plans">View Membership Options</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={`border-b ${getMembershipColor(membershipDetails.membershipType)}`}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{getMembershipTitle(membershipDetails.membershipType)}</CardTitle>
            <CardDescription className="mt-1">
              Enjoy {membershipDetails.discount}% off on eligible bookings
            </CardDescription>
          </div>
          <Badge className={getMembershipColor(membershipDetails.membershipType)}>
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4 flex items-center text-sm text-gray-700">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Renews on {formatDate(membershipDetails.renewalDate)}</span>
        </div>

        <h3 className="font-medium text-gray-800 mb-2">Your Benefits:</h3>
        <ul className="space-y-2 mb-4">
          {membershipDetails.benefits.map((benefit: string, index: number) => (
            <li key={index} className="flex items-start text-sm">
              <CheckCircle className="h-4 w-4 text-cricket-green mr-2 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <Button variant="outline" onClick={checkMembership} size="sm">
            Refresh Status
          </Button>
          <Button asChild size="sm" className="bg-cricket-green hover:bg-cricket-green-light">
            <Link to="/booking">Book a Pitch Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
