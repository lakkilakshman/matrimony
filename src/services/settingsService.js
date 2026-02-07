import api from './api';

// Get all system settings
export const getSettings = async () => {
    return await api.get('/admin/settings');
};

// Update system settings
export const updateSettings = async (settingsData) => {
    return await api.put('/admin/settings', settingsData);
};
