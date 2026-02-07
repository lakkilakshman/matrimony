
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Eye, EyeOff, MapPin, Briefcase, GraduationCap, Check, Loader2, Clock, Shield, Star, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getProfileById } from '@/services/profileService';
import { mapProfileFields } from '@/utils/profileUtils';
import { sendInterest, acceptInterest, rejectInterest } from '@/services/interestsService';
import { useAuth } from '@/context/AuthContext';


const ProfileDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getProfileById(id);
        if (response.success) {
          const mappedProfile = mapProfileFields(response.data);
          setProfile(mappedProfile);

          // Set initial selected image
          if (mappedProfile.profilePhoto) {
            setSelectedImage(`http://localhost:5000${mappedProfile.profilePhoto}`);
          } else if (mappedProfile.photos && mappedProfile.photos.length > 0) {
            setSelectedImage(`http://localhost:5000${mappedProfile.photos[0].photo_url || mappedProfile.photos[0].url}`);
          }
        } else {
          setError(response.message || 'Profile not found');
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream">
        <Loader2 className="h-12 w-12 text-maroon animate-spin mb-4" />
        <p className="text-maroon font-semibold">Loading profile details...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-maroon text-xl">Profile not found</p>
      </div>
    );
  }

  const handleInterest = async () => {
    if (profile.interestStatus) return;

    setInterestLoading(true);
    try {
      const response = await sendInterest(profile.id);
      if (response.success) {
        toast({
          title: 'Interest Sent!',
          description: `Your interest has been sent to ${profile.first_name || profile.firstName}`
        });
        // Update local state to reflect sent status
        setProfile(prev => ({ ...prev, interestStatus: 'pending' }));
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to send interest',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Send interest error:', err);
      toast({
        title: 'Error',
        description: 'Failed to send interest. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setInterestLoading(false);
    }
  };

  const handleAcceptInterest = async () => {
    setInterestLoading(true);
    try {
      // We need the interest ID here. Since we don't have it in the profile object directly, 
      // we might need to fetch it or just assume the backend handles it by sender/receiver pairing.
      // However, existing acceptInterest takes an ID. 
      // Let's assume for now we can't easily accept without ID unless we look it up.
      // A better approach for now might be to redirect them to dashboard or just say "Visit Dashboard"
      // But let's try to make it work if we can. 
      // Actually, simplest is to tell them to check dashboard for now to avoid complex lookup logic here 
      // until we pass interest ID in getProfileById.
      // WAIT: I can update getProfileById to return interest ID too!
      // But let's check if I can just use the status for now.

      // Since I didn't update backend to return interest ID, I'll direct them to dashboard for 'received' requests
      // OR I can implement a 'respondToInterest' endpoint that takes profileId.
      // For now, let's keep it simple: Messages are restricted.

    } catch (err) {
      console.error(err);
    }
  };



  const formatLabel = (value) => {
    if (!value) return 'N/A';
    return String(value).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <Helmet>
        <title>{`${profile.first_name || profile.firstName} ${profile.last_name || profile.lastName} - Merukulam Matrimony`}</title>
        <meta name="description" content={`View ${profile.first_name || profile.firstName}'s profile on Merukulam Matrimony`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        <Navbar />

        <div className="pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <Link to="/browse" className="inline-flex items-center text-maroon hover:text-gold mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Photo and Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="space-y-4 sticky top-20">
                  {/* Main Photo */}
                  <div className="bg-white rounded-xl overflow-hidden border-2 border-gold/20 bg-gradient-to-br from-maroon to-maroon-dark relative flex items-center justify-center h-96">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={`${profile.first_name || profile.firstName} ${profile.last_name || profile.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.querySelector('.fallback-avatar').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="fallback-avatar absolute inset-0 flex flex-col items-center justify-center text-white"
                      style={{ display: (profile.profile_photo || profile.profilePhoto || profile.photo || (profile.photos && profile.photos.length > 0)) ? 'none' : 'flex' }}
                    >
                      <div className="text-7xl font-bold mb-2">
                        {(profile.first_name || profile.firstName)?.charAt(0)}{(profile.last_name || profile.lastName)?.charAt(0)}
                      </div>
                      <p className="text-2xl font-semibold">{profile.first_name || profile.firstName} {profile.last_name || profile.lastName}</p>
                    </div>
                  </div>

                  {/* Thumbnail Grid */}
                  {profile.photos && profile.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {/* Include profile photo as a thumbnail if it exists */}
                      {profile.profilePhoto && (
                        <div
                          onClick={() => setSelectedImage(`http://localhost:5000${profile.profilePhoto}`)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === `http://localhost:5000${profile.profilePhoto}`
                            ? 'border-gold shadow-md scale-105 z-10'
                            : 'border-gold/20 hover:border-gold/50'
                            }`}
                        >
                          <img
                            src={`http://localhost:5000${profile.profilePhoto}`}
                            alt="Main Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {profile.photos.map((img, index) => {
                        const imageUrl = `http://localhost:5000${img.photo_url || img.url}`;
                        // Avoid showing the same image twice if it's the profile photo
                        if (img.photo_url === profile.profilePhoto || img.url === profile.profilePhoto) return null;

                        return (
                          <div
                            key={img.id || index}
                            onClick={() => setSelectedImage(imageUrl)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === imageUrl
                              ? 'border-gold shadow-md scale-105 z-10'
                              : 'border-gold/20 hover:border-gold/50'
                              }`}
                          >
                            <img
                              src={imageUrl}
                              alt={`Profile ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-6 space-y-3 border-2 border-gold/20">
                    <Button
                      onClick={handleInterest}
                      disabled={interestLoading || profile.interestStatus === 'pending' || profile.interestStatus === 'accepted'}
                      className={`w-full font-semibold transition-all ${profile.interestStatus === 'accepted'
                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-default'
                        : profile.interestStatus === 'pending'
                          ? 'bg-yellow-500 text-white cursor-default'
                          : profile.interestStatus === 'received'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' // Pending action from me
                            : 'bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon'
                        }`}
                    >
                      {interestLoading ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : profile.interestStatus === 'accepted' ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Connected
                        </>
                      ) : profile.interestStatus === 'pending' ? (
                        <>
                          <Clock className="h-5 w-5 mr-2" />
                          Interest Sent
                        </>
                      ) : profile.interestStatus === 'received' ? (
                        <>
                          <Info className="h-5 w-5 mr-2" />
                          Interest Received (Check Dashboard)
                        </>
                      ) : (
                        <>
                          <Heart className="h-5 w-5 mr-2" />
                          Express Interest
                        </>
                      )}
                    </Button>
                    {/* Send Message Button / Note */}
                    {profile.interestStatus === 'accepted' ? (
                      <p className="text-xs text-center text-gray-500 mt-2 italic px-2">
                        You are connected! Go to <Link to="/dashboard" className="text-maroon underline hover:text-gold">Dashboard</Link> to message.
                      </p>
                    ) : (
                      <p className="text-xs text-center text-gray-500 mt-2 italic px-2">
                        Wait for mutual interest approval to message.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Basic Info */}
                <div className="bg-white rounded-xl border-2 border-gold/20 p-6">
                  {/* Matrimony ID Badge */}
                  {profile.matrimonyId && (
                    <div className="mb-4">
                      <div className="inline-block bg-gradient-to-r from-gold to-yellow-500 text-maroon px-4 py-2 rounded-full shadow-md">
                        <span className="text-sm font-bold tracking-wide">ID: {profile.matrimonyId}</span>
                      </div>
                    </div>
                  )}

                  <h1 className="text-3xl font-bold text-maroon mb-2 flex items-center">
                    {profile.first_name || profile.firstName} {profile.last_name || profile.lastName}
                    {(profile.profile_status === 'verified' || profile.profileStatus === 'verified' || profile.isVerified) && (
                      <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <Check className="h-3 w-3 mr-1 mt-0.5 stroke-[3px]" />
                        Verified
                      </span>
                    )}
                  </h1>
                  <p className="text-maroon/70 text-lg mb-4">{profile.age} years old</p>

                  {profile.bio && (
                    <p className="text-maroon/80 italic border-l-4 border-gold pl-4 py-2">
                      "{profile.bio}"
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center text-maroon">
                      <MapPin className="h-5 w-5 mr-2 text-gold" />
                      <span className="capitalize">{profile.city || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-maroon">
                      <Briefcase className="h-5 w-5 mr-2 text-gold" />
                      <span className="capitalize">{formatLabel(profile.occupation)}</span>
                    </div>
                    <div className="flex items-center text-maroon">
                      <GraduationCap className="h-5 w-5 mr-2 text-gold" />
                      <span>{formatLabel(profile.education)}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="bg-white rounded-xl border-2 border-gold/20 p-6">
                  <h2 className="text-xl font-semibold text-maroon mb-4 border-b-2 border-gold/20 pb-2">
                    Personal Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-maroon/60">Height</p>
                      <p className="text-maroon font-medium">{profile.height}"</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Weight</p>
                      <p className="text-maroon font-medium">{profile.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Marital Status</p>
                      <p className="text-maroon font-medium">{formatLabel(profile.marital_status || profile.maritalStatus)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Religion</p>
                      <p className="text-maroon font-medium">{profile.religion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Caste</p>
                      <p className="text-maroon font-medium">{profile.caste}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Annual Income</p>
                      <p className="text-maroon font-medium">{formatLabel(profile.annualIncome)}</p>
                    </div>
                  </div>
                </div>

                {/* Family Details */}
                <div className="bg-white rounded-xl border-2 border-gold/20 p-6">
                  <h2 className="text-xl font-semibold text-maroon mb-4 border-b-2 border-gold/20 pb-2">
                    Family Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-maroon/60">Father's Occupation</p>
                      <p className="text-maroon font-medium">{formatLabel(profile.father_occupation || profile.fatherOccupation)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Mother's Occupation</p>
                      <p className="text-maroon font-medium">{formatLabel(profile.mother_occupation || profile.motherOccupation)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Brothers</p>
                      <p className="text-maroon font-medium">{profile.brothers || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Sisters</p>
                      <p className="text-maroon font-medium">{profile.sisters || '0'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-maroon/60">Permanent Address</p>
                      <p className="text-maroon font-medium">{profile.permanent_address || profile.permanentAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Horoscope Details */}
                <div className="bg-white rounded-xl border-2 border-gold/20 p-6">
                  <h2 className="text-xl font-semibold text-maroon mb-4 border-b-2 border-gold/20 pb-2">
                    Horoscope Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-maroon/60">Raasi / Moon Sign</p>
                      <p className="text-maroon font-medium">{formatLabel(profile.raasi)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Star / Nakshatra</p>
                      <p className="text-maroon font-medium">{formatLabel(profile.star)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Birth Time</p>
                      <p className="text-maroon font-medium">{profile.birth_time || profile.birthTime || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-maroon/60">Birth Place</p>
                      <p className="text-maroon font-medium">{profile.birth_place || profile.birthPlace || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white rounded-xl border-2 border-gold/20 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-maroon border-b-2 border-gold/20 pb-2">
                      Contact Details
                    </h2>
                    <Button
                      onClick={() => {
                        console.log('CurrentUser:', currentUser);
                        // Check if user is logged in
                        if (!currentUser) {
                          toast({
                            title: "Authentication Required",
                            description: "Please login to view contact details.",
                            variant: "destructive"
                          });
                          return;
                        }

                        // Check subscription
                        if (currentUser.subscription_status !== 'active' && currentUser.role !== 'admin' && currentUser.id !== profile.user_id) {
                          toast({
                            title: "Premium Feature",
                            description: "Please upgrade to a premium plan to view contact details.",
                            variant: "destructive"
                          });
                          return;
                        }
                        setShowContact(!showContact);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-gold text-maroon hover:bg-gold/10"
                    >
                      {showContact ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>

                  {showContact ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-maroon/60">Email</p>
                        <p className="text-maroon font-medium">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-maroon/60">Mobile</p>
                        <p className="text-maroon font-medium">{profile.mobile}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-maroon/70 text-center py-4">
                      Click "Show" to view contact details
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div >

        <Footer />
      </div >

    </>
  );
};

export default ProfileDetailPage;
