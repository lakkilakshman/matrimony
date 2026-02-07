
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword } from '@/lib/validation';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();
  const { login } = useAuth(); // Use login function from context which handles API call
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Clear existing session on mount
  React.useEffect(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }, []);

  const handleLogin = async () => {
    if (!validateEmail(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    if (!validatePassword(formData.password)) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      // Call standard login with isAdmin=true
      const result = await login(formData.email, formData.password, true);

      if (result.success) {
        toast({
          title: 'Admin Login Successful',
          description: 'Welcome to admin panel'
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: result.message || 'Invalid credentials',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Admin Login Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Merukulam Matrimony</title>
        <meta name="description" content="Admin login for Merukulam Matrimony management" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-maroon-dark via-maroon to-maroon-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-cream rounded-2xl shadow-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-gold to-gold/80 p-4 rounded-full">
                <Shield className="h-12 w-12 text-maroon" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-maroon text-center mb-2">Admin Access</h1>
            <p className="text-maroon/70 text-center mb-8">Restricted Area - Authorized Personnel Only</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-maroon mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                    placeholder="admin@Merukulam.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-maroon mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                    placeholder="Enter admin password"
                  />
                </div>
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon font-semibold py-3"
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin Login
              </Button>

              <div className="mt-6 text-center">
                <p className="text-maroon/50 text-xs">
                  Demo credentials: admin@merukulam.com / admin123
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLoginPage;
