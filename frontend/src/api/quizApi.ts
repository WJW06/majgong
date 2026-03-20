import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';

const API_BASE = '/api/v1';

/** true이면 백엔드 대신 mock 데이터를 사용 (백엔드 완성 후 false로 변경) */
const USE_MOCK = true;

// ── 타입 정의 ──────────────────────────────────────────

/** 과목 목록 응답 */
export interface Subject {
  id: number;
  name: string; // 예: '운영체제', '자료구조'
}

/** 범위(챕터) 목록 응답 */
export interface ProblemRange {
  id: number;
  name: string; // 예: '프로세스 관리', '메모리 관리'
}

/** 퀴즈 시작 요청 body */
export interface QuizStartRequest {
  subjectId: number;
  rangeId: number;
  difficulty: 'HIGH' | 'MEDIUM' | 'LOW';
  count: number;
  type: 'PRACTICE' | 'EXAM'; // 연습문제 | 실전문제
}

/** 퀴즈 시작 응답 - 실제 문제 목록 */
export interface QuizProblem {
  id: number;
  question: string;
  options: string[];
  answer?: number; // 연습문제에서만 제공될 수 있음
}

export interface QuizStartResponse {
  quizId: number;
  problems: QuizProblem[];
}

// ── API 함수 ───────────────────────────────────────────

async function authFetch<T>(url: string, token: string | null, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || '요청에 실패했습니다.');
  }
  return res.json() as Promise<T>;
}

// ── Mock 데이터 (USE_MOCK = true 일 때 사용) ─────────────

const MOCK_SUBJECTS: Subject[] = [
  { id: 1, name: '수학' },
  { id: 2, name: '영어' },
];

const MOCK_RANGES: Record<number, ProblemRange[]> = {
  1: [ // 수학
    { id: 101, name: '수와 연산' },
    { id: 102, name: '방정식과 부등식' },
    { id: 103, name: '함수와 그래프' },
    { id: 104, name: '확률과 통계' },
  ],
  2: [ // 영어
    { id: 201, name: '어휘 및 숙어' },
    { id: 202, name: '문법' },
    { id: 203, name: '독해' },
    { id: 204, name: '듣기 및 말하기' },
  ],
};

/** 과목 목록 조회 */
export const fetchSubjects = (token: string | null): Promise<Subject[]> => {
  if (USE_MOCK) return Promise.resolve(MOCK_SUBJECTS);
  return authFetch<Subject[]>(`${API_BASE}/problems/subjects`, token);
};

/** 범위 목록 조회 (과목 ID 기반) */
export const fetchRanges = (token: string | null, subjectId: number): Promise<ProblemRange[]> => {
  if (USE_MOCK) return Promise.resolve(MOCK_RANGES[subjectId] ?? []);
  return authFetch<ProblemRange[]>(`${API_BASE}/problems/ranges?subject=${subjectId}`, token);
};

/** 퀴즈 시작 (문제 목록 반환) */
export const startQuiz = (token: string | null, body: QuizStartRequest) =>
  authFetch<QuizStartResponse>(`${API_BASE}/problems/quiz`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** 점수 제출 요청 body */
export interface ScoreSubmitRequest {
  quizId: number;
  type: 'PRACTICE' | 'EXAM';
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  score: number;
}

/** 점수 제출 응답 */
export interface ScoreSubmitResponse {
  id: number;
  score: number;
  message: string;
}

/** 점수 제출 */
export const submitScore = (token: string | null, body: ScoreSubmitRequest): Promise<ScoreSubmitResponse> => {
  if (USE_MOCK) {
    // mock 모드: 즉시 성공 응답 반환
    return Promise.resolve({ id: 0, score: body.score, message: '점수가 저장되었습니다.' });
  }
  return authFetch<ScoreSubmitResponse>(`${API_BASE}/scores`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

// ── React Query 커스텀 훅 ──────────────────────────────

/** 과목 목록 훅 */
export const useSubjects = (): UseQueryResult<Subject[], Error> => {
  const token = useAuthStore((s) => s.token);
  return useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: () => fetchSubjects(token),
    enabled: USE_MOCK || !!token, // mock 모드에서는 토큰 불필요
    staleTime: 1000 * 60 * 10, // 10분 캐싱
  });
};

/** 범위 목록 훅 (과목 선택 시 활성화) */
export const useRanges = (subjectId: number | null): UseQueryResult<ProblemRange[], Error> => {
  const token = useAuthStore((s) => s.token);
  return useQuery<ProblemRange[], Error>({
    queryKey: ['ranges', subjectId],
    queryFn: () => fetchRanges(token, subjectId!),
    enabled: (USE_MOCK || !!token) && subjectId !== null, // mock 모드에서는 토큰 불필요
    staleTime: 1000 * 60 * 10,
  });
};
