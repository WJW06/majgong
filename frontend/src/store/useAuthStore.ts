import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Type Definition ──────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  grade: string;
  totalScore: number;
}

interface AuthState {
  user: User | null;      // Logged-in user information
  token: string | null;   // JWT access token

  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// Global state for logged-in user (Zustand + localStorage persistence)
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: 'majgong-auth', // localStorage key
    }
  )
);

export default useAuthStore;
