import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Normalize: ensure it ends with /api (without duplicate //api)
const normalizedBase = rawBaseURL.replace(/\/+$/, '');
const baseURL = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;

// Single configured axios instance the whole app shares.
const axiosClient = axios.create({
  baseURL,
});

// Attach the stored JWT, if any, to every outgoing request.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
