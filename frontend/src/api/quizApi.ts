import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';

const API_BASE = '/api/v1';
const USE_MOCK = false;

// ── Type Definition ──────────────────────────────────────────

/** Subject list response */
export interface Subject {
  id: number;
  name: string;
  folderName: string;
}

/** Range (Chapter) list response */
export interface ProblemRange {
  id: number;
  name: string;
  folderName: string;
}

export interface QuizStartRequest {
  subjectId: number;
  rangeId: number;
  difficulty: 'HIGH' | 'MEDIUM' | 'LOW' | 'MIXED';
  count: number;
  type: 'PRACTICE' | 'EXAM';
  format: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'MIXED';
}

export interface ProblemCreateRequest {
  subjectId: number;
  rangeId: number;
  format: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';
  difficulty: 'HIGH' | 'MEDIUM' | 'LOW' | 'MIXED';
  imageUrl?: string | null;
  question: string;
  answer: string;
  options?: string[];
}

/** Quiz start response - Actual problem list */
export interface QuizProblem {
  id: number;
  question: string;
  options: string[];
  answer?: string;
  format: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';
  imageUrl?: string | null;
}

export interface QuizStartResponse {
  quizId: number;
  problems: QuizProblem[];
}

// ── API function ───────────────────────────────────────────

async function authFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let message = '요청에 실패했습니다.';
    try {
      if (errText) {
        const errJson = JSON.parse(errText);
        message = errJson.message || message;
      }
    } catch (e) {
      // Maintain default message on JSON parsing failure
    }
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return {} as T;
  }
}

// ── Mock data ─────────────

const MOCK_SUBJECTS: Subject[] = [
  { id: 1, name: '수학', folderName: 'math' },
  { id: 2, name: '영어', folderName: 'english' },
];

const MOCK_RANGES: Record<number, ProblemRange[]> = {
  1: [ // 수학
    { id: 101, name: '수와 연산', folderName: 'numOp' },
    { id: 102, name: '방정식과 부등식', folderName: 'E&I' },
    { id: 103, name: '함수와 그래프', folderName: 'funcGraph' },
    { id: 104, name: '확률과 통계', folderName: 'probStat' },
  ],
  2: [ // 영어
    { id: 201, name: '어휘 및 숙어', folderName: 'vocab' },
    { id: 202, name: '문법', folderName: 'grammar' },
    { id: 203, name: '독해', folderName: 'reading' },
    { id: 204, name: '듣기 및 말하기', folderName: 'listening' },
  ],
};

/** Fetch subject list */
export const fetchSubjects = (): Promise<Subject[]> => {
  if (USE_MOCK) return Promise.resolve(MOCK_SUBJECTS);
  return authFetch<Subject[]>(`${API_BASE}/problems/subjects`);
};

/** Fetch range list (Based on Subject ID) */
export const fetchRanges = (subjectId: number): Promise<ProblemRange[]> => {
  if (USE_MOCK) return Promise.resolve(MOCK_RANGES[subjectId] ?? []);
  return authFetch<ProblemRange[]>(`${API_BASE}/problems/ranges?subject=${subjectId}`);
};

/** Fetch problem count */
export const fetchProblemCount = (rangeId: number, difficulty: string, format: string): Promise<number> => {
  if (USE_MOCK) return Promise.resolve(15);
  return authFetch<number>(`${API_BASE}/problems/count?rangeId=${rangeId}&difficulty=${difficulty}&format=${format}`);
};

/** Start quiz (Returns problem list) */
export const startQuiz = (body: QuizStartRequest) =>
  authFetch<QuizStartResponse>(`${API_BASE}/problems/quiz`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export interface CheckAnswerRequest {
  problemId: number;
  userAnswer: string;
}

export interface CheckAnswerResponse {
  correct: boolean;
  actualAnswer?: string;
}

export const checkAnswer = (body: CheckAnswerRequest) =>
  authFetch<CheckAnswerResponse>(`${API_BASE}/problems/check`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** Score submission request body */
export interface ScoreSubmitRequest {
  quizId: number;
  type: 'PRACTICE' | 'EXAM';
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  score: number;
}

/** Score submission response */
export interface ScoreSubmitResponse {
  id: number;
  score: number;
  message: string;
}

/** Submit score */
export const submitScore = (body: ScoreSubmitRequest): Promise<ScoreSubmitResponse> => {
  if (USE_MOCK) {
    return Promise.resolve({ id: 0, score: body.score, message: '점수가 저장되었습니다.' });
  }
  return authFetch<ScoreSubmitResponse>(`${API_BASE}/scores`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

// ── React Query custom hook ──────────────────────────────

/** Subject list hook */
export const useSubjects = (): UseQueryResult<Subject[], Error> => {
  const user = useAuthStore((s) => s.user);
  return useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: () => fetchSubjects(),
    enabled: USE_MOCK || !!user,
    staleTime: 1000 * 60 * 10,
  });
};

/** Range list hook (Active when subject is selected) */
export const useRanges = (subjectId: number | null): UseQueryResult<ProblemRange[], Error> => {
  const user = useAuthStore((s) => s.user);
  return useQuery<ProblemRange[], Error>({
    queryKey: ['ranges', subjectId],
    queryFn: () => fetchRanges(subjectId!),
    enabled: (USE_MOCK || !!user) && subjectId !== null,
    staleTime: 1000 * 60 * 10,
  });
};

/** Problem count lookup hook */
export const useProblemCount = (rangeId: number | null, difficulty: string, format: string): UseQueryResult<number, Error> => {
  const user = useAuthStore((s) => s.user);
  return useQuery<number, Error>({
    queryKey: ['problemCount', rangeId, difficulty, format],
    queryFn: () => fetchProblemCount(rangeId!, difficulty, format),
    enabled: !!user && rangeId !== null,
    staleTime: 1000 * 60 * 5,
  });
};

/** Create problem */
export const createProblem = (data: ProblemCreateRequest): Promise<void> => {
  return authFetch<void>(`${API_BASE}/problems/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export interface AdminProblem {
  id: number;
  question: string;
  options: string[];
  answer: string;
  format: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';
  difficulty: 'HIGH' | 'MEDIUM' | 'LOW';
  imageUrl?: string | null;
}

/** Fetch admin problem list (with answers) */
export const fetchAdminProblems = (rangeId: number): Promise<AdminProblem[]> => {
  return authFetch<AdminProblem[]>(`${API_BASE}/problems/admin/list?rangeId=${rangeId}`);
};

/** Create subject range */
export const createRange = (subjectId: number, name: string, folderName: string): Promise<void> => {
  return authFetch<void>(`${API_BASE}/problems/ranges`, {
    method: 'POST',
    body: JSON.stringify({ subjectId, name, folderName }),
  });
};

/** Update subject range */
export const updateRange = (rangeId: number, name: string, folderName: string): Promise<void> => {
  return authFetch<void>(`${API_BASE}/problems/ranges/${rangeId}`, {
    method: 'PUT',
    body: JSON.stringify({ name, folderName }),
  });
};

/** Delete subject range */
export const deleteRange = (rangeId: number): Promise<void> => {
  return authFetch<void>(`${API_BASE}/problems/ranges/${rangeId}`, {
    method: 'DELETE',
  });
};

/** Update problem */
export const updateProblem = (problemId: number, data: ProblemCreateRequest): Promise<void> => {
  return authFetch<void>(`${API_BASE}/problems/${problemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/** Delete problem */
export const deleteProblem = (problemId: number): Promise<void> => {
  return authFetch<void>(`${API_BASE}/problems/${problemId}`, {
    method: 'DELETE',
  });
};
