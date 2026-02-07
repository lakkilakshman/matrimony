import api from './api';

// Get all profiles with pagination
export const getAllProfiles = async (page = 1, limit = 12, gender = null) => {
    const params = { page, limit };
    if (gender) params.gender = gender;

    const response = await api.get('/profiles', { params });
    return response;
};

// Get single profile by ID
export const getProfileById = async (id) => {
    const response = await api.get(`/profiles/${id}`);
    return response;
};

// Update profile
export const updateProfile = async (id, profileData) => {
    const response = await api.put(`/profiles/${id}`, profileData);
    return response;
};

// Search profiles with filters
export const searchProfiles = async (filters) => {
    const response = await api.get('/profiles/search', { params: filters });
    return response;
};

// Upload profile photo
export const uploadProfilePhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/profiles/upload-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response;
};
