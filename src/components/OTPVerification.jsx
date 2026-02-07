
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const OTPVerification = ({ mobile, onVerify, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { toast } = useToast();

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter all 6 digits',
        variant: 'destructive'
      });
      return;
    }
    onVerify(otpValue);
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    onResend();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-maroon mb-2">
          Enter OTP sent to {mobile}
        </label>
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleVerify}
          className="flex-1 bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon"
        >
          Verify OTP
        </Button>
        <Button
          onClick={handleResend}
          variant="outline"
          className="border-gold text-maroon hover:bg-gold/10"
        >
          Resend
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;
