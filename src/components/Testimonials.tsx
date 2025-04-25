
import { Card, CardContent } from '@/components/ui/card';

export const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Michael Johnson',
      role: 'Club Captain',
      quote: 'The Indoor Cricket Centre has transformed our training sessions. The high-quality pitches and professional environment have helped our team improve significantly.',
      image: 'https://i.pravatar.cc/150?img=11'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      role: 'Cricket Coach',
      quote: 'As a coach, I appreciate the excellent facilities and flexible booking system. My students have benefited greatly from practicing in such a well-designed space.',
      image: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 3,
      name: 'Raj Patel',
      role: 'Amateur Player',
      quote: "Booking is straightforward and the pitches are top-notch. I've been bringing my friends here regularly for friendly matches and we always have a great experience.",
      image: 'https://i.pravatar.cc/150?img=59'
    }
  ];
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cricket-dark">What Our Customers Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Hear from players and coaches who use our facilities regularly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="overflow-hidden hover-scale">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-cricket-green p-1">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <blockquote className="italic text-gray-600 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <h4 className="font-bold text-cricket-dark">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
