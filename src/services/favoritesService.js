import api from './api';

// Get favorites
export const getFavorites = async () => {
    const response = await api.get('/favorites');
    return response;
};

// Add to favorites
export const addToFavorites = async (profileId) => {
    const response = await api.post(`/favorites/${profileId}`);
    return response;
};

// Remove from favorites
export const removeFromFavorites = async (profileId) => {
    const response = await api.delete(`/favorites/${profileId}`);
    return response;
};

// Check if profile is favorited
export const checkFavorite = async (profileId) => {
    const response = await api.get(`/favorites/${profileId}/check`);
    return response;
};
