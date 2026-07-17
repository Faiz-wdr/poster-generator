import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Lock, Shield, Eye, EyeOff } from 'lucide-react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'wdr654';

export default function SuperLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Redirect to super admin dashboard if already logged in
  useEffect(() => {
    if (sessionStorage.getItem('super_admin_logged_in') === 'true') {
      navigate('/super-admin');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('super_admin_logged_in', 'true');
      sessionStorage.removeItem('client_admin_logged_in');
      sessionStorage.removeItem('client_id');
      sessionStorage.removeItem('client_slug');
      navigate('/super-admin');
    } else {
      triggerError('Incorrect Super Admin password.');
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
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: 24,
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)', padding: '48px 40px', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        width: '100%', maxWidth: 420, position: 'relative', overflow: 'hidden',
        color: '#FFFFFF'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 120, height: 120,
          background: 'rgba(14, 165, 233, 0.15)',
          borderRadius: '50%', filter: 'blur(20px)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="logo-icon" style={{
            margin: '0 auto 16px', width: 56, height: 56, fontSize: '1.6rem',
            background: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '14px', color: '#FFFFFF', fontWeight: 800
          }}>
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Super Control Portal</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: 4 }}>
            Enter license key credentials to unlock global SaaS controls.
          </p>
        </div>

        <form onSubmit={handleLogin} id="super-login-form">
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="super-password-input" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#E2E8F0', display: 'block', marginBottom: 8 }}>
              Super Admin Key / Password *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, color: '#94A3B8' }} />
              <input
                id="super-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '12px 42px 12px 42px', borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.6)',
                  fontFamily: 'var(--font-body)', color: '#FFFFFF'
                }}
                required
                autoFocus
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
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                color: '#FCA5A5', fontWeight: 700, marginBottom: 20, fontSize: '0.88rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'rgba(239, 68, 68, 0.15)', padding: '10px 14px', borderRadius: 8,
                border: '1px solid rgba(239, 68, 68, 0.3)',
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
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
              color: '#FFFFFF', padding: '12px 24px', border: 'none', borderRadius: 10,
              fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.25)'
            }}
          >
            <span>Unlock Control Center →</span>
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8', textDecoration: 'none' }}>
            ← Back to Product Homepage
          </Link>
        </div>

        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      </div>
    </div>
  );
}
