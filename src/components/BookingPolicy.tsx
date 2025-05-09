
import { AlertTriangle } from 'lucide-react';

export const BookingPolicy = () => {
  return (
    <section className="py-12 bg-cricket-gray">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-start mb-4">
            <AlertTriangle className="text-yellow-500 mr-3 mt-1" />
            <h2 className="text-2xl font-bold">Booking & Cancellation Policy</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              To ensure a smooth experience for all our players, please note our booking 
              and cancellation policies:
            </p>
            
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Payment required in advance</span> (online or at the counter).
              </li>
              <li>
                <span className="font-medium">Cancellation:</span> 24-hour notice for full refund; 
                late cancellations incur a 50% charge.
              </li>
              <li>
                <span className="font-medium">No-shows</span> will be charged the full session fee.
              </li>
              <li>
                <span className="font-medium">Group discounts:</span> 10% discount available for 
                groups of 5 or more players.
              </li>
            </ul>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
              <p className="font-medium text-yellow-800">
                Please arrive 10-15 minutes before your scheduled time to complete check-in 
                and prepare for your session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
