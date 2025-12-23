import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSignIn } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Leaf, Sparkles, Mail, ArrowLeft, Lock } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const { signIn } = useSignIn();
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
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
      // Request password reset
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      toast({
        title: 'Code sent',
        description: 'Please check your email for the reset code.',
      });
      setStep('code');
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast({
        title: 'Error',
        description: error.errors?.[0]?.longMessage || error.errors?.[0]?.message || 'Failed to send reset code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signIn) return;

    setLoading(true);

    try {
      // Attempt reset with code and new password
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        toast({
          title: 'Password reset successful',
          description: 'Your password has been changed. Redirecting to login...',
        });
        setStep('success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Reset failed',
        description: error.errors?.[0]?.longMessage || error.errors?.[0]?.message || 'Invalid code or password',
        variant: 'destructive',
      });
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
                Reset your
                <br />
                <span className="text-gradient-organic">password</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We'll send you a code to reset your password securely.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Reset Form */}
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

            {step === 'email' && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold">Forgot password?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Enter your email address and we'll send you a code to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSendCode} className="space-y-6">
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

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Sending code...' : 'Send Reset Code'}
                    </Button>
                  </div>
                </form>

                <div className="text-center pt-2">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
                </div>
              </div>
            )}

            {step === 'code' && (
              <div className="space-y-10">
                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold">Reset your password</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We sent a code to <strong>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="code" className="text-base">Reset Code</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-12"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Resetting password...' : 'Reset Password'}
                  </Button>
                </form>

                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleSendCode}
                      className="text-primary font-medium hover:underline"
                    >
                      Resend
                    </button>
                  </p>
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-8 text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto"
                >
                  <Sparkles className="w-10 h-10 text-primary" />
                </motion.div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold">Password Reset!</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your password has been successfully reset.
                    <br />
                    Redirecting to login...
                  </p>
                </div>

                <Link to="/login">
                  <Button className="w-full h-12" size="lg">
                    Go to Login
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

