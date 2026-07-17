import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClientBySlug, getResult, getTemplates, deleteResult } from '../lib/db';
import { applyClientTheme } from '../lib/theme';
import { posterEngine } from '../lib/posterEngine';
import { ArrowLeft, Download, Pencil, Trash2, Award, Palette, Calendar } from 'lucide-react';

export default function PublicEventDetail() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [client, setClient] = useState(null);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is the admin for this event client
  const isAdmin = sessionStorage.getItem('client_admin_logged_in') === 'true' && 
                  sessionStorage.getItem('client_slug') === slug;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const c = await getClientBySlug(slug);
      if (!c) {
        setClient(null);
        setLoading(false);
        return;
      }
      setClient(c);
      applyClientTheme(c);

      const [r, t] = await Promise.all([
        getResult(id),
        getTemplates(c.id)
      ]);

      setResult(r);
      setTemplates(t);
      setActiveTemplate(t[0] || null);
      setLoading(false);
    }
    load();

    return () => {
      // Reset theme on unmount
      applyClientTheme(null);
    };
  }, [slug, id]);

  // Render poster whenever result or template changes
  useEffect(() => {
    if (!containerRef.current || !result || !activeTemplate) return;
    const cleanup = posterEngine.render(containerRef.current, result, activeTemplate, {});
    return cleanup;
  }, [result, activeTemplate]);

  const handleDownload = () => {
    if (!containerRef.current) return;
    posterEngine.exportJpg(containerRef.current, `${result.programName}.jpg`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete result "${result.programName}"? This cannot be undone.`)) return;
    const ok = await deleteResult(id);
    if (ok) navigate(`/event/${slug}`);
    else alert('Failed to delete result.');
  };

  const getPlaceBadge = (pos) => {
    if (pos === '01' || pos === '1') return { cls: 'winner-place-1', label: '1st' };
    if (pos === '02' || pos === '2') return { cls: 'winner-place-2', label: '2nd' };
    if (pos === '03' || pos === '3') return { cls: 'winner-place-3', label: '3rd' };
    return { cls: 'winner-place-2', label: pos };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Loading result details…
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Event Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 420 }}>
          The event portal you are trying to access does not exist.
        </p>
        <Link to="/" className="btn btn-primary">Return to Homepage</Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
        <header style={{ background: 'white', borderBottom: '1px solid var(--border-color)', padding: '14px 0' }}>
          <div className="container nav-flex">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="logo-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image')) ? (
                  <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                ) : (
                  client.logo || 'E'
                )}
              </div>
              <div style={{ fontWeight: 800 }}>{client.event_name}</div>
            </div>
            <Link to={`/event/${slug}`} className="btn btn-outline btn-sm">Results Gallery</Link>
          </div>
        </header>
        <main className="container section-padding" style={{ textAlign: 'center', flexGrow: 1 }}>
          <h2>Result not found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>This program result could not be located.</p>
          <Link to={`/event/${slug}`} className="btn btn-primary" style={{ marginTop: 24 }}>← Back to Gallery</Link>
        </main>
      </div>
    );
  }

  const winners = result.winners || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Event Header */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--border-color)', padding: '14px 0' }}>
        <div className="container nav-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon" style={{ background: `linear-gradient(135deg, var(--primary), var(--secondary))`, overflow: 'hidden' }}>
              {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image')) ? (
                <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              ) : (
                client.logo || 'E'
              )}
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {client.event_name}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {client.organization_name}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to={`/event/${slug}`} style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>Results</Link>
            <Link to="/login" className="btn btn-outline btn-sm" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Admin Access</Link>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="container section-padding" style={{ paddingTop: 40, flexGrow: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to={`/event/${slug}`} style={{ fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Results Gallery
          </Link>
        </div>

        <div className="detail-grid">
          {/* Left: Poster Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div ref={containerRef} className="poster-preview-container" />

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 480, gap: 12, marginTop: 24 }}>
              <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleDownload}>
                <Download size={18} /> Download Poster (High-Res JPG)
              </button>

              {isAdmin && (
                <div style={{ display: 'flex', gap: 12 }} id="admin-actions-shortcut">
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flexGrow: 1, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => navigate(`/admin/upload?edit=${result.id}`)}
                  >
                    <Pencil size={14} /> Edit Result Details
                  </button>
                  <button
                    className="btn btn-outline btn-sm btn-danger"
                    style={{ flexGrow: 1, padding: 12, color: '#FFFFFF', borderColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} /> Delete Result
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details & Theme Selector */}
          <div className="detail-sidebar">
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{result.category}</span>
            <h1>{result.programName}</h1>

            <div className="detail-divider" />
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} style={{ color: 'var(--accent)' }} />
              <span>Placement Standings</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {winners.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No winners recorded for this event yet.</p>
              ) : (
                winners.map((w, i) => {
                  const badge = getPlaceBadge(w.position);
                  const borderCls = i === 0 ? 'winner-item-1' : i === 1 ? 'winner-item-2' : i === 2 ? 'winner-item-3' : '';
                  return (
                    <div key={i} className={`winner-item ${borderCls}`}>
                      <div className={`winner-place ${badge.cls}`}>{badge.label}</div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {w.team || 'No Team'}
                        </div>
                        <div className="winner-name">{w.name}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="detail-divider" />

            {/* Template Picker */}
            <h3 style={{ fontSize: '1.15rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Palette size={20} style={{ color: 'var(--primary)' }} />
              <span>Apply Brand Layout Style</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Click any layout thumbnail to instantly apply event graphics.
            </p>

            {templates.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.88rem' }}>No templates registered for this event.</p>
            ) : (
              <div className="template-slider-container" style={{ margin: 0 }}>
                <div className="template-slider" style={{ paddingBottom: 12 }}>
                  {templates.map(tpl => (
                    <div
                      key={tpl.id}
                      className={`template-slide ${activeTemplate?.id === tpl.id ? 'active' : ''}`}
                      onClick={() => setActiveTemplate(tpl)}
                      title={tpl.name}
                    >
                      <div
                        className="template-slide-img"
                        style={{ backgroundImage: `url("${tpl.background}")`, backgroundSize: 'cover' }}
                      />
                      <div className="template-slide-name">{tpl.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Event Footer */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '40px 0', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem', marginBottom: 6 }}>
              {client.event_name}
            </div>
            <p>© {new Date().getFullYear()} {client.organization_name}. All rights reserved.</p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/" style={{ color: '#94A3B8' }}>Powered by ResultFlow</Link>
            <Link to="/login" style={{ color: '#94A3B8' }}>Admin Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
