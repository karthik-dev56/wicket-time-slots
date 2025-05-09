
import { Layout } from '@/components/Layout';
import { HeroBanner } from '@/components/HeroBanner';
import { FeaturedPitches } from '@/components/FeaturedPitches';
import { Testimonials } from '@/components/Testimonials';
import { CallToAction } from '@/components/CallToAction';
import { MembershipPlans } from '@/components/MembershipPlans';
import { BookingPolicy } from '@/components/BookingPolicy';

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cricket-dark">Why Choose Us</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We provide the best indoor cricket experience with state-of-the-art facilities and excellent service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Premium Facilities',
                description: 'World-class cricket pitches designed to meet professional standards.',
                icon: '🏏'
              },
              {
                title: 'Easy Booking',
                description: 'Simple online booking system to reserve your pitch in minutes.',
                icon: '📱'
              },
              {
                title: 'Professional Support',
                description: 'Expert staff available to assist with your cricket needs.',
                icon: '👨‍💼'
              },
              {
                title: 'Flexible Hours',
                description: 'Open 7 days a week with extended hours to suit your schedule.',
                icon: '🕒'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-white shadow-sm hover-scale">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-cricket-dark">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <FeaturedPitches />
      <MembershipPlans />
      <BookingPolicy />
      <Testimonials />
      <CallToAction />
    </Layout>
  );
};

export default Index;
