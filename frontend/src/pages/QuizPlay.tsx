import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { submitScore } from '../api/quizApi';
import type {
  QuizStartResponse,
  QuizProblem,
  ScoreSubmitRequest,
  ScoreSubmitResponse,
} from '../api/quizApi';
import useAuthStore from '../store/useAuthStore';

// ── 라우터 state 타입 ───────────────────────────────────
interface LocationState {
  quizData: QuizStartResponse;
  quizType: 'PRACTICE' | 'EXAM';
  count: number;
}

// ── 답안 상태 ───────────────────────────────────────────
type AnswerState = 'idle' | 'correct' | 'wrong';

// ── 점수 계산 ───────────────────────────────────────────
function calcScore(type: 'PRACTICE' | 'EXAM', total: number, correct: number): number {
  const wrong = total - correct;
  if (type === 'PRACTICE') return correct * 1;
  return Math.max(0, total * 5 - wrong);
}

// ── 컴포넌트 ────────────────────────────────────────────
export default function QuizPlay(): JSX.Element {
  const navigate   = useNavigate();
  const location   = useLocation();
  const state      = location.state as LocationState | null;
  const token      = useAuthStore((s) => s.token);

  // 설정 페이지를 거치지 않고 직접 접근한 경우 리다이렉트
  useEffect(() => {
    if (!state?.quizData) navigate('/quiz/setting', { replace: true });
  }, [state, navigate]);

  const { quizData, quizType } = state ?? {
    quizData: { quizId: 0, problems: [] },
    quizType: 'PRACTICE' as const,
  };
  const problems: QuizProblem[] = quizData.problems;

  // ── 퀴즈 진행 상태
  const [currentIdx,    setCurrentIdx]    = useState(0);
  const [selectedOpt,   setSelectedOpt]   = useState<number | null>(null);
  const [answerState,   setAnswerState]   = useState<AnswerState>('idle');
  const [correctCount,  setCorrectCount]  = useState(0);
  const [elapsed,       setElapsed]       = useState(0); // 초 단위
  const [isFinished,    setIsFinished]    = useState(false);
  const [userAnswers,   setUserAnswers]   = useState<(number | null)[]>(
    Array(problems.length).fill(null)
  );

  // ── 타이머
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── 점수 제출 mutation
  const { mutate: sendScore, isPending: submitting, isSuccess, data: scoreResult } = useMutation<
    ScoreSubmitResponse,
    Error,
    ScoreSubmitRequest
  >({
    mutationFn: (body) => submitScore(token, body),
  });

  // ── 퀴즈 종료 처리
  const finishQuiz = useCallback(
    (finalCorrect: number) => {
      setIsFinished(true);
      const score = calcScore(quizType, problems.length, finalCorrect);
      sendScore({
        quizId: quizData.quizId,
        type: quizType,
        totalCount: problems.length,
        correctCount: finalCorrect,
        wrongCount: problems.length - finalCorrect,
        score,
      });
    },
    [quizType, problems.length, quizData.quizId, sendScore]
  );

  // ── 보기 선택
  const handleSelect = (optIdx: number) => {
    if (answerState !== 'idle') return; // 이미 선택한 경우 무시
    setSelectedOpt(optIdx);

    const problem = problems[currentIdx];
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = optIdx;
    setUserAnswers(newAnswers);

    // 연습문제: 즉시 정답 피드백 표시
    if (quizType === 'PRACTICE' && problem.answer !== undefined) {
      const isCorrect = optIdx === problem.answer;
      setAnswerState(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) setCorrectCount((c) => c + 1);

      // 1.2초 후 다음 문제로 이동
      setTimeout(() => nextQuestion(newAnswers, isCorrect ? correctCount + 1 : correctCount), 1200);
    } else {
      // 실전문제: 피드백 없이 바로 다음으로
      const isCorrect = problem.answer !== undefined && optIdx === problem.answer;
      const newCorrect = isCorrect ? correctCount + 1 : correctCount;
      if (isCorrect) setCorrectCount(newCorrect);
      setTimeout(() => nextQuestion(newAnswers, newCorrect), 400);
    }
  };

  const nextQuestion = (_answers: (number | null)[], curCorrect: number) => {
    setSelectedOpt(null);
    setAnswerState('idle');
    if (currentIdx + 1 >= problems.length) {
      finishQuiz(curCorrect);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  // ── 결과 화면 ────────────────────────────────────────
  if (isFinished) {
    const totalCount  = problems.length;
    const wrongCount  = totalCount - correctCount;
    const score       = calcScore(quizType, totalCount, correctCount);
    const accuracy    = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    return (
      <div style={styles.page}>
        <div style={styles.bgOrb1} />
        <div style={styles.bgOrb2} />

        <div style={styles.container}>
          <div style={styles.resultCard}>
            {/* 트로피 */}
            <div style={styles.trophyWrap}>
              <span style={styles.trophyIcon}>
                {accuracy >= 80 ? '🏆' : accuracy >= 50 ? '🥈' : '🥉'}
              </span>
            </div>

            <h2 style={styles.resultTitle}>퀴즈 완료!</h2>
            <p style={styles.resultSub}>
              {quizType === 'PRACTICE' ? '연습문제' : '실전문제'} · {formatTime(elapsed)} 소요
            </p>

            {/* 점수 강조 */}
            <div style={styles.scoreCircle}>
              <span style={styles.scoreNum}>{score}</span>
              <span style={styles.scoreSuffix}>점</span>
            </div>

            {/* 상세 통계 */}
            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#34d399' }}>{correctCount}</span>
                <span style={styles.statLabel}>정답</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#f87171' }}>{wrongCount}</span>
                <span style={styles.statLabel}>오답</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#a78bfa' }}>{accuracy}%</span>
                <span style={styles.statLabel}>정확도</span>
              </div>
            </div>

            {/* 제출 상태 */}
            {submitting && <p style={styles.savingText}>점수 저장 중...</p>}
            {isSuccess  && <p style={styles.savedText}>✅ {scoreResult?.message}</p>}

            {/* 버튼 */}
            <div style={styles.resultBtns}>
              <button style={styles.btnSecondary} onClick={() => navigate('/quiz/setting')}>
                다시 설정
              </button>
              <button style={styles.btnPrimary} onClick={() => navigate('/main')}>
                메인으로
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 문제 풀기 화면 ───────────────────────────────────
  const problem  = problems[currentIdx];
  const progress = ((currentIdx) / problems.length) * 100;

  if (!problem) return <div />;

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.container}>

        {/* 상단 바 */}
        <div style={styles.topBar}>
          <span style={styles.questionIdx}>
            {currentIdx + 1} <span style={styles.questionTotal}>/ {problems.length}</span>
          </span>
          <span style={styles.typeBadge}>
            {quizType === 'PRACTICE' ? '🌿 연습' : '⚔️ 실전'}
          </span>
          <span style={styles.timer}>⏱ {formatTime(elapsed)}</span>
        </div>

        {/* 진행 바 */}
        <div style={styles.progressWrap}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }} />
        </div>

        {/* 문제 카드 */}
        <div style={styles.questionCard}>
          <p style={styles.questionText}>{problem.question}</p>
        </div>

        {/* 보기 목록 */}
        <div style={styles.optionsGrid}>
          {problem.options.map((opt, idx) => {
            // 색상 결정
            let border = 'rgba(255,255,255,0.1)';
            let bg     = 'rgba(255,255,255,0.04)';
            let color  = '#e0e7ff';

            if (selectedOpt === idx) {
              if (answerState === 'correct') {
                border = '#34d399'; bg = '#34d39922'; color = '#34d399';
              } else if (answerState === 'wrong') {
                border = '#f87171'; bg = '#f8717122'; color = '#f87171';
              } else {
                border = '#a78bfa'; bg = '#a78bfa22'; color = '#a78bfa';
              }
            }
            // 연습 모드에서 오답 선택 후 정답 표시
            if (
              quizType === 'PRACTICE' &&
              answerState === 'wrong' &&
              problem.answer !== undefined &&
              idx === problem.answer
            ) {
              border = '#34d399'; bg = '#34d39911'; color = '#34d399';
            }

            return (
              <button
                key={idx}
                style={{ ...styles.optionBtn, borderColor: border, background: bg, color }}
                onClick={() => handleSelect(idx)}
                disabled={answerState !== 'idle'}
              >
                <span style={styles.optionLabel}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={styles.optionText}>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* 정답/오답 피드백 메시지 (연습 모드) */}
        {quizType === 'PRACTICE' && answerState !== 'idle' && (
          <div
            style={{
              ...styles.feedbackBanner,
              background: answerState === 'correct' ? '#34d39922' : '#f8717122',
              borderColor: answerState === 'correct' ? '#34d399' : '#f87171',
              color:       answerState === 'correct' ? '#34d399' : '#f87171',
            }}
          >
            {answerState === 'correct' ? '🎉 정답입니다!' : '❌ 오답입니다.'}
          </div>
        )}

        {/* 정답 현황 */}
        <div style={styles.scoreBar}>
          <span style={{ color: '#34d399' }}>✔ {correctCount}정답</span>
          <span style={{ color: '#f87171' }}>
            ✖ {currentIdx - correctCount + (answerState !== 'idle' ? 0 : 0)}오답
          </span>
          <span style={{ color: '#64748b' }}>
            예상 점수: {calcScore(quizType, problems.length, correctCount)}점
          </span>
        </div>

      </div>
    </div>
  );
}

// ── 스타일 ───────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '1.75rem 1.25rem 2rem',
  },
  bgOrb1: {
    position: 'absolute', top: '-80px', right: '-80px',
    width: '360px', height: '360px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '-100px', left: '-60px',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: '560px',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    position: 'relative', zIndex: 1,
  },

  // ── 상단 바
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  questionIdx: { fontSize: '1.3rem', fontWeight: '800', color: '#e0e7ff' },
  questionTotal: { fontSize: '1rem', color: '#64748b', fontWeight: '400' },
  typeBadge: {
    fontSize: '0.8rem', fontWeight: '600',
    color: '#a5b4fc',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '50px', padding: '3px 12px',
  },
  timer: { fontSize: '0.95rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' },

  // ── 진행 바
  progressWrap: {
    height: '5px', background: 'rgba(255,255,255,0.08)',
    borderRadius: '99px', overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    borderRadius: '99px',
    transition: 'width 0.4s ease',
  },

  // ── 문제 카드
  questionCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '16px',
    padding: '1.5rem',
    minHeight: '80px',
    display: 'flex', alignItems: 'center',
  },
  questionText: {
    fontSize: '1.05rem', fontWeight: '600',
    color: '#e0e7ff', lineHeight: 1.6, margin: 0,
  },

  // ── 보기
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '0.65rem' },
  optionBtn: {
    display: 'flex', alignItems: 'center', gap: '0.9rem',
    padding: '0.85rem 1.1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    width: '100%',
  },
  optionLabel: {
    minWidth: '28px', height: '28px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    fontSize: '0.8rem', fontWeight: '700',
    flexShrink: 0,
  },
  optionText: { fontSize: '0.95rem', fontWeight: '500', lineHeight: 1.4 },

  // ── 피드백 배너
  feedbackBanner: {
    textAlign: 'center', padding: '0.65rem',
    borderRadius: '10px', border: '1px solid',
    fontWeight: '700', fontSize: '0.95rem',
  },

  // ── 정답 현황 바
  scoreBar: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.8rem', fontWeight: '600',
    padding: '0.5rem 0',
  },

  // ── 결과 화면
  resultCard: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '2.5rem 2rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
  },
  trophyWrap: {
    width: '80px', height: '80px', borderRadius: '50%',
    background: 'rgba(251,191,36,0.12)',
    border: '2px solid rgba(251,191,36,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  trophyIcon: { fontSize: '2.2rem' },
  resultTitle: {
    fontSize: '1.8rem', fontWeight: '800',
    color: '#e0e7ff', margin: 0,
  },
  resultSub: { fontSize: '0.87rem', color: '#64748b', margin: 0 },
  scoreCircle: {
    display: 'flex', alignItems: 'baseline', gap: '4px',
    background: 'rgba(99,102,241,0.12)',
    border: '2px solid rgba(99,102,241,0.3)',
    borderRadius: '16px', padding: '0.75rem 2.5rem',
    marginTop: '0.25rem',
  },
  scoreNum: { fontSize: '3rem', fontWeight: '900', color: '#818cf8', lineHeight: 1 },
  scoreSuffix: { fontSize: '1.2rem', color: '#a5b4fc', fontWeight: '600' },
  statsRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '0.75rem 1.5rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', width: '100%',
    justifyContent: 'center',
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  statValue: { fontSize: '1.4rem', fontWeight: '800' },
  statLabel: { fontSize: '0.75rem', color: '#64748b' },
  statDivider: { width: '1px', height: '36px', background: 'rgba(255,255,255,0.07)' },
  savingText: { fontSize: '0.85rem', color: '#94a3b8', margin: 0 },
  savedText:  { fontSize: '0.85rem', color: '#34d399', margin: 0, fontWeight: '600' },
  resultBtns: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem', width: '100%', marginTop: '0.5rem',
  },
  btnSecondary: {
    padding: '0.8rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px', color: '#a5b4fc',
    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
  },
  btnPrimary: {
    padding: '0.8rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: '12px', color: '#fff',
    fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
  },
};
