
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon!",
      });
      setIsSubmitting(false);
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <Layout>
      <section className="relative bg-cricket-dark text-white py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-cricket-dark to-cricket-green opacity-80 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg max-w-3xl">
            Have questions about our facilities or need help with a booking?
            Our team is ready to assist you.
          </p>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-cricket-dark">Get in Touch</h2>
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={5} required />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-cricket-green hover:bg-cricket-green-light"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending Message...' : 'Send Message'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-cricket-dark">Contact Information</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />Address
                      </h3>
                      <address className="not-italic text-gray-600">
                        Unit 2/56 Barretta Rd<br />
                        Ravenhall VIC 3023<br />
                        Australia
                      </address>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />Contact Details
                      </h3>
                      <p className="text-gray-600">Phone: +61 490 703 772</p>
                      <p className="text-gray-600">Email: info@ravenhallcricket.com</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />Opening Hours
                      </h3>
                      <p className="text-gray-600">Monday - Friday: 6am - 11pm</p>
                      <p className="text-gray-600">Saturday: 6am - 11pm</p>
                      <p className="text-gray-600">Sunday: 9am - 8pm</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6 text-cricket-dark">Frequently Asked Questions</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-cricket-dark mb-1">How do I book a cricket pitch?</h3>
                      <p className="text-gray-600">You can book online through our booking page or contact us by phone.</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-cricket-dark mb-1">What equipment is provided?</h3>
                      <p className="text-gray-600">Basic equipment is provided for casual pitches. For premium and training pitches, specialized equipment is available.</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-cricket-dark mb-1">Can I cancel my booking?</h3>
                      <p className="text-gray-600">Yes, bookings can be cancelled up to 24 hours before the scheduled time for a full refund.</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-cricket-dark mb-1">Do you offer coaching services?</h3>
                      <p className="text-gray-600">Yes, we have professional coaches available. Please enquire for rates and availability.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-cricket-gray rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-cricket-dark">Ready to Play?</h2>
            <p className="text-lg mb-6">Book your cricket pitch now and start playing in our state-of-the-art facility.</p>
            <Button asChild className="bg-cricket-green hover:bg-cricket-green-light">
              <Link to="/booking">Book a Pitch</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
