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
      const published = r.filter(item => item.status === 'published');
      setResults(published);
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

          <div className="hero-content">
            <h1>Wandoor Sector<br />Sahityotsav</h1>
            <p>Publish, design and download stunning high-resolution result <br />posters for your arts programs — all in one place.</p>
            <div className="hero-actions">
              <Link to="/gallery" className="btn btn-primary">Browse Results Gallery →</Link>
            </div>
          </div>
        </section>



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
