// Replace imports
import React, { useState, useEffect } from 'react'; // Add useEffect
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Shield, Users, Star, ArrowRight, Search, Play, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import TestimonialCard from '@/components/TestimonialCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getAllProfiles } from '@/services/profileService'; // Import getAllProfiles

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredProfiles, setFeaturedProfiles] = useState([]); // State for profiles
  const [loading, setLoading] = useState(true); // Loading state

  // ... existing heroImages code ...
  const heroImages = [
    'https://images.unsplash.com/photo-1606800052052-a08af7148866', // Telugu wedding
    'https://images.unsplash.com/photo-1519741497674-611481863552', // Indian bride
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a', // South Indian wedding
    'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2', // Traditional ceremony
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ... existing useEffect loop ...
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ... audio useEffect ...
  React.useEffect(() => {
    const hasPlayed = sessionStorage.getItem('welcomeAudioPlayed');
    if (!hasPlayed) {
      // ... (audio logic remains same)
      const utterance = new SpeechSynthesisUtterance("Namaskaram! Merukulam Matrimony ki Swaagatham.");
      utterance.lang = 'te-IN'; // Telugu India
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const teluguVoice = voices.find(v => v.lang.includes('te'));
      if (teluguVoice) utterance.voice = teluguVoice;

      window.speechSynthesis.speak(utterance);
      sessionStorage.setItem('welcomeAudioPlayed', 'true');
    }
  }, []);

  // Fetch featured profiles from backend
  useEffect(() => {
    const fetchFeaturedProfiles = async () => {
      try {
        // Pass isFeatured=true to filter directly
        const response = await getAllProfiles({ isFeatured: true, limit: 6 });
        if (response.success && response.data.profiles) {
          setFeaturedProfiles(response.data.profiles);
        } else if (response.profiles) { // Case if structure differs
          setFeaturedProfiles(response.profiles);
        }
      } catch (error) {
        console.error("Failed to fetch featured profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProfiles();
  }, []);

  const [searchFilters, setSearchFilters] = useState({
    ageFrom: 21,
    ageTo: 35,
    salaryFrom: '',
    salaryTo: ''
  });

  // ... rest of component logic (video modals, features, testimonials) ...
  // Video player state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const weddingVideos = [
    {
      id: 1,
      title: "Arjun & Sneha",
      thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      duration: "3:45",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
      id: 2,
      title: "Karthik & Priya",
      thumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
      duration: "4:20",
      videoUrl: "https://www.w3schools.com/html/movie.mp4"
    },
    {
      id: 3,
      title: "Traditional Ceremony",
      thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      duration: "2:15",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
  ];

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const handleQuickSearch = () => {
    navigate('/browse');
  };

  const features = [
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'All profiles are thoroughly verified to ensure authenticity and safety'
    },
    {
      icon: Users,
      title: 'Merukulam Community',
      description: 'Connect with verified members from the Merukulam community'
    },
    {
      icon: Heart,
      title: 'Personalized Matching',
      description: 'Find compatible matches based on your preferences and values'
    },
    {
      icon: Star,
      title: 'Success Stories',
      description: 'Join hundreds of successful marriages made through our platform'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh & Priya',
      image: 'https://images.unsplash.com/photo-1606663889134-b1dedb5ed8b7?w=200',
      text: 'We found each other through Merukulam Matrimony. The platform made it easy to connect with our perfect match. Forever grateful!',
      rating: 5
    },
    {
      name: 'Vikram & Ananya',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200',
      text: 'Amazing experience! The verification process gave us confidence, and we found our soulmate within weeks.',
      rating: 5
    },
    {
      name: 'Karthik & Sneha',
      image: 'https://images.unsplash.com/photo-1591604466107-ec97de8a7e31?w=200',
      text: 'Best matrimony platform for our community. Professional, reliable, and truly cares about finding the right match.',
      rating: 5
    }
  ];

  const getFullImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300x400";
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <>
      <Helmet>
        <title>Merukulam Matrimony - Find Your Perfect Match</title>
        <meta name="description" content="India's most trusted Merukulam matrimony platform. Find your perfect life partner from verified profiles in the Merukulam community." />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-maroon-dark/80 to-gray-900">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gold rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-cream rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gold rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

          {/* Background Image Carousel with Overlay */}
          <div className="absolute inset-0">
            <motion.img
              key={currentImageIndex}
              src={heroImages[currentImageIndex]}
              alt="Traditional Telugu wedding ceremony"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Floating Decorative Elements */}
          <motion.div
            className="absolute top-1/4 left-10 text-gold/20"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="w-16 h-16" fill="currentColor" />
          </motion.div>
          <motion.div
            className="absolute bottom-1/4 right-10 text-gold/20"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Star className="w-20 h-20" fill="currentColor" />
          </motion.div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <span className="bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-gold/30">
                    ✨ India's Trusted Merukulam Platform
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
                >
                  Find Your
                  <span className="block bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent mt-2 animate-gradient">
                    Perfect Match
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-base sm:text-xl md:text-2xl text-cream/90 font-medium mb-8 leading-relaxed"
                >
                  Join thousands of verified Merukulam community members in their journey to find true love and lifelong companionship.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-6 mb-8"
                >
                  <div className="flex items-center gap-2 text-cream">
                    <Shield className="w-5 h-5 text-gold" />
                    <span className="text-sm font-medium">100% Verified Profiles</span>
                  </div>
                  <div className="flex items-center gap-2 text-cream">
                    <Users className="w-5 h-5 text-gold" />
                    <span className="text-sm font-medium">Trusted Community</span>
                  </div>
                  <div className="flex items-center gap-2 text-cream">
                    <Heart className="w-5 h-5 text-gold" />
                    <span className="text-sm font-medium">Success Stories</span>
                  </div>
                </motion.div>

                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <Link to="/register">
                      <Button className="bg-gradient-to-r from-gold to-yellow-500 text-maroon hover:from-yellow-500 hover:to-gold text-lg px-10 py-7 font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-gold/50">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to="/browse">
                      <Button variant="outline" className="border-2 border-white/80 text-white bg-white/10 hover:bg-white hover:text-maroon text-lg px-10 py-7 font-bold backdrop-blur-md transform hover:scale-105 transition-all duration-300">
                        Browse Profiles
                      </Button>
                    </Link>
                  </motion.div>
                )}

                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link to="/browse">
                      <Button className="bg-gradient-to-r from-gold to-yellow-500 text-maroon hover:from-yellow-500 hover:to-gold text-lg px-10 py-7 font-bold shadow-2xl transform hover:scale-105 transition-all duration-300">
                        Discover Matches
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>

              {/* Right Content - Stats Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:grid grid-cols-2 gap-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl"
                >
                  <div className="text-gold text-4xl font-bold mb-2">10,000+</div>
                  <div className="text-cream text-sm font-medium">Verified Profiles</div>
                  <div className="mt-3 flex items-center gap-2 text-gold/80">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Active Members</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl"
                >
                  <div className="text-gold text-4xl font-bold mb-2">500+</div>
                  <div className="text-cream text-sm font-medium">Success Stories</div>
                  <div className="mt-3 flex items-center gap-2 text-gold/80">
                    <Heart className="w-4 h-4" fill="currentColor" />
                    <span className="text-xs">Happy Couples</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl"
                >
                  <div className="text-gold text-4xl font-bold mb-2">100%</div>
                  <div className="text-cream text-sm font-medium">Verified Profiles</div>
                  <div className="mt-3 flex items-center gap-2 text-gold/80">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs">Secure & Safe</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl"
                >
                  <div className="text-gold text-4xl font-bold mb-2">24/7</div>
                  <div className="text-cream text-sm font-medium">Support Available</div>
                  <div className="mt-3 flex items-center gap-2 text-gold/80">
                    <Star className="w-4 h-4" fill="currentColor" />
                    <span className="text-xs">Always Here</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Mobile Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:hidden grid grid-cols-2 gap-4 mt-12"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                <div className="text-gold text-3xl font-bold">10K+</div>
                <div className="text-cream text-xs mt-1">Profiles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                <div className="text-gold text-3xl font-bold">500+</div>
                <div className="text-cream text-xs mt-1">Success</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                <div className="text-gold text-3xl font-bold">100%</div>
                <div className="text-cream text-xs mt-1">Verified</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                <div className="text-gold text-3xl font-bold">24/7</div>
                <div className="text-cream text-xs mt-1">Support</div>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </motion.div>
        </section>

        {/* Quick Search */}
        {isAuthenticated && (
          <section className="py-16 bg-gradient-to-b from-white to-cream">
            <div className="max-w-5xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl border-2 border-gold/30 p-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-maroon mb-2 flex items-center justify-center">
                    <Search className="h-8 w-8 mr-3 text-gold" />
                    Quick Search
                  </h2>
                  <p className="text-maroon/70 font-medium">
                    Find your perfect match with our quick filters
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Age */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-maroon">Age Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-maroon/70 mb-1">From</label>
                        <input type="number" min="18" max="60" value={searchFilters.ageFrom} onChange={(e) => setSearchFilters({ ...searchFilters, ageFrom: e.target.value })} className="w-full px-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon font-medium" placeholder="21" />
                      </div>
                      <div>
                        <label className="block text-xs text-maroon/70 mb-1">To</label>
                        <input type="number" min="18" max="60" value={searchFilters.ageTo} onChange={(e) => setSearchFilters({ ...searchFilters, ageTo: e.target.value })} className="w-full px-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon font-medium" placeholder="35" />
                      </div>
                    </div>
                  </div>
                  {/* Salary */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-maroon">Annual Income (₹)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-maroon/70 mb-1">From</label>
                        <select value={searchFilters.salaryFrom} onChange={(e) => setSearchFilters({ ...searchFilters, salaryFrom: e.target.value })} className="w-full px-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon font-medium">
                          <option value="">Any</option>
                          <option value="3">3 LPA</option>
                          <option value="5">5 LPA</option>
                          <option value="7">7 LPA</option>
                          <option value="10">10 LPA</option>
                          <option value="15">15 LPA</option>
                          <option value="20">20 LPA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-maroon/70 mb-1">To</label>
                        <select value={searchFilters.salaryTo} onChange={(e) => setSearchFilters({ ...searchFilters, salaryTo: e.target.value })} className="w-full px-4 py-3 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon font-medium">
                          <option value="">Any</option>
                          <option value="5">5 LPA</option>
                          <option value="7">7 LPA</option>
                          <option value="10">10 LPA</option>
                          <option value="15">15 LPA</option>
                          <option value="20">20 LPA</option>
                          <option value="25">25+ LPA</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button onClick={handleQuickSearch} className="bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon text-lg px-12 py-6 font-bold shadow-xl">
                    <Search className="mr-2 h-5 w-5" />
                    Search Profiles
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Featured Profiles Section */}
        <section className="py-20 bg-gradient-to-b from-cream to-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-maroon mb-4">Featured Profiles</h2>
              <p className="text-maroon/80 text-lg font-medium">
                Discover verified members from our community
              </p>
            </motion.div>

            <div className="relative">
              {featuredProfiles.length > 0 ? (
                /* Conditional rendering: Marquee for many profiles, Static centered for few */
                featuredProfiles.length > 4 ? (
                  <motion.div
                    className="flex gap-6"
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                      duration: featuredProfiles.length * 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ width: "fit-content" }}
                  >
                    {[...featuredProfiles, ...featuredProfiles].map((profile, index) => (
                      <Link key={`${profile.id}-${index}`} to={`/profile/${profile.id}`} className="flex-shrink-0">
                        <motion.div whileHover={{ scale: 1.05, y: -5 }} className="w-64 bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gold/20 hover:border-gold transition-all duration-300">
                          <div className="relative h-80 overflow-hidden">
                            <img
                              src={getFullImageUrl(profile.profile_photo || profile.profilePhoto)}
                              alt={`${profile.first_name || profile.firstName} ${profile.last_name || profile.lastName}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute top-4 right-4">
                              <div className="bg-gradient-to-r from-gold to-yellow-500 text-maroon px-4 py-2 rounded-full shadow-xl">
                                <span className="text-sm font-bold tracking-wide">
                                  {profile.matrimony_id || profile.matrimonyId || `MKM${String(profile.id).padStart(6, '0')}`}
                                </span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              <h3 className="text-xl font-bold mb-1">{profile.first_name || profile.firstName} {profile.last_name || profile.lastName}</h3>
                              <div className="flex items-center gap-3 text-sm">
                                <span>{profile.age} yrs</span>
                                <span>•</span>
                                <span>{profile.city || 'N/A'}</span>
                              </div>
                              <div className="mt-2 text-sm text-gold font-medium">{profile.education_level || profile.education || 'N/A'}</div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </motion.div>
                ) : (
                  /* Center only the unique profiles if count is low */
                  <div className="flex flex-wrap justify-center gap-6">
                    {featuredProfiles.map((profile) => (
                      <Link key={profile.id} to={`/profile/${profile.id}`}>
                        <motion.div whileHover={{ scale: 1.05, y: -5 }} className="w-64 bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gold/20 hover:border-gold transition-all duration-300">
                          <div className="relative h-80 overflow-hidden">
                            <img
                              src={getFullImageUrl(profile.profile_photo || profile.profilePhoto)}
                              alt={`${profile.first_name || profile.firstName} ${profile.last_name || profile.lastName}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute top-4 right-4">
                              <div className="bg-gradient-to-r from-gold to-yellow-500 text-maroon px-4 py-2 rounded-full shadow-xl">
                                <span className="text-sm font-bold tracking-wide">
                                  {profile.matrimony_id || profile.matrimonyId || `MKM${String(profile.id).padStart(6, '0')}`}
                                </span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              <h3 className="text-xl font-bold mb-1">{profile.first_name || profile.firstName} {profile.last_name || profile.lastName}</h3>
                              <div className="flex items-center gap-3 text-sm">
                                <span>{profile.age} yrs</span>
                                <span>•</span>
                                <span>{profile.city || 'N/A'}</span>
                              </div>
                              <div className="mt-2 text-sm text-gold font-medium">{profile.education_level || profile.education || 'N/A'}</div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center text-maroon/50 italic py-12">No featured profiles available currently.</div>
              )}
            </div>

            <div className="text-center mt-12">
              <Link to="/browse">
                <Button className="bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon px-8 py-6 text-lg font-bold">
                  View All Profiles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-cream to-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-maroon mb-4">Why Choose Us</h2>
              <p className="text-maroon/80 text-lg font-medium">
                India's most trusted matrimony platform for the Merukulam community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-b from-white to-cream">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-maroon mb-4">Success Stories</h2>
              <p className="text-maroon/80 text-lg font-medium">
                Hear from couples who found their perfect match through us
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TestimonialCard {...testimonial} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Happy Weddings Video Section */}
        <section className="py-20 bg-gradient-to-b from-white to-cream relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-maroon mb-4">Happy Weddings</h2>
              <p className="text-maroon/80 text-lg font-medium">
                Watch the beautiful moments of couples who found love here
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {weddingVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-white/50">
                        <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-maroon fill-maroon ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      {video.duration}
                    </div>
                  </div>

                  {/* Video Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-white font-bold text-lg">{video.title}</h3>
                    <p className="text-white/80 text-sm">Wedding Highlights</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" className="border-2 border-maroon text-maroon hover:bg-maroon hover:text-white px-8 py-3 font-bold transition-all">
                Watch More Stories
              </Button>
            </div>
          </div>
        </section>


        {/* CTA Section - Only for Non-Authenticated Users */}
        {!isAuthenticated && (
          <section className="py-20 bg-gradient-to-r from-maroon to-maroon-dark text-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-4 drop-shadow-md">Ready to Find Your Perfect Match?</h2>
                <p className="text-cream/90 text-lg font-medium mb-8 max-w-2xl mx-auto drop-shadow-sm">
                  Join thousands of verified profiles and start your journey towards a happy married life
                </p>
                <Link to="/register">
                  <Button className="bg-gold text-maroon hover:bg-gold/90 text-lg px-8 py-6 font-bold shadow-2xl border-2 border-transparent">
                    Get Started Today
                    <Heart className="ml-2 h-5 w-5 fill-maroon" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Video Player Modal */}
        {isVideoModalOpen && selectedVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeVideoModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeVideoModal}
                className="absolute -top-12 right-0 text-white hover:text-gold transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Video Title */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-white">{selectedVideo.title}</h3>
                <p className="text-white/80">Wedding Highlights</p>
              </div>

              {/* Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
                <video
                  className="w-full aspect-video"
                  controls
                  autoPlay
                  src={selectedVideo.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div className="mt-4 text-white/70 text-sm">
                <p>Duration: {selectedVideo.duration}</p>
              </div>
            </motion.div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
