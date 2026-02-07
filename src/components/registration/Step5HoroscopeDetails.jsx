
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { validateRequired } from '@/lib/validation';
import { useFormFieldOptions } from '@/hooks/useFormFieldOptions';

const Step5HoroscopeDetails = ({ formData, updateFormData, onNext, onPrev }) => {
  const { toast } = useToast();
  const { options, loading } = useFormFieldOptions();

  const handleNext = () => {
    if (!validateRequired(formData.raasi)) {
      toast({ title: 'Error', description: 'Raasi/Moon sign is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.star)) {
      toast({ title: 'Error', description: 'Star/Nakshatra is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.birthTime)) {
      toast({ title: 'Error', description: 'Birth time is required', variant: 'destructive' });
      return;
    }
    if (!validateRequired(formData.birthPlace)) {
      toast({ title: 'Error', description: 'Birth place is required', variant: 'destructive' });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Raasi / Moon Sign *
          </label>
          <select
            value={formData.raasi}
            onChange={(e) => updateFormData('raasi', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            disabled={loading}
          >
            <option value="">{loading ? 'Loading...' : 'Select Raasi'}</option>
            {options.raasi?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Star / Nakshatra *
          </label>
          <select
            value={formData.star}
            onChange={(e) => updateFormData('star', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            disabled={loading}
          >
            <option value="">{loading ? 'Loading...' : 'Select Star'}</option>
            {options.star?.map(option => (
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
            Birth Time *
          </label>
          <input
            type="time"
            value={formData.birthTime}
            onChange={(e) => updateFormData('birthTime', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Birth Place *
          </label>
          <input
            type="text"
            value={formData.birthPlace}
            onChange={(e) => updateFormData('birthPlace', e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon text-gray-900 bg-white"
            placeholder="Enter birth place"
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
          Review & Submit
        </Button>
      </div>
    </div>
  );
};

export default Step5HoroscopeDetails;
