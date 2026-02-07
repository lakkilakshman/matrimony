import api from './api';

// Get sent interests
export const getSentInterests = async () => {
    const response = await api.get('/interests/sent');
    return response;
};

// Get received interests
export const getReceivedInterests = async () => {
    const response = await api.get('/interests/received');
    return response;
};

// Send interest
export const sendInterest = async (profileId, message = '') => {
    const response = await api.post(`/interests/${profileId}`, { message });
    return response;
};

// Accept interest
export const acceptInterest = async (interestId) => {
    const response = await api.put(`/interests/${interestId}/accept`);
    return response;
};

// Reject interest
export const rejectInterest = async (interestId) => {
    const response = await api.put(`/interests/${interestId}/reject`);
    return response;
};
