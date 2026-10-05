import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface UserAuthData {
  accessToken: string;
  refreshToken: string;
  role: 'ADMIN' | 'LAWYER' | 'CLIENT';
  username: string;
  userId: number;
  name: string;
}

export const saveAuthData = (data: UserAuthData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
    localStorage.setItem('userId', data.userId.toString());
    localStorage.setItem('name', data.name);
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
};

export const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;
  return {
    accessToken: localStorage.getItem('accessToken'),
    role: localStorage.getItem('role'),
    username: localStorage.getItem('username'),
    userId: localStorage.getItem('userId'),
    name: localStorage.getItem('name'),
  };
};
