import axios from 'axios';

const api = axios.create({
  baseURL: '/api'  // This is correct - proxy will handle it
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;