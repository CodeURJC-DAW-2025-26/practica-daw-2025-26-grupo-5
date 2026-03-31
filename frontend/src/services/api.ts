import axios from 'axios';
import { useLoadingStore } from '../store/useLoadingStore'; // Import the store

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

// REQUEST INTERCEPTOR: Start spinner
api.interceptors.request.use((config) => {
    useLoadingStore.getState().setLoading(true); // Turn ON
    return config;
});

// RESPONSE INTERCEPTOR: Stop spinner
api.interceptors.response.use(
    (response) => {
        useLoadingStore.getState().setLoading(false); // Turn OFF
        return response;
    },
    (error) => {
        useLoadingStore.getState().setLoading(false); // Turn OFF on error too
        return Promise.reject(error);
    }
);

export default api;
