import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRanking } from '../api/rankingApi';
import useAuthStore from '../store/useAuthStore';
import type { RankingEntry } from '../api/rankingApi';

// ── 등급 메타데이터 ────────────────────────────────────
const GRADE_META: Record<string, { color: string; emoji: string }> = {
  '입문':   { color: '#9ca3af', emoji: '🌱' },
  '초급':   { color: '#34d399', emoji: '🌿' },
  '중급':   { color: '#60a5fa', emoji: '📘' },
  '고급':   { color: '#a78bfa', emoji: '💜' },
  '마스터': { color: '#f59e0b', emoji: '⭐' },
  '전설':   { color: '#f43f5e', emoji: '🔥' },
};

// 상위 3위 메달
const MEDAL = ['🥇', '🥈', '🥉'];

// ── 컴포넌트 ────────────────────────────────────────────
export default function Ranking(): JSX.Element {
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');

  const { data: ranking, isLoading, isError, error, refetch } = useRanking();

  // 검색 필터
  const filtered: RankingEntry[] = (ranking ?? []).filter((r) =>
    r.name.includes(search.trim())
  );

  return (
    <div style={styles.page}>
      {/* 배경 장식 */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.container}>

        {/* 헤더 */}
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/main')}>
            ← 돌아가기
          </button>
          <h1 style={styles.title}>🏆 순위표</h1>
        </header>

        {/* 로딩 */}
        {isLoading && (
          <div style={styles.centerBox}>
            <div style={styles.spinner} />
            <p style={styles.dimText}>순위를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 */}
        {isError && (
          <div style={styles.centerBox}>
            <p style={styles.errorText}>⚠️ {(error as Error).message}</p>
            <button style={styles.retryBtn} onClick={() => refetch()}>다시 시도</button>
          </div>
        )}

        {ranking && (
          <>
            {/* 상위 3위 포디엄 */}
            {ranking.length >= 3 && <Podium top3={ranking.slice(0, 3)} />}

            {/* 내 순위 빠른 찾기 */}
            {me && (() => {
              const myEntry = ranking.find((r) => r.name === me.name);
              if (!myEntry) return null;
              const meta = GRADE_META[myEntry.grade] ?? { color: '#94a3b8', emoji: '🌱' };
              return (
                <div style={styles.myRankCard}>
                  <span style={styles.myRankLabel}>내 순위</span>
                  <span style={styles.myRankNum}>#{myEntry.rank}</span>
                  <span style={{ color: meta.color, fontWeight: 700 }}>
                    {meta.emoji} {myEntry.grade}
                  </span>
                  <span style={styles.myRankScore}>{myEntry.totalScore.toLocaleString()}점</span>
                </div>
              );
            })()}

            {/* 검색 */}
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="이름으로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button style={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            {/* 전체 목록 */}
            <div style={styles.listCard}>
              {/* 헤더 행 */}
              <div style={styles.listHeader}>
                <span style={{ width: '40px', textAlign: 'center' }}>순위</span>
                <span style={{ flex: 1 }}>이름</span>
                <span style={{ width: '80px', textAlign: 'center' }}>등급</span>
                <span style={{ width: '70px', textAlign: 'right' }}>점수</span>
              </div>

              {filtered.length === 0 ? (
                <p style={{ ...styles.dimText, textAlign: 'center', padding: '1.5rem 0' }}>
                  검색 결과가 없습니다.
                </p>
              ) : (
                filtered.map((entry) => (
                  <RankRow key={entry.userId} entry={entry} isMe={me?.name === entry.name} />
                ))
              )}
            </div>

            <p style={styles.footerNote}>
              총 {ranking.length}명 참여 중
            </p>
          </>
        )}

        <footer style={styles.footer}>© 2026 맞공(maj.gong) — WJW06</footer>
      </div>
    </div>
  );
}

// ── 포디엄 (1~3위) ─────────────────────────────────────
function Podium({ top3 }: { top3: RankingEntry[] }) {
  // 2위-1위-3위 순서로 배치
  const order = [top3[1], top3[0], top3[2]];
  const heights = ['60px', '80px', '48px'];
  const ranks   = [2, 1, 3];

  return (
    <div style={styles.podiumWrap}>
      {order.map((entry, i) => {
        const meta = GRADE_META[entry.grade] ?? { color: '#94a3b8', emoji: '🌱' };
        return (
          <div key={entry.userId} style={styles.podiumCol}>
            {/* 뱃지 */}
            <span style={styles.podiumMedal}>{MEDAL[ranks[i] - 1]}</span>
            <p style={styles.podiumName}>{entry.name}</p>
            <p style={{ ...styles.podiumGrade, color: meta.color }}>
              {meta.emoji} {entry.grade}
            </p>
            <p style={styles.podiumScore}>{entry.totalScore.toLocaleString()}점</p>
            {/* 받침대 */}
            <div
              style={{
                ...styles.podiumBase,
                height: heights[i],
                background: i === 1
                  ? 'linear-gradient(180deg, rgba(251,191,36,0.25), rgba(251,191,36,0.08))'
                  : i === 0
                    ? 'linear-gradient(180deg, rgba(156,163,175,0.2), rgba(156,163,175,0.06))'
                    : 'linear-gradient(180deg, rgba(180,120,60,0.2), rgba(180,120,60,0.06))',
                borderColor: i === 1 ? 'rgba(251,191,36,0.4)'
                  : i === 0 ? 'rgba(156,163,175,0.3)'
                  : 'rgba(180,120,60,0.3)',
              }}
            >
              <span style={styles.podiumRankNum}>#{ranks[i]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 순위 행 ────────────────────────────────────────────
function RankRow({ entry, isMe }: { entry: RankingEntry; isMe: boolean }) {
  const meta = GRADE_META[entry.grade] ?? { color: '#94a3b8', emoji: '🌱' };
  return (
    <div
      style={{
        ...styles.listRow,
        background: isMe ? 'rgba(99,102,241,0.1)' : 'transparent',
        borderLeft: isMe ? '3px solid #6366f1' : '3px solid transparent',
      }}
    >
      {/* 순위 */}
      <span style={styles.rankCell}>
        {entry.rank <= 3
          ? <span style={styles.medalSpan}>{MEDAL[entry.rank - 1]}</span>
          : <span style={styles.rankNum}>{entry.rank}</span>}
      </span>
      {/* 이름 */}
      <span style={styles.nameCell}>
        {entry.name}
        {isMe && <span style={styles.meBadge}>나</span>}
      </span>
      {/* 등급 */}
      <span style={{ ...styles.gradeCell, color: meta.color }}>
        {meta.emoji} {entry.grade}
      </span>
      {/* 점수 */}
      <span style={styles.scoreCell}>{entry.totalScore.toLocaleString()}</span>
    </div>
  );
}

// ── 스타일 ───────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
    position: 'relative', overflow: 'hidden',
    padding: '1.75rem 1.25rem 2.5rem',
  },
  bgOrb1: {
    position: 'absolute', top: '-80px', right: '-80px',
    width: '380px', height: '380px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '-100px', left: '-60px',
    width: '320px', height: '320px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: '560px',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    position: 'relative', zIndex: 1,
  },

  // 헤더
  header:  { display: 'flex', alignItems: 'center', gap: '1rem' },
  backBtn: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#a5b4fc', borderRadius: '8px', padding: '6px 14px',
    cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap',
  },
  title: { fontSize: '1.4rem', fontWeight: '800', color: '#e0e7ff', margin: 0 },

  // 로딩/에러
  centerBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.75rem', padding: '3rem 0',
  },
  spinner: {
    width: '36px', height: '36px',
    border: '3px solid rgba(165,180,252,0.2)',
    borderTop: '3px solid #a5b4fc',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  dimText:   { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  errorText: { color: '#f87171', fontSize: '0.9rem', margin: 0 },
  retryBtn: {
    background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)',
    color: '#f87171', borderRadius: '8px', padding: '6px 18px',
    cursor: 'pointer', fontSize: '0.85rem',
  },

  // 포디엄
  podiumWrap: {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    gap: '0.5rem', padding: '0.5rem 0 0',
  },
  podiumCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  podiumMedal: { fontSize: '1.8rem', marginBottom: '0.25rem' },
  podiumName:  { fontSize: '0.85rem', fontWeight: '700', color: '#e0e7ff', margin: '2px 0' },
  podiumGrade: { fontSize: '0.72rem', fontWeight: '600', margin: '1px 0' },
  podiumScore: { fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 6px' },
  podiumBase: {
    width: '100%', borderRadius: '8px 8px 0 0',
    border: '1.5px solid', borderBottom: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  podiumRankNum: { fontSize: '1rem', fontWeight: '800', color: '#e0e7ff' },

  // 내 순위 카드
  myRankCard: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '12px', padding: '0.7rem 1rem', flexWrap: 'wrap',
  },
  myRankLabel: { fontSize: '0.8rem', color: '#818cf8', fontWeight: '600' },
  myRankNum:   { fontSize: '1.1rem', fontWeight: '800', color: '#e0e7ff' },
  myRankScore: { marginLeft: 'auto', fontSize: '0.9rem', color: '#a5b4fc', fontWeight: '600' },

  // 검색
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '10px', padding: '0 0.75rem',
  },
  searchIcon:  { fontSize: '0.9rem', color: '#64748b' },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: '#e0e7ff', fontSize: '0.9rem', padding: '0.6rem 0',
  },
  clearBtn: {
    background: 'none', border: 'none', color: '#64748b',
    cursor: 'pointer', fontSize: '0.85rem', padding: '0',
  },

  // 리스트
  listCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', overflow: 'hidden',
  },
  listHeader: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    fontSize: '0.75rem', color: '#64748b', fontWeight: '600',
    letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  listRow: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.15s',
  },
  rankCell:   { width: '40px', textAlign: 'center', flexShrink: 0 },
  medalSpan:  { fontSize: '1.2rem' },
  rankNum:    { fontSize: '0.95rem', fontWeight: '700', color: '#64748b' },
  nameCell:   { flex: 1, fontSize: '0.95rem', fontWeight: '600', color: '#e0e7ff', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  meBadge:    {
    fontSize: '0.65rem', fontWeight: '700', color: '#6366f1',
    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
    borderRadius: '4px', padding: '1px 5px',
  },
  gradeCell:  { width: '80px', textAlign: 'center', fontSize: '0.82rem', fontWeight: '600' },
  scoreCell:  { width: '70px', textAlign: 'right', fontSize: '0.9rem', fontWeight: '700', color: '#a5b4fc' },

  footerNote: { textAlign: 'center', color: '#475569', fontSize: '0.8rem', margin: 0 },
  footer:     { textAlign: 'center', color: '#334155', fontSize: '0.75rem' },
};
