
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Search, MapPin, Briefcase, GraduationCap, Heart, X, Eye, Edit2, Save, Phone, Mail, Calendar, UserPlus, ArrowLeft, ArrowRight, Check, Plus, Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { mockProfiles } from '@/data/mockProfiles';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { EditableField } from '@/components/EditableField';
import ImageUpload from '@/components/ImageUpload';
import { getAllUsers, updateUserProfile, createUserProfile } from '@/services/adminService';
import { getAllFormFieldOptions } from '@/services/formFieldsService';
import { useFormFieldOptions } from '@/hooks/useFormFieldOptions';

const AdminProfilesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);
    const { toast } = useToast();

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPhotos, setUserPhotos] = useState([]);

    // Form Field Options
    const [fieldOptions, setFieldOptions] = useState({});
    const { options: dynamicFieldOptions, loading: optionsLoading } = useFormFieldOptions();

    // Create Profile Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [newProfile, setNewProfile] = useState({
        // Account details
        email: '',
        mobile: '',
        password: '',
        // Basic Profile
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        maritalStatus: 'never_married',
        // Physical
        height: '',
        weight: '',
        complexion: '',
        religion: '',
        caste: '',
        bio: '',
        // Location
        permanentAddress: '',
        city: '',
        state: '',
        country: 'India',
        currentLocation: '',
        pincode: '',
        // Education
        education: '',
        fieldOfStudy: '',
        institution: '',
        yearOfCompletion: '',
        // Professional
        occupation: '',
        occupationCategory: '',
        company: '',
        annualIncome: '',
        workLocation: '',
        // Family
        fatherOccupation: '',
        motherOccupation: '',
        brothers: '',
        sisters: '',
        // Astrology
        raasi: '',
        star: '',
        birthTime: '',
        birthPlace: ''
    });

    // Fetch profiles and field options from backend
    useEffect(() => {
        fetchProfiles();
        fetchFieldOptions();
    }, []);

    const fetchFieldOptions = async () => {
        try {
            const response = await getAllFormFieldOptions();
            if (response.success && response.data) {
                // The API already returns grouped options as an object
                // No need to call .reduce() - just use the data directly
                setFieldOptions(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch field options:', error);
        }
    };

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers(1, 100); // Fetch first 100 for now
            if (response.success && response.data.users) {
                // Map backend data to frontend model
                const mappedProfiles = response.data.users.map(user => ({
                    id: user.profile_id || user.id,
                    userId: user.id,
                    firstName: user.first_name || 'N/A',
                    lastName: user.last_name || '',
                    email: user.email,
                    mobile: user.mobile,
                    gender: user.gender || 'N/A',
                    age: user.age || 'N/A',
                    dateOfBirth: user.date_of_birth,
                    status: user.status,
                    profileStatus: user.profile_status,
                    maritalStatus: user.marital_status,
                    height: user.height,
                    weight: user.weight,
                    complexion: user.complexion,
                    religion: user.religion,
                    caste: user.caste,
                    bio: user.bio,
                    // Location
                    permanentAddress: user.permanent_address,
                    city: user.city || 'N/A',
                    state: user.state || 'N/A',
                    country: user.country,
                    currentLocation: user.current_location,
                    pincode: user.pincode,
                    // Profile Photo
                    profile_photo: user.profile_photo,
                    profilePhoto: user.profile_photo,
                    // Education
                    education: user.education_level,
                    fieldOfStudy: user.field_of_study,
                    institution: user.institution,
                    yearOfCompletion: user.year_of_completion,
                    // Professional
                    occupation: user.occupation || user.occupation_category || 'N/A',
                    occupationCategory: user.occupation_category,
                    company: user.company_name,
                    annualIncome: user.annual_income,
                    workLocation: user.work_location,
                    // Family
                    fatherName: user.father_name,
                    fatherOccupation: user.father_occupation,
                    motherName: user.mother_name,
                    motherOccupation: user.mother_occupation,
                    brothers: user.brothers || '0',
                    sisters: user.sisters || '0',
                    // Astrology
                    raasi: user.raasi,
                    star: user.star,
                    birthTime: user.birth_time,
                    birthPlace: user.birth_place,
                    isFeatured: user.is_featured
                }));
                setProfiles(mappedProfiles);
            }
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
            toast({
                title: 'Error',
                description: 'Failed to load profiles',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Generate matrimony ID for profile
    const getMatrimonyId = (profileId) => {
        return `MKM${String(profileId).padStart(6, '0')}`;
    };

    // Filter profiles
    const filteredProfiles = profiles.filter(profile => {
        const matchesSearch = `${profile.firstName} ${profile.lastName} ${profile.email}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGender = genderFilter === 'all' || profile.gender === genderFilter;
        const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;
        return matchesSearch && matchesGender && matchesStatus;
    });

    const handleViewProfile = async (profile) => {
        setSelectedProfile(profile);
        setIsEditing(false);

        // Initialize images from photo fallback
        let initialImages = profile.images || [];
        if (initialImages.length === 0 && profile.profile_photo) { // Changed from profile.photo to profile.profile_photo
            initialImages = [{
                id: 'legacy-photo',
                url: profile.profile_photo,
                isPrimary: true,
                uploadedAt: new Date().toISOString()
            }];
        }

        // Initialize edited profile immediately with available data
        const initialProfileState = {
            ...profile,
            images: initialImages,
            isFeatured: profile.isFeatured || false
        };
        setEditedProfile(initialProfileState);

        // Fetch user photos
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/profiles/${profile.id}/photos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success && data.data) {
                setUserPhotos(data.data);

                // Update the edited profile images with fetched data
                setEditedProfile(prev => {
                    if (!prev) return initialProfileState; // Safety fallback

                    return {
                        ...prev,
                        images: data.data.map(img => ({
                            id: img.id,
                            url: img.photo_url || img.url,
                            isPrimary: img.is_primary || img.isPrimary,
                            uploadedAt: img.uploaded_at
                        }))
                    };
                });
            } else {
                setUserPhotos([]);
            }
        } catch (error) {
            console.error('Failed to fetch user photos:', error);
            setUserPhotos([]);
        }
    };

    const handleClosePanel = () => {
        setSelectedProfile(null);
        setIsEditing(false);
    };

    const handleSaveProfile = async () => {
        try {
            // Call backend API instead of just local storage
            console.log('Saving profile with isFeatured:', editedProfile.isFeatured);
            const response = await updateUserProfile(editedProfile.userId, editedProfile);

            if (response.success) {
                // Fetch photos to ensure sync if images were changed
                if (editedProfile.images) {
                    const token = localStorage.getItem('authToken');
                    const photoRes = await fetch(`http://localhost:5000/api/profiles/${editedProfile.id}/photos`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const photoData = await photoRes.json();
                    if (photoData.success) {
                        setUserPhotos(photoData.data);
                        // Find the new primary photo URL to update the profile lists
                        const primaryPhoto = photoData.data.find(p => p.is_primary || p.isPrimary);
                        if (primaryPhoto) {
                            editedProfile.profile_photo = primaryPhoto.photo_url || primaryPhoto.url;
                            editedProfile.profilePhoto = editedProfile.profile_photo;
                        }
                    }
                }

                // Update local list state
                const updatedProfiles = profiles.map(p =>
                    p.id === editedProfile.id ? editedProfile : p
                );
                setProfiles(updatedProfiles);

                // Update selected profile to reflect changes
                setSelectedProfile(editedProfile);

                toast({
                    title: 'Profile Updated',
                    description: 'Profile information covers and photos have been saved successfully.',
                });
                setIsEditing(false);
            } else {
                toast({
                    title: 'Update Failed',
                    description: response.message || 'Failed to update profile.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred while saving.',
                variant: 'destructive'
            });
        }
    };
    const handleCreateProfile = async () => {
        try {
            setIsCreating(true);
            const response = await createUserProfile(newProfile);

            if (response.success) {
                toast({
                    title: 'Profile Created',
                    description: `New profile for ${newProfile.firstName} ${newProfile.lastName} has been created successfully.`,
                });
                setShowCreateModal(false);
                // Reset form
                setNewProfile({
                    email: '', mobile: '', password: '',
                    firstName: '', lastName: '', gender: '', dateOfBirth: '', maritalStatus: 'never_married',
                    height: '', weight: '', complexion: '', religion: '', caste: '', bio: '',
                    permanentAddress: '', city: '', state: '', country: 'India', currentLocation: '', pincode: '',
                    education: '', fieldOfStudy: '', institution: '', yearOfCompletion: '',
                    occupation: '', occupationCategory: '', company: '', annualIncome: '', workLocation: '',
                    fatherOccupation: '', motherOccupation: '', brothers: '', sisters: '',
                    raasi: '', star: '', birthTime: '', birthPlace: ''
                });
                setCreateStep(1);
                fetchProfiles(); // Refresh list
            } else {
                toast({
                    title: 'Creation Failed',
                    description: response.message || 'Failed to create profile.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Failed to create profile:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleNewProfileChange = (field, value) => {
        setNewProfile({ ...newProfile, [field]: value });
    };

    const handleEditChange = (field, value) => {
        setEditedProfile({ ...editedProfile, [field]: value });
    };

    const stats = [
        { label: 'Total Profiles', value: profiles.length, color: 'bg-blue-500' },
        { label: 'Male', value: profiles.filter(p => p.gender === 'male').length, color: 'bg-green-500' },
        { label: 'Female', value: profiles.filter(p => p.gender === 'female').length, color: 'bg-pink-500' },
        { label: 'Active', value: profiles.filter(p => p.status === 'active').length, color: 'bg-gold' }
    ];

    return (
        <>
            <Helmet>
                <title>Profile Management - Admin Panel</title>
            </Helmet>

            <div className="flex min-h-screen bg-gradient-to-br from-cream to-white">
                <AdminSidebar />

                <div className={`flex-1 p-4 md:p-8 ml-0 md:ml-64 pt-20 md:pt-8 transition-all duration-300 ${selectedProfile ? 'mr-0 md:mr-[600px]' : ''}`}>
                    <div className="p-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-4xl font-bold text-maroon mb-2 flex items-center">
                                <UserCheck className="h-10 w-10 mr-3 text-gold" />
                                Profile Management
                            </h1>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <p className="text-maroon/70 text-lg">
                                    Manage and moderate user profiles ({filteredProfiles.length} profiles)
                                </p>
                                <Button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gradient-to-r from-maroon to-maroon-dark text-white hover:shadow-lg transition-all"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create New Profile
                                </Button>
                            </div>
                        </motion.div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl shadow-lg border-2 border-gold/20 p-4"
                                >
                                    <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                                        <Heart className="h-6 w-6 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-maroon">{stat.value}</p>
                                    <p className="text-sm text-maroon/60">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gold/20 p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-maroon mb-2">
                                        Search Profiles
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name..."
                                            className="w-full pl-10 pr-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-maroon mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={genderFilter}
                                        onChange={(e) => setGenderFilter(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                    >
                                        <option value="all">All Genders</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-maroon mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Profiles Table */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gold/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-maroon to-maroon-dark text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Matrimony ID</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Profile</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Age</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Occupation</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gold/20">
                                        {filteredProfiles.map((profile, index) => (
                                            <motion.tr
                                                key={profile.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`hover:bg-cream/30 transition-colors ${selectedProfile?.id === profile.id ? 'bg-gold/10' : ''}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm font-semibold text-maroon bg-gold/20 px-2 py-1 rounded">
                                                        {getMatrimonyId(profile.id)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="flex items-center">
                                                            <p className="font-semibold text-maroon">{profile.firstName} {profile.lastName}</p>
                                                            {profile.isFeatured && (
                                                                <span className="ml-2 bg-yellow-400 text-maroon text-[10px] px-1.5 py-0.5 rounded-full font-bold">Featured</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-maroon/60 capitalize">{profile.gender}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-maroon">{profile.age} years</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <p className="text-maroon">{profile.city}</p>
                                                        <p className="text-maroon/60">{profile.state}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-maroon text-sm">{profile.occupation}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {profile.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-gold text-maroon hover:bg-gold/10"
                                                        onClick={() => handleViewProfile(profile)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredProfiles.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-maroon/70">No profiles found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side Panel */}
                <AnimatePresence>
                    {selectedProfile && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 h-screen w-full md:w-[600px] bg-white shadow-2xl border-l-2 border-gold/20 overflow-y-auto z-40"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-gold/20">
                                    <div>
                                        <h2 className="text-2xl font-bold text-maroon">Profile Details</h2>
                                        <p className="text-sm text-maroon/60">Matrimony ID: {getMatrimonyId(selectedProfile.id)}</p>

                                        {/* Status and Featured Badges */}
                                        <div className="flex items-center mt-2 gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedProfile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {selectedProfile.status}
                                            </span>
                                            {isEditing && (
                                                <label className="flex items-center space-x-2 cursor-pointer bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={editedProfile.isFeatured || false}
                                                        onChange={(e) => handleEditChange('isFeatured', e.target.checked)}
                                                        className="form-checkbox h-4 w-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                                                    />
                                                    <span className="text-xs font-bold text-yellow-700">Featured</span>
                                                </label>
                                            )}
                                            {!isEditing && selectedProfile.isFeatured && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold border border-yellow-200">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!isEditing ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-gold text-maroon hover:bg-gold/10"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Edit2 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="bg-green-500 text-white hover:bg-green-600"
                                                onClick={handleSaveProfile}
                                            >
                                                <Save className="h-4 w-4 mr-1" />
                                                Save
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500 text-red-500 hover:bg-red-50"
                                            onClick={handleClosePanel}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Profile Image */}
                                <div className="mb-6">
                                    <div className="w-full h-96 bg-gradient-to-br from-maroon to-maroon-dark rounded-xl flex items-center justify-center overflow-hidden relative">
                                        {(selectedProfile.profile_photo || selectedProfile.profilePhoto || userPhotos.find(p => p.is_primary || p.isPrimary)) ? (
                                            <img
                                                src={`http://localhost:5000${(userPhotos.find(p => p.is_primary || p.isPrimary)?.photo_url || userPhotos.find(p => p.is_primary || p.isPrimary)?.url) || (selectedProfile.profile_photo || selectedProfile.profilePhoto)}`}
                                                alt={`${selectedProfile.firstName} ${selectedProfile.lastName}`}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentNode.querySelector('.fallback-avatar').style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="fallback-avatar text-center text-white flex-col items-center justify-center"
                                            style={{ display: (selectedProfile.profile_photo || selectedProfile.profilePhoto || userPhotos.find(p => p.is_primary || p.isPrimary)) ? 'none' : 'flex' }}
                                        >
                                            <div className="text-6xl font-bold mb-2">
                                                {selectedProfile.firstName.charAt(0)}{selectedProfile.lastName.charAt(0)}
                                            </div>
                                            <p className="text-xl">{selectedProfile.firstName} {selectedProfile.lastName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Photo Gallery - Show all uploaded photos */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-maroon mb-4">
                                        All Photos ({userPhotos.length})
                                    </h3>
                                    {userPhotos.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No additional photos uploaded</p>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-4">
                                            {userPhotos.map((photo, index) => (
                                                <div key={photo.id} className="relative group">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                        <img
                                                            src={`http://localhost:5000${photo.photo_url}`}
                                                            alt={`Photo ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {photo.is_primary && (
                                                        <div className="absolute top-2 right-2 bg-gold text-white text-xs px-2 py-1 rounded">
                                                            Primary
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Image Upload Section */}
                                {isEditing && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-maroon mb-4">Profile Photos</h3>
                                        <ImageUpload
                                            images={editedProfile.images || []}
                                            onImagesChange={(images) => handleEditChange('images', images)}
                                            maxImages={5}
                                            profileId={editedProfile.id}
                                        />
                                    </div>
                                )}

                                {/* Profile Information Sections */}
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4 flex items-center">
                                            <UserCheck className="h-5 w-5 mr-2 text-gold" />
                                            Basic Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <EditableField
                                                label="First Name"
                                                value={isEditing ? editedProfile.firstName : selectedProfile.firstName}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('firstName', val)}
                                            />
                                            <EditableField
                                                label="Last Name"
                                                value={isEditing ? editedProfile.lastName : selectedProfile.lastName}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('lastName', val)}
                                            />
                                            <EditableField
                                                label="Age"
                                                value={isEditing ? editedProfile.age : selectedProfile.age}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('age', val)}
                                                type="number"
                                            />
                                            <EditableField
                                                label="Gender"
                                                value={isEditing ? editedProfile.gender : selectedProfile.gender}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('gender', val)}
                                                options={[
                                                    { value: 'male', label: 'Male' },
                                                    { value: 'female', label: 'Female' }
                                                ]}
                                            />
                                            <EditableField
                                                label="Marital Status"
                                                value={isEditing ? editedProfile.maritalStatus : selectedProfile.maritalStatus}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('maritalStatus', val)}
                                            />
                                        </div>
                                    </div>
                                    {/* Personal Details */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4 flex items-center">
                                            <UserCheck className="h-5 w-5 mr-2 text-gold" />
                                            Personal Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <EditableField
                                                label="Height"
                                                value={isEditing ? editedProfile.height : selectedProfile.height}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('height', val)}
                                            />
                                            <EditableField
                                                label="Weight"
                                                value={isEditing ? editedProfile.weight : selectedProfile.weight}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('weight', val)}
                                            />
                                            <EditableField
                                                label="Complexion"
                                                value={isEditing ? editedProfile.complexion : selectedProfile.complexion}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('complexion', val)}
                                                options={dynamicFieldOptions.complexion?.map(opt => ({
                                                    value: opt.value,
                                                    label: opt.label
                                                }))}
                                            />
                                            <EditableField
                                                label="Religion"
                                                value={isEditing ? editedProfile.religion : selectedProfile.religion}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('religion', val)}
                                            />
                                            <EditableField
                                                label="Caste"
                                                value={isEditing ? editedProfile.caste : selectedProfile.caste}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('caste', val)}
                                            />
                                            <EditableField
                                                label="Marital Status"
                                                value={isEditing ? editedProfile.maritalStatus : selectedProfile.maritalStatus}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('maritalStatus', val)}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4 flex items-center">
                                            <MapPin className="h-5 w-5 mr-2 text-gold" />
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 text-sm">
                                            <EditableField
                                                label="Email"
                                                value={isEditing ? editedProfile.email : selectedProfile.email}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('email', val)}
                                                type="email"
                                            />
                                            <EditableField
                                                label="Mobile"
                                                value={isEditing ? editedProfile.mobile : selectedProfile.mobile}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('mobile', val)}
                                                type="tel"
                                            />
                                        </div>
                                    </div>

                                    {/* Education & Career */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4 flex items-center">
                                            <GraduationCap className="h-5 w-5 mr-2 text-gold" />
                                            Education & Career
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 text-sm">
                                            <EditableField
                                                label="Education"
                                                value={isEditing ? editedProfile.education : selectedProfile.education}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('education', val)}
                                            />
                                            <EditableField
                                                label="Occupation"
                                                value={isEditing ? editedProfile.occupation : selectedProfile.occupation}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('occupation', val)}
                                            />
                                            <EditableField
                                                label="Company"
                                                value={isEditing ? editedProfile.company : selectedProfile.company}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('company', val)}
                                            />
                                            <EditableField
                                                label="Annual Income"
                                                value={isEditing ? (editedProfile.income || editedProfile.annualIncome) : (selectedProfile.income || selectedProfile.annualIncome)}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('annualIncome', val)}
                                            />
                                        </div>
                                    </div>

                                    {/* Family Details */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4">Family Details</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <EditableField
                                                label="Father's Occupation"
                                                value={isEditing ? editedProfile.fatherOccupation : selectedProfile.fatherOccupation}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('fatherOccupation', val)}
                                                options={dynamicFieldOptions.fatherOccupation?.map(opt => ({
                                                    value: opt.value,
                                                    label: opt.label
                                                }))}
                                            />
                                            <EditableField
                                                label="Mother's Occupation"
                                                value={isEditing ? editedProfile.motherOccupation : selectedProfile.motherOccupation}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('motherOccupation', val)}
                                                options={dynamicFieldOptions.motherOccupation?.map(opt => ({
                                                    value: opt.value,
                                                    label: opt.label
                                                }))}
                                            />
                                            <EditableField
                                                label="Brothers"
                                                value={isEditing ? (editedProfile.brothers || '0') : (selectedProfile.brothers || '0')}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('brothers', val)}
                                                type="number"
                                            />
                                            <EditableField
                                                label="Sisters"
                                                value={isEditing ? (editedProfile.sisters || '0') : (selectedProfile.sisters || '0')}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('sisters', val)}
                                                type="number"
                                            />
                                            <div className="col-span-2">
                                                <EditableField
                                                    label="Permanent Address"
                                                    value={isEditing ? editedProfile.permanentAddress : selectedProfile.permanentAddress}
                                                    isEditing={isEditing}
                                                    onChange={(val) => handleEditChange('permanentAddress', val)}
                                                    type="textarea"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Horoscope Details */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4">Horoscope Details</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <EditableField
                                                label="Raasi"
                                                value={isEditing ? editedProfile.raasi : selectedProfile.raasi}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('raasi', val)}
                                            />
                                            <EditableField
                                                label="Star"
                                                value={isEditing ? editedProfile.star : selectedProfile.star}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('star', val)}
                                            />
                                            <EditableField
                                                label="Birth Time"
                                                value={isEditing ? editedProfile.birthTime : selectedProfile.birthTime}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('birthTime', val)}
                                            />
                                            <EditableField
                                                label="Birth Place"
                                                value={isEditing ? editedProfile.birthPlace : selectedProfile.birthPlace}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('birthPlace', val)}
                                            />
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4 flex items-center">
                                            <MapPin className="h-5 w-5 mr-2 text-gold" />
                                            Current Location
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 text-sm">
                                            <EditableField
                                                label="City"
                                                value={isEditing ? editedProfile.city : selectedProfile.city}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('city', val)}
                                            />
                                            <EditableField
                                                label="State"
                                                value={isEditing ? editedProfile.state : selectedProfile.state}
                                                isEditing={isEditing}
                                                onChange={(val) => handleEditChange('state', val)}
                                            />
                                        </div>
                                    </div>

                                    {/* About */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4">About</h3>
                                        <EditableField
                                            label=""
                                            value={isEditing ? (editedProfile.bio || '') : (selectedProfile.bio || '')}
                                            isEditing={isEditing}
                                            onChange={(val) => handleEditChange('bio', val)}
                                            type="textarea"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="bg-cream/30 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-maroon mb-4">Profile Status</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-maroon/60">Current Status:</span>
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedProfile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {selectedProfile.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Profile Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-gradient-to-r from-maroon to-maroon-dark text-white">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mr-4">
                                            <UserPlus className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">Create New Profile</h2>
                                            <p className="text-white/70 text-sm">Step {createStep} of 5</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-gray-100">
                                    <motion.div
                                        className="h-full bg-gold"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(createStep / 5) * 100}%` }}
                                    />
                                </div>

                                {/* Modal Content */}
                                <div className="flex-1 overflow-y-auto p-8">
                                    {/* Step 1: Account Information */}
                                    {createStep === 1 && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-maroon border-b border-gold/20 pb-2">Account Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Email Address *</label>
                                                    <input
                                                        type="email"
                                                        value={newProfile.email}
                                                        onChange={(e) => handleNewProfileChange('email', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        placeholder="example@mail.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Mobile Number *</label>
                                                    <input
                                                        type="text"
                                                        value={newProfile.mobile}
                                                        onChange={(e) => handleNewProfileChange('mobile', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        placeholder="+91 XXXXX XXXXX"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Password *</label>
                                                    <input
                                                        type="password"
                                                        value={newProfile.password}
                                                        onChange={(e) => handleNewProfileChange('password', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        placeholder="Set initial password"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Personal Information */}
                                    {createStep === 2 && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-maroon border-b border-gold/20 pb-2">Personal Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">First Name *</label>
                                                    <input
                                                        type="text"
                                                        value={newProfile.firstName}
                                                        onChange={(e) => handleNewProfileChange('firstName', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Last Name *</label>
                                                    <input
                                                        type="text"
                                                        value={newProfile.lastName}
                                                        onChange={(e) => handleNewProfileChange('lastName', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Gender *</label>
                                                    <select
                                                        value={newProfile.gender}
                                                        onChange={(e) => handleNewProfileChange('gender', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Date of Birth *</label>
                                                    <input
                                                        type="date"
                                                        value={newProfile.dateOfBirth}
                                                        onChange={(e) => handleNewProfileChange('dateOfBirth', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Marital Status</label>
                                                    <select
                                                        value={newProfile.maritalStatus}
                                                        onChange={(e) => handleNewProfileChange('maritalStatus', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Status'}</option>
                                                        {dynamicFieldOptions.maritalStatus?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Religion</label>
                                                    <select
                                                        value={newProfile.religion}
                                                        onChange={(e) => handleNewProfileChange('religion', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Religion'}</option>
                                                        {dynamicFieldOptions.religion?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Caste</label>
                                                    <select
                                                        value={newProfile.caste}
                                                        onChange={(e) => handleNewProfileChange('caste', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Caste'}</option>
                                                        {dynamicFieldOptions.caste?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Height</label>
                                                    <select
                                                        value={newProfile.height}
                                                        onChange={(e) => handleNewProfileChange('height', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Height'}</option>
                                                        {dynamicFieldOptions.height?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Complexion</label>
                                                    <select
                                                        value={newProfile.complexion}
                                                        onChange={(e) => handleNewProfileChange('complexion', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Complexion'}</option>
                                                        {dynamicFieldOptions.complexion?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-maroon mb-2">Bio / About</label>
                                                <textarea
                                                    value={newProfile.bio}
                                                    onChange={(e) => handleNewProfileChange('bio', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Education & Professional */}
                                    {createStep === 3 && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-maroon border-b border-gold/20 pb-2">Professional Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Education Level</label>
                                                    <select
                                                        value={newProfile.education}
                                                        onChange={(e) => handleNewProfileChange('education', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Education'}</option>
                                                        {dynamicFieldOptions.education?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Occupation</label>
                                                    <select
                                                        value={newProfile.occupation}
                                                        onChange={(e) => handleNewProfileChange('occupation', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Occupation'}</option>
                                                        {dynamicFieldOptions.occupation?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Company Name</label>
                                                    <input
                                                        type="text"
                                                        value={newProfile.company}
                                                        onChange={(e) => handleNewProfileChange('company', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Annual Income</label>
                                                    <select
                                                        value={newProfile.annualIncome}
                                                        onChange={(e) => handleNewProfileChange('annualIncome', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Income Range'}</option>
                                                        {dynamicFieldOptions.annualIncome?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Family Details */}
                                    {createStep === 4 && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-maroon border-b border-gold/20 pb-2">Family Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Father's Occupation</label>
                                                    <select
                                                        value={newProfile.fatherOccupation}
                                                        onChange={(e) => handleNewProfileChange('fatherOccupation', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Occupation'}</option>
                                                        {dynamicFieldOptions.fatherOccupation?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Mother's Occupation</label>
                                                    <select
                                                        value={newProfile.motherOccupation}
                                                        onChange={(e) => handleNewProfileChange('motherOccupation', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Occupation'}</option>
                                                        {dynamicFieldOptions.motherOccupation?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Brothers</label>
                                                    <input
                                                        type="number"
                                                        value={newProfile.brothers}
                                                        onChange={(e) => handleNewProfileChange('brothers', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Sisters</label>
                                                    <input
                                                        type="number"
                                                        value={newProfile.sisters}
                                                        onChange={(e) => handleNewProfileChange('sisters', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 5: Location & Astrology */}
                                    {createStep === 5 && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-maroon border-b border-gold/20 pb-2">Location & Astrology</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">City</label>
                                                    <select
                                                        value={newProfile.city}
                                                        onChange={(e) => handleNewProfileChange('city', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select City'}</option>
                                                        {dynamicFieldOptions.city?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">State</label>
                                                    <select
                                                        value={newProfile.state}
                                                        onChange={(e) => handleNewProfileChange('state', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select State'}</option>
                                                        {dynamicFieldOptions.state?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Raasi</label>
                                                    <select
                                                        value={newProfile.raasi}
                                                        onChange={(e) => handleNewProfileChange('raasi', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Raasi'}</option>
                                                        {dynamicFieldOptions.raasi?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Star / Nakshatra</label>
                                                    <select
                                                        value={newProfile.star}
                                                        onChange={(e) => handleNewProfileChange('star', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                        disabled={optionsLoading}
                                                    >
                                                        <option value="">{optionsLoading ? 'Loading...' : 'Select Star'}</option>
                                                        {dynamicFieldOptions.star?.map(opt => (
                                                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Birth Time</label>
                                                    <input
                                                        type="time"
                                                        value={newProfile.birthTime}
                                                        onChange={(e) => handleNewProfileChange('birthTime', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-maroon mb-2">Birth Place</label>
                                                    <input
                                                        type="text"
                                                        value={newProfile.birthPlace}
                                                        onChange={(e) => handleNewProfileChange('birthPlace', e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-maroon mb-2">Permanent Address</label>
                                                <textarea
                                                    value={newProfile.permanentAddress}
                                                    onChange={(e) => handleNewProfileChange('permanentAddress', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-4 py-2 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 border-t border-gold/20 flex items-center justify-between bg-cream/30">
                                    <Button
                                        disabled={createStep === 1 || isCreating}
                                        onClick={() => setCreateStep(prev => prev - 1)}
                                        className="bg-white border-2 border-gold text-maroon hover:bg-gold/10"
                                    >
                                        <ArrowLeft className="h-5 w-5 mr-2" />
                                        Back
                                    </Button>
                                    <div className="flex gap-4">
                                        {createStep < 5 ? (
                                            <Button
                                                onClick={() => setCreateStep(prev => prev + 1)}
                                                className="bg-maroon text-white hover:bg-maroon-dark shadow-md"
                                            >
                                                Next
                                                <ArrowRight className="h-5 w-5 ml-2" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleCreateProfile}
                                                disabled={isCreating}
                                                className="bg-gradient-to-r from-gold to-gold-dark text-maroon-dark font-bold hover:shadow-xl transition-all min-w-[150px]"
                                            >
                                                {isCreating ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="h-5 w-5 mr-2" />
                                                        Finish & Create
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default AdminProfilesPage;
