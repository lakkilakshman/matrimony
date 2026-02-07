
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validateMobile, validatePassword } from '@/lib/validation';
import OTPVerification from '@/components/OTPVerification';


const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // email or mobile
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
    otp: ''
  });
  const [showOTP, setShowOTP] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = () => {
    if (!validateMobile(formData.mobile)) {
      toast({
        title: 'Invalid Mobile',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'OTP Sent',
      description: `OTP sent to ${formData.mobile}. For demo, use: 123456`
    });
    setShowOTP(true);
  };

  const handleVerifyOTP = (otp) => {
    if (otp === '123456') {
      // Find user by mobile
      const user = mockProfiles.find(p => p.mobile === formData.mobile);
      if (user) {
        const userData = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          role: 'user'
        };
        login(userData, 'demo-token-' + user.id);
        toast({
          title: 'Login Successful',
          description: 'Welcome back!'
        });
        navigate('/browse');
      } else {
        toast({
          title: 'Account Not Found',
          description: 'No account found with this mobile number',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter correct OTP. For demo, use: 123456',
        variant: 'destructive'
      });
    }
  };

  const handleEmailLogin = async () => {
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
      // Call the real API via AuthContext
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!'
        });
        navigate('/browse-profiles');
      } else {
        toast({
          title: 'Login Failed',
          description: result.message || 'Invalid email or password',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Login Error',
        description: error || 'An error occurred during login',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Merukulam Matrimony</title>
        <meta name="description" content="Login to your Merukulam Matrimony account to find your perfect match" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-maroon via-maroon-dark to-maroon flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-cream rounded-2xl shadow-2xl p-8">
            <Link to="/" className="inline-flex items-center text-maroon hover:text-gold mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <h1 className="text-3xl font-bold text-maroon mb-2">Welcome Back</h1>
            <p className="text-maroon/70 mb-6">Login to find your perfect match</p>

            {/* Login Method Toggle */}
            <div className="flex space-x-2 mb-6 bg-white rounded-lg p-1">
              <button
                onClick={() => {
                  setLoginMethod('email');
                  setShowOTP(false);
                }}
                className={`flex-1 py-2 rounded-md transition-all ${loginMethod === 'email'
                  ? 'bg-gradient-to-r from-maroon to-maroon-dark text-white'
                  : 'text-maroon hover:bg-gold/10'
                  }`}
              >
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </button>
              <button
                onClick={() => {
                  setLoginMethod('mobile');
                  setShowOTP(false);
                }}
                className={`flex-1 py-2 rounded-md transition-all ${loginMethod === 'mobile'
                  ? 'bg-gradient-to-r from-maroon to-maroon-dark text-white'
                  : 'text-maroon hover:bg-gold/10'
                  }`}
              >
                <Phone className="h-4 w-4 inline mr-2" />
                Mobile
              </button>
            </div>

            {loginMethod === 'email' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-maroon mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      placeholder="Enter your email"
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
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleEmailLogin}
                  className="w-full bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon font-semibold py-3"
                >
                  Login with Email
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-maroon mb-2">
                    Mobile Number
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold" />
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        maxLength={10}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                        placeholder="Enter mobile number"
                      />
                    </div>
                    {!showOTP && (
                      <Button
                        onClick={handleSendOTP}
                        className="bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon"
                      >
                        Send OTP
                      </Button>
                    )}
                  </div>
                </div>

                {showOTP && (
                  <OTPVerification
                    mobile={formData.mobile}
                    onVerify={handleVerifyOTP}
                    onResend={handleSendOTP}
                  />
                )}
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-maroon/70 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-gold hover:underline font-semibold">
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
