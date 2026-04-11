import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchMe } from '../api/userApi';
import useAuthStore from '../store/useAuthStore';

export default function OAuth2Callback(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [errorMSG, setErrorMSG] = useState('');

  useEffect(() => {
    // The backend has successfully set the HttpOnly cookie for the token,
    // so we can immediately request the user information using the cookie.
    fetchMe()
      .then((user) => {
        setAuth(user);
        navigate('/main', { replace: true });
      })
      .catch((err) => {
        console.error('Failed to fetch user info during OAuth2 login', err);
        setErrorMSG('로그인 유저 정보를 불러오는 데 실패했습니다.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      });
  }, [navigate, setAuth]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner} />
        <h2 style={styles.text}>
          {errorMSG ? errorMSG : '로그인 처리 중입니다...'}
        </h2>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 50%, #24243e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
  },
  card: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(165,180,252,0.2)',
    borderTop: '4px solid #a5b4fc',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    color: '#e0e7ff',
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: 0,
  },
};
