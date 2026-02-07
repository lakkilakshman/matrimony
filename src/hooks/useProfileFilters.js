
import { useState, useMemo } from 'react';

export const useProfileFilters = (profiles, userGender) => {
  const [filters, setFilters] = useState({
    searchName: '',
    ageRange: [18, 50],
    heightRange: ['4.6', '6.3'],
    occupation: '',
    location: '',
    education: '',
    income: '',
    maritalStatus: ''
  });

  const updateFilter = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      searchName: '',
      ageRange: [18, 50],
      heightRange: ['4.6', '6.3'],
      occupation: '',
      location: '',
      education: '',
      income: '',
      maritalStatus: ''
    });
  };

  const filteredProfiles = useMemo(() => {
    let result = profiles;

    // Gender-based filtering (males see females, females see males)
    if (userGender) {
      const oppositeGender = userGender === 'male' ? 'female' : 'male';
      result = result.filter(profile => profile.gender === oppositeGender);
    }

    // Caste filtering (only Merukulam)
    result = result.filter(profile => profile.caste === 'Merukulam');

    // Status filtering (only active profiles)
    result = result.filter(profile => profile.status === 'active');

    // Search by name
    if (filters.searchName) {
      const searchLower = filters.searchName.toLowerCase();
      result = result.filter(profile => 
        `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(searchLower)
      );
    }

    // Age range filter
    result = result.filter(profile => 
      profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1]
    );

    // Height range filter
    const minHeight = parseFloat(filters.heightRange[0]);
    const maxHeight = parseFloat(filters.heightRange[1]);
    result = result.filter(profile => {
      const profileHeight = parseFloat(profile.height);
      return profileHeight >= minHeight && profileHeight <= maxHeight;
    });

    // Occupation filter
    if (filters.occupation) {
      result = result.filter(profile => profile.occupation === filters.occupation);
    }

    // Location filter
    if (filters.location) {
      result = result.filter(profile => profile.location === filters.location);
    }

    // Education filter
    if (filters.education) {
      result = result.filter(profile => profile.education === filters.education);
    }

    // Income filter
    if (filters.income) {
      result = result.filter(profile => profile.annualIncome === filters.income);
    }

    // Marital status filter
    if (filters.maritalStatus) {
      result = result.filter(profile => profile.maritalStatus === filters.maritalStatus);
    }

    return result;
  }, [profiles, userGender, filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredProfiles,
    resultCount: filteredProfiles.length
  };
};
