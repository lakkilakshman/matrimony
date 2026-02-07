
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { validateRequired } from '@/lib/validation';
import { useFormFieldOptions } from '@/hooks/useFormFieldOptions';

const Step4FamilyDetails = ({ formData, updateFormData, onNext, onPrev }) => {
  const { toast } = useToast();
  const { options, loading } = useFormFieldOptions();

  const handleNext = () => {
    if (!validateRequired(formData.fatherOccupation)) {
      toast({ title: 'Error', description: 'Father\'s occupation is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.motherOccupation)) {
      toast({ title: 'Error', description: 'Mother\'s occupation is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.permanentAddress)) {
      toast({ title: 'Error', description: 'Permanent address is required', variant: 'destructive' });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Father's Occupation *
          </label>
          <select
            value={formData.fatherOccupation}
            onChange={(e) => updateFormData('fatherOccupation', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            disabled={loading}
          >
            <option value="">{loading ? 'Loading...' : 'Select Occupation'}</option>
            {options.fatherOccupation?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Mother's Occupation *
          </label>
          <select
            value={formData.motherOccupation}
            onChange={(e) => updateFormData('motherOccupation', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            disabled={loading}
          >
            <option value="">{loading ? 'Loading...' : 'Select Occupation'}</option>
            {options.motherOccupation?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Brothers
          </label>
          <input
            type="number"
            value={formData.brothers}
            onChange={(e) => updateFormData('brothers', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            placeholder="Number of brothers"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Sisters
          </label>
          <input
            type="number"
            value={formData.sisters}
            onChange={(e) => updateFormData('sisters', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            placeholder="Number of sisters"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Permanent Address *
        </label>
        <textarea
          value={formData.permanentAddress}
          onChange={(e) => updateFormData('permanentAddress', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          placeholder="Enter complete permanent address"
        />
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

export default Step4FamilyDetails;
