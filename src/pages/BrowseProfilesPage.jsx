
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Filter, RotateCcw, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getAllProfiles, searchProfiles } from '@/services/profileService';
import { mapProfileFields } from '@/utils/profileUtils';
import {
  educationOptions,
  occupationOptions,
  incomeOptions,
  locationOptions,
  maritalStatusOptions
} from '@/data/dropdownOptions';

const BrowseProfilesPage = () => {
  const { currentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    ageFrom: 18,
    ageTo: 50,
    education: '',
    occupation: '',
    location: '',
    income: '',
    maritalStatus: ''
  });

  useEffect(() => {
    fetchProfiles();
  }, [currentUser]);

  const fetchProfiles = async (page = 1) => {
    setLoading(true);
    try {
      // Determine gender filter (show opposite gender)
      let gender = null;
      if (currentUser?.gender) {
        gender = currentUser.gender === 'male' ? 'female' : 'male';
      }

      const response = await getAllProfiles(page, 12, gender);
      if (response.success) {
        setProfiles(response.data.profiles);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch profiles');
      }
    } catch (err) {
      console.error('Fetch profiles error:', err);
      setError('An error occurred while fetching profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const searchFilters = {
        ...filters,
        gender: currentUser?.gender === 'male' ? 'female' : 'male',
        city: filters.location,
        page: 1,
        limit: 100 // Fetch more for browsing
      };

      // Remove empty values
      Object.keys(searchFilters).forEach(key => {
        if (searchFilters[key] === '') delete searchFilters[key];
      });

      const response = await searchProfiles(searchFilters);
      if (response.success) {
        setProfiles(response.data.profiles);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-run search when filters change (with debounce or manual apply button)
  // For now, let's keep frontend filtering if we have all data, 
  // but since we want it "correctly according to backend", we fetch from API.

  useEffect(() => {
    // If any filter is set, use search API
    const hasFilters = Object.values(filters).some(v => v !== '' && v !== 18 && v !== 50) || searchQuery !== '';
    if (hasFilters) {
      const timer = setTimeout(() => {
        handleApplyFilters();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchProfiles();
    }
  }, [filters, searchQuery]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      ageFrom: 18,
      ageTo: 50,
      education: '',
      occupation: '',
      location: '',
      income: '',
      maritalStatus: ''
    });
  };

  // No need for frontend filtering as we use API
  const filteredProfiles = profiles;

  return (
    <>
      <Helmet>
        <title>All Profiles - Merukulam Matrimony</title>
        <meta name="description" content="Browse through verified profiles in the Merukulam community" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        <Navbar />

        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-maroon mb-4">
                All Profiles
              </h1>
              <p className="text-maroon/70 text-lg">
                Find your perfect match from our verified Merukulam community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Panel */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-xl border-2 border-gold/20 p-6 sticky top-20">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-maroon flex items-center">
                      <Filter className="h-5 w-5 mr-2 text-gold" />
                      Filters
                    </h2>
                    <Button
                      onClick={resetFilters}
                      variant="ghost"
                      size="sm"
                      className="text-maroon hover:text-gold"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Search by Name */}
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">
                        Search by Name
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon text-sm"
                        placeholder="Enter name..."
                      />
                    </div>

                    {/* Age Range */}
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">
                        Age Range: {filters.ageFrom} - {filters.ageTo}
                      </label>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="18"
                          max="50"
                          value={filters.ageFrom}
                          onChange={(e) => updateFilter('ageFrom', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <input
                          type="range"
                          min="18"
                          max="50"
                          value={filters.ageTo}
                          onChange={(e) => updateFilter('ageTo', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">
                        Education
                      </label>
                      <select
                        value={filters.education}
                        onChange={(e) => updateFilter('education', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon text-sm"
                      >
                        <option value="">Any</option>
                        {educationOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Occupation */}
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">
                        Occupation
                      </label>
                      <select
                        value={filters.occupation}
                        onChange={(e) => updateFilter('occupation', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon text-sm"
                      >
                        <option value="">Any</option>
                        {occupationOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">
                        Location
                      </label>
                      <select
                        value={filters.location}
                        onChange={(e) => updateFilter('location', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon text-sm"
                      >
                        <option value="">Any</option>
                        {locationOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Income */}
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">
                        Annual Income
                      </label>
                      <select
                        value={filters.income}
                        onChange={(e) => updateFilter('income', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon text-sm"
                      >
                        <option value="">Any</option>
                        {incomeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Marital Status */}
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">
                        Marital Status
                      </label>
                      <select
                        value={filters.maritalStatus}
                        onChange={(e) => updateFilter('maritalStatus', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon text-sm"
                      >
                        <option value="">Any</option>
                        {maritalStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Results */}
              <div className="lg:col-span-3">
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-maroon/70 text-lg">
                    Found {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Profile Grid */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 text-maroon animate-spin mb-4" />
                    <p className="text-maroon/70">Loading profiles...</p>
                  </div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {filteredProfiles.map((profile, index) => (
                        <motion.div
                          key={profile.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ProfileCard profile={mapProfileFields(profile)} />
                        </motion.div>
                      ))}
                    </motion.div>

                    {filteredProfiles.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-maroon/70 text-lg">No profiles found matching your filters</p>
                        <Button
                          onClick={resetFilters}
                          className="mt-4 bg-gradient-to-r from-maroon to-maroon-dark text-white hover:from-maroon-dark hover:to-maroon"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BrowseProfilesPage;
