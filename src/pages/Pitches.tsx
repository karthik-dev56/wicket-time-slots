
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Pitches = () => {
  const pitches = [
    {
      id: 1,
      title: 'Premium Match Pitch',
      description: 'Professional-grade cricket pitch with electronic scoreboard and spectator seating. Ideal for league matches and tournaments.',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '₹6,000/hour',
      features: [
        'Electronic scoreboard',
        'Spectator seating',
        'Match-quality pitch',
        'HD recording capabilities',
        'Professional lighting system',
        'Changing rooms and showers'
      ]
    },
    {
      id: 2,
      title: 'Training Pitch',
      description: 'Ideal for practice sessions and coaching with bowling machines available. Perfect for teams looking to improve their skills.',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '₹4,000/hour',
      features: [
        'Bowling machines',
        'Video analysis',
        'Training equipment',
        'Coaching area',
        'Ball tracking technology',
        'Skill development zones'
      ]
    },
    {
      id: 3,
      title: 'Casual Play Pitch',
      description: 'Perfect for casual games and beginners looking to enjoy cricket indoors. Affordable option for friendly matches and recreational play.',
      image: 'https://images.unsplash.com/photo-1624765434852-66678c237697?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '₹2,800/hour',
      features: [
        'Basic equipment provided',
        'Flexible booking',
        'Suitable for beginners',
        'Family-friendly environment',
        'No special gear required',
        'Relaxed atmosphere'
      ]
    },
    {
      id: 4,
      title: 'Junior Development Pitch',
      description: 'Specially designed for young cricketers aged 7-15. Child-friendly equipment and simplified playing area to develop core skills.',
      image: 'https://images.unsplash.com/photo-1587397845856-e6cf49176c70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '₹2,400/hour',
      features: [
        'Child-sized equipment',
        'Safe playing environment',
        'Junior coaching available',
        'Simplified pitch layout',
        'Parent viewing area',
        'Development programs'
      ]
    }
  ];

  return (
    <Layout>
      <section className="relative bg-cricket-dark text-white py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-cricket-dark to-cricket-green opacity-80 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Cricket Pitches</h1>
          <p className="text-lg max-w-3xl">
            Explore our range of high-quality cricket pitches designed to meet all your playing needs,
            from professional matches to casual games and training sessions.
          </p>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {pitches.map((pitch) => (
              <Card key={pitch.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img 
                      src={pitch.image} 
                      alt={pitch.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="text-2xl">{pitch.title}</CardTitle>
                      <CardDescription className="text-base mt-2">{pitch.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 py-4">
                      <div className="mb-4">
                        <span className="font-bold text-cricket-green text-xl">{pitch.price}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pitch.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <span className="mr-2 text-cricket-green">✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-0 pt-4">
                      <Button asChild className="w-full bg-cricket-green hover:bg-cricket-green-light">
                        <Link to="/booking">Book This Pitch</Link>
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-cricket-gray">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Need Help Choosing the Right Pitch?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Our cricket experts are available to help you select the perfect pitch for your needs.
            Whether you're planning a professional match or just a casual game with friends,
            we'll make sure you get the best experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" className="bg-cricket-green hover:bg-cricket-green-light">
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="outline" className="border-cricket-green text-cricket-green hover:bg-cricket-green hover:text-white">
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Pitches;
