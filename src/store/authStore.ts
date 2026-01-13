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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (emailOrUsername: string, password: string) => {
        // Simulate login - check localStorage for registered users
        const usersJson = localStorage.getItem('registered_users');
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];

        const user = users.find(
          (u) =>
            (u.email === emailOrUsername || u.username === emailOrUsername)
        );

        if (user) {
          // In production, verify password hash here
          set({ user, isAuthenticated: true });
          return true;
        }

        return false;
      },

      signup: async (email: string, username: string, password: string) => {
        // Simulate signup - store user in localStorage
        const usersJson = localStorage.getItem('registered_users');
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];

        // Check if email or username already exists
        const exists = users.some(
          (u) => u.email === email || u.username === username
        );

        if (exists) {
          return false;
        }

        const newUser: User = {
          id: Date.now().toString(),
          email,
          username,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem('registered_users', JSON.stringify(users));

        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
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
