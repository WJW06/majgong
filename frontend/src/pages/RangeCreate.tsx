import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';
import { useSubjects, createRange } from '../api/quizApi';

export default function RangeCreate(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Check admin authority
  if (user?.email !== 'majgong@manager.com') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p style={{ color: '#f87171', textAlign: 'center', marginTop: '4rem' }}>접근 권한이 없습니다.</p>
          <button style={styles.btnPrimary} onClick={() => navigate('/main')}>메인으로 돌아가기</button>
        </div>
      </div>
    );
  }

  const state = location.state as { subjectId?: number | null } | undefined;
  const [subjectId, setSubjectId] = useState<number | null>(state?.subjectId || null);
  const [name, setName] = useState('');
  const [folderName, setFolderName] = useState('');

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();

  const { mutate: handleCreate, isPending } = useMutation({
    mutationFn: () => {
      if (!subjectId || !name.trim() || !folderName.trim()) {
        throw new Error('모든 필드를 입력해 주세요.');
      }
      return createRange(subjectId, name.trim(), folderName.trim());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranges'] });
      alert('범위가 성공적으로 생성되었습니다.');
      navigate('/admin/exam-range');
    },
    onError: (err: any) => {
      alert('범위 생성에 실패했습니다: ' + err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      alert('과목을 선택해 주세요.');
      return;
    }
    if (!name.trim()) {
      alert('범위 이름을 입력해 주세요.');
      return;
    }
    if (!folderName.trim()) {
      alert('폴더 이름(영문)을 입력해 주세요.');
      return;
    }
    handleCreate();
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <main style={styles.container}>
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/admin/exam-range')}>
            <span style={styles.backIcon}>←</span> 뒤로가기
          </button>
          <h1 style={styles.title}>범위 추가</h1>
        </header>

        <form onSubmit={handleSubmit} style={styles.formCard}>
          <div style={styles.sectionColumn}>
            <label style={styles.label}>과목:</label>
            <select
              style={styles.select}
              value={subjectId ?? ''}
              onChange={(e) => setSubjectId(Number(e.target.value))}
            >
              <option value="" disabled>{subjectsLoading ? '과목 불러오는 중...' : '과목 선택'}</option>
              {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div style={styles.divider} />

          <div style={styles.sectionColumn}>
            <label style={styles.label}>범위 이름:</label>
            <input
              type="text"
              style={styles.input}
              placeholder="이름을 작성해주세요."
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div style={styles.divider} />

          <div style={styles.sectionColumn}>
            <label style={styles.label}>폴더 이름(영문):</label>
            <input
              type="text"
              style={styles.input}
              placeholder="이름을 작성해주세요."
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
            />
          </div>

          <button type="submit" style={styles.btnSubmit} disabled={isPending}>
            {isPending ? '생성 중...' : '범위 생성'}
          </button>
        </form>

        <footer style={styles.footer}>
          © 2026 맞공(maj.gong) — WJW06<br />
          majgong2026@gmail.com
        </footer>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    padding: '3rem 1rem 2rem', fontFamily: "'Pretendard', sans-serif",
    position: 'relative', overflowX: 'hidden',
  },
  bgOrb1: {
    position: 'absolute', top: '-10%', right: '-10%',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '-15%', left: '-15%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: '500px',
    display: 'flex', flexDirection: 'column', gap: '1.2rem',
    position: 'relative', zIndex: 1,
  },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '6px 14px', color: '#cbd5e1', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.2s',
  },
  backIcon: { fontSize: '1rem', marginTop: '-2px' },
  title: { fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: 0, letterSpacing: '-0.5px' },
  formCard: {
    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
    padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
  },
  sectionColumn: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#94a3b8' },
  select: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.9rem', outline: 'none',
  },
  input: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box',
  },
  divider: { height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.1rem 0' },
  btnSubmit: {
    marginTop: '0.5rem', width: '100%', padding: '0.75rem',
    borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
    transition: 'transform 0.1s ease', boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
  },
  btnPrimary: {
    width: '100%', padding: '0.75rem',
    borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    color: '#334155',
    fontSize: '0.75rem',
    marginTop: '1rem',
  },
};
