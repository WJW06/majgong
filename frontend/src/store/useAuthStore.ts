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

  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// Global state for logged-in user (Zustand + localStorage persistence)
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setAuth: (user) => set({ user }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: 'majgong-auth', // localStorage key
    }
  )
);

export default useAuthStore;
