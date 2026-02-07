
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { validateEmail, validateMobile, validatePassword, validateRequired, isAdult } from '@/lib/validation';
import { genderOptions } from '@/data/dropdownOptions';
import OTPVerification from '@/components/OTPVerification';

const Step1BasicDetails = ({ formData, updateFormData, onNext }) => {
  const [showOTP, setShowOTP] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = () => {
    if (!validateMobile(formData.mobile)) {
      toast({
        title: 'Invalid Mobile',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive'
      });
      return;
    }

    // Simulate OTP sending
    toast({
      title: 'OTP Sent',
      description: `OTP sent to ${formData.mobile}. For demo, use: 123456`
    });
    setShowOTP(true);
  };

  const handleVerifyOTP = (otp) => {
    if (otp === '123456') {
      updateFormData('otpVerified', true);
      toast({
        title: 'Success',
        description: 'Mobile number verified successfully'
      });
    } else {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter correct OTP. For demo, use: 123456',
        variant: 'destructive'
      });
    }
  };

  const handleNext = () => {
    if (!validateRequired(formData.firstName)) {
      toast({ title: 'Error', description: 'First name is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.lastName)) {
      toast({ title: 'Error', description: 'Last name is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.dob)) {
      toast({ title: 'Error', description: 'Date of birth is required', variant: 'destructive' });
      return;
    }
    if (!isAdult(formData.dob)) {
      toast({ title: 'Error', description: 'You must be at least 18 years old', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.gender)) {
      toast({ title: 'Error', description: 'Gender is required', variant: 'destructive' });
      return;
    }
    if (!validateEmail(formData.email)) {
      toast({ title: 'Error', description: 'Valid email is required', variant: 'destructive' });
      return;
    }
    if (!validateMobile(formData.mobile)) {
      toast({ title: 'Error', description: 'Valid mobile number is required', variant: 'destructive' });
      return;
    }
    if (!formData.otpVerified) {
      toast({ title: 'Error', description: 'Please verify your mobile number', variant: 'destructive' });
      return;
    }
    if (!validatePassword(formData.password)) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => updateFormData('dob', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Gender *
          </label>
          <select
            value={formData.gender}
            onChange={(e) => updateFormData('gender', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          >
            <option value="">Select Gender</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Mobile Number *
        </label>
        <div className="flex space-x-2">
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => updateFormData('mobile', e.target.value)}
            maxLength={10}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Enter 10-digit mobile number"
            disabled={formData.otpVerified}
          />
          {!formData.otpVerified && (
            <Button
              onClick={handleSendOTP}
              className="bg-maroon text-white hover:bg-maroon-dark font-medium px-4 py-2 rounded-lg"
            >
              Send OTP
            </Button>
          )}
          {formData.otpVerified && (
            <Button disabled className="bg-green-600 text-white font-medium px-4 py-2 rounded-lg opacity-100">
              ✓ Verified
            </Button>
          )}
        </div>
      </div>

      {showOTP && !formData.otpVerified && (
        <OTPVerification
          mobile={formData.mobile}
          onVerify={handleVerifyOTP}
          onResend={handleSendOTP}
        />
      )}

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Password *
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => updateFormData('password', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          placeholder="Enter password (min 6 characters)"
        />
      </div>

      <Button
        onClick={handleNext}
        className="w-full bg-maroon text-white hover:bg-maroon-dark font-bold py-3 text-lg rounded-lg shadow-md"
      >
        Next Step
      </Button>
    </div>
  );
};

export default Step1BasicDetails;
