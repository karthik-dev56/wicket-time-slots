
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const HeroBanner = () => {
  return (
    <section className="relative bg-cricket-dark text-white py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cricket-dark to-cricket-green opacity-80 z-0"></div>
      <div className="absolute inset-0 bg-[url('https://i.ibb.co/rGFCLbdj/Ravenhall-Indoor-Cricket-Centre-bg-scaled.jpg')] bg-cover bg-center mix-blend-overlay z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Premier Indoor Cricket Experience
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">
            Book your pitch today and experience state-of-the-art cricket facilities
            designed for players of all skill levels. Perfect your game in our
            professional environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-cricket-yellow text-cricket-dark hover:brightness-110 btn-bounce">
              <Link to="/booking">Book a Pitch</Link>
            </Button>
            <Button asChild size="lg" className="bg-cricket-yellow text-cricket-dark hover:brightness-110">
              <Link to="/pitches">Explore Our Facilities</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
