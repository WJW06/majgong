import React, { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useSubjects, useRanges, useProblemCount, startQuiz } from '../api/quizApi';
import type { QuizStartRequest, QuizStartResponse } from '../api/quizApi';
import useAuthStore from '../store/useAuthStore';

// ── Constants ────────────────────────────────────────────────

type Difficulty = 'HIGH' | 'MEDIUM' | 'LOW' | 'MIXED';
type QuizType = 'PRACTICE' | 'EXAM';

interface DifficultyOption {
  value: Difficulty;
  label: string;
  emoji: string;
  color: string;
}

interface CountOption {
  value: number;
  label: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: 'LOW', label: '하', emoji: '🌱', color: '#34d399' },
  { value: 'MEDIUM', label: '중', emoji: '📘', color: '#60a5fa' },
  { value: 'HIGH', label: '상', emoji: '🔥', color: '#f43f5e' },
  { value: 'MIXED', label: '혼합', emoji: '🌪️', color: '#a78bfa' },
];

const COUNT_OPTIONS: CountOption[] = [
  { value: 10, label: '10문제' },
  { value: 20, label: '20문제' },
  { value: 30, label: '30문제' },
  { value: 50, label: '50문제' },
];

// ── Component ────────────────────────────────────────────

export default function QuizSetting(): React.ReactElement {
  const navigate = useNavigate();

  // ── Selection State
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedRangeId, setSelectedRangeId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [count, setCount] = useState<number>(10);
  const [quizType, setQuizType] = useState<QuizType>('PRACTICE');
  const [format, setFormat] = useState<'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'MIXED'>('MULTIPLE_CHOICE');

  // ── API hooks
  const { data: subjects, isLoading: subjectsLoading, isError: subjectsError } = useSubjects();
  const { data: ranges, isLoading: rangesLoading } = useRanges(selectedSubjectId);
  const { data: availableCount, isLoading: countLoading } = useProblemCount(selectedRangeId, difficulty, format);

  // ── Quiz Start Mutation
  const { mutate: submitQuiz, isPending, error: submitError } = useMutation<
    QuizStartResponse,
    Error,
    QuizStartRequest
  >({
    mutationFn: (body) => startQuiz(body),
    onSuccess: (data) => {
      if (data.problems.length === 0) {
        alert('선택한 조건에 해당하는 문제가 없습니다. 다른 설정을 선택해 주세요.');
        return;
      }
      const selectedSubject = subjects?.find(s => s.id === selectedSubjectId);
      const selectedRange = ranges?.find(r => r.id === selectedRangeId);
      const selectedDifficulty = DIFFICULTY_OPTIONS.find(d => d.value === difficulty);

      sessionStorage.removeItem('majgong_quiz_session');

      // Move to quiz play page and pass problem data via state
      navigate('/quiz/play', {
        state: {
          quizData: data,
          quizType,
          count,
          subjectName: selectedSubject?.name,
          rangeName: selectedRange?.name,
          difficultyLabel: selectedDifficulty?.label
        }
      });
    },
  });

  const isInsufficient = availableCount !== undefined && availableCount < count;
  const isReady = selectedSubjectId !== null && selectedRangeId !== null && !isInsufficient;

  const handleStart = () => {
    if (!isReady) return;
    submitQuiz({
      subjectId: selectedSubjectId!,
      rangeId: selectedRangeId!,
      difficulty,
      count,
      type: quizType,
      format,
    });
  };

  // Reset range when subject changes
  const handleSubjectChange = (id: number) => {
    setSelectedSubjectId(id);
    setSelectedRangeId(null);
  };

  // Calculate expected score (preview)
  const expectedScore =
    quizType === 'PRACTICE' ? count * 1 : count * 5;

  return (
    <div style={styles.page}>
      {/* Background decorations */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/main')}>
            ← 돌아가기
          </button>
          <h1 style={styles.title}>📝 문제 설정</h1>
        </header>

        {/* Card area */}
        <div style={styles.card}>

          <div style={styles.sectionRow}>
            {/* 1. Subject Selection */}
            <section style={{ ...styles.section, flex: 1 }}>
              <label style={styles.label}>과목</label>
              {subjectsLoading ? (
                <div style={styles.skeletonSelect} />
              ) : subjectsError ? (
                <p style={styles.errorText}>⚠️ 에러</p>
              ) : (
                <select
                  style={styles.select}
                  value={selectedSubjectId ?? ''}
                  onChange={(e) => handleSubjectChange(Number(e.target.value))}
                >
                  <option value="" disabled>과목 선택</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </section>

            {/* 2. Range Selection */}
            <section style={{ ...styles.section, flex: 1 }}>
              <label style={styles.label}>범위</label>
              {rangesLoading ? (
                <div style={styles.skeletonSelect} />
              ) : (
                <select
                  style={{
                    ...styles.select,
                    opacity: selectedSubjectId === null ? 0.4 : 1,
                    cursor: selectedSubjectId === null ? 'not-allowed' : 'pointer',
                  }}
                  value={selectedRangeId ?? ''}
                  onChange={(e) => setSelectedRangeId(Number(e.target.value))}
                  disabled={selectedSubjectId === null}
                >
                  <option value="" disabled>
                    {selectedSubjectId === null ? '과목 미선택' : '범위 선택'}
                  </option>
                  {ranges?.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
            </section>
          </div>

          <div style={styles.divider} />

          {/* 4. Difficulty Selection */}
          <section style={styles.section}>
            <label style={styles.label}>난이도</label>
            <div style={styles.chipGroup}>
              {DIFFICULTY_OPTIONS.map((opt) => {
                const active = difficulty === opt.value;
                return (
                  <button
                    key={opt.value}
                    style={{
                      ...styles.chip,
                      borderColor: active ? opt.color : 'rgba(255,255,255,0.1)',
                      background: active ? opt.color + '22' : 'rgba(255,255,255,0.04)',
                      color: active ? opt.color : '#94a3b8',
                    }}
                    onClick={() => setDifficulty(opt.value)}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          <div style={styles.divider} />

          {/* 5. Format Selection */}
          <section style={styles.section}>
            <label style={styles.label}>문제 형식</label>
            <div style={styles.chipGroup}>
              <button
                style={{
                  ...styles.chip,
                  borderColor: format === 'MULTIPLE_CHOICE' ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                  background: format === 'MULTIPLE_CHOICE' ? '#a78bfa22' : 'rgba(255,255,255,0.04)',
                  color: format === 'MULTIPLE_CHOICE' ? '#a78bfa' : '#94a3b8',
                }}
                onClick={() => setFormat('MULTIPLE_CHOICE')}
              >
                객관식
              </button>
              <button
                style={{
                  ...styles.chip,
                  borderColor: format === 'SHORT_ANSWER' ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                  background: format === 'SHORT_ANSWER' ? '#a78bfa22' : 'rgba(255,255,255,0.04)',
                  color: format === 'SHORT_ANSWER' ? '#a78bfa' : '#94a3b8',
                }}
                onClick={() => setFormat('SHORT_ANSWER')}
              >
                주관식
              </button>
              <button
                style={{
                  ...styles.chip,
                  borderColor: format === 'MIXED' ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                  background: format === 'MIXED' ? '#a78bfa22' : 'rgba(255,255,255,0.04)',
                  color: format === 'MIXED' ? '#a78bfa' : '#94a3b8',
                }}
                onClick={() => setFormat('MIXED')}
              >
                혼합
              </button>
            </div>
          </section>

          <div style={styles.divider} />

          {/* 5. Question Count Selection */}
          <section style={styles.section}>
            <label style={styles.label}>문제 수</label>
            <div style={styles.chipGroup}>
              {COUNT_OPTIONS.map((opt) => {
                const active = count === opt.value;
                return (
                  <button
                    key={opt.value}
                    style={{
                      ...styles.chip,
                      borderColor: active ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                      background: active ? '#a78bfa22' : 'rgba(255,255,255,0.04)',
                      color: active ? '#a78bfa' : '#94a3b8',
                    }}
                    onClick={() => setCount(opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {selectedRangeId !== null && (
              <p style={{ ...styles.infoText, marginTop: '0.4rem' }}>
                💡 현재 조건의 문제: {availableCount ?? 0}개
              </p>
            )}
          </section>

          <div style={styles.divider} />

          {/* 6. Quiz Type Selection */}
          <section style={styles.section}>
            <label style={styles.label}>문제 유형</label>
            <div style={styles.typeGroup}>
              {/* Practice Quiz */}
              <button
                style={{
                  ...styles.typeCard,
                  borderColor: quizType === 'PRACTICE' ? '#34d399' : 'rgba(255,255,255,0.08)',
                  background: quizType === 'PRACTICE' ? '#34d39911' : 'rgba(255,255,255,0.03)',
                }}
                onClick={() => setQuizType('PRACTICE')}
              >
                <span style={styles.typeEmoji}>🌿</span>
                <span style={{ ...styles.typeTitle, color: quizType === 'PRACTICE' ? '#34d399' : '#e0e7ff' }}>
                  연습문제
                </span>
                <span style={styles.typeDesc}>1점 × 문제 수</span>
                <span style={styles.typeScore}>최대 {count}점</span>
              </button>

              {/* Exam Quiz */}
              <button
                style={{
                  ...styles.typeCard,
                  borderColor: quizType === 'EXAM' ? '#f43f5e' : 'rgba(255,255,255,0.08)',
                  background: quizType === 'EXAM' ? '#f43f5e11' : 'rgba(255,255,255,0.03)',
                }}
                onClick={() => setQuizType('EXAM')}
              >
                <span style={styles.typeEmoji}>⚔️</span>
                <span style={{ ...styles.typeTitle, color: quizType === 'EXAM' ? '#f43f5e' : '#e0e7ff' }}>
                  실전문제
                </span>
                <span style={styles.typeDesc}> (맞은 수 − 틀린 수) x 5 </span>
                <span style={styles.typeScore}>최대 {count * 5}점</span>
              </button>
            </div>
          </section>

          {/* Expected Score Preview */}
          <div style={styles.scorePreview}>
            <span style={styles.scorePreviewLabel}>예상 최대 점수</span>
            <span style={styles.scorePreviewValue}>{expectedScore.toLocaleString()}점</span>
          </div>

          {/* Error message */}
          {submitError && (
            <p style={styles.errorText}>⚠️ {submitError.message}</p>
          )}

          {/* Insufficient problems warning */}
          {isInsufficient && !countLoading && (
            <p style={styles.errorText}>
              ⚠️ 해당 조건의 문제가 부족합니다. (보유: {availableCount ?? 0}개)
            </p>
          )}

          {/* Start button */}
          <button
            style={{
              ...styles.startBtn,
              opacity: isReady && !isPending ? 1 : 0.45,
              cursor: isReady && !isPending ? 'pointer' : 'not-allowed',
            }}
            onClick={handleStart}
            disabled={!isReady || isPending}
          >
            {isPending ? '문제 불러오는 중...' : '🚀 시작하기'}
          </button>

        </div>

        <footer style={styles.footer}>
          © 2026 맞공(maj.gong) — WJW06<br></br>
        majgong2026@gmail.com
        </footer>
      </div>
    </div>
  );
}

// ── Style ───────────────────────────────────────────────
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
    padding: '1rem 1.5rem 2rem',
  },
  bgOrb1: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-60px',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#a5b4fc',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#e0e7ff',
    margin: 0,
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '20px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  select: {
    width: '100%',
    padding: '0.65rem 1rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#e0e7ff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'calc(100% - 12px) center',
    paddingRight: '2.5rem',
  },
  skeletonSelect: {
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.06)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  chipGroup: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
  },
  chip: {
    padding: '0.45rem 1.1rem',
    borderRadius: '50px',
    border: '1.5px solid',
    fontSize: '0.92rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    letterSpacing: '0.02em',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.07)',
    margin: '0.1rem 0',
  },
  sectionRow: {
    display: 'flex',
    gap: '0.85rem',
  },
  typeGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.6rem',
  },
  typeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.6rem 0.5rem',
    borderRadius: '14px',
    border: '1.5px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  typeEmoji: {
    fontSize: '1.2rem',
  },
  typeTitle: {
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  typeDesc: {
    fontSize: '0.72rem',
    color: '#64748b',
    textAlign: 'center',
  },
  typeScore: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: '0.05rem',
  },
  scorePreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: '10px',
    padding: '0.65rem 1rem',
  },
  scorePreviewLabel: {
    fontSize: '0.85rem',
    color: '#a5b4fc',
    fontWeight: '500',
  },
  scorePreviewValue: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#818cf8',
  },
  infoText: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
  },
  errorText: {
    fontSize: '0.85rem',
    color: '#f87171',
    margin: 0,
    textAlign: 'center',
  },
  startBtn: {
    width: '100%',
    padding: '0.8rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(99,102,241,0.4)',
    transition: 'opacity 0.15s ease',
    letterSpacing: '0.03em',
  },
  footer: {
    textAlign: 'center',
    color: '#334155',
    fontSize: '0.75rem',
  },
};
