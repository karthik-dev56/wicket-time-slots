
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { MembershipStatus } from '@/components/MembershipStatus';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

type BookingType = {
  id: string;
  pitch_type: string;
  date: string;
  time: string;
  price: number;
  status: string;
  booking_date: string;
};

type UserProfileType = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  member_since: string | null;
  avatar_url: string | null;
};

const Dashboard = () => {
  const { toast } = useToast();
  const [upcomingBookings, setUpcomingBookings] = useState<BookingType[]>([]);
  const [pastBookings, setPastBookings] = useState<BookingType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchUserProfile();
    } else {
      setIsLoadingBookings(false);
      setIsLoadingProfile(false);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      
      // Get current date in ISO format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch upcoming bookings (today and future)
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('bookings')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true });
      
      if (upcomingError) throw upcomingError;
      
      // Fetch past bookings
      const { data: pastData, error: pastError } = await supabase
        .from('bookings')
        .select('*')
        .lt('date', today)
        .order('date', { ascending: false });
      
      if (pastError) throw pastError;
      
      setUpcomingBookings(upcomingData || []);
      setPastBookings(pastData || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Failed to load bookings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .single();
      
      if (error) throw error;
      
      setUserProfile(data);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Failed to load profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // Update local state to reflect the change
      setUpcomingBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Failed to cancel booking",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const formatMemberSince = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-cricket-dark">My Dashboard</h1>
              <p className="text-gray-600">Manage your bookings and account settings</p>
            </div>
            <Button asChild className="mt-4 md:mt-0 bg-cricket-green hover:bg-cricket-green-light">
              <Link to="/booking">Book a New Pitch</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-8">
                  <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
                  <TabsTrigger value="past">Past Bookings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {isLoadingBookings ? (
                    <div className="flex justify-center items-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-cricket-green" />
                    </div>
                  ) : upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-cricket-dark">{booking.pitch_type}</h3>
                                <p className="text-gray-600">{formatDate(booking.date)} • {booking.time}</p>
                                <p className="font-medium text-cricket-green mt-2">{formatCurrency(booking.price)}</p>
                                {booking.status === 'cancelled' && (
                                  <Badge variant="outline" className="mt-2 text-red-500 border-red-200 bg-red-50">
                                    Cancelled
                                  </Badge>
                                )}
                              </div>
                              {booking.status !== 'cancelled' && (
                                <div className="flex space-x-2 mt-4 md:mt-0">
                                  <Button variant="outline" className="border-cricket-green text-cricket-green hover:bg-cricket-green hover:text-white">
                                    Modify
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500 mb-4">You don't have any upcoming bookings.</p>
                        <Button asChild className="bg-cricket-green hover:bg-cricket-green-light">
                          <Link to="/booking">Book a Pitch</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {isLoadingBookings ? (
                    <div className="flex justify-center items-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-cricket-green" />
                    </div>
                  ) : pastBookings.length > 0 ? (
                    <div className="space-y-4">
                      {pastBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-cricket-dark">{booking.pitch_type}</h3>
                                <p className="text-gray-600">{formatDate(booking.date)} • {booking.time}</p>
                                <p className="font-medium text-cricket-green mt-2">{formatCurrency(booking.price)}</p>
                                {booking.status === 'cancelled' && (
                                  <Badge variant="outline" className="mt-2 text-red-500 border-red-200 bg-red-50">
                                    Cancelled
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-4 md:mt-0">
                                <Button variant="outline">Book Again</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">You don't have any past bookings.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <MembershipStatus />
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>Your account information and stats</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProfile ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-cricket-green" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">
                          {userProfile ? 
                            `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Not set' 
                            : user?.email?.split('@')[0] || 'Not available'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Bookings</p>
                        <p className="font-medium">{upcomingBookings.length + pastBookings.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">
                          {userProfile ? formatMemberSince(userProfile.member_since) : 'Not available'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Payment Methods
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-500 hover:text-red-700"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      toast({
                        title: "Signed Out",
                        description: "You have been successfully signed out."
                      });
                    }}
                  >
                    Log Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
