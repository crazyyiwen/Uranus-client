import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getCurrentUser: () => User | null;
}

const API_BASE_URL = 'http://localhost:3316';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (emailOrUsername: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: emailOrUsername,
              password,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Login failed:', error);
            return false;
          }

          const data = await response.json();

          // Assuming backend returns user data
          const user: User = {
            id: data.id || data._id || Date.now().toString(),
            email: data.email || '',
            username: data.username || emailOrUsername,
            createdAt: data.createdAt || new Date().toISOString(),
          };

          // Store token if returned by backend
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }

          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      signup: async (email: string, username: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username,
              email,
              password,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Signup failed:', error);
            return false;
          }

          const data = await response.json();

          const user: User = {
            id: data.id || data._id || Date.now().toString(),
            email: data.email || email,
            username: data.username || username,
            createdAt: data.createdAt || new Date().toISOString(),
          };

          // Store token if returned by backend
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }

          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },

      logout: () => {
        // Remove token from localStorage
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false });
      },

      getCurrentUser: () => {
        return get().user;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
