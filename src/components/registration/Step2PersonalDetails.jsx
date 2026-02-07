
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { validateRequired } from '@/lib/validation';
import { useFormFieldOptions } from '@/hooks/useFormFieldOptions';

const Step2PersonalDetails = ({ formData, updateFormData, onNext, onPrev }) => {
  const { toast } = useToast();
  const { options, loading } = useFormFieldOptions();

  const handleNext = () => {
    if (!validateRequired(formData.maritalStatus)) {
      toast({ title: 'Error', description: 'Marital status is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.height)) {
      toast({ title: 'Error', description: 'Height is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.weight)) {
      toast({ title: 'Error', description: 'Weight is required', variant: 'destructive' });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Marital Status *
        </label>
        <select
          value={formData.maritalStatus}
          onChange={(e) => updateFormData('maritalStatus', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          disabled={loading}
        >
          <option value="">{loading ? 'Loading...' : 'Select Marital Status'}</option>
          {options.maritalStatus?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Religion
          </label>
          <input
            type="text"
            value="Hindu"
            disabled
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Caste
          </label>
          <input
            type="text"
            value="Merukulam"
            disabled
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Height *
          </label>
          <select
            value={formData.height}
            onChange={(e) => updateFormData('height', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            disabled={loading}
          >
            <option value="">{loading ? 'Loading...' : 'Select Height'}</option>
            {options.height?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Weight (kg) *
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData('weight', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            placeholder="Enter weight in kg"
            min="30"
            max="200"
          />
        </div>
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

export default Step2PersonalDetails;
