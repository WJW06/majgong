import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api/v1';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message: string;
}

async function registerApi(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '회원가입 실패');
  }

  return res.json() as Promise<RegisterResponse>;
}

export default function Register(): React.ReactElement {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      await registerApi({ name, email, password });
      setSuccess('회원가입이 완료됐습니다! 로그인 페이지로 이동합니다.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>회원가입</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div>
            <label style={styles.label}>닉네임</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              placeholder="닉네임을 입력해주세요"
            />
          </div>

          <div>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="이메일을 입력해주세요"
            />
          </div>

          <div>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="비밀번호 (6자 이상)"
            />
          </div>

          <div>
            <label style={styles.label}>비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              style={styles.input}
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        {/* 소셜 로그인 구분선 */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>또는 소셜 계정으로 가입</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Google 회원가입 */}
        <button
          type="button"
          style={styles.googleButton}
          onClick={() => { window.location.href = '/api/v1/auth/google'; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10, flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.1-6.1C34.46 3.1 29.5 1 24 1 14.82 1 7.07 6.48 3.68 14.22l7.07 5.49C12.49 13.47 17.82 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v8.97h12.68c-.55 2.94-2.2 5.43-4.68 7.1l7.19 5.59C43.18 37.45 46.52 31.45 46.52 24.5z"/>
            <path fill="#FBBC05" d="M10.75 28.29A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.71-4.29L3.14 14.22A23.94 23.94 0 0 0 0 24c0 3.87.93 7.52 2.57 10.73l7.18-6.44z"/>
            <path fill="#34A853" d="M24 47c6.48 0 11.92-2.15 15.89-5.84l-7.19-5.59c-2.01 1.35-4.59 2.15-8.7 2.15-6.18 0-11.41-3.98-13.32-9.43l-7.07 6.44C7.07 41.52 14.82 47 24 47z"/>
          </svg>
          Google로 가입하기
        </button>

        {/* Naver 회원가입 */}
        <button
          type="button"
          style={styles.naverButton}
          onClick={() => { window.location.href = '/api/v1/auth/naver'; }}
        >
          <span style={styles.naverLogo}>N</span>
          Naver로 가입하기
        </button>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span style={styles.guideText}>이미 계정이 있으신가요?</span>
          <button
            onClick={() => navigate('/login')}
            style={styles.linkButton}
          >
            로그인
          </button>
        </div>
      </div>

      <footer style={styles.footer}>
        © 2026 맞공(maj.gong) — WJW06
      </footer>
    </div>
  </div>
  );
}

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
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#e0e7ff',
    marginBottom: '1.5rem',
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontWeight: 500,
    fontSize: '0.9rem',
    color: '#e0e7ff',
  },
  input: {
    width: '100%',
    height: '44px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '0 12px',
    fontSize: '0.95rem',
    color: '#fff',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    height: '48px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#a5b4fc',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'underline',
    marginLeft: '6px',
  },
  error: {
    color: '#fca5a5',
    backgroundColor: 'rgba(248,113,113,0.15)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  success: {
    color: '#86efac',
    backgroundColor: 'rgba(22,163,74,0.15)',
    border: '1px solid rgba(134,239,172,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0 16px',
    gap: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    display: 'block',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '44px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#3c4043',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'background 0.2s',
  },
  naverButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '44px',
    backgroundColor: '#03C75A',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '4px',
  },
  naverLogo: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    backgroundColor: '#fff',
    color: '#03C75A',
    fontWeight: 900,
    fontSize: '12px',
    borderRadius: '3px',
    marginRight: '10px',
    flexShrink: 0,
  },
  guideText: {
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  footer: {
    textAlign: 'center',
    color: '#334155',
    fontSize: '0.75rem',
    marginTop: '10px',
  },
};

