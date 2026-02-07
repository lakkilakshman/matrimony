
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { validateRequired } from '@/lib/validation';
import { useFormFieldOptions } from '@/hooks/useFormFieldOptions';

const Step3EducationCareer = ({ formData, updateFormData, onNext, onPrev }) => {
  const { toast } = useToast();
  const { options, loading } = useFormFieldOptions();

  const handleNext = () => {
    if (!validateRequired(formData.education)) {
      toast({ title: 'Error', description: 'Education is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.occupation)) {
      toast({ title: 'Error', description: 'Occupation is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.annualIncome)) {
      toast({ title: 'Error', description: 'Annual income is required', variant: 'destructive' });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Education *
        </label>
        <select
          value={formData.education}
          onChange={(e) => updateFormData('education', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          disabled={loading}
        >
          <option value="">{loading ? 'Loading...' : 'Select Education'}</option>
          {options.education?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Occupation *
        </label>
        <select
          value={formData.occupation}
          onChange={(e) => updateFormData('occupation', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          disabled={loading}
        >
          <option value="">{loading ? 'Loading...' : 'Select Occupation'}</option>
          {options.occupation?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Annual Income *
        </label>
        <select
          value={formData.annualIncome}
          onChange={(e) => updateFormData('annualIncome', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          disabled={loading}
        >
          <option value="">{loading ? 'Loading...' : 'Select Annual Income'}</option>
          {options.annualIncome?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={onPrev}
          variant="outline"
          className="flex-1 border-2 border-maroon text-maroon hover:bg-maroon hover:text-white font-bold"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 bg-maroon text-white hover:bg-maroon-dark font-bold py-3"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default Step3EducationCareer;
