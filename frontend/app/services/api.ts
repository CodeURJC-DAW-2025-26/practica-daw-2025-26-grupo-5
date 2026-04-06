import axios from 'axios';

const api = axios.create({
    baseURL: window.location.origin + '/api',
    withCredentials: true,
});

export default api;
