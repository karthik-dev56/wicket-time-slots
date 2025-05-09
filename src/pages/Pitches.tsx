
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Pitches = () => {
  const pitches = [
    {
      id: 1,
      title: 'Bowling Machine Lane',
      description: 'Professional practice with our state-of-the-art bowling machines for perfecting your technique.',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '$45/hour',
      features: [
        'Professional bowling machines',
        'Speed and spin control',
        'Performance analysis',
        'HD recording capabilities',
        'Professional lighting system',
        'Technical feedback available'
      ]
    },
    {
      id: 2,
      title: 'Normal Practice Lane',
      description: 'Standard cricket lanes for practice sessions, casual play, and friendly matches.',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '$40/hour',
      features: [
        'Basic equipment provided',
        'Suitable for all skill levels',
        'Flexible booking times',
        'Casual-friendly environment',
        'Group bookings welcome',
        'Perfect for practice matches'
      ]
    },
    {
      id: 3,
      title: 'Coaching Sessions',
      description: 'Personalized training with experienced cricket coaches to improve your skills.',
      image: 'https://images.unsplash.com/photo-1624765434852-66678c237697?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '$60/hour',
      features: [
        'Personalized training',
        'Professional coaches',
        'Skill development focus',
        'Video analysis included',
        'Performance tracking',
        'Technique refinement'
      ]
    },
    {
      id: 4,
      title: 'Junior Development Pitch',
      description: 'Specially designed for young cricketers aged 7-15. Child-friendly equipment and simplified playing area to develop core skills.',
      image: 'https://images.unsplash.com/photo-1587397845856-e6cf49176c70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '$30/hour',
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
            <Button asChild variant="outline" className="border-cricket-green text-cricket-green hover:bg-cricket-green hover:text-white">
              <Link to="/rules">Facility Rules</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Pitches;
