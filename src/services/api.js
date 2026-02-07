import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle specific error cases
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 401) {
                // Ignore 401s from login/register endpoints to allow UI to show error messages
                const originalRequestUrl = error.config?.url || '';
                console.log('401 Intercepted. URL:', originalRequestUrl); // Debug log

                const isLoginRequest = originalRequestUrl.includes('/auth/login') ||
                    originalRequestUrl.includes('/auth/admin-login') ||
                    originalRequestUrl.includes('/auth/register');

                console.log('Is Login Request?', isLoginRequest); // Debug log

                if (!isLoginRequest) {
                    console.warn('Redirecting to login due to 401');
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    window.location.href = '/login';
                }
            }

            if (status === 403) {
                // Forbidden
                console.error('Access denied:', data.message);
            }

            // Return error data from server (including detailed messages/codes)
            return Promise.reject(data || { message: 'An error occurred' });
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject('No response from server. Please check your connection.');
        } else {
            // Error in request setup
            return Promise.reject(error.message || 'Request failed');
        }
    }
);

export default api;
