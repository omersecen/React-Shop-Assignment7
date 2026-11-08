import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { login, DEMO_USERNAME } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    try {
      const user = await login(username, password);
      if (!active.current) return;
      dispatch({ type: 'LOGGED_IN', user });
      const from = location.state?.from;
      const destination = from?.pathname?.startsWith('/') && !from.pathname.startsWith('//') && from.pathname !== '/login'
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : '/';
      navigate(destination, { replace: true });
    } catch (failure) {
      if (active.current) setError(failure.message);
    } finally {
      if (active.current) setLoading(false);
    }
  }
  return <section className="login-panel"><p className="eyebrow">WELCOME BACK</p><h1>Your finds are waiting.</h1><p>Sign in to review and manage your cart.</p>
    <form onSubmit={handleSubmit}>
      <label>Student email<input type="email" autoComplete="username" required value={username} onChange={event => setUsername(event.target.value)} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in →'}</button>
    </form><aside className="demo-note"><strong>Demo account</strong><p>{DEMO_USERNAME}<br />Password: <code>demo123456</code></p><small>This is a practice sign-in. Do not enter a real password.</small></aside>
  </section>;
}
