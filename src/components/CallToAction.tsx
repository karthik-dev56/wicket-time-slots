
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const CallToAction = () => {
  return (
    <section className="py-16 bg-cricket-green text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Book Your Cricket Pitch?</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Experience our world-class facilities and take your cricket game to the next level. 
          Easy booking, flexible scheduling, and professional pitches await you.
        </p>
        <Button asChild size="lg" className="bg-cricket-yellow text-cricket-dark hover:brightness-110 btn-bounce">
          <Link to="/booking">Book Now</Link>
        </Button>
      </div>
    </section>
  );
};
