import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClientBySlug, getResults, getTemplates } from '../lib/db';
import { applyClientTheme } from '../lib/theme';
import { CATEGORY_OPTIONS } from '../data/defaults';
import ResultRow from '../components/ResultRow';
import PosterModal from '../components/PosterModal';
import { Search, Trophy, Calendar, MapPin, Sparkles, Award } from 'lucide-react';

export default function PublicEvent() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [results, setResults] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalResult, setModalResult] = useState(null);

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
        getResults(c.id),
        getTemplates(c.id)
      ]);

      const published = r.filter(item => item.status === 'published');
      setResults(published);
      setTemplates(t);
      setLoading(false);
    }
    load();

    return () => {
      // Reset theme on unmount
      applyClientTheme(null);
    };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Loading event portal…
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Event Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 420 }}>
          The event URL you are trying to access does not exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">Return to Homepage</Link>
      </div>
    );
  }

  if (client.status === 'suspended') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#EF4444' }}>Event Access Suspended</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 420 }}>
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
  const totalWinners = results.reduce((acc, r) => acc + (r.winners?.length || 0), 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Event Header */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--border-color)', sticky: 'top', top: 0, zIndex: 50, padding: '14px 0' }}>
        <div className="container nav-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon" style={{
              background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
              overflow: 'hidden'
            }}>
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

      {/* Main Container */}
      <main className="container" style={{ flexGrow: 1, paddingBottom: 80 }}>
        {/* Hero Section */}
        <section className="hero-centered" style={{
          background: `linear-gradient(-45deg, var(--primary-light), #FFFFFF, var(--primary-light))`,
          padding: '100px 24px', margin: '32px 0 48px', border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div className="hero-content">
            <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-flex', gap: 6 }}>
              <Trophy size={14} style={{ color: 'var(--accent)' }} /> Official Results Portal
            </span>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: 16 }}>
              {client.organization_name}<br />{client.event_name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', textAlign: 'center', maxWidth: 580, marginBottom: 28 }}>
              Browse standings, view winner announcements, and generate custom high-resolution result posters instantly.
            </p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
              {client.start_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} />
                  <span>{client.start_date} {client.end_date ? `to ${client.end_date}` : ''}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={16} style={{ color: 'var(--accent)' }} />
                <span>{results.length} Programs Announced</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Content */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Program Results</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Click on any result card to view the placement standings and export poster flyers.
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="search-filter-bar" style={{ marginBottom: 32 }}>
          <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)' }} />
            <input
              type="search"
              placeholder="Search program or winner name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 42 }}
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
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>No results found.</p>
            <p>Try searching another keyword or clearing filters.</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 16, fontSize: '0.88rem' }}>
              Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="results-list-container">
              {filtered.map(r => (
                <div key={r.id} onClick={() => navigate(`/event/${slug}/detail/${r.id}`)} style={{ cursor: 'pointer' }}>
                  <ResultRow result={r} onOpenModal={() => {}} />
                </div>
              ))}
            </div>
          </>
        )}
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

      {modalResult && templates.length > 0 && (
        <PosterModal
          result={modalResult}
          templates={templates}
          onClose={() => setModalResult(null)}
        />
      )}
    </div>
  );
}
