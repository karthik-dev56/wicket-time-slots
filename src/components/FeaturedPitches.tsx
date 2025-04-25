
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const FeaturedPitches = () => {
  const pitches = [
    {
      id: 1,
      title: 'Premium Match Pitch',
      description: 'Professional-grade cricket pitch with electronic scoreboard and spectator seating.',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '₹6,000/hour',
      features: ['Electronic scoreboard', 'Spectator seating', 'Match-quality pitch']
    },
    {
      id: 2,
      title: 'Training Pitch',
      description: 'Ideal for practice sessions and coaching with bowling machines available.',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '₹4,000/hour',
      features: ['Bowling machines', 'Video analysis', 'Training equipment']
    },
    {
      id: 3,
      title: 'Casual Play Pitch',
      description: 'Perfect for casual games and beginners looking to enjoy cricket indoors.',
      image: 'https://images.unsplash.com/photo-1624765434852-66678c237697?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80',
      price: '₹2,800/hour',
      features: ['Basic equipment provided', 'Flexible booking', 'Suitable for beginners']
    }
  ];
  
  return (
    <section className="py-16 bg-cricket-gray">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cricket-dark">Our Premium Pitches</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose from our range of high-quality cricket pitches designed to meet all your playing needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pitches.map((pitch) => (
            <Card key={pitch.id} className="overflow-hidden hover-scale">
              <div className="h-48 overflow-hidden">
                <img 
                  src={pitch.image} 
                  alt={pitch.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <CardHeader>
                <CardTitle>{pitch.title}</CardTitle>
                <CardDescription>{pitch.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-cricket-green text-xl">{pitch.price}</span>
                  <Link 
                    to="/booking" 
                    className="text-sm font-medium text-cricket-green hover:text-cricket-green-light hover:underline"
                  >
                    Check availability
                  </Link>
                </div>
                <ul className="space-y-1">
                  {pitch.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <span className="mr-2 text-cricket-green">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-cricket-green hover:bg-cricket-green-light">
                  <Link to="/booking">Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-cricket-green text-cricket-green hover:bg-cricket-green hover:text-white">
            <Link to="/pitches">View All Pitches</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
