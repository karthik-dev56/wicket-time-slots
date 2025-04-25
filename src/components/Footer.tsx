
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-cricket-dark text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-cricket-green flex items-center justify-center">
                <span className="text-white font-bold text-lg">ICC</span>
              </div>
              <span className="font-bold text-white text-xl">Indoor Cricket Centre</span>
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
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-xl mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Monday - Friday: 9am - 10pm</li>
              <li>Saturday: 8am - 10pm</li>
              <li>Sunday: 8am - 8pm</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-xl mb-4">Contact Us</h3>
            <address className="not-italic text-gray-300 space-y-2">
              <p>123 Cricket Lane</p>
              <p>Birmingham, B1 1AA</p>
              <p>United Kingdom</p>
              <p className="mt-2">Phone: 01234 567890</p>
              <p>Email: info@indoorcricket.com</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-300">© {currentYear} Indoor Cricket Centre. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link to="/terms" className="text-gray-300 hover:text-cricket-yellow transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-gray-300 hover:text-cricket-yellow transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
