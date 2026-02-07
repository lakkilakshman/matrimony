import api from './api';

// Get notification history
export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response;
};

// Mark as read
export const markAsRead = async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response;
};

// Mark all as read
export const markAllAsRead = async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response;
};

// Delete
export const deleteNotification = async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response;
};
