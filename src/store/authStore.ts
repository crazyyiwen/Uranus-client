import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;

  // Actions
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getCurrentUser: () => User | null;
  getToken: () => string | null;
}

const API_BASE_URL = 'http://localhost:3316';

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,
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

          // Store token in memory only (no localStorage)
          const token = data.token || null;

          set({ user, isAuthenticated: true, token });
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

          // Store token in memory only (no localStorage)
          const token = data.token || null;

          set({ user, isAuthenticated: true, token });
          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },

  logout: () => {
    set({ user: null, isAuthenticated: false, token: null });
  },

  getCurrentUser: () => {
    return get().user;
  },

  getToken: () => {
    return get().token;
  },
}));
