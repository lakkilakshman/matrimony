
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, User, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ProfileCard = ({ profile }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to view profile details",
        variant: "destructive"
      });
      navigate('/login', { state: { from: `/profile/${profile.id}` } });
      return;
    }
    navigate(`/profile/${profile.id}`);
  };

  const getEducationLabel = (value) => {
    const educationMap = {
      'high_school': 'High School',
      'diploma': 'Diploma',
      'bachelors': 'Bachelor\'s',
      'masters': 'Master\'s',
      'phd': 'PhD',
      'professional': 'Professional'
    };
    return educationMap[value] || value;
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleClick}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-200"
    >
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-maroon to-maroon-dark">
        {profile.profile_photo || profile.profilePhoto || profile.photo ? (
          <img
            src={profile.profile_photo ? `http://localhost:5000${profile.profile_photo}` : (profile.profilePhoto ? `http://localhost:5000${profile.profilePhoto}` : profile.photo)}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-white"
          style={{ display: (profile.profile_photo || profile.profilePhoto || profile.photo) ? 'none' : 'flex' }}
        >
          <div className="text-5xl font-bold mb-2">
            {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
          </div>
          <p className="text-lg font-semibold">{profile.firstName} {profile.lastName}</p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Matrimony ID Badge */}
        {profile.matrimonyId && (
          <div className="absolute top-3 right-3">
            <div className="bg-gradient-to-r from-gold to-yellow-500 text-maroon px-3 py-1.5 rounded-full shadow-lg">
              <span className="text-xs font-bold tracking-wide">{profile.matrimonyId}</span>
            </div>
          </div>
        )}

        {/* Verified Badge */}
        {(profile.profile_status === 'verified' || profile.profileStatus === 'verified' || profile.isVerified) && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full shadow-lg flex items-center space-x-1 border border-white/20">
              <Check className="h-3 w-3 stroke-[3px]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 text-shadow">
          <h3 className="text-white text-xl font-bold drop-shadow-md">
            {profile.firstName} {profile.lastName}
          </h3>
          <p className="text-white/90 text-sm font-medium drop-shadow-sm">{profile.age} years</p>
        </div>
      </div>

      <div className="p-4 bg-white">
        <div className="space-y-3">
          <div className="flex items-center text-gray-800 text-sm font-medium">
            <User className="h-4 w-4 mr-2 text-maroon flex-shrink-0" />
            <span>{profile.height || 'N/A'}" • {getEducationLabel(profile.education_level || profile.education)}</span>
          </div>

          <div className="flex items-center text-gray-800 text-sm font-medium">
            <Briefcase className="h-4 w-4 mr-2 text-maroon flex-shrink-0" />
            <span className="capitalize">{(profile.occupation_category || profile.occupation || 'N/A').replace(/_/g, ' ')}</span>
          </div>

          <div className="flex items-center text-gray-800 text-sm font-medium">
            <MapPin className="h-4 w-4 mr-2 text-maroon flex-shrink-0" />
            <span className="capitalize">{profile.city || profile.location || 'N/A'}</span>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="mt-4">
          <button className="w-full bg-maroon text-white py-2.5 rounded-lg hover:bg-maroon-dark transition-all font-bold shadow-sm">
            View Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
