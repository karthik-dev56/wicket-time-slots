
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [membershipActive, setMembershipActive] = useState(false);
  const [membershipType, setMembershipType] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkMembership();
      } else {
        setMembershipActive(false);
        setMembershipType('');
      }
    });

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        checkMembership();
      }
    };

    initializeAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkMembership = async () => {
    try {
      const { data } = await supabase.functions.invoke('check-membership', {});
      if (data?.active) {
        setMembershipActive(true);
        setMembershipType(data.membershipType);
      } else {
        setMembershipActive(false);
        setMembershipType('');
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      setMembershipActive(false);
      setMembershipType('');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMembershipColor = (type: string) => {
    switch(type) {
      case 'premium': return 'bg-amber-500';
      case 'junior': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };
  
  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-cricket-green flex items-center justify-center">
            <span className="text-white font-bold text-lg">ICC</span>
          </div>
          <span className="font-bold text-cricket-dark text-xl hidden sm:block">Indoor Cricket Centre</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-cricket-dark hover:text-cricket-green transition-colors font-medium">
            Home
          </Link>
          <Link to="/booking" className="text-cricket-dark hover:text-cricket-green transition-colors font-medium">
            Book a Pitch
          </Link>
          <Link to="/pitches" className="text-cricket-dark hover:text-cricket-green transition-colors font-medium">
            Our Pitches
          </Link>
          <Link to="/contact" className="text-cricket-dark hover:text-cricket-green transition-colors font-medium">
            Contact
          </Link>
          {user ? (
            <>
              <Button asChild variant="default" className="bg-cricket-green hover:bg-cricket-green-light flex items-center gap-2">
                <Link to="/dashboard">
                  Dashboard
                  {membershipActive && (
                    <Badge className={`ml-2 ${getMembershipColor(membershipType)}`}>
                      <Crown className="h-3 w-3 mr-1" />
                      <span className="text-[10px] uppercase">{membershipType}</span>
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-cricket-green text-cricket-green hover:bg-cricket-green hover:text-white"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild variant="default" className="bg-cricket-green hover:bg-cricket-green-light">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-cricket-dark"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link 
              to="/" 
              className="text-cricket-dark hover:text-cricket-green transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/booking" 
              className="text-cricket-dark hover:text-cricket-green transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Book a Pitch
            </Link>
            <Link 
              to="/pitches" 
              className="text-cricket-dark hover:text-cricket-green transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Pitches
            </Link>
            <Link 
              to="/contact" 
              className="text-cricket-dark hover:text-cricket-green transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Button 
                  asChild 
                  variant="default" 
                  className="bg-cricket-green hover:bg-cricket-green-light w-full justify-start"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/dashboard" className="flex items-center">
                    Dashboard
                    {membershipActive && (
                      <Badge className={`ml-2 ${getMembershipColor(membershipType)}`}>
                        <Crown className="h-3 w-3 mr-1" />
                        <span className="text-[10px] uppercase">{membershipType}</span>
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full border-cricket-green text-cricket-green hover:bg-cricket-green hover:text-white"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                asChild 
                variant="default" 
                className="bg-cricket-green hover:bg-cricket-green-light w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
