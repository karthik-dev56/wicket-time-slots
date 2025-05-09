
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const MembershipPlans = () => {
  const plans = [
    {
      id: 1,
      title: 'Basic Membership',
      price: '$30/month',
      description: 'Perfect for casual players who want to save on regular bookings.',
      benefits: [
        '10% off lane bookings',
        'Priority booking access',
        'Member-only events'
      ]
    },
    {
      id: 2,
      title: 'Premium Membership',
      price: '$80/month',
      description: 'Our most comprehensive package for serious cricket enthusiasts.',
      benefits: [
        '20% off all sessions (including bowling machine)',
        '1 free hour per week (normal lane)',
        'Discounts on coaching & events',
        'Access to members lounge'
      ],
      featured: true
    },
    {
      id: 3,
      title: 'Junior Membership',
      price: '$20/month',
      description: 'Special package for players under 16 years old.',
      benefits: [
        '15% off bookings',
        'Free weekly group training session',
        'Junior tournaments access'
      ]
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cricket-dark">Membership Plans</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join our membership program and unlock exclusive savings and benefits
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`overflow-hidden ${plan.featured ? 'border-cricket-green border-2 shadow-lg' : ''}`}
            >
              {plan.featured && (
                <div className="bg-cricket-green text-white text-center py-2">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription className="text-2xl font-bold text-cricket-green">{plan.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">{plan.description}</p>
                <ul className="space-y-2">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-cricket-green font-bold">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-cricket-green hover:bg-cricket-green-light">
                  <Link to="/contact">Sign Up Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-3">Special Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded shadow-sm">
              <h4 className="font-semibold text-cricket-green">Early Bird Discount</h4>
              <p>15% off before 4 PM on weekdays.</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h4 className="font-semibold text-cricket-green">Weekend Family Package</h4>
              <p>2 hours for $70 (normal lane).</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h4 className="font-semibold text-cricket-green">Loyalty Program</h4>
              <p>Earn points for every $100 spent → redeem free sessions.</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm">
              <h4 className="font-semibold text-cricket-green">Corporate/Team Packages</h4>
              <p>Customized deals for clubs & companies.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
