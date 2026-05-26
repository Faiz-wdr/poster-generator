import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ResultRow from '../components/ResultRow';
import PosterModal from '../components/PosterModal';
import { getResults, getTemplates } from '../lib/db';
import { Music, Sparkles, Palette, Drama, Trophy, Star } from 'lucide-react';

export default function Home() {
  const [results, setResults] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const latestResults = results.slice(0, 6);
  const totalWinners = results.reduce((acc, r) => acc + (r.winners?.length || 0), 0);

  return (
    <>
      <Header />

      <main className="container">
        {/* Hero */}
        <section className="hero-centered">
          <div className="hero-bg-shapes">
            <div className="shape shape-1" />
            <div className="shape shape-2" />
            <div className="shape shape-3" />
          </div>

          {/* Floating Badges */}
          <div className="floating-badge badge-music" style={{ top: '18%', left: '8%', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Music size={14} /> Music
          </div>
          <div className="floating-badge badge-dance" style={{ top: '55%', left: '5%', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Dance
          </div>
          <div className="floating-badge badge-art" style={{ top: '22%', right: '6%', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={14} /> Visual Arts
          </div>
          <div className="floating-badge badge-theatre" style={{ bottom: '20%', right: '8%', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Drama size={14} /> Theatre
          </div>
          <div className="floating-badge badge-trophy" style={{ top: '70%', left: '12%', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Trophy size={14} /> Champions
          </div>
          <div className="floating-badge badge-star" style={{ top: '40%', right: '4%', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={14} /> Stars
          </div>

          <div className="hero-content">
            <h1>Arts Program<br />Result Posters</h1>
            <p>Publish, design and download stunning high-resolution result posters for your arts programs — all in one place.</p>
            <div className="hero-actions">
              <Link to="/gallery" className="btn btn-primary">Browse Results Gallery →</Link>
              <Link to="/admin" className="btn btn-outline">Admin Dashboard</Link>
            </div>
          </div>
        </section>

        {/* Stats Bento */}
        {!loading && (
          <section style={{ marginBottom: 48 }}>
            <div className="bento-section-title">
              <h2>Platform at a Glance</h2>
            </div>
            <div className="bento-grid">
              <div className="bento-card bento-span-2 bg-primary-gradient">
                <div className="bento-stat-num">{results.length}</div>
                <div className="bento-stat-label">Published Results</div>
              </div>
              <div className="bento-card">
                <div className="bento-stat-num">{totalWinners}</div>
                <div className="bento-stat-label">Total Winners</div>
              </div>
              <div className="bento-card">
                <div className="bento-stat-num">{templates.length}</div>
                <div className="bento-stat-label">Design Templates</div>
              </div>
              <div className="bento-card bento-span-4 bento-gradient-cyan">
                <div className="icon-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Palette size={24} />
                </div>
                <h3 style={{ marginBottom: 8 }}>Premium Poster Generation</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Click any result to preview and download a high-resolution 1080×1350 poster in your chosen design template.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Latest Results */}
        <section className="section-padding" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <h2>Latest Results</h2>
            <Link to="/gallery" className="btn btn-outline btn-sm">View All →</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Loading results…
            </div>
          ) : latestResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: 16, fontWeight: 600 }}>No results published yet.</p>
              <Link to="/admin/upload" className="btn btn-primary">Publish First Result</Link>
            </div>
          ) : (
            <div className="results-list-container">
              {latestResults.map(r => (
                <ResultRow key={r.id} result={r} onOpenModal={setModalResult} />
              ))}
            </div>
          )}
        </section>
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
