
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingSuccess = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-cricket-green" />
              </div>
              <CardTitle className="text-2xl">Booking Successful!</CardTitle>
              <CardDescription>Your cricket pitch has been booked successfully</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                Thank you for your payment. We have sent the booking details to your email.
              </p>
              <p className="text-sm text-gray-500">
                If you have any questions about your booking, please contact our support team.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
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
