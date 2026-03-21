import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { login } from '../api/auth';
import type { LoginRequest } from '../types/auth';

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginRequest: LoginRequest = {
      email,
      password,
    };

    try {
      const response = await login(loginRequest);
      setToken(response.token);
      setUser(response.user);
      navigate('/');
    } catch (err) {
      setError('로그인 실패: 아이디 또는 비밀번호가 일치하지 않습니다.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          로그인
        </h2>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div>
            <label style={styles.label}>
              이메일
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder='이메일을 입력해주세요'
            />
          </div>

          <div>
            <label style={styles.label}>
              비밀번호
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder='비밀번호를 입력해주세요'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            style={styles.button}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className='mt-4 text-center'>
          <button
            onClick={() => navigate('/register')}
            style={styles.buttonText}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}


const style: Record<string, CSSProperties> = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
}