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
      return { label: '1st Place', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
    }
    if (positionStr === '02' || positionStr === '2') {
      return { label: '2nd Place', bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' };
    }
    if (positionStr === '03' || positionStr === '3') {
      return { label: '3rd Place', bg: '#FFEDD5', color: '#9A3412', border: '#FDBA74' };
    }
    return { label: `Rank ${positionStr}`, bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
          Loading result details…
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#0F172A' }}>Event Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: 24, maxWidth: 420 }}>
          The event portal you are trying to access does not exist.
        </p>
        <Link to="/" className="btn btn-primary">Return to Homepage</Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 0' }}>
          <div className="container nav-flex">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="logo-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image')) ? (
                  <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                ) : (
                  client.logo || 'E'
                )}
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A' }}>{client.event_name}</div>
            </div>
            <Link to={`/event/${slug}`} className="btn btn-outline btn-sm">Results Directory</Link>
          </div>
        </header>
        <main className="container section-padding" style={{ textAlign: 'center', flexGrow: 1 }}>
          <h2 style={{ color: '#0F172A' }}>Result not found</h2>
          <p style={{ color: '#64748B', marginTop: 8 }}>This program result could not be located.</p>
          <Link to={`/event/${slug}`} className="btn btn-primary" style={{ marginTop: 24 }}>← Back to Results</Link>
        </main>
      </div>
    );
  }

  const winners = result.winners || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: 'var(--font-body)' }}>
      {/* Event Header */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container nav-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon" style={{ background: '#0F172A', color: '#FFFFFF', overflow: 'hidden' }}>
              {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image')) ? (
                <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to={`/event/${slug}`} style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>All Results</Link>
            <Link to="/login" className="btn btn-outline btn-sm" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Admin Access</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flexGrow: 1, paddingTop: 32, paddingBottom: 64, maxWidth: 760, margin: '0 auto' }}>
        {/* Navigation & Share */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link to={`/event/${slug}`} style={{ fontWeight: 600, color: '#475569', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to Results List
          </Link>
          
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px',
              color: '#334155', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} style={{ color: '#16A34A' }} /> : <Share2 size={14} />}
            <span>{copied ? 'Link Copied' : 'Share Result'}</span>
          </button>
        </div>

        {/* Professional Result Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Card Header */}
          <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{
                background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0',
                fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px'
              }}>
                {result.category}
              </span>
              {result.resultNo && (
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>
                  Result No: #{result.resultNo}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.25 }}>
              {result.programName}
            </h1>
          </div>

          {/* Standings Downward List Section */}
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Award size={20} style={{ color: '#0F172A' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Official Placement Standings
              </h2>
            </div>

            {winners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748B', fontStyle: 'italic' }}>
                No winners listed for this program yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {winners.map((w, index) => {
                  const badge = getPlaceBadge(w.position, index);
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '16px 20px',
                        background: '#F8FAFC',
                        borderRadius: '12px',
                        border: `1px solid ${badge.border}`,
                        gap: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Position Tag */}
                        <div style={{
                          minWidth: '84px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: badge.bg,
                          color: badge.color,
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          border: `1px solid ${badge.border}`
                        }}>
                          {badge.label}
                        </div>

                        {/* Winner Name */}
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                            {w.name}
                          </div>
                        </div>
                      </div>

                      {/* Team Name */}
                      {w.team && (
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#475569',
                          background: '#FFFFFF',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          whiteSpace: 'nowrap'
                        }}>
                          {w.team}
                        </div>
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
              padding: '20px 32px',
              background: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: 12,
              justify: 'flex-end'
            }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                onClick={() => navigate(`/admin/upload?edit=${result.id}`)}
              >
                <Pencil size={14} /> Edit Result
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ color: '#DC2626', borderColor: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div className="container public-footer-content">
          <div className="public-footer-brand">
            <div className="public-footer-title">
              {client.event_name}
            </div>
            <div className="public-footer-subtitle">
              {client.organization_name}
            </div>
          </div>
          <div className="public-footer-links">
            <Link to="/">ResultFlow</Link>
            <Link to="/login">Admin Login</Link>
          </div>
          <div className="public-footer-copyright">
            © {new Date().getFullYear()} {client.organization_name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
