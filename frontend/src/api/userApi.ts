import { useQuery, UseQueryResult } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';
import type { User } from '../store/useAuthStore';

// 기본 API URL
const API_BASE = '/api/v1';

// ── 타입 정의 ──────────────────────────────────────────
interface ApiErrorResponse {
  message?: string;
}

// 내 정보 조회 API 함수
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

// React Query 커스텀 훅: 내 정보 조회
export const useMe = (): UseQueryResult<User, Error> => {
  const token = useAuthStore((s) => s.token);

  return useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: () => fetchMe(token),
    enabled: !!token, // 토큰이 있을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분 캐싱
    retry: 1,
  });
};
