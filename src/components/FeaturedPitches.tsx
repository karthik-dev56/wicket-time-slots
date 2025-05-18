
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const FeaturedPitches = () => {
  const pitches = [
    {
      id: 1,
      title: 'Bowling Machine Lane',
      description: 'Professional practice with our state-of-the-art bowling machines for perfecting your technique.',
      image: 'https://i.ibb.co/3mCR33hX/IMG-20250517-WA0007.jpg',
      price: '$45/hour',
      features: ['Professional bowling machines', 'Speed and spin control', 'Performance analysis']
    },
    {
      id: 2,
      title: 'Normal Practice Lane',
      description: 'Standard cricket lanes for practice sessions, casual play, and friendly matches.',
      image: 'https://i.ibb.co/S4gR8JCM/IMG-20250517-WA0015.jpg',
      price: '$40/hour',
      features: ['Basic equipment provided', 'Suitable for all skill levels', 'Flexible booking times']
    },
    {
      id: 3,
      title: 'Coaching Sessions',
      description: 'Personalized training with experienced cricket coaches to improve your skills.',
      image: 'https://i.ibb.co/39s908zm/IMG-20250517-WA0011.jpg',
      price: '$60/hour',
      features: ['Personalized training', 'Professional coaches', 'Skill development focus']
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
            <Card key={pitch.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
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
