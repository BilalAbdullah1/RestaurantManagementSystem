import axios from 'axios';
import { getToken, logout } from './authUtils';
import { getApiBaseUrl } from './apiConfig';
import { loadingManager } from './loadingManager';

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// ── REQUEST INTERCEPTOR ────────────────────────────────────────────────────────
// Har request bhejne se pehle:
// 1. Start global top progress loader
// 2. Token attach karo Authorization header mein
api.interceptors.request.use(
  (config) => {
    loadingManager.startLoading();

    const token = getToken();

    // Attach token if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    loadingManager.stopLoading();
    return Promise.reject(error);
  }
);

// ── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────────
// Har response receive karne ke baad:
// 1. Stop global top progress loader
// 2. 401 = Server ne bhi token reject kar diya → logout karo
api.interceptors.response.use(
  (response) => {
    loadingManager.stopLoading();
    return response;
  },
  (error) => {
    loadingManager.stopLoading();

    // Cancelled requests (from our own request interceptor) silently ignore karo
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    if (status === 401 && !error?.config?.url?.includes('/login')) {
      // Server ne bhi unauthorized bola — token invalid ya expired hai
      logout('expired');
    }

    // Baaki sab errors ko as-is pass karo components ko handle karne ke liye
    return Promise.reject(error);
  }
);

export default api;
