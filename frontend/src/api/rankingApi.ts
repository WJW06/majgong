import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';

const API_BASE = '/api/v1';

/** true이면 백엔드 대신 mock 데이터를 사용 */
const USE_MOCK = true;

// ── 타입 정의 ──────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  userId: number;
  name: string;
  grade: string;       // '입문' | '초급' | '중급' | '고급' | '마스터' | '전설'
  totalScore: number;
}

// ── Mock 데이터 ────────────────────────────────────────

const MOCK_RANKING: RankingEntry[] = [
  { rank: 1,  userId: 1,  name: '위재우', grade: '전설',    totalScore: 7777 },
  { rank: 2,  userId: 2,  name: '신우진', grade: '전설',    totalScore: 1256 },
  { rank: 3,  userId: 3,  name: '이지성', grade: '마스터',  totalScore:  879 },
  { rank: 4,  userId: 4,  name: '김민찬', grade: '마스터',  totalScore:  666 },
  { rank: 5,  userId: 5,  name: '박정호', grade: '고급',    totalScore:  444 },
  { rank: 6,  userId: 6,  name: '장수완', grade: '고급',    totalScore:  303 },
  { rank: 7,  userId: 7,  name: '김민수', grade: '중급',    totalScore:  170 },
  { rank: 8,  userId: 8,  name: '송지민', grade: '초급',    totalScore:   50 },
  { rank: 9,  userId: 9,  name: '한지원', grade: '입문',    totalScore:   20 },
  { rank: 10, userId: 10, name: '우엉이', grade: '입문',    totalScore:    0 },
];

// ── API 함수 ───────────────────────────────────────────

export const fetchRanking = async (token: string | null): Promise<RankingEntry[]> => {
  if (USE_MOCK) return Promise.resolve(MOCK_RANKING);

  const res = await fetch(`${API_BASE}/ranking`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || '순위 정보를 불러오지 못했습니다.');
  }
  return res.json() as Promise<RankingEntry[]>;
};

// ── React Query 커스텀 훅 ──────────────────────────────

export const useRanking = (): UseQueryResult<RankingEntry[], Error> => {
  const token = useAuthStore((s) => s.token);
  return useQuery<RankingEntry[], Error>({
    queryKey: ['ranking'],
    queryFn: () => fetchRanking(token),
    enabled: USE_MOCK || !!token,
    staleTime: 1000 * 60 * 2, // 2분 캐싱
  });
};
