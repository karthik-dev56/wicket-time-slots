
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { MembershipStatus } from '@/components/MembershipStatus';

const Dashboard = () => {
  const { toast } = useToast();
  
  const handleCancelBooking = () => {
    toast({
      title: "Booking Cancelled",
      description: "Your booking has been successfully cancelled.",
    });
  };

  // Sample upcoming bookings data
  const upcomingBookings = [
    {
      id: 1,
      pitchType: 'Premium Match Pitch',
      date: 'May 15, 2023',
      time: '3:00 PM - 4:00 PM',
      price: '£75.00'
    },
    {
      id: 2,
      pitchType: 'Training Pitch',
      date: 'May 22, 2023',
      time: '5:00 PM - 6:00 PM',
      price: '£50.00'
    }
  ];
  
  // Sample past bookings data
  const pastBookings = [
    {
      id: 101,
      pitchType: 'Casual Play Pitch',
      date: 'April 30, 2023',
      time: '2:00 PM - 3:00 PM',
      price: '£35.00'
    },
    {
      id: 102,
      pitchType: 'Premium Match Pitch',
      date: 'April 25, 2023',
      time: '6:00 PM - 7:00 PM',
      price: '£75.00'
    },
    {
      id: 103,
      pitchType: 'Training Pitch',
      date: 'April 18, 2023',
      time: '4:00 PM - 5:00 PM',
      price: '£50.00'
    }
  ];

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
                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-cricket-dark">{booking.pitchType}</h3>
                                <p className="text-gray-600">{booking.date} • {booking.time}</p>
                                <p className="font-medium text-cricket-green mt-2">{booking.price}</p>
                              </div>
                              <div className="flex space-x-2 mt-4 md:mt-0">
                                <Button variant="outline" className="border-cricket-green text-cricket-green hover:bg-cricket-green hover:text-white">
                                  Modify
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={handleCancelBooking}
                                >
                                  Cancel
                                </Button>
                              </div>
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
                  {pastBookings.length > 0 ? (
                    <div className="space-y-4">
                      {pastBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-cricket-dark">{booking.pitchType}</h3>
                                <p className="text-gray-600">{booking.date} • {booking.time}</p>
                                <p className="font-medium text-cricket-green mt-2">{booking.price}</p>
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
              {/* Membership Status Card - NEW COMPONENT */}
              <MembershipStatus />
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>Your account information and stats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">John Doe</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">john.doe@example.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Bookings</p>
                      <p className="font-medium">5</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">January 2023</p>
                    </div>
                  </div>
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
                  <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-700">
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
