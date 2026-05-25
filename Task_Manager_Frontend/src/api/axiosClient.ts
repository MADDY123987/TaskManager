import axios from 'axios';
import { getStoredToken, tokenStorage } from '../utils/storage';

function getApiBaseUrl() {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) {
    throw new Error('VITE_API_URL is required. Set it to the deployed backend base URL.');
  }

  return apiUrl.replace(/\/+$/, '');
}

export const API_BASE_URL = getApiBaseUrl();

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Received 401 Unauthorized - clearing stored token and triggering logout');
      tokenStorage.clear();
      // Dispatch logout event so auth context can update
      window.dispatchEvent(new Event('auth:logout'));
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
