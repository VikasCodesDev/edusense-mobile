/** EduSense client for the existing backend. The mobile bundle contains no credentials. */

import axios from 'axios';
import { clearAuthSession, readSessionValue } from '@/lib/sessionStorage';
import { ApiConfigurationError, getApiBaseUrl } from '@/lib/apiConfig';

const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const base = await getApiBaseUrl();
  if (!base) {
    throw new ApiConfigurationError('EduSense backend is not configured. Open Settings → Backend connection to add its HTTPS API URL.');
  }
  config.baseURL = base;

  const token = await readSessionValue('edusense_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = String(error.config?.url || '');
    const isAuthRequest = /\/auth\/(login|register)(\?|$)/.test(url);
    if (error.response?.status === 401 && !isAuthRequest && typeof window !== 'undefined') {
      try {
        await clearAuthSession();
      } finally {
        window.dispatchEvent(new CustomEvent('edusense:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
