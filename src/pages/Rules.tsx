
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';

const Rules = () => {
  const ruleCategories = [
    {
      title: "1. General Conduct",
      rules: [
        "Respect all players, staff, and equipment.",
        "No abusive language, aggressive behavior, or unsportsmanlike conduct.",
        "Follow instructions from staff and referees at all times."
      ]
    },
    {
      title: "2. Booking & Payments",
      rules: [
        "Sessions should be pre-booked where possible. Walk-ins subject to availability.",
        "Payments must be made before play begins (unless prior arrangements exist).",
        "Cancellations may require advance notice to avoid charges."
      ]
    },
    {
      title: "3. Safety Rules",
      rules: [
        "Wear appropriate non-marking indoor sports shoes (no spikes or black-soled shoes).",
        "Protective gear (helmets, pads, gloves) may be mandatory in certain areas.",
        "No food, drinks (except water), or chewing gum on the playing surface.",
        "Be aware of surroundings to avoid collisions with walls, nets, or other players."
      ]
    },
    {
      title: "4. Gameplay Rules",
      rules: [
        "Follow the specific rules of the format being played (e.g., modified indoor cricket rules).",
        "Fair play is encouraged – no deliberate cheating or arguing over decisions.",
        "Batsmen must retire after a set score (if applicable) to allow others to bat.",
        "No excessive force when bowling (some centres restrict bowling speed)."
      ]
    },
    {
      title: "5. Equipment Usage",
      rules: [
        "Only use provided equipment (bats, balls, etc.) unless approved by staff.",
        "Report any damaged equipment immediately.",
        "Do not hit balls recklessly outside designated areas."
      ]
    },
    {
      title: "6. Facility Care",
      rules: [
        "No climbing on nets or tampering with facility structures.",
        "Dispose of trash in designated bins.",
        "No smoking, alcohol, or illegal substances on the premises."
      ]
    },
    {
      title: "7. Spectators & Non-Players",
      rules: [
        "Spectators must stay in designated areas.",
        "Children must be supervised at all times."
      ]
    },
    {
      title: "8. Injuries & Liability",
      rules: [
        "Play at your own risk; the centre is not liable for injuries caused by improper play.",
        "Report any accidents or injuries to staff immediately."
      ]
    },
    {
      title: "9. Time Management",
      rules: [
        "Sessions have fixed time slots; ensure you finish and exit promptly for the next group."
      ]
    }
  ];

  return (
    <Layout>
      <section className="relative bg-cricket-dark text-white py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-cricket-dark to-cricket-green opacity-80 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Facility Rules</h1>
          <p className="text-lg max-w-3xl">
            Ravenhall Indoor Cricket Centre rules to ensure safety, fairness, and an enjoyable experience for everyone.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {ruleCategories.map((category, index) => (
                <Card key={index} className="p-6">
                  <h2 className="text-xl font-bold mb-3 text-cricket-dark">{category.title}</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {category.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="text-gray-700">{rule}</li>
                    ))}
                  </ul>
                </Card>
              ))}

              <div className="bg-yellow-50 border border-yellow-200 rounded p-6 mt-8 flex">
                <div className="mr-4 mt-1 text-yellow-600">
                  <Info size={24} />
                </div>
                <div>
                  <p className="font-bold text-yellow-800 mb-2">Important Notice</p>
                  <p className="text-yellow-800">
                    By following these rules, everyone can enjoy a safe and competitive environment. 
                    <strong> Failure to comply may result in warnings, removal, or bans from the facility.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Rules;
