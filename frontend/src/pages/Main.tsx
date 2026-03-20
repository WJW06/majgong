import { useNavigate } from 'react-router-dom';
import { useMe } from '../api/userApi';
import useAuthStore from '../store/useAuthStore';
import type { CSSProperties } from 'react';

// ── 타입 정의 ──────────────────────────────────────────
interface Grade {
  label: string;
  min: number;
  color: string;
  emoji: string;
}

interface Action {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  to?: string;
  href?: string;
  primary: boolean;
}

// ── 등급 데이터 ────────────────────────────────────────
const GRADES: Grade[] = [
  { label: '입문',   min: 0,    color: '#9ca3af', emoji: '🌱' },
  { label: '초급',   min: 50,   color: '#34d399', emoji: '🌿' },
  { label: '중급',   min: 150,  color: '#60a5fa', emoji: '📘' },
  { label: '고급',   min: 300,  color: '#a78bfa', emoji: '💜' },
  { label: '마스터', min: 500,  color: '#f59e0b', emoji: '⭐' },
  { label: '전설',   min: 1000, color: '#f43f5e', emoji: '🔥' },
];

// 점수 기반 등급 계산
function getGrade(score: number): Grade {
  let grade = GRADES[0];
  for (const g of GRADES) {
    if (score >= g.min) grade = g;
  }
  return grade;
}

// 다음 등급까지의 진행도 계산
function getProgress(score: number): number {
  const idx = GRADES.findLastIndex((g) => score >= g.min);
  const next = GRADES[idx + 1];
  if (!next) return 100;
  const cur = GRADES[idx];
  return Math.min(100, Math.round(((score - cur.min) / (next.min - cur.min)) * 100));
}

// 액션 버튼 목록
const ACTIONS: Action[] = [
  {
    id: 'quiz',
    label: '문제 풀기',
    desc: '과목·난이도 선택 후 도전',
    emoji: '📝',
    to: '/quiz/setting',
    primary: true,
  },
  {
    id: 'ranking',
    label: '순위표',
    desc: '전체 유저 랭킹 확인',
    emoji: '🏆',
    to: '/ranking',
    primary: false,
  },
  {
    id: 'contact',
    label: '문의하기',
    desc: '오류·건의 사항 접수',
    emoji: '💬',
    href: 'mailto:majgong@gmail.com',
    primary: false,
  },
];

export default function Main(): JSX.Element {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { data: me, isLoading, isError, error, refetch } = useMe();

  // API 응답이 있으면 우선, 없으면 store 캐시 사용
  const profile = me ?? user;
  const score: number = profile?.totalScore ?? 0;
  const grade = getGrade(score);
  const progress = getProgress(score);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  const handleAction = (action: Action) => {
    if (action.href) {
      window.location.href = action.href;
    } else if (action.to) {
      navigate(action.to);
    }
  };

  return (
    <div style={styles.page}>
      {/* 배경 장식 */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.container}>
        {/* 헤더 */}
        <header style={styles.header}>
          <span style={styles.logo}>🎯 맞공!</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
        </header>

        {/* 유저 카드 */}
        <section style={styles.card}>
          {isLoading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>정보를 불러오는 중...</p>
            </div>
          ) : isError ? (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>⚠️ {(error as Error)?.message}</p>
              <button style={styles.retryBtn} onClick={() => refetch()}>
                다시 시도
              </button>
            </div>
          ) : (
            <>
              {/* 등급 뱃지 */}
              <div
                style={{
                  ...styles.gradeBadge,
                  background: grade.color + '22',
                  border: `2px solid ${grade.color}`,
                }}
              >
                <span style={{ fontSize: '2rem' }}>{grade.emoji}</span>
                <span style={{ ...styles.gradeLabel, color: grade.color }}>{grade.label}</span>
              </div>

              {/* 유저 이름 & 점수 */}
              <h1 style={styles.userName}>
                {profile?.name ?? '게스트'}
                <span style={styles.userSuffix}>님</span>
              </h1>
              <p style={styles.scoreText}>
                총 점수 <strong style={{ color: grade.color }}>{score.toLocaleString()}</strong>점
              </p>

              {/* 진행도 바 */}
              <div style={styles.progressWrap}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${grade.color}99, ${grade.color})`,
                  }}
                />
              </div>
              <p style={styles.progressLabel}>
                {progress === 100 ? '🎉 최고 등급 달성!' : `다음 등급까지 ${progress}%`}
              </p>
            </>
          )}
        </section>

        {/* 액션 버튼 그룹 */}
        <section style={styles.actionsGrid}>
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              style={action.primary ? styles.actionCardPrimary : styles.actionCard}
              onClick={() => handleAction(action)}
            >
              <span style={styles.actionEmoji}>{action.emoji}</span>
              <span style={styles.actionLabel}>{action.label}</span>
              <span style={styles.actionDesc}>{action.desc}</span>
            </button>
          ))}
        </section>

        {/* 푸터 */}
        <footer style={styles.footer}>
          © 2026 맞공(maj.gong) — WJW06
        </footer>
      </div>
    </div>
  );
}

/* ── 인라인 스타일 ── */
const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '1.5rem',
  },
  bgOrb1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '-120px',
    left: '-80px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#e0e7ff',
    letterSpacing: '-0.5px',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#a5b4fc',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background 0.2s',
  },
  card: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  gradeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '50px',
    padding: '6px 18px',
    marginBottom: '0.25rem',
  },
  gradeLabel: {
    fontWeight: '700',
    fontSize: '1rem',
    letterSpacing: '0.5px',
  },
  userName: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#e0e7ff',
    margin: 0,
    lineHeight: 1.2,
    textAlign: 'center',
  },
  userSuffix: {
    fontSize: '1.2rem',
    fontWeight: '400',
    color: '#94a3b8',
    marginLeft: '4px',
  },
  scoreText: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
  },
  progressWrap: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '99px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  },
  progressBar: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.6s ease',
  },
  progressLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem 0',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(165,180,252,0.2)',
    borderTop: '3px solid #a5b4fc',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 0',
  },
  errorText: {
    color: '#f87171',
    fontSize: '0.9rem',
    margin: 0,
    textAlign: 'center',
  },
  retryBtn: {
    background: 'rgba(248,113,113,0.15)',
    border: '1px solid rgba(248,113,113,0.3)',
    color: '#f87171',
    borderRadius: '8px',
    padding: '6px 20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  actionCardPrimary: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '1.4rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '1.2rem 0.8rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    cursor: 'pointer',
    color: '#e0e7ff',
    backdropFilter: 'blur(10px)',
    transition: 'background 0.15s ease',
  },
  actionEmoji: {
    fontSize: '1.8rem',
  },
  actionLabel: {
    fontWeight: '700',
    fontSize: '1rem',
    color: 'inherit',
  },
  actionDesc: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    color: '#334155',
    fontSize: '0.75rem',
  },
};
