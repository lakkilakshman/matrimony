
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useFormFieldOptions } from '@/hooks/useFormFieldOptions';

const EditProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { toast } = useToast();
  const { options, loading } = useFormFieldOptions();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    mobile: currentUser?.mobile || '',
    dateOfBirth: (currentUser?.dateOfBirth || currentUser?.date_of_birth) ? new Date(currentUser?.dateOfBirth || currentUser?.date_of_birth).toISOString().split('T')[0] : '',
    gender: currentUser?.gender || '',
    maritalStatus: currentUser?.maritalStatus || '',
    height: currentUser?.height || '',
    weight: currentUser?.weight || '',
    complexion: currentUser?.complexion || '',
    religion: currentUser?.religion || '',
    caste: currentUser?.caste || '',
    education: currentUser?.education || '',
    occupation: currentUser?.occupation || '',
    company: currentUser?.company || '',
    annualIncome: currentUser?.annualIncome || currentUser?.income || '',
    fatherOccupation: currentUser?.fatherOccupation || '',
    motherOccupation: currentUser?.motherOccupation || '',
    brothers: currentUser?.brothers || '0',
    sisters: currentUser?.sisters || '0',
    permanentAddress: currentUser?.permanentAddress || '',
    raasi: currentUser?.raasi || '',
    star: currentUser?.star || '',
    birthTime: currentUser?.birthTime || '',
    birthPlace: currentUser?.birthPlace || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    bio: currentUser?.bio || ''
  });

  const [uploadedImages, setUploadedImages] = useState(() => {
    const existingImages = currentUser?.images || [];
    if (existingImages.length === 0 && currentUser?.photo) {
      return [{
        id: 'legacy-photo',
        url: currentUser.photo,
        isPrimary: true,
        uploadedAt: new Date().toISOString()
      }];
    }
    return existingImages;
  });

  const handleSave = async () => {
    console.log('=== PROFILE SAVE STARTED ===');
    console.log('Form data to save:', formData);
    console.log('Uploaded images:', uploadedImages);

    const result = await updateProfile({
      ...formData,
      images: uploadedImages
    });

    console.log('Update profile result:', result);

    if (result.success) {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully'
      });
      navigate('/profile');
    } else {
      toast({
        title: 'Update Failed',
        description: result.message || 'Failed to update profile',
        variant: 'destructive'
      });
    }
    console.log('=== PROFILE SAVE COMPLETED ===');
  };

  return (
    <>
      <Helmet>
        <title>Edit Profile - Merukulam Matrimony</title>
        <meta name="description" content="Edit your Merukulam Matrimony profile" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        <Navbar />

        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/profile" className="inline-flex items-center text-maroon hover:text-gold mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border-2 border-gold/20 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-maroon to-maroon-dark p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
                <p className="text-cream/90">Update your profile information</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2">Profile Photos</h2>
                  <ImageUpload
                    images={uploadedImages}
                    onImagesChange={setUploadedImages}
                    maxImages={5}
                    profileId={currentUser?.profile?.id || currentUser?.profile_id}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Gender</label>
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Marital Status</label>
                      <select
                        value={formData.maritalStatus || ''}
                        onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Marital Status</option>
                        {options.maritalStatus?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">Physical Attributes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Height</label>
                      <select
                        value={formData.height || ''}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Height</option>
                        {options.height?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Weight</label>
                      <input
                        type="text"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Complexion</label>
                      <input
                        type="text"
                        value={formData.complexion || ''}
                        onChange={(e) => setFormData({ ...formData, complexion: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">Religious Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Religion</label>
                      <select
                        value={formData.religion || ''}
                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Religion</option>
                        {options.religion?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Caste</label>
                      <select
                        value={formData.caste || ''}
                        onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Caste</option>
                        {options.caste?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">Education & Career</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Education</label>
                      <select
                        value={formData.education || ''}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Education</option>
                        {options.education?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Occupation</label>
                      <select
                        value={formData.occupation || ''}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Occupation</option>
                        {options.occupation?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Company/Employer</label>
                      <input
                        type="text"
                        value={formData.company || ''}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Annual Income</label>
                      <select
                        value={formData.annualIncome || ''}
                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Annual Income</option>
                        {options.annualIncome?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">Family Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Father's Occupation</label>
                      <select
                        value={formData.fatherOccupation || ''}
                        onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Father's Occupation</option>
                        {options.fatherOccupation?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Mother's Occupation</label>
                      <select
                        value={formData.motherOccupation || ''}
                        onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Mother's Occupation</option>
                        {options.motherOccupation?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Brothers</label>
                      <input
                        type="number"
                        value={formData.brothers || '0'}
                        onChange={(e) => setFormData({ ...formData, brothers: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Sisters</label>
                      <input
                        type="number"
                        value={formData.sisters || '0'}
                        onChange={(e) => setFormData({ ...formData, sisters: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-maroon mb-2">Permanent Address</label>
                      <textarea
                        value={formData.permanentAddress || ''}
                        onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">Horoscope Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Raasi</label>
                      <select
                        value={formData.raasi || ''}
                        onChange={(e) => setFormData({ ...formData, raasi: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Raasi</option>
                        {options.raasi?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Star</label>
                      <select
                        value={formData.star || ''}
                        onChange={(e) => setFormData({ ...formData, star: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select Star</option>
                        {options.star?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Birth Time</label>
                      <input
                        type="text"
                        value={formData.birthTime || ''}
                        onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Birth Place</label>
                      <input
                        type="text"
                        value={formData.birthPlace || ''}
                        onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">Location</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">City</label>
                      <select
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select City</option>
                        {options.city?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">State</label>
                      <select
                        value={formData.state || ''}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon bg-white"
                        disabled={loading}
                      >
                        <option value="">Select State</option>
                        {options.state?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">Mobile</label>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                      />
                    </div>
                  </div>
                </div>

                {/* About Me */}
                <div>
                  <h2 className="text-xl font-semibold text-maroon border-b border-gold/20 pb-2 mb-4">About Me</h2>
                  <div>
                    <label className="block text-sm font-medium text-maroon mb-2">Bio</label>
                    <textarea
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Link to="/profile" className="flex-1">
                    <Button variant="outline" className="w-full border-gold text-maroon hover:bg-gold/10">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default EditProfilePage;
