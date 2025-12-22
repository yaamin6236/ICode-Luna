import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('access_token', response.access_token);
      toast({
        title: 'Welcome back!',
        description: 'Login successful',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.detail || 'Invalid username or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="glass-effect">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center gradient-primary bg-clip-text text-transparent">
              ICode Portal
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to manage camp registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Demo credentials:</p>
              <p>Username: <code className="text-primary">admin</code></p>
              <p>Password: <code className="text-primary">admin123</code></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

