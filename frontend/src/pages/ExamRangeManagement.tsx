import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';
import {
  useSubjects,
  useRanges,
  fetchAdminProblems,
  updateRange,
  deleteRange,
  updateProblem,
  deleteProblem,
  ProblemRange,
  AdminProblem
} from '../api/quizApi';

// ── Range Accordion Item Component ───────────────────────────
interface RangeAccordionItemProps {
  range: ProblemRange;
  subjectFolder: string;
  onEditRange: (range: ProblemRange) => void;
  onDeleteRange: (range: ProblemRange) => void;
  onEditProblem: (problem: AdminProblem, rangeId: number) => void;
  onDeleteProblem: (problemId: number, rangeId: number) => void;
}

function RangeAccordionItem({
  range,
  subjectFolder,
  onEditRange,
  onDeleteRange,
  onEditProblem,
  onDeleteProblem
}: RangeAccordionItemProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch problems inside this range only when expanded
  const { data: problems, isLoading, error } = useQuery<AdminProblem[], Error>({
    queryKey: ['adminProblems', range.id],
    queryFn: () => fetchAdminProblems(range.id),
    enabled: isOpen,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  return (
    <div style={styles.rangeAccordion}>
      {/* Accordion Header */}
      <div style={styles.accordionHeader}>
        <div style={styles.accordionTitleClick} onClick={() => setIsOpen(!isOpen)}>
          <span style={styles.arrowIcon}>{isOpen ? '▼' : '▶'}</span>
          <span style={styles.rangeNameText}>{range.name}</span>
        </div>
        <div style={styles.rangeActionButtons}>
          <button
            type="button"
            style={styles.actionBtnEdit}
            onClick={(e) => {
              e.stopPropagation();
              onEditRange(range);
            }}
            title="범위 수정"
          >
            ✏️
          </button>
          <button
            type="button"
            style={styles.actionBtnDelete}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRange(range);
            }}
            title="범위 삭제"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Accordion Content (Problem List) */}
      {isOpen && (
        <div style={styles.accordionContent}>
          {isLoading ? (
            <p style={styles.infoText}>문제를 불러오는 중...</p>
          ) : error ? (
            <p style={styles.errorText}>문제를 불러오지 못했습니다: {error.message}</p>
          ) : !problems || problems.length === 0 ? (
            <p style={styles.infoText}>이 범위에 등록된 문제가 없습니다.</p>
          ) : (
            <div style={styles.problemListGrid}>
              {problems.map((prob, index) => (
                <div key={prob.id} style={styles.problemItemRow}>
                  <div style={styles.problemInfoCol}>
                    <p style={styles.problemQuestionText}>
                      {index + 1}. {prob.question}
                    </p>
                    <span style={styles.problemMetaBadge}>
                      이미지: {prob.imageUrl ? 'O' : 'X'} &nbsp;|&nbsp; 
                      유형: {prob.format === 'MULTIPLE_CHOICE' ? '객관식' : '주관식'} &nbsp;|&nbsp; 
                      난이도: {prob.difficulty === 'HIGH' ? '상' : prob.difficulty === 'MEDIUM' ? '중' : '하'} &nbsp;|&nbsp; 
                      답: {prob.answer}
                    </span>
                  </div>
                  <div style={styles.problemActionButtons}>
                    <button
                      type="button"
                      style={styles.actionBtnEdit}
                      onClick={() => onEditProblem(prob, range.id)}
                      title="문제 수정"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      style={styles.actionBtnDelete}
                      onClick={() => onDeleteProblem(prob.id, range.id)}
                      title="문제 삭제"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────
export default function ExamRangeManagement(): React.ReactElement {
  const navigate = useNavigate();
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

  // ── States
  const [subjectId, setSubjectId] = useState<number | null>(null);

  // Modal control states
  const [editingRange, setEditingRange] = useState<ProblemRange | null>(null);
  const [editingRangeName, setEditingRangeName] = useState('');
  const [editingRangeFolder, setEditingRangeFolder] = useState('');

  const [deletingItem, setDeletingItem] = useState<{
    type: 'range' | 'problem';
    id: number;
    rangeId?: number;
    name?: string;
  } | null>(null);

  const [editingProblem, setEditingProblem] = useState<{
    prob: AdminProblem;
    rangeId: number;
  } | null>(null);

  // Editing problem form states
  const [editFormat, setEditFormat] = useState<'MULTIPLE_CHOICE' | 'SHORT_ANSWER'>('MULTIPLE_CHOICE');
  const [editDifficulty, setEditDifficulty] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>(['', '', '', '', '']);
  const [editIsDragging, setEditIsDragging] = useState(false);

  // ── Queries
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: ranges, isLoading: rangesLoading } = useRanges(subjectId);

  const selectedSubjectObj = subjects?.find(s => s.id === subjectId);

  // ── Range Update Mutation
  const rangeUpdateMutation = useMutation({
    mutationFn: () => {
      if (!editingRange) throw new Error('수정 중인 범위가 없습니다.');
      return updateRange(editingRange.id, editingRangeName.trim(), editingRangeFolder.trim());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranges', subjectId] });
      alert('범위가 수정되었습니다.');
      setEditingRange(null);
    },
    onError: (err: any) => {
      alert('범위 수정에 실패했습니다: ' + err.message);
    }
  });

  // ── Range Delete Mutation
  const rangeDeleteMutation = useMutation({
    mutationFn: (rangeId: number) => deleteRange(rangeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranges', subjectId] });
      alert('범위가 삭제되었습니다.');
      setDeletingItem(null);
    },
    onError: (err: any) => {
      alert('범위 삭제에 실패했습니다: ' + err.message);
    }
  });

  // ── Problem Delete Mutation
  const problemDeleteMutation = useMutation({
    mutationFn: (args: { problemId: number; rangeId: number }) => deleteProblem(args.problemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminProblems', variables.rangeId] });
      queryClient.invalidateQueries({ queryKey: ['problemCount'] });
      alert('문제가 삭제되었습니다.');
      setDeletingItem(null);
    },
    onError: (err: any) => {
      alert('문제 삭제에 실패했습니다: ' + err.message);
    }
  });

  // ── Problem Update Mutation
  const problemUpdateMutation = useMutation({
    mutationFn: async () => {
      if (!editingProblem) throw new Error('수정 중인 문제가 없습니다.');

      let finalImageUrl = editImageUrl.trim() || null;

      // Handle Image Upload inside editing problem modal if file is selected
      if (editImageFile && selectedSubjectObj) {
        const selectedRangeObj = ranges?.find(r => r.id === editingProblem.rangeId);
        if (selectedRangeObj) {
          const formData = new FormData();
          formData.append('file', editImageFile);
          formData.append('subjectFolder', selectedSubjectObj.folderName);
          formData.append('rangeFolder', selectedRangeObj.folderName);

          try {
            const uploadRes = await fetch('/api/v1/problems/upload-image', {
              method: 'POST',
              body: formData,
              credentials: 'include',
            });
            if (!uploadRes.ok) {
              throw new Error('Image upload failed');
            }
            finalImageUrl = await uploadRes.text();
          } catch (err) {
            alert('이미지 업로드에 실패했습니다. 수동 경로를 사용하거나 다시 시도해주세요.');
            throw err;
          }
        }
      }

      return updateProblem(editingProblem.prob.id, {
        subjectId: subjectId!,
        rangeId: editingProblem.rangeId,
        format: editFormat,
        difficulty: editDifficulty,
        imageUrl: finalImageUrl,
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
        options: editFormat === 'MULTIPLE_CHOICE' ? editOptions.map(o => o.trim()) : undefined,
      });
    },
    onSuccess: (_, variables) => {
      if (editingProblem) {
        queryClient.invalidateQueries({ queryKey: ['adminProblems', editingProblem.rangeId] });
        queryClient.invalidateQueries({ queryKey: ['problemCount'] });
      }
      alert('문제가 수정되었습니다.');
      setEditingProblem(null);
    },
    onError: (err: any) => {
      alert('문제 수정에 실패했습니다: ' + err.message);
    }
  });

  // ── Handlers
  const handleOpenEditRange = (range: ProblemRange) => {
    setEditingRange(range);
    setEditingRangeName(range.name);
    setEditingRangeFolder(range.folderName);
  };

  const handleOpenEditProblem = (prob: AdminProblem, rangeId: number) => {
    setEditingProblem({ prob, rangeId });
    setEditFormat(prob.format);
    setEditDifficulty(prob.difficulty);
    setEditImageUrl(prob.imageUrl || '');
    setEditImageFile(null);
    setEditQuestion(prob.question);
    setEditAnswer(prob.answer);
    if (prob.options && prob.options.length > 0) {
      const newOpts = [...prob.options];
      while (newOpts.length < 5) newOpts.push('');
      setEditOptions(newOpts);
    } else {
      setEditOptions(['', '', '', '', '']);
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...editOptions];
    updated[idx] = val;
    setEditOptions(updated);
  };

  // ── Drag & Drop for Modal
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setEditIsDragging(true);
  };
  const handleDragLeave = () => {
    setEditIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setEditIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0 && editingProblem) {
      const file = files[0];
      const selectedRangeObj = ranges?.find(r => r.id === editingProblem.rangeId);
      if (!selectedSubjectObj || !selectedRangeObj) {
        alert('올바른 범위와 과목이 선택되지 않았습니다.');
        return;
      }
      setEditImageFile(file);

      const subjectPart = encodeURIComponent(selectedSubjectObj.folderName);
      const rangePart = encodeURIComponent(selectedRangeObj.folderName);
      const filePart = encodeURIComponent(file.name);
      setEditImageUrl(`/source/${subjectPart}/${rangePart}/${filePart}`);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    if (deletingItem.type === 'range') {
      rangeDeleteMutation.mutate(deletingItem.id);
    } else {
      problemDeleteMutation.mutate({
        problemId: deletingItem.id,
        rangeId: deletingItem.rangeId!
      });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <main style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/main')}>
            <span style={styles.backIcon}>←</span> 메인
          </button>
          <h1 style={styles.title}>시험 범위 관리</h1>
        </header>

        {/* Content Card */}
        <div style={styles.formCard}>
          {/* Subject Dropdown */}
          <div style={styles.sectionRow}>
            <div style={styles.flex1}>
              <label style={styles.label}>과목:</label>
              <select
                style={styles.select}
                value={subjectId ?? ''}
                onChange={(e) => setSubjectId(Number(e.target.value))}
              >
                <option value="" disabled>{subjectsLoading ? '과목 불러오는 중...' : '과목 선택'}</option>
                {subjects?.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Subject Ranges Accordion List */}
          <div style={styles.rangeSection}>
            <label style={styles.label}>범위</label>
            {!subjectId ? (
              <p style={styles.infoText}>과목을 선택하시면 범위 목록이 표시됩니다.</p>
            ) : rangesLoading ? (
              <p style={styles.infoText}>범위 정보를 불러오는 중...</p>
            ) : !ranges || ranges.length === 0 ? (
              <p style={styles.infoText}>등록된 시험 범위가 없습니다.</p>
            ) : (
              <div style={styles.rangesAccordionList}>
                {ranges.map(range => (
                  <RangeAccordionItem
                    key={range.id}
                    range={range}
                    subjectFolder={selectedSubjectObj?.folderName || ''}
                    onEditRange={handleOpenEditRange}
                    onDeleteRange={(r) =>
                      setDeletingItem({ type: 'range', id: r.id, name: r.name })
                    }
                    onEditProblem={handleOpenEditProblem}
                    onDeleteProblem={(probId, rId) =>
                      setDeletingItem({ type: 'problem', id: probId, rangeId: rId })
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Buttons */}
          <div style={styles.bottomActionsRow}>
            <button
              type="button"
              style={styles.bottomBtn}
              onClick={() => {
                navigate('/admin/range/create', { state: { subjectId } });
              }}
            >
              범위 추가
            </button>
            <button
              type="button"
              style={styles.bottomBtn}
              onClick={() => navigate('/problem/create')}
            >
              문제 추가
            </button>
          </div>
        </div>

        <footer style={styles.footer}>
          © 2026 맞공(maj.gong) — WJW06<br />
          majgong2026@gmail.com
        </footer>
      </main>

      {/* ── 팝업 모달 1: 범위 수정 ── */}
      {editingRange && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h2 style={styles.modalTitle}>범위 수정</h2>
            <div style={styles.sectionColumn}>
              <label style={styles.label}>범위 이름:</label>
              <input
                type="text"
                style={styles.input}
                value={editingRangeName}
                onChange={e => setEditingRangeName(e.target.value)}
              />
            </div>
            <div style={styles.sectionColumn}>
              <label style={styles.label}>폴더 이름(영문):</label>
              <input
                type="text"
                style={styles.input}
                value={editingRangeFolder}
                onChange={e => setEditingRangeFolder(e.target.value)}
              />
            </div>
            <div style={styles.modalButtonsRow}>
              <button
                type="button"
                style={styles.modalBtnCancel}
                onClick={() => setEditingRange(null)}
              >
                취소
              </button>
              <button
                type="button"
                style={styles.modalBtnSave}
                onClick={() => rangeUpdateMutation.mutate()}
                disabled={rangeUpdateMutation.isPending}
              >
                {rangeUpdateMutation.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 팝업 모달 2: 삭제 확인 ── */}
      {deletingItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardCompact}>
            <h2 style={styles.modalTitleConfirm}>정말 삭제하시겠습니까?</h2>
            {deletingItem.type === 'range' && (
              <p style={styles.modalConfirmSubText}>
                ⚠️ 범위 "{deletingItem.name}"를 삭제하면 해당 범위에 포함된 모든 문제도 함께 삭제됩니다.
              </p>
            )}
            <div style={styles.modalButtonsRow}>
              <button
                type="button"
                style={styles.modalBtnCancel}
                onClick={() => setDeletingItem(null)}
              >
                아니요
              </button>
              <button
                type="button"
                style={styles.modalBtnDanger}
                onClick={handleConfirmDelete}
                disabled={rangeDeleteMutation.isPending || problemDeleteMutation.isPending}
              >
                네
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 팝업 모달 3: 문제 수정 ── */}
      {editingProblem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardLarge}>
            <h2 style={styles.modalTitle}>문제 수정</h2>
            <div style={styles.modalScrollBody}>
              {/* Type and Difficulty */}
              <div style={styles.sectionRow}>
                <div style={styles.flex1}>
                  <label style={styles.label}>문제 유형</label>
                  <div style={styles.chipGroup}>
                    <button
                      type="button"
                      style={{ ...styles.chip, ...(editFormat === 'MULTIPLE_CHOICE' ? styles.chipActive : {}) }}
                      onClick={() => setEditFormat('MULTIPLE_CHOICE')}
                    >
                      객관식
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.chip, ...(editFormat === 'SHORT_ANSWER' ? styles.chipActive : {}) }}
                      onClick={() => setEditFormat('SHORT_ANSWER')}
                    >
                      주관식
                    </button>
                  </div>
                </div>

                <div style={styles.flex1}>
                  <label style={styles.label}>난이도</label>
                  <div style={styles.chipGroup}>
                    <button
                      type="button"
                      style={{ ...styles.chip, ...(editDifficulty === 'LOW' ? styles.chipActive : {}) }}
                      onClick={() => setEditDifficulty('LOW')}
                    >
                      하
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.chip, ...(editDifficulty === 'MEDIUM' ? styles.chipActive : {}) }}
                      onClick={() => setEditDifficulty('MEDIUM')}
                    >
                      중
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.chip, ...(editDifficulty === 'HIGH' ? styles.chipActive : {}) }}
                      onClick={() => setEditDifficulty('HIGH')}
                    >
                      상
                    </button>
                  </div>
                </div>
              </div>

              <div style={styles.divider} />

              {/* Drag and Drop Image */}
              <div style={styles.sectionColumn}>
                <label style={styles.label}>이미지 첨부 (Drag & Drop)</label>
                <div
                  style={{
                    ...styles.dropZone,
                    ...(editIsDragging ? styles.dropZoneActive : {}),
                    ...(editImageUrl || editImageFile ? styles.dropZoneFilled : {})
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {editImageUrl || editImageFile ? (
                    <div style={styles.previewContainer}>
                      <img
                        src={editImageFile ? URL.createObjectURL(editImageFile) : editImageUrl}
                        alt="Preview"
                        style={styles.previewImage}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                        }}
                      />
                      <div style={styles.previewInfo}>
                        <p style={styles.previewPath}>{editImageFile ? editImageFile.name : editImageUrl}</p>
                        <button
                          type="button"
                          style={styles.btnReset}
                          onClick={() => {
                            setEditImageUrl('');
                            setEditImageFile(null);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.dropZonePlaceholder}>
                      <span style={styles.dropIcon}>🖼️</span>
                      <p style={{ margin: 0, fontSize: '0.8rem' }}>이미지 파일을 여기에 드래그하여 놓으세요</p>
                    </div>
                  )}
                </div>

                <label style={styles.label}>이미지 URL (수동 입력)</label>
                <input
                  type="text"
                  style={styles.inputCompact}
                  placeholder="/source/math/E&I/problem1.png"
                  value={editImageUrl}
                  onChange={e => setEditImageUrl(e.target.value)}
                  disabled={!!editImageFile}
                />
              </div>

              <div style={styles.divider} />

              {/* Question Text */}
              <div style={styles.sectionColumn}>
                <label style={styles.label}>문제 내용</label>
                <textarea
                  style={styles.textarea}
                  placeholder="문제를 입력하세요"
                  value={editQuestion}
                  onChange={e => setEditQuestion(e.target.value)}
                  rows={2}
                />
              </div>

              <div style={styles.divider} />

              {/* Multiple choice options */}
              {editFormat === 'MULTIPLE_CHOICE' && (
                <div style={styles.sectionColumn}>
                  <label style={styles.label}>보기 입력 (5개)</label>
                  <div style={styles.optionsGrid}>
                    {editOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        style={styles.inputCompact}
                        placeholder={`보기 ${idx + 1}`}
                        value={opt}
                        onChange={e => handleOptionChange(idx, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              <div style={styles.sectionColumn}>
                <label style={styles.label}>
                  {editFormat === 'MULTIPLE_CHOICE' ? '정답 (객관식 보기 내용과 완전히 동일하게 작성)' : '정답 (직접 입력)'}
                </label>
                <input
                  type="text"
                  style={styles.inputCompact}
                  placeholder="정답이 될 문구를 입력하세요"
                  value={editAnswer}
                  onChange={e => setEditAnswer(e.target.value)}
                />
              </div>
            </div>

            {/* Save / Cancel buttons */}
            <div style={styles.modalButtonsRow}>
              <button
                type="button"
                style={styles.modalBtnCancel}
                onClick={() => setEditingProblem(null)}
              >
                취소
              </button>
              <button
                type="button"
                style={styles.modalBtnSave}
                onClick={() => {
                  if (!editQuestion.trim() || !editAnswer.trim()) {
                    alert('문제 내용과 정답을 입력해 주세요.');
                    return;
                  }
                  if (editFormat === 'MULTIPLE_CHOICE' && editOptions.some(o => !o.trim())) {
                    alert('객관식 보기를 모두 입력해 주세요.');
                    return;
                  }
                  problemUpdateMutation.mutate();
                }}
                disabled={problemUpdateMutation.isPending}
              >
                {problemUpdateMutation.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline Styles ──────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    padding: '2rem 1rem 3rem', fontFamily: "'Pretendard', sans-serif",
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
    display: 'flex', flexDirection: 'column', gap: '0.8rem',
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
    padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.8rem',
  },
  sectionRow: { display: 'flex', gap: '0.6rem', flexWrap: 'nowrap' },
  sectionColumn: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  flex1: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' },
  select: {
    width: '100%', padding: '0.5rem 0.75rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.85rem', outline: 'none',
  },
  input: {
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.85rem', outline: 'none',
    boxSizing: 'border-box',
  },
  inputCompact: {
    width: '100%', padding: '0.4rem 0.6rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.8rem', outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '0.5rem 0.75rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)',
    color: '#e0e7ff', fontSize: '0.85rem', outline: 'none', resize: 'vertical',
    boxSizing: 'border-box',
  },
  divider: { height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.1rem 0' },
  rangeSection: {
    display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: '120px'
  },
  infoText: {
    fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '1.5rem 0', margin: 0
  },
  errorText: {
    fontSize: '0.8rem', color: '#f87171', textAlign: 'center', padding: '1.5rem 0', margin: 0
  },
  rangesAccordionList: {
    display: 'flex', flexDirection: 'column', gap: '0.6rem'
  },
  rangeAccordion: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s',
  },
  accordionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)',
  },
  accordionTitleClick: {
    flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
    userSelect: 'none',
  },
  arrowIcon: { fontSize: '0.7rem', color: '#94a3b8' },
  rangeNameText: { fontSize: '0.9rem', fontWeight: 'bold', color: '#e2e8f0' },
  rangeActionButtons: { display: 'flex', gap: '0.4rem' },
  actionBtnEdit: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px', width: '28px', height: '28px', display: 'flex',
    justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionBtnDelete: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '6px', width: '28px', height: '28px', display: 'flex',
    justifyType: 'center', justifyItems: 'center', alignContent: 'center', alignItems: 'center',
    fontSize: '0.75rem', cursor: 'pointer', color: '#f87171', transition: 'all 0.2s',
    justifyContent: 'center'
  },
  accordionContent: {
    background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.04)',
    padding: '0.6rem 0.8rem',
  },
  problemListGrid: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  problemItemRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px',
  },
  problemInfoCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' },
  problemQuestionText: {
    fontSize: '0.85rem', fontWeight: '500', color: '#f1f5f9', margin: 0,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  problemMetaBadge: {
    fontSize: '0.7rem', color: '#64748b'
  },
  problemActionButtons: { display: 'flex', gap: '0.3rem', marginLeft: '0.5rem' },
  bottomActionsRow: { display: 'flex', gap: '0.8rem', marginTop: '0.4rem' },
  bottomBtn: {
    flex: 1, padding: '0.6rem', borderRadius: '12px',
    border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer',
    transition: 'all 0.2s', textAlign: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
  },
  btnPrimary: {
    width: '100%', padding: '0.6rem',
    borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer',
  },
  footer: {
    textAlign: 'center', color: '#334155', fontSize: '0.75rem', marginTop: '0.5rem'
  },

  // ── Modal Styles
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  modalCard: {
    width: '90%', maxWidth: '400px', background: '#131130',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
    padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  modalCardCompact: {
    width: '90%', maxWidth: '340px', background: '#131130',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
    padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.8rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', textAlign: 'center' as const,
  },
  modalCardLarge: {
    width: '90%', maxWidth: '500px', background: '#131130',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
    padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.8rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxHeight: '90vh',
  },
  modalScrollBody: {
    flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', gap: '0.8rem',
    paddingRight: '4px',
  },
  modalTitle: { fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: 0 },
  modalTitleConfirm: { fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: 0, textAlign: 'center' },
  modalConfirmSubText: { fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 },
  modalButtonsRow: { display: 'flex', gap: '0.6rem', marginTop: '0.5rem' },
  modalBtnCancel: {
    flex: 1, padding: '0.5rem', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
    color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer',
  },
  modalBtnSave: {
    flex: 1, padding: '0.5rem', borderRadius: '10px',
    border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer',
  },
  modalBtnDanger: {
    flex: 1, padding: '0.5rem', borderRadius: '10px',
    border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer',
  },

  // Dropzone inside Large Modal
  chipGroup: { display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', width: '100%' },
  chip: {
    flex: 1, padding: '0.4rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer',
    transition: 'all 0.2s ease', textAlign: 'center' as const,
  },
  chipActive: {
    borderColor: '#a78bfa', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontWeight: '600',
  },
  dropZone: {
    width: '100%', minHeight: '50px', borderRadius: '12px',
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
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    color: '#94a3b8', fontSize: '0.75rem',
  },
  dropIcon: { fontSize: '1rem' },
  previewContainer: {
    width: '100%', display: 'flex', gap: '0.6rem', padding: '0.3rem 0.6rem', alignItems: 'center',
  },
  previewImage: {
    width: '36px', height: '36px', objectFit: 'contain' as const, borderRadius: '6px',
    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
  },
  previewInfo: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden',
  },
  previewPath: {
    fontSize: '0.7rem', color: '#cbd5e1', wordBreak: 'break-all', margin: 0,
    background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px',
    maxHeight: '30px', overflow: 'hidden',
  },
  btnReset: {
    alignSelf: 'flex-start', padding: '2px 8px', borderRadius: '6px',
    background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)',
    cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600', transition: 'all 0.2s',
  },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' },
};
