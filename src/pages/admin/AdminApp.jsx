import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { getClient } from '../../lib/db';
import { applyClientTheme } from '../../lib/theme';
import Dashboard from './Dashboard';
import PublishResult from './PublishResult';
import TemplateEditor from './TemplateEditor';
import PublishedResults from './PublishedResults';
import Settings from './Settings';
import ScheduleManager from './ScheduleManager';
import TeamPoints from './TeamPoints';
import {
  LayoutDashboard,
  PlusCircle,
  Palette,
  Trophy,
  ClipboardList,
  CalendarDays,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  Lock
} from 'lucide-react';

export default function AdminApp() {
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const clientId = sessionStorage.getItem('client_id');
  const loggedIn = sessionStorage.getItem('client_admin_logged_in') === 'true';

  useEffect(() => {
    if (!loggedIn || !clientId) {
      navigate('/login');
      return;
    }

    async function loadClient() {
      try {
        const c = await getClient(clientId);
        if (!c) {
          sessionStorage.clear();
          navigate('/login');
          return;
        }
        setClient(c);
        applyClientTheme(c);
        
        // Set Event Admin Control Panel Title & Description
        document.title = `${c.event_name} Control Panel — ResultFlow Admin`;
        let metaDesc = document.querySelector('meta[name="description"]');
        const adminDesc = `Event coordinator control panel for ${c.event_name} (${c.organization_name}). Manage program standings, publish live winner announcements, generate batch poster graphics, and configure team points.`;
        if (metaDesc) {
          metaDesc.setAttribute('content', adminDesc);
        } else {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          metaDesc.content = adminDesc;
          document.head.appendChild(metaDesc);
        }

        const expiry = c.expiry_date ? new Date(c.expiry_date) : null;
        const expired = expiry ? expiry <= new Date() : false;
        setIsExpired(expired);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load client details in AdminApp:", err);
        setLoading(false);
      }
    }

    loadClient();

    return () => {
      applyClientTheme(null);
    };
  }, [loggedIn, clientId, navigate]);

  const logout = () => {
    sessionStorage.clear();
    applyClientTheme(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Authenticating event dashboard…
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/upload', label: 'Publish Result', icon: <PlusCircle size={18} /> },
    { to: '/admin/templates', label: 'Templates', icon: <Palette size={18} /> },
    { to: '/admin/results', label: 'Results', icon: <ClipboardList size={18} /> },
    { to: '/admin/schedule', label: 'Event Schedule', icon: <CalendarDays size={18} /> },
    { to: '/admin/team-points', label: 'Team Points', icon: <Trophy size={18} /> },
    { to: '/admin/settings', label: 'Program Settings', icon: <SettingsIcon size={18} /> },
  ];

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
            <div className="logo-icon" style={{ background: `linear-gradient(135deg, var(--primary), var(--secondary))`, overflow: 'hidden' }}>
              {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image')) ? (
                <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              ) : (
                client.logo || 'E'
              )}
            </div>
            <div>
              <div className="logo-text" style={{ fontSize: '1.1rem', background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>
                {client.event_name}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                {client.organization_name}
              </div>
            </div>
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
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onClick={logout}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}><LogOut size={18} /></span>
            <span>Logout</span>
          </button>
          
          <div style={{ marginTop: 16, padding: '0 8px' }}>
            <a
              className="btn btn-outline btn-sm"
              href={`/event/${client.slug}`}
              target="_blank"
              rel="noreferrer"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <ArrowLeft size={14} /> View Public Event
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Mobile header */}
        <div className="admin-mobile-header">
          <div className="logo-group">
            <div className="logo-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image')) ? (
                <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              ) : (
                client.logo || 'E'
              )}
            </div>
            <div className="logo-text">{client.event_name}</div>
          </div>
          <button
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        {/* Global Expiry Locked Alert */}
        {isExpired && (
          <div style={{
            background: '#FEF2F2', borderBottom: '1px solid #FCA5A5', color: '#B91C1C',
            padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '0.9rem'
          }}>
            <Lock size={16} style={{ flexShrink: 0 }} />
            <span>Event License Expired. Contact Administrator. Editing has been locked.</span>
          </div>
        )}

        <div style={{ padding: 24, flexGrow: 1 }}>
          <Routes>
            <Route index element={<Dashboard isExpired={isExpired} clientId={clientId} />} />
            <Route path="upload" element={<PublishResult isExpired={isExpired} clientId={clientId} />} />
            <Route path="templates" element={<TemplateEditor isExpired={isExpired} clientId={clientId} />} />
            <Route path="results" element={<PublishedResults isExpired={isExpired} clientId={clientId} />} />
            <Route path="schedule" element={<ScheduleManager isExpired={isExpired} clientId={clientId} />} />
            <Route path="team-points" element={<TeamPoints isExpired={isExpired} clientId={clientId} />} />
            <Route path="settings" element={<Settings isExpired={isExpired} clientId={clientId} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

