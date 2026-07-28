import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getClientBySlug } from '../../lib/db';
import { AlertCircle, Lock, Globe, Eye, EyeOff } from 'lucide-react';

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
      background: '#F8FAFC', padding: 24,
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: '#FFFFFF', padding: '40px 36px', borderRadius: 16,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        width: '100%', maxWidth: 400
      }}>
        {/* Header — Event Portal title, no logo icon, no accent line */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Event Portal
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 6, marginBottom: 0 }}>
            Enter event credentials to access your coordinator workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} id="login-auth-form">
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="login-username-input" style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B', display: 'block', marginBottom: 6 }}>
              Username *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Globe size={16} style={{ position: 'absolute', left: 14, color: '#94A3B8' }} />
              <input
                id="login-username-input"
                type="text"
                placeholder="e.g. wandoor-sahityotsav-2026"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px 12px 42px', borderRadius: 8,
                  border: '1px solid #CBD5E1', background: '#FFFFFF',
                  fontSize: '0.95rem', color: '#0F172A', outline: 'none'
                }}
                disabled={loading}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="login-password-input" style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B', display: 'block', marginBottom: 6 }}>
              Password *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, color: '#94A3B8' }} />
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '12px 42px 12px 42px', borderRadius: 8,
                  border: '1px solid #CBD5E1', background: '#FFFFFF',
                  fontSize: '0.95rem', color: '#0F172A', outline: 'none'
                }}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, color: '#94A3B8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                color: '#DC2626', fontWeight: 600, marginBottom: 20, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, border: '1px solid #FCA5A5',
                animation: shake ? 'shake 0.4s ease' : 'none',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Button — Clean label, no icons, no arrow */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%', height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#001735ff', color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, borderRadius: 8,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <span>{loading ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#001735ff', textDecoration: 'none' }}>
            Back to Homepage
          </Link>
        </div>

        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      </div>
    </div>
  );
}
