
import { useState } from 'react';

export const useRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    email: '',
    mobile: '',
    otp: '',
    otpVerified: false,
    password: '',
    
    // Step 2: Personal Details
    maritalStatus: '',
    religion: 'Hindu',
    caste: 'Merukulam',
    height: '',
    weight: '',
    
    // Step 3: Education & Career
    education: '',
    occupation: '',
    annualIncome: '',
    
    // Step 4: Family Details
    fatherOccupation: '',
    motherOccupation: '',
    brothers: '',
    sisters: '',
    permanentAddress: '',
    
    // Step 5: Horoscope Details
    raasi: '',
    star: '',
    birthTime: '',
    birthPlace: ''
  });

  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const updateMultipleFields = (fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  };

  const setError = (field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      email: '',
      mobile: '',
      otp: '',
      otpVerified: false,
      password: '',
      maritalStatus: '',
      religion: 'Hindu',
      caste: 'Merukulam',
      height: '',
      weight: '',
      education: '',
      occupation: '',
      annualIncome: '',
      fatherOccupation: '',
      motherOccupation: '',
      brothers: '',
      sisters: '',
      permanentAddress: '',
      raasi: '',
      star: '',
      birthTime: '',
      birthPlace: ''
    });
    setErrors({});
  };

  return {
    currentStep,
    formData,
    errors,
    updateFormData,
    updateMultipleFields,
    setError,
    clearErrors,
    nextStep,
    prevStep,
    goToStep,
    resetForm
  };
};
