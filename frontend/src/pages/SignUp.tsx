import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Leaf, Sparkles, Lock, Mail, User } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const { signUp, setActive } = useSignUp();
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
    
    if (!signUp) {
      toast({
        title: 'Error',
        description: 'Authentication system not ready. Please refresh.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create the sign-up
      await signUp.create({
        emailAddress: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setVerifying(true);
      toast({
        title: 'Verification code sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific errors
      const errorMessage = error.errors?.[0]?.longMessage || 
                          error.errors?.[0]?.message || 
                          'Unable to create account';
      
      toast({
        title: 'Sign up failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUp) return;

    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log('Sign up status:', completeSignUp.status);
      console.log('Complete sign up object:', completeSignUp);

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        toast({
          title: 'Welcome!',
          description: 'Account created successfully',
        });
        navigate('/');
      } else {
        // Log the actual status for debugging
        console.log('Unexpected status:', completeSignUp.status);
        toast({
          title: 'Verification incomplete',
          description: `Status: ${completeSignUp.status}. Please try again or contact support.`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Verification error details:', error);
      console.error('Error response:', error.errors);
      
      // Check if already verified
      if (error.errors?.[0]?.code === 'verification_already_verified') {
        toast({
          title: 'Already verified',
          description: 'Your account is already verified. Please try logging in.',
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const errorMessage = error.errors?.[0]?.longMessage || 
                            error.errors?.[0]?.message || 
                            error.message ||
                            'Invalid verification code';
        
        toast({
          title: 'Verification failed',
          description: errorMessage,
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
                Join us and
                <br />
                <span className="text-gradient-organic">streamline your</span>
                <br />
                camp management
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create your account and start managing enrollments, tracking revenue, and analyzing your camp's performance.
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
        </motion.div>

        {/* Right Side - Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <Card className="p-8 lg:p-10 shadow-organic-xl">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
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

            {!verifying ? (
              /* Sign Up Form */
              <div className="space-y-8">
                {/* Header */}
                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold">Create account</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Get started with your camp management dashboard
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Clerk CAPTCHA element for bot protection */}
                  <div id="clerk-captcha" className="mb-4"></div>
                  
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          className="pl-11 h-12"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          className="pl-11 h-12"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-11 h-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-12"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Must be at least 8 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>

                {/* Sign In Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                {/* Security Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-5 rounded-2xl bg-muted/30 border-2 border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg mt-0.5">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-display font-semibold">Secured by Clerk</p>
                      <p className="text-sm text-muted-foreground">
                        Your data is protected with enterprise-grade security and encryption.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              /* Email Verification */
              <div className="space-y-10">
                {/* Header */}
                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold">Verify your email</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We sent a verification code to <strong>{email}</strong>
                  </p>
                </div>

                {/* Verification Form */}
                <div className="space-y-8">
                  <form onSubmit={handleVerify} className="space-y-8">
                    {/* Code Input */}
                    <div className="space-y-3">
                      <Label htmlFor="code" className="text-base">Verification Code</Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        maxLength={6}
                        className="text-center text-3xl tracking-[0.5em] h-16 font-mono"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the 6-digit code from your email
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </Button>
                  </form>

                  {/* Links */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?{' '}
                      <button
                        type="button"
                        onClick={() => signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })}
                        className="text-primary font-medium hover:underline"
                      >
                        Resend
                      </button>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link 
                        to="/login" 
                        className="text-primary font-medium hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

