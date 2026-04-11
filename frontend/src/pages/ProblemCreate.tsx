import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';
import { useSubjects, useRanges, createProblem, ProblemCreateRequest } from '../api/quizApi';

// ── Component ────────────────────────────────────────────
export default function ProblemCreate(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Check admin authority (rejected at rendering level)
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

  // ── Form State
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [rangeId, setRangeId] = useState<number | null>(null);
  const [format, setFormat] = useState<'MULTIPLE_CHOICE' | 'SHORT_ANSWER'>('MULTIPLE_CHOICE');
  const [difficulty, setDifficulty] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '', '']);

  // ── API hooks
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: ranges, isLoading: rangesLoading } = useRanges(subjectId);

  // ── Problem Creation Mutation
  const { mutate: submitProblem, isPending } = useMutation({
    mutationFn: (data: ProblemCreateRequest) => createProblem(data),
    onSuccess: () => {
      alert('문제가 성공적으로 생성되었습니다.');
      navigate('/main');
    },
    onError: (err) => {
      alert('문제 생성에 실패했습니다: ' + err.message);
    }
  });

  // ── Submission Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !rangeId || !question.trim() || !answer.trim()) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    if (format === 'MULTIPLE_CHOICE' && options.some(opt => !opt.trim())) {
      alert('객관식 보기를 모두 입력해주세요.');
      return;
    }

    const requestData: ProblemCreateRequest = {
      subjectId,
      rangeId,
      format,
      difficulty,
      imageUrl: imageUrl.trim() || null,
      question: question.trim(),
      answer: answer.trim(),
      options: format === 'MULTIPLE_CHOICE' ? options.map(o => o.trim()) : undefined,
    };

    submitProblem(requestData);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // ── Drag & Drop Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      const selectedSubject = subjects?.find(s => s.id === subjectId);
      const selectedRange = ranges?.find(r => r.id === rangeId);

      if (!selectedSubject || !selectedRange) {
        alert('과목과 범위를 먼저 선택해주세요.');
        return;
      }

      // Path assembly: /source/{subjectFolder}/{rangeFolder}/{fileName}
      const subjectPart = encodeURIComponent(selectedSubject.folderName);
      const rangePart = encodeURIComponent(selectedRange.folderName);
      const filePart = encodeURIComponent(file.name);
      const newUrl = `/source/${subjectPart}/${rangePart}/${filePart}`;
      setImageUrl(newUrl);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decorations */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <main style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/main')}>
            <span style={styles.backIcon}>←</span> 메인
          </button>
          <h1 style={styles.title}>관리자 문제 추가</h1>
        </header>

        <form onSubmit={handleSubmit} style={styles.formCard}>
          
          {/* Subject & Range Selection */}
          <div style={styles.sectionRow}>
            <div style={styles.flex1}>
              <label style={styles.label}>과목</label>
              <select
                style={styles.select}
                value={subjectId ?? ''}
                onChange={(e) => {
                  setSubjectId(Number(e.target.value));
                  setRangeId(null);
                }}
              >
                <option value="" disabled>{subjectsLoading ? '과목 불러오는 중...' : '과목 선택'}</option>
                {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div style={styles.flex1}>
              <label style={styles.label}>범위</label>
              <select
                style={styles.select}
                value={rangeId ?? ''}
                onChange={(e) => setRangeId(Number(e.target.value))}
                disabled={!subjectId || rangesLoading}
              >
                <option value="" disabled>
                  {!subjectId ? '과목 먼저 선택' : (rangesLoading ? '범위 불러오는 중...' : '범위 선택')}
                </option>
                {ranges?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Format & Difficulty Selection */}
          <div style={styles.sectionRow}>
            <div style={styles.flex1}>
              <label style={styles.label}>문제 유형</label>
              <div style={styles.chipGroup}>
                <button
                  type="button"
                  style={{ ...styles.chip, ...(format === 'MULTIPLE_CHOICE' ? styles.chipActive : {}) }}
                  onClick={() => setFormat('MULTIPLE_CHOICE')}
                >객관식</button>
                <button
                  type="button"
                  style={{ ...styles.chip, ...(format === 'SHORT_ANSWER' ? styles.chipActive : {}) }}
                  onClick={() => setFormat('SHORT_ANSWER')}
                >주관식</button>
              </div>
            </div>

            <div style={styles.flex1}>
              <label style={styles.label}>난이도</label>
              <div style={styles.chipGroup}>
                <button
                  type="button"
                  style={{ ...styles.chip, ...(difficulty === 'LOW' ? styles.chipActive : {}) }}
                  onClick={() => setDifficulty('LOW')}
                >🌱 하</button>
                <button
                  type="button"
                  style={{ ...styles.chip, ...(difficulty === 'MEDIUM' ? styles.chipActive : {}) }}
                  onClick={() => setDifficulty('MEDIUM')}
                >📘 중</button>
                <button
                  type="button"
                  style={{ ...styles.chip, ...(difficulty === 'HIGH' ? styles.chipActive : {}) }}
                  onClick={() => setDifficulty('HIGH')}
                >🔥 상</button>
              </div>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Problem and Image Input */}
          <section style={styles.sectionColumn}>
            <label style={styles.label}>이미지 첨부 (Drag & Drop)</label>
            <div 
              style={{ 
                ...styles.dropZone, 
                ...(isDragging ? styles.dropZoneActive : {}),
                ...(imageUrl ? styles.dropZoneFilled : {})
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {imageUrl ? (
                <div style={styles.previewContainer}>
                  <img src={imageUrl} alt="Preview" style={styles.previewImage} onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                  }} />
                  <div style={styles.previewInfo}>
                    <p style={styles.previewPath}>{imageUrl}</p>
                    <button type="button" style={styles.btnReset} onClick={() => setImageUrl('')}>삭제</button>
                  </div>
                </div>
              ) : (
                <div style={styles.dropZonePlaceholder}>
                  <span style={styles.dropIcon}>🖼️</span>
                  <p>이미지 파일을 여기에 드래그하여 놓으세요</p>
                  <p style={styles.dropSubText}>(backend/source 폴더에 저장된 파일명 기준)</p>
                </div>
              )}
            </div>

            <label style={styles.label}>이미지 URL (수동 입력)</label>
            <input 
              type="text" 
              style={styles.input} 
              placeholder="/source/math/E&I/problem1.png" 
              value={imageUrl} 
              onChange={e => setImageUrl(e.target.value)} 
            />

            <label style={styles.label}>문제 내용</label>
            <textarea 
              style={styles.textarea} 
              placeholder="문제를 입력하세요" 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              rows={2}
            />
          </section>

          <div style={styles.divider} />

          {/* Multiple Choice Options Input */}
          {format === 'MULTIPLE_CHOICE' && (
            <section style={styles.sectionColumn}>
              <label style={styles.label}>보기 입력 (5개)</label>
              <div style={styles.optionsGrid}>
                {options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    style={styles.input}
                    placeholder={`보기 ${idx + 1}`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Correct Answer Input */}
          <section style={styles.sectionColumn}>
            <label style={styles.label}>
              {format === 'MULTIPLE_CHOICE' ? '정답 (객관식 보기 내용과 완전히 동일하게 작성)' : '정답 (직접 입력)'}
            </label>
            <input 
              type="text" 
              style={styles.input} 
              placeholder="정답이 될 문구를 입력하세요" 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
            />
          </section>

          <button type="submit" style={styles.btnSubmit} disabled={isPending}>
            {isPending ? '생성 중...' : '문제 생성'}
          </button>
        </form>

        <footer style={styles.footer}>
          © 2026 맞공(maj.gong) — WJW06
        </footer>
      </main>

    </div>
  );
}

// ── Style ───────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    padding: '1rem 1rem 2rem', fontFamily: "'Pretendard', sans-serif",
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
    width: '100%', maxWidth: '640px',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
    position: 'relative', zIndex: 1,
  },
  header: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 0 },
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
    padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
  },
  sectionRow: { display: 'flex', gap: '0.6rem', flexWrap: 'nowrap' },
  sectionColumn: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  flex1: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' },
  select: {
    width: '100%', padding: '0.4rem 0.6rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.85rem', outline: 'none',
  },
  input: {
    width: '100%', padding: '0.4rem 0.6rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.85rem', outline: 'none',
  },
  textarea: {
    width: '100%', padding: '0.4rem 0.6rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.85rem', outline: 'none', resize: 'vertical',
  },
  chipGroup: { display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', width: '100%' },
  chip: {
    flex: 1, padding: '0.5rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer',
    transition: 'all 0.2s ease', textAlign: 'center',
  },
  chipActive: {
    borderColor: '#a78bfa', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontWeight: '600',
  },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.05rem 0' },
  btnSubmit: {
    marginTop: '0.2rem', width: '100%', padding: '0.6rem',
    borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer',
    transition: 'transform 0.1s ease', boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
  },
  btnPrimary: {
    width: '100%', padding: '0.6rem',
    borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    color: '#334155',
    fontSize: '0.75rem',
  },
  dropZone: {
    width: '100%', minHeight: '60px', borderRadius: '16px',
    border: '2px dashed rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.02)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    transition: 'all 0.2s ease', cursor: 'default',
  },
  dropZoneActive: {
    borderColor: '#a78bfa', background: 'rgba(167,139,250,0.08)',
  },
  dropZoneFilled: {
    borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.1)',
  },
  dropZonePlaceholder: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    color: '#94a3b8', fontSize: '0.9rem',
  },
  dropIcon: { fontSize: '1.2rem', marginBottom: '4px' },
  dropSubText: { fontSize: '0.7rem', color: '#64748b', marginTop: '-4px' },
  previewContainer: {
    width: '100%', display: 'flex', gap: '0.8rem', padding: '0.4rem 0.8rem', alignItems: 'center',
  },
  previewImage: {
    width: '50px', height: '50px', objectFit: 'contain', borderRadius: '8px',
    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
  },
  previewInfo: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden',
  },
  previewPath: {
    fontSize: '0.75rem', color: '#cbd5e1', wordBreak: 'break-all', margin: 0,
    background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '6px',
    maxHeight: '40px', overflow: 'hidden',
  },
  btnReset: {
    alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '8px',
    background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)',
    cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s',
  },
};
