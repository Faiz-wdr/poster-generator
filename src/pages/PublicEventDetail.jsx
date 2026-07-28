import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClientBySlug, getResult, deleteResult } from '../lib/db';
import { applyClientTheme } from '../lib/theme';
import { ArrowLeft, Pencil, Trash2, Award, Share2, Check } from 'lucide-react';

export default function PublicEventDetail({ overrideSlug, overrideId }) {
  const { slug: routeSlug, id: routeId } = useParams();
  const slug = overrideSlug || routeSlug;
  const id = overrideId || routeId;
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

      const r = await getResult(id);
      setResult(r);
      setLoading(false);
    }
    load();

    return () => {
      applyClientTheme(null);
    };
  }, [slug, id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete result "${result.programName}"? This cannot be undone.`)) return;
    const ok = await deleteResult(id);
    if (ok) navigate(`/event/${slug}`);
    else alert('Failed to delete result.');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlaceBadge = (pos, index) => {
    const positionStr = pos || String(index + 1).padStart(2, '0');
    if (positionStr === '01' || positionStr === '1') {
      return { label: '1st Place', bg: '#0F172A', color: '#FFFFFF', border: '#0F172A' };
    }
    if (positionStr === '02' || positionStr === '2') {
      return { label: '2nd Place', bg: '#0066FF', color: '#FFFFFF', border: '#0066FF' };
    }
    if (positionStr === '03' || positionStr === '3') {
      return { label: '3rd Place', bg: '#F1F5F9', color: '#0F172A', border: '#CBD5E1' };
    }
    return { label: `Rank ${positionStr}`, bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
          Loading result details…
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#0F172A' }}>Event Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: 24, maxWidth: 420 }}>
          The event portal you are trying to access does not exist.
        </p>
        <Link to="/" className="hz-btn-dark">Return to Homepage</Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
        <header style={{ background: 'rgba(244, 245, 247, 0.95)', borderBottom: '1px solid #E2E8F0', padding: '16px 0' }}>
          <div className="container nav-flex">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 800 }}>
                {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image')) ? (
                  <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  client.logo || 'E'
                )}
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A' }}>{client.event_name}</div>
            </div>
            <Link to={`/event/${slug}`} className="hz-btn-light" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Results Directory</Link>
          </div>
        </header>
        <main className="container section-padding" style={{ textAlign: 'center', flexGrow: 1 }}>
          <h2 style={{ color: '#0F172A' }}>Result not found</h2>
          <p style={{ color: '#64748B', marginTop: 8 }}>This program result could not be located.</p>
          <Link to={`/event/${slug}`} className="hz-btn-dark" style={{ marginTop: 24 }}>← Back to Results</Link>
        </main>
      </div>
    );
  }

  const winners = result.winners || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}>
      {/* Event Header */}
      <header style={{ background: 'rgba(244, 245, 247, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0', padding: '16px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container nav-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 800 }}>
              {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image')) ? (
                <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                client.logo || 'E'
              )}
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {client.event_name}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {client.organization_name}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to={`/event/${slug}`} className="hz-btn-light" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>All Results</Link>
            <Link to="/login" className="hz-btn-dark" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Admin Access</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flexGrow: 1, paddingTop: 32, paddingBottom: 64, maxWidth: 780, margin: '0 auto' }}>
        {/* Navigation & Share */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link to={`/event/${slug}`} style={{ fontWeight: 700, color: '#0F172A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to Results List
          </Link>
          
          <button
            onClick={handleShare}
            className="hz-btn-light"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {copied ? <Check size={14} style={{ color: '#16A34A' }} /> : <Share2 size={14} />}
            <span>{copied ? 'Link Copied' : 'Share Result'}</span>
          </button>
        </div>

        {/* Horizon Courts Bento Result Card */}
        <div className="hz-card" style={{ padding: 0 }}>
          {/* Card Header */}
          <div style={{ padding: '36px 36px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className="hz-pill-badge" style={{ background: '#0F172A', color: '#FFFFFF', border: 'none' }}>
                {result.category}
              </span>
              {result.resultNo && (
                <span className="hz-pill-badge">
                  Result No: #{result.resultNo}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {result.programName}
            </h1>
          </div>

          {/* Standings Downward List Section */}
          <div style={{ padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Award size={22} style={{ color: '#0066FF' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Official Placement Standings
              </h2>
            </div>

            {winners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748B', fontStyle: 'italic' }}>
                No winners listed for this program yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {winners.map((w, index) => {
                  const badge = getPlaceBadge(w.position, index);
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '18px 24px',
                        background: '#F8FAFC',
                        borderRadius: '20px',
                        border: `1px solid ${badge.border}`,
                        gap: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Position Tag */}
                        <div style={{
                          minWidth: '94px',
                          padding: '8px 14px',
                          borderRadius: 9999,
                          background: badge.bg,
                          color: badge.color,
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          textAlign: 'center'
                        }}>
                          {badge.label}
                        </div>

                        {/* Winner Name */}
                        <div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                            {w.name}
                          </div>
                        </div>
                      </div>

                      {/* Team Name */}
                      {w.team && (
                        <span className="hz-pill-badge" style={{ fontSize: '0.82rem', padding: '6px 16px' }}>
                          {w.team}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Controls Footer (Only visible when logged in as admin) */}
          {isAdmin && (
            <div style={{
              padding: '20px 36px',
              background: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: 12,
              justify: 'flex-end'
            }}>
              <button
                className="hz-btn-light"
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                onClick={() => navigate(`/admin/upload?edit=${result.id}`)}
              >
                <Pencil size={14} /> Edit Result
              </button>
              <button
                className="hz-btn-light"
                style={{ color: '#DC2626', borderColor: '#FCA5A5', fontSize: '0.85rem', padding: '8px 16px' }}
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '40px 0 60px', fontSize: '0.9rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
              {client.event_name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              {client.organization_name}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/" style={{ color: '#94A3B8', fontWeight: 600 }}>ResultFlow</Link>
            <Link to="/login" style={{ color: '#94A3B8', fontWeight: 600 }}>Admin Login</Link>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
            © {new Date().getFullYear()} {client.organization_name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
