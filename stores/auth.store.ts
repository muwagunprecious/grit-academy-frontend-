import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  photo?: string;
  hasPaidAccessFee?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', data);
      const { user, accessToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try again.';
      set({ error: errMsg, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed, clearing local state anyway');
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  },

  checkAuth: async () => {
    // If no access token is stored, we don't need to request
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return null;
    }

    set({ isLoading: true });
    try {
      const response = await api.get('/users/me');
      const { user } = response.data.data;
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      // Access token was invalid or expired, interceptor will attempt refresh.
      // If it also fails, we clear state.
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },
}));
