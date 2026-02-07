import api from './api';

// Get dashboard stats
export const getDashboardStats = async () => {
    return await api.get('/admin/stats');
};

// Get all users (profiles)
export const getAllUsers = async (page = 1, limit = 20) => {
    return await api.get(`/admin/users?page=${page}&limit=${limit}`);
};

// Update user status
export const updateUserStatus = async (userId, status) => {
    return await api.put(`/admin/users/${userId}/status`, { status });
};

// Get pending verifications
export const getPendingVerifications = async () => {
    return await api.get('/admin/pending-verifications');
};

// Verify profile
export const verifyProfile = async (profileId, status, remarks) => {
    return await api.put(`/admin/profiles/${profileId}/verify`, { status, remarks });
};

// Get admin logs
export const getAdminLogs = async (page = 1, limit = 50) => {
    return await api.get(`/admin/logs?page=${page}&limit=${limit}`);
};

// Update user profile (Admin)
export const updateUserProfile = async (userId, profileData) => {
    return await api.put(`/admin/users/${userId}/profile`, profileData);
};

// Create user profile (Admin)
export const createUserProfile = async (profileData) => {
    return await api.post('/admin/users/create', profileData);
};
