import api from './api';

// Register new user
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);

    // Store token and user data
    if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }

    return response;
};

// Login user
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    // Store token and user data
    if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }

    return response;
};

// Admin login
export const adminLogin = async (email, password) => {
    const response = await api.post('/auth/admin-login', { email, password });

    // Store token and user data
    if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }

    return response;
};

// Get current user
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');

    // Update stored user data
    if (response.success && response.data) {
        localStorage.setItem('currentUser', JSON.stringify(response.data));
    }

    return response;
};

// Logout
export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } finally {
        // Clear local storage regardless of API response
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};

// Get stored user data
export const getStoredUser = () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
};

// Update user profile
export const updateProfile = async (profileId, profileData) => {
    const response = await api.put(`/profiles/${profileId}`, profileData);

    // Update stored user data if successful
    if (response.success && response.data) {
        const currentUser = getStoredUser();
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    return response;
};
