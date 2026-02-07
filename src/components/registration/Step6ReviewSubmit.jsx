
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

const Step6ReviewSubmit = ({ formData, onEdit, onSubmit, onPrev }) => {
  const formatLabel = (value) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const sections = [
    {
      title: 'Basic Details',
      step: 1,
      fields: [
        { label: 'Name', value: `${formData.firstName} ${formData.lastName}` },
        { label: 'Date of Birth', value: formData.dob },
        { label: 'Gender', value: formatLabel(formData.gender) },
        { label: 'Email', value: formData.email },
        { label: 'Mobile', value: formData.mobile }
      ]
    },
    {
      title: 'Personal Details',
      step: 2,
      fields: [
        { label: 'Marital Status', value: formatLabel(formData.maritalStatus) },
        { label: 'Religion', value: formData.religion },
        { label: 'Caste', value: formData.caste },
        { label: 'Height', value: `${formData.height}"` },
        { label: 'Weight', value: `${formData.weight} kg` }
      ]
    },
    {
      title: 'Education & Career',
      step: 3,
      fields: [
        { label: 'Education', value: formatLabel(formData.education) },
        { label: 'Occupation', value: formatLabel(formData.occupation) },
        { label: 'Annual Income', value: `${formData.annualIncome} Lakhs` }
      ]
    },
    {
      title: 'Family Details',
      step: 4,
      fields: [
        { label: 'Father\'s Occupation', value: formatLabel(formData.fatherOccupation) },
        { label: 'Mother\'s Occupation', value: formatLabel(formData.motherOccupation) },
        { label: 'Brothers', value: formData.brothers || '0' },
        { label: 'Sisters', value: formData.sisters || '0' },
        { label: 'Permanent Address', value: formData.permanentAddress }
      ]
    },
    {
      title: 'Horoscope Details',
      step: 5,
      fields: [
        { label: 'Raasi', value: formatLabel(formData.raasi) },
        { label: 'Star', value: formatLabel(formData.star) },
        { label: 'Birth Time', value: formData.birthTime },
        { label: 'Birth Place', value: formData.birthPlace }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border-2 border-gold rounded-lg p-4">
        <p className="text-maroon font-bold text-center text-lg">
          Please review your details carefully before submitting
        </p>
      </div>

      {sections.map((section, index) => (
        <div key={index} className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
            <h3 className="text-lg font-bold text-maroon">{section.title}</h3>
            <Button
              onClick={() => onEdit(section.step)}
              variant="outline"
              size="sm"
              className="border-maroon text-maroon hover:bg-maroon hover:text-white font-medium"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field, idx) => (
              <div key={idx}>
                <p className="text-sm text-gray-600 font-medium">{field.label}</p>
                <p className="text-gray-900 font-bold text-base">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex space-x-4">
        <Button
          onClick={onPrev}
          variant="outline"
          className="flex-1 border-2 border-maroon text-maroon hover:bg-maroon hover:text-white font-bold"
        >
          Previous
        </Button>
        <Button
          onClick={onSubmit}
          className="flex-1 bg-maroon text-white hover:bg-maroon-dark font-bold py-3 text-lg"
        >
          Submit Registration
        </Button>
      </div>
    </div>
  );
};

export default Step6ReviewSubmit;
