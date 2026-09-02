import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BRAND } from '../config/branding';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@tjconsultancy.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const isPortal = data.user.roles?.some((r) => r.name === 'Customer Portal User');
      navigate(isPortal ? '/portal' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card" aria-labelledby="login-heading">
        <div className="login-brand">
          <img src={BRAND.logoUrl} alt={`${BRAND.name} logo`} />
          <h1 id="login-heading">{BRAND.name}</h1>
          <p>Financial Management System v1.0</p>
        </div>
        {error && (
          <div className="alert alert-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group mb-1">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div className="form-group mb-1">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-muted login-hint">
          Admin: admin@tjconsultancy.com / Admin@TJ2026
          <br />
          Portal: accounts@banka.com / Customer@TJ2026
        </p>
      </main>
    </div>
  );
}
