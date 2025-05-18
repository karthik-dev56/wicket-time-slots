import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-cricket-dark text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-cricket-green flex items-center justify-center">
                <span className="text-white font-bold text-lg">RIC</span>
              </div>
              <span className="font-bold text-white text-xl">Ravenhall Indoor Cricket</span>
            </div>
            <p className="text-gray-300 mt-2">
              Premier indoor cricket facility offering state-of-the-art pitches for practice and matches.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-xl mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-cricket-yellow transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-300 hover:text-cricket-yellow transition-colors">
                  Book a Pitch
                </Link>
              </li>
              <li>
                <Link to="/pitches" className="text-gray-300 hover:text-cricket-yellow transition-colors">
                  Our Pitches
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-cricket-yellow transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/rules" className="text-gray-300 hover:text-cricket-yellow transition-colors">
                  Facility Rules
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-xl mb-4">Opening Hours</h3>
            <ul className="space-y-1 text-gray-300">
              <li className="flex items-start">
                <Clock className="h-4 w-4 mt-1 mr-2" />
                <span>Monday - Saturday: 6am - 11pm</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 mt-1 mr-2" />
                <span>Sunday: 9am - 8pm</span>
              </li>
              <li className="flex items-start">
                
                <span></span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-xl mb-4">Contact Us</h3>
            <address className="not-italic text-gray-300 space-y-2">
              <p className="flex items-start">
                <MapPin className="h-4 w-4 mt-1 mr-2" />
                <span>Unit 2/56 Barretta Rd<br />Ravenhall VIC 3023<br />Australia</span>
              </p>
              <p className="flex items-center mt-2">
                <Phone className="h-4 w-4 mr-2" />
                <span>+61 490 703 772</span>
              </p>
              <p className="flex items-center">
                
                
              </p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-300">© {currentYear} Ravenhall Indoor Cricket Centre. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            
            
          </div>
        </div>
      </div>
    </footer>;
};