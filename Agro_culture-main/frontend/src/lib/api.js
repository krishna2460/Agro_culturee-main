import axios from 'axios';

const defaultBaseUrl = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`
  : 'http://localhost:5000';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;