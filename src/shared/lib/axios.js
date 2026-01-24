import axios from 'axios';

// Create generic Axios instance
// In the future, baseURL will come from env vars
export const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '', // Empty for now, acts relative or mock
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor
httpClient.interceptors.request.use(
    (config) => {
        // Basic Auth Token Logic (Placeholder)
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
httpClient.interceptors.response.use(
    (response) => {
        return response.data; // Unwrap data directly
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';

        // Global 401 handling
        if (error.response?.status === 401) {
            // Dispatch logout action or widespread event
            console.warn('Unauthorized - redirecting to login...');
            // window.location.href = '/login'; // distinct from React Router, use carefully
        }

        // Normalize error object
        const normalizedError = {
            message,
            status: error.response?.status,
            originalError: error,
        };

        return Promise.reject(normalizedError);
    }
);
