import axios from 'axios';

const API_URL = 'http://localhost:5180/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(credentials: any) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  async signup(data: any) {
    return api.post('/auth/signup', data);
  },
  async forgotPassword(data: any) {
    return api.post('/auth/forgot-password', data);
  },
  logout() {
    localStorage.removeItem('token');
  },
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default api;
