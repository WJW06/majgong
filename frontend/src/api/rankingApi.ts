import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';

const API_BASE = '/api/v1';
const USE_MOCK = false;

// ── Type Definition ──────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  userId: number;
  name: string;
  grade: string;       // '입문' | '초급' | '중급' | '고급' | '마스터' | '전설'
  totalScore: number;
}

// ── Mock data ────────────────────────────────────────

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
  { rank: 10, userId: 10, name: '연근이', grade: '입문',    totalScore:    0 },
];

// ── API function ───────────────────────────────────────────

export const fetchRanking = async (): Promise<RankingEntry[]> => {
  if (USE_MOCK) return Promise.resolve(MOCK_RANKING);

  const res = await fetch(`${API_BASE}/ranking`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || '순위 정보를 불러오지 못했습니다.');
  }
  return res.json() as Promise<RankingEntry[]>;
};

// ── React Query custom hook ──────────────────────────────

export const useRanking = (): UseQueryResult<RankingEntry[], Error> => {
  const user = useAuthStore((s) => s.user);
  return useQuery<RankingEntry[], Error>({
    queryKey: ['ranking'],
    queryFn: () => fetchRanking(),
    enabled: USE_MOCK || !!user,
    staleTime: 1000 * 60 * 2,
  });
};
