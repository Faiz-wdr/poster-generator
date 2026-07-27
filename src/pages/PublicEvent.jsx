import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClientBySlug, getResults } from '../lib/db';
import { applyClientTheme } from '../lib/theme';
import { CATEGORY_OPTIONS } from '../data/defaults';
import ResultRow from '../components/ResultRow';
import ResultDetailModal from '../components/ResultDetailModal';
import { Search, Trophy, Calendar, Award } from 'lucide-react';

export default function PublicEvent() {
  const { slug } = useParams();

  const [client, setClient] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedResult, setSelectedResult] = useState(null);

  // Check if current user is admin for this event client
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

      const r = await getResults(c.id);
      const published = r.filter(item => item.status === 'published');
      setResults(published);
      setLoading(false);
    }
    load();

    return () => {
      applyClientTheme(null);
    };
  }, [slug]);

  const handleDeleteSuccess = (deletedId) => {
    setResults(prev => prev.filter(item => item.id !== deletedId));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
          Loading event portal…
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#0F172A' }}>Event Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: 24, maxWidth: 420 }}>
          The event URL you are trying to access does not exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">Return to Homepage</Link>
      </div>
    );
  }

  if (client.status === 'suspended') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#EF4444' }}>Event Access Suspended</h2>
        <p style={{ color: '#64748B', marginBottom: 24, maxWidth: 420 }}>
          This event portal has been suspended by the administrator. Please contact support.
        </p>
        <Link to="/" className="btn btn-primary">Return to Homepage</Link>
      </div>
    );
  }

  const filtered = results.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.programName?.toLowerCase().includes(q) ||
      r.winners?.some(w => w.name?.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const clientCats = client?.categories && client.categories.length ? client.categories : CATEGORY_OPTIONS;
  const categories = ['All', ...clientCats];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: 'var(--font-body)' }}>
      {/* Event Header */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50, padding: '14px 0' }}>
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
            <Link to={`/event/${slug}`} style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>Results</Link>
            <Link to="/login" className="btn btn-outline btn-sm" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>Admin Access</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flexGrow: 1, paddingBottom: 80 }}>
        {/* Hero Section */}
        <section className="hero-centered" style={{
          background: '#FFFFFF',
          padding: '60px 24px', margin: '24px 0 36px', border: '1px solid #E2E8F0', borderRadius: '16px'
        }}>
          <div className="hero-content">
            <span className="badge" style={{ marginBottom: 12, display: 'inline-flex', gap: 6, background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem' }}>
              <Trophy size={14} style={{ color: '#D97706' }} /> Official Competition Results
            </span>
            <h1 style={{ color: '#0F172A', fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
              {client.organization_name}<br />{client.event_name}
            </h1>
            <p style={{ color: '#475569', fontSize: '1rem', textAlign: 'center', maxWidth: 580, marginBottom: 24 }}>
              Browse official program standings and verified winner placements.
            </p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', color: '#64748B', fontSize: '0.88rem', fontWeight: 600 }}>
              {client.start_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} style={{ color: '#475569' }} />
                  <span>{client.start_date} {client.end_date ? `to ${client.end_date}` : ''}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={16} style={{ color: '#0F172A' }} />
                <span>{results.length} Programs Announced</span>
              </div>
            </div>
          </div>
        </section>

        {/* Results Directory */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>Program Results</h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Click any program row below to view winner standings in a pop-up card.
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="search-filter-bar" style={{ marginBottom: 28, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: 14, color: '#64748B' }} />
            <input
              type="search"
              placeholder="Search program or winner name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 42, background: '#F8FAFC', border: '1px solid #CBD5E1' }}
            />
          </div>

          <div className="filter-pills">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#64748B' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6, color: '#0F172A' }}>No results found.</p>
            <p style={{ fontSize: '0.9rem' }}>Try searching another keyword or clearing filters.</p>
          </div>
        ) : (
          <>
            <p style={{ color: '#64748B', fontWeight: 600, marginBottom: 14, fontSize: '0.85rem' }}>
              Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="results-list-container">
              {filtered.map(r => (
                <div key={r.id} onClick={() => setSelectedResult(r)} style={{ cursor: 'pointer' }}>
                  <ResultRow result={r} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Result Detail Pop-up Modal */}
      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          slug={slug}
          isAdmin={isAdmin}
          onClose={() => setSelectedResult(null)}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      {/* Event Footer */}
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
