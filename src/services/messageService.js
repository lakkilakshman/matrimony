import api from './api';

// Send a message
export const sendMessage = async (receiverId, message) => {
    const response = await api.post('/messages', { receiverId, message });
    return response;
};

// Get all conversations
export const getConversations = async () => {
    const response = await api.get('/messages/conversations');
    return response;
};

// Get messages for a specific user
export const getMessages = async (otherUserId) => {
    const response = await api.get(`/messages/${otherUserId}`);
    return response;
};
