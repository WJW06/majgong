import { useQuery, UseQueryResult } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';
import type { User } from '../store/useAuthStore';

const API_BASE = '/api/v1';

// ── Type Definition ──────────────────────────────────────────
interface ApiErrorResponse {
  message?: string;
}

// My Information Lookup API Function
export const fetchMe = async (token: string | null): Promise<User> => {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err: ApiErrorResponse = await res.json().catch(() => ({}));
    throw new Error(err.message || '유저 정보를 불러오지 못했습니다.');
  }

  return res.json() as Promise<User>;
};

// React Query custom hook: Lookup my information
export const useMe = (): UseQueryResult<User, Error> => {
  const token = useAuthStore((s) => s.token);

  return useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: () => fetchMe(token),
    enabled: !!token, // Execute only when a token exists
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
