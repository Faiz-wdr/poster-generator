import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getClientBySlug } from '../../lib/db';
import { AlertCircle, Lock, LayoutDashboard, Globe, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (sessionStorage.getItem('client_admin_logged_in') === 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const slug = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!slug) {
      triggerError('Please enter your Event Slug / Username.');
      return;
    }

    setLoading(true);
    try {
      const client = await getClientBySlug(slug);
      if (client && client.status === 'active' && password === client.admin_password) {
        sessionStorage.setItem('client_admin_logged_in', 'true');
        sessionStorage.setItem('client_id', client.id);
        sessionStorage.setItem('client_slug', client.slug);
        sessionStorage.removeItem('super_admin_logged_in');
        navigate('/admin');
      } else if (client && client.status === 'suspended') {
        triggerError('This event portal has been suspended.');
      } else {
        triggerError('Incorrect Event Slug or Password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      triggerError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setPassword('');
    setTimeout(() => setShake(false), 600);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', padding: 24,
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        background: 'white', padding: '48px 40px', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)',
        width: '100%', maxWidth: 420, position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative corner background shapes */}
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 90, height: 90,
          background: 'rgba(124, 58, 237, 0.1)',
          borderRadius: '50%', filter: 'blur(10px)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="logo-icon" style={{
            margin: '0 auto 16px', width: 52, height: 52, fontSize: '1.6rem',
            background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', color: '#FFFFFF', fontWeight: 800
          }}>
            C
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>ResultFlow Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Enter event credentials to access your coordinator workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} id="login-auth-form">
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="login-username-input" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
              Event Slug / Username *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Globe size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)' }} />
              <input
                id="login-username-input"
                type="text"
                placeholder="e.g. wandoor-sahityotsav-2026"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10,
                  border: '1px solid var(--border-color)', background: 'var(--bg-page)',
                  fontFamily: 'var(--font-body)'
                }}
                disabled={loading}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="login-password-input" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
              Password *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)' }} />
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '12px 42px 12px 42px', borderRadius: 10,
                  border: '1px solid var(--border-color)', background: 'var(--bg-page)',
                  fontFamily: 'var(--font-body)'
                }}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={loading}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                color: '#EF4444', fontWeight: 700, marginBottom: 20, fontSize: '0.88rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, border: '1px solid #FCA5A5',
                animation: shake ? 'shake 0.4s ease' : 'none',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'var(--primary)',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)'
            }}
          >
            <LayoutDashboard size={18} />
            <span>{loading ? 'Logging in...' : 'Unlock Event Dashboard →'}</span>
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link to="/" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            ← Back to Product Homepage
          </Link>
        </div>

        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      </div>
    </div>
  );
}
