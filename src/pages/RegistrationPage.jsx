
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useRegistrationForm } from '@/hooks/useRegistrationForm';
import Step1BasicDetails from '@/components/registration/Step1BasicDetails';
import Step2PersonalDetails from '@/components/registration/Step2PersonalDetails';
import Step3EducationCareer from '@/components/registration/Step3EducationCareer';
import Step4FamilyDetails from '@/components/registration/Step4FamilyDetails';
import Step5HoroscopeDetails from '@/components/registration/Step5HoroscopeDetails';
import Step6ReviewSubmit from '@/components/registration/Step6ReviewSubmit';

const RegistrationPage = () => {
  const { currentStep, formData, updateFormData, nextStep, prevStep, goToStep, resetForm } = useRegistrationForm();
  const { toast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Prepare registration data
      const registrationData = {
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dob  // Fixed: form uses 'dob' field name
      };

      // Call the real API via AuthContext
      const result = await register(registrationData);

      if (result.success) {
        toast({
          title: 'Registration Successful!',
          description: 'Your profile has been created. Redirecting...'
        });

        setTimeout(() => {
          resetForm();
          navigate('/browse-profiles');
        }, 2000);
      } else {
        toast({
          title: 'Registration Failed',
          description: result.message || 'An error occurred during registration',
          variant: 'destructive'
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        title: 'Registration Error',
        description: error || 'An error occurred. Please try again.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Basic Details',
    'Personal Details',
    'Education & Career',
    'Family Details',
    'Horoscope Details',
    'Review & Submit'
  ];

  return (
    <>
      <Helmet>
        <title>Register - Merukulam Matrimony</title>
        <meta name="description" content="Create your profile on Merukulam Matrimony and find your perfect life partner" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-maroon hover:text-gold mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gold/20"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon to-maroon-dark p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
              <p className="text-cream/90">Step {currentStep} of 6: {stepTitles[currentStep - 1]}</p>
            </div>

            {/* Progress Bar */}
            <div className="bg-cream/50 p-6">
              <div className="flex justify-between mb-2">
                {stepTitles.map((title, index) => (
                  <div
                    key={index}
                    className={`flex-1 text-center ${index < stepTitles.length - 1 ? 'mr-2' : ''
                      }`}
                  >
                    <div
                      className={`w-full h-2 rounded-full ${index + 1 <= currentStep
                        ? 'bg-gradient-to-r from-maroon to-gold'
                        : 'bg-gray-300'
                        }`}
                    />
                    <p
                      className={`text-xs mt-1 ${index + 1 <= currentStep ? 'text-maroon font-semibold' : 'text-gray-400'
                        }`}
                    >
                      {title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {currentStep === 1 && (
                <Step1BasicDetails
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                />
              )}
              {currentStep === 2 && (
                <Step2PersonalDetails
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 3 && (
                <Step3EducationCareer
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 4 && (
                <Step4FamilyDetails
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 5 && (
                <Step5HoroscopeDetails
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 6 && (
                <Step6ReviewSubmit
                  formData={formData}
                  onEdit={goToStep}
                  onSubmit={handleSubmit}
                  onPrev={prevStep}
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RegistrationPage;
