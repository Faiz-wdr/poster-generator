import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import PublishResult from './PublishResult';
import TemplateEditor from './TemplateEditor';
import PublishedResults from './PublishedResults';
import Settings from './Settings';
import {
  LayoutDashboard,
  PlusCircle,
  Palette,
  ClipboardList,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'wdr456';

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_logged_in', 'true');
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setPw('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', padding: 24,
    }}>
      <div style={{
        background: 'white', padding: '48px 40px', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)',
        width: '100%', maxWidth: 400, textAlign: 'center',
      }}>
        <div className="logo-icon" style={{ margin: '0 auto 20px', width: 56, height: 56, fontSize: '1.8rem' }}>A</div>
        <h2 style={{ marginBottom: 8 }}>Admin Access</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem' }}>
          Enter your admin password to continue.
        </p>
        <form onSubmit={submit} id="admin-login-form">
          <div className="form-group">
            <input
              type="password"
              id="admin-password-input"
              placeholder="Admin Password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.1em' }}
              autoFocus
            />
          </div>
          {error && (
            <div
              id="login-error-msg"
              style={{
                color: '#EF4444', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                animation: shake ? 'shake 0.4s ease' : 'none',
              }}
            >
              <AlertCircle size={16} />
              <span>Incorrect password. Please try again.</span>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Unlock Dashboard →
          </button>
        </form>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/upload', label: 'Publish Result', icon: <PlusCircle size={18} /> },
  { to: '/admin/templates', label: 'Template Editor', icon: <Palette size={18} /> },
  { to: '/admin/published', label: 'Published Results', icon: <ClipboardList size={18} /> },
  { to: '/admin/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
];

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(
    sessionStorage.getItem('admin_logged_in') === 'true'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setLoggedIn(false);
  };

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="admin-container">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div>
          <div className="logo-group" style={{ padding: '0 8px' }}>
            <div className="logo-icon">A</div>
            <div className="logo-text">Arts Admin</div>
          </div>

          <nav className="admin-nav">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <button
            className="admin-nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={logout}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}><LogOut size={18} /></span>
            <span>Logout</span>
          </button>
          <div style={{ marginTop: 16, padding: '0 8px' }}>
            <button
              className="btn btn-outline btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={14} /> View Public Site
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-content">
        {/* Mobile header */}
        <div className="admin-mobile-header">
          <div className="logo-group">
            <div className="logo-icon">A</div>
            <div className="logo-text">Arts Admin</div>
          </div>
          <button
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<PublishResult />} />
          <Route path="templates" element={<TemplateEditor />} />
          <Route path="published" element={<PublishedResults />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
