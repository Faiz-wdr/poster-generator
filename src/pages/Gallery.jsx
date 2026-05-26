import { useState, useEffect } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ResultRow from '../components/ResultRow';
import PosterModal from '../components/PosterModal';
import { getResults, getTemplates } from '../lib/db';
import { CATEGORY_OPTIONS } from '../data/defaults';
import { Search } from 'lucide-react';

export default function Gallery() {
  const [results, setResults] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalResult, setModalResult] = useState(null);

  useEffect(() => {
    async function load() {
      const [r, t] = await Promise.all([getResults(), getTemplates()]);
      setResults(r);
      setTemplates(t);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = results.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.programName?.toLowerCase().includes(q) ||
      r.winners?.some(w => w.name?.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const categories = ['All', ...CATEGORY_OPTIONS];

  return (
    <>
      <Header />

      <main className="container section-padding">
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>Results Gallery</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Browse all published program results. Click any row to preview & download a poster.
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)' }} />
            <input
              type="search"
              placeholder="Search program or winner name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="gallery-search-input"
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

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)', fontWeight: 600 }}>
            Loading results…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>No results found.</p>
            <p>Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 20, fontSize: '0.9rem' }}>
              Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="results-list-container">
              {filtered.map(r => (
                <ResultRow key={r.id} result={r} onOpenModal={setModalResult} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />

      {modalResult && templates.length > 0 && (
        <PosterModal
          result={modalResult}
          templates={templates}
          onClose={() => setModalResult(null)}
        />
      )}
    </>
  );
}
