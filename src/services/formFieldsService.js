// Service for managing form field options via API
import api from './api';

// Get all form field options
export const getAllFormFieldOptions = async () => {
    try {
        const response = await api.get('/form-fields');
        return response;
    } catch (error) {
        console.error('Error fetching form field options:', error);
        throw error;
    }
};

// Get options for a specific field
export const getFieldOptions = async (fieldName) => {
    try {
        const response = await api.get(`/form-fields/${fieldName}`);
        return response;
    } catch (error) {
        console.error(`Error fetching options for ${fieldName}:`, error);
        throw error;
    }
};

// Add new field option (admin only)
export const addFieldOption = async (fieldName, optionValue, optionLabel) => {
    try {
        const response = await api.post('/form-fields', {
            fieldName,
            optionValue,
            optionLabel
        });
        return response;
    } catch (error) {
        console.error('Error adding field option:', error);
        throw error;
    }
};

// Update field option (admin only)
export const updateFieldOption = async (id, optionLabel) => {
    try {
        const response = await api.put(`/form-fields/${id}`, {
            optionLabel
        });
        return response;
    } catch (error) {
        console.error('Error updating field option:', error);
        throw error;
    }
};

// Delete field option (admin only)
export const deleteFieldOption = async (id) => {
    try {
        const response = await api.delete(`/form-fields/${id}`);
        return response;
    } catch (error) {
        console.error('Error deleting field option:', error);
        throw error;
    }
};
