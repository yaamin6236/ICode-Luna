import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSignIn, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Leaf, Sparkles, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signIn) {
      toast({
        title: 'Error',
        description: 'Authentication system not ready. Please refresh.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast({
          title: 'Welcome back!',
          description: 'Login successful',
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle "already signed in" error
      if (error.errors?.[0]?.message?.includes('already signed in')) {
        toast({
          title: 'Already signed in',
          description: 'Redirecting to dashboard...',
        });
        setTimeout(() => navigate('/'), 1000);
      } else {
        toast({
          title: 'Login failed',
          description: error.errors?.[0]?.message || 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-organic-mesh p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="hidden lg:flex flex-col justify-center space-y-8 p-12"
        >
          {/* Logo & Brand */}
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-4 p-4 bg-card rounded-[24px] shadow-organic-lg"
            >
              <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-glow-warm">
                <Leaf className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-gradient-organic">
                  ICode Portal
                </h1>
                <p className="text-muted-foreground font-display">Camp Management System</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-display font-bold leading-tight">
                Welcome to your
                <br />
                <span className="text-gradient-organic">growth management</span>
                <br />
                workspace
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Streamline your camp registrations, track enrollments, and nurture every student's learning journey—all in one beautiful, intuitive platform.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-4"
            >
              {[
                { icon: Sparkles, text: 'Real-time enrollment tracking' },
                { icon: Leaf, text: 'Automated email processing' },
                { icon: Mail, text: 'Beautiful analytics & reports' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                  className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-organic-sm hover:shadow-organic transition-all"
                >
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-display font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Decorative organic shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <Card className="p-10 lg:p-12 shadow-organic-xl">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-glow-warm">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gradient-organic">
                  ICode Portal
                </h1>
                <p className="text-sm text-muted-foreground">Camp Management</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold">Sign in</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Enter your credentials to access your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/sign-up" 
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-5 rounded-2xl bg-muted/30 border-2 border-border/50"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg mt-0.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-display font-semibold">Secured by Clerk</p>
                    <p className="text-sm text-muted-foreground">
                      Your authentication is managed securely by Clerk with enterprise-grade security.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
