import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── 타입 정의 ──────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  grade: string;
  totalScore: number;
}

interface AuthState {
  user: User | null;      // 로그인 유저 정보
  token: string | null;   // JWT 액세스 토큰

  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// 로그인 유저 전역 상태 (Zustand + localStorage 영속화)
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
      name: 'majgong-auth', // localStorage 키
    }
  )
);

export default useAuthStore;
