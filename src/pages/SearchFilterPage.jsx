
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Filter as FilterIcon, RotateCcw, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useFormFieldOptions } from '@/hooks/useFormFieldOptions';
import { getAllProfiles, searchProfiles } from '@/services/profileService';
import { mapProfileFields } from '@/utils/profileUtils';

const SearchFilterPage = () => {
  const { currentUser } = useAuth();
  const { options, loading: optionsLoading } = useFormFieldOptions();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultCount, setResultCount] = useState(0);

  const [filters, setFilters] = useState({
    searchName: '',
    ageRange: [18, 50],
    education: '',
    occupation: '',
    location: '',
    income: '',
    maritalStatus: ''
  });

  useEffect(() => {
    fetchInitialProfiles();
  }, [currentUser]);

  const fetchInitialProfiles = async () => {
    setLoading(true);
    try {
      let gender = null;
      if (currentUser?.gender) {
        gender = currentUser.gender === 'male' ? 'female' : 'male';
      }
      const response = await getAllProfiles(1, 100, gender);
      if (response.success) {
        setProfiles(response.data.profiles);
        setResultCount(response.data.pagination.total);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const searchFilters = {
        gender: currentUser?.gender === 'male' ? 'female' : 'male',
        ageFrom: filters.ageRange[0],
        ageTo: filters.ageRange[1],
        education: filters.education,
        occupation: filters.occupation,
        city: filters.location,
        income: filters.income,
        maritalStatus: filters.maritalStatus,
        firstName: filters.searchName, // Add name search support if backend supports it
        page: 1,
        limit: 100
      };

      // Remove empty values
      Object.keys(searchFilters).forEach(key => {
        if (searchFilters[key] === '' || searchFilters[key] === null) delete searchFilters[key];
      });

      const response = await searchProfiles(searchFilters);
      if (response.success) {
        setProfiles(response.data.profiles);
        setResultCount(response.data.profiles.length);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasFilters = Object.values(filters).some(v => v !== '' && v !== null && (Array.isArray(v) ? (v[0] !== 18 || v[1] !== 50) : true));
    if (hasFilters) {
      const timer = setTimeout(() => handleApplyFilters(), 500);
      return () => clearTimeout(timer);
    } else {
      fetchInitialProfiles();
    }
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchName: '',
      ageRange: [18, 50],
      education: '',
      occupation: '',
      location: '',
      income: '',
      maritalStatus: ''
    });
  };

  const filteredProfiles = profiles;

  return (
    <>
      <Helmet>
        <title>Search & Filter - Merukulam Matrimony</title>
        <meta name="description" content="Use advanced filters to find your perfect match" />
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
                <FilterIcon className="inline h-10 w-10 mr-3 text-gold" />
                Advanced Search
              </h1>
              <p className="text-maroon/70 text-lg">
                Use filters to refine your search and find the perfect match
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
                    <h2 className="text-xl font-semibold text-maroon">Filters</h2>
                    <Button
                      onClick={resetFilters}
                      variant="ghost"
                      size="sm"
                      className="text-maroon hover:text-gold"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
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
                        value={filters.searchName}
                        onChange={(e) => updateFilter('searchName', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-maroon text-sm"
                        placeholder="Enter name..."
                      />
                    </div>

                    {/* Age Range */}
                    <div>
                      <label className="block text-sm font-medium text-maroon mb-2">
                        Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
                      </label>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="18"
                          max="50"
                          value={filters.ageRange[0]}
                          onChange={(e) => updateFilter('ageRange', [parseInt(e.target.value), filters.ageRange[1]])}
                          className="w-full"
                        />
                        <input
                          type="range"
                          min="18"
                          max="50"
                          value={filters.ageRange[1]}
                          onChange={(e) => updateFilter('ageRange', [filters.ageRange[0], parseInt(e.target.value)])}
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
                        disabled={loading}
                      >
                        <option value="">Any</option>
                        {options.education?.map(option => (
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
                        disabled={loading}
                      >
                        <option value="">Any</option>
                        {options.occupation?.map(option => (
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
                        disabled={loading}
                      >
                        <option value="">Any</option>
                        {options.location?.map(option => (
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
                        disabled={loading}
                      >
                        <option value="">Any</option>
                        {options.annualIncome?.map(option => (
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
                        disabled={loading}
                      >
                        <option value="">Any</option>
                        {options.maritalStatus?.map(option => (
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
                    Found {resultCount} profile{resultCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Profile Grid */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-maroon">
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <p className="font-medium">Searching profiles...</p>
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
                        <p className="text-maroon/70 text-lg">No profiles match your filters</p>
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

export default SearchFilterPage;
