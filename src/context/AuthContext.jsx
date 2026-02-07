
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '@/services/authService';
import { mapProfileFields } from '@/utils/profileUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = authService.getStoredUser();

        if (token && storedUser) {
          const userData = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;

          // Optimistically set user from local storage first
          setCurrentUser(mapProfileFields(userData));
          setIsAuthenticated(true);

          try {
            // Verify with backend
            const response = await authService.getCurrentUser();
            if (response.success) {
              // Update with fresh data
              setCurrentUser(mapProfileFields(response.data));
            } else {
              console.warn('Session verification failed, but keeping local session for resilience');
            }
          } catch (error) {
            console.error('Session verification error:', error);
            // Do NOT logout on generic errors to prevent logout on reload if backend is flaky
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();

      if (response.success && response.data) {
        const userData = response.data;
        const mappedUser = mapProfileFields(userData);
        setCurrentUser(mappedUser);
        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
        return { success: true, user: mappedUser };
      }
      return { success: false };
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false, error };
    }
  };

  const login = async (email, password, isAdmin = false) => {
    try {
      const response = isAdmin
        ? await authService.adminLogin(email, password)
        : await authService.login(email, password);

      if (response.success) {
        setCurrentUser(mapProfileFields(response.data.user));
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);

      if (response.success) {
        setCurrentUser(mapProfileFields(response.data.user));
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Direct login method for demo/admin purposes
  const loginDirect = (userData, token) => {
    setCurrentUser(mapProfileFields(userData));
    setIsAuthenticated(true);
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const updateProfile = async (updatedData) => {
    try {
      // Get profile ID from current user
      const profileId = currentUser?.profile?.id || currentUser?.profile_id || currentUser?.id;

      if (!profileId) {
        return { success: false, message: 'Profile ID not found' };
      }

      // Map frontend field names to backend field names
      const backendData = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        age: updatedData.age, // Added age
        dateOfBirth: updatedData.dateOfBirth,
        maritalStatus: updatedData.maritalStatus,
        height: updatedData.height,
        weight: updatedData.weight,
        complexion: updatedData.complexion,
        bio: updatedData.bio,
        // Location
        permanentAddress: updatedData.permanentAddress,
        city: updatedData.city,
        state: updatedData.state,
        // Professional
        occupation: updatedData.occupation,
        companyName: updatedData.company,
        annualIncome: updatedData.annualIncome,
        // Education
        educationLevel: updatedData.education, // Mapped education to educationLevel
        // Family
        fatherOccupation: updatedData.fatherOccupation,
        motherOccupation: updatedData.motherOccupation,
        brothers: updatedData.brothers,
        sisters: updatedData.sisters,
        // Astrology
        raasi: updatedData.raasi,
        star: updatedData.star,
        birthTime: updatedData.birthTime,
        birthPlace: updatedData.birthPlace
      };

      // Call backend API
      const response = await authService.updateProfile(profileId, backendData);

      if (response.success) {
        // Update local state with the merged data
        const updatedUser = mapProfileFields({ ...currentUser, ...updatedData });
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return { success: true };
      }

      return { success: false, message: response.message || 'Failed to update profile' };
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.message || error.error || (typeof error === 'string' ? error : 'Failed to update profile');
      return { success: false, message: errorMessage };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    loginDirect,
    register,
    logout,
    updateProfile,
    refreshCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
