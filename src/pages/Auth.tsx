import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Mail } from 'lucide-react';
const Auth = () => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  useEffect(() => {
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      if (error) throw error;
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-cricket-dark to-cricket-green/90 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Welcome to Ravenhall Cricket Centre</h2>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-white/10 text-white">
            <TabsTrigger value="signin" className="data-[state=active]:bg-cricket-yellow data-[state=active]:text-cricket-dark">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-cricket-yellow data-[state=active]:text-cricket-dark">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input id="signin-email" type="email" placeholder="james.anderson@example.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input id="signin-password" type="password" placeholder="Enter your password" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full bg-cricket-green hover:bg-cricket-green-light transition-all duration-300 transform hover:scale-105" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full hover:scale-105 transition-all duration-300">
                    Continue with Google
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Join Indoor Cricket Centre today
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSignUp}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input id="firstname" placeholder="James" className="pl-10" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input id="lastname" placeholder="Anderson" className="pl-10" value={lastName} onChange={e => setLastName(e.target.value)} required />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input id="signup-email" type="email" placeholder="james.anderson@example.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input id="signup-password" type="password" placeholder="Create a strong password" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full bg-cricket-green hover:bg-cricket-green-light transition-all duration-300 transform hover:scale-105" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full hover:scale-105 transition-all duration-300">
                    Continue with Google
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default Auth;