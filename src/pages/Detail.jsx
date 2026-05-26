import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { posterEngine } from '../lib/posterEngine';
import { getResult, getTemplates, deleteResult } from '../lib/db';
import { ArrowLeft, Download, Pencil, Trash2, Award, Palette } from 'lucide-react';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [r, t] = await Promise.all([getResult(id), getTemplates()]);
      setResult(r);
      setTemplates(t);
      setActiveTemplate(t[0] || null);
      setLoading(false);
    }
    load();
  }, [id]);

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
    if (ok) navigate('/gallery');
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
      <>
        <Header />
        <main className="container section-padding" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!result) {
    return (
      <>
        <Header />
        <main className="container section-padding" style={{ textAlign: 'center' }}>
          <h2>Result not found</h2>
          <Link to="/gallery" className="btn btn-primary" style={{ marginTop: 24 }}>← Back to Gallery</Link>
        </main>
        <Footer />
      </>
    );
  }

  const winners = result.winners || [];

  return (
    <>
      <Header />
      <main className="container section-padding" style={{ paddingTop: 40 }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/gallery" style={{ fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
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
            </div>
          </div>

          {/* Right: Details + Template Picker */}
          <div className="detail-sidebar">
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>{result.category}</span>
            <h1>{result.programName}</h1>

            <div className="detail-divider" />
            <h3 style={{ fontSize: '1.15rem', marginBottom: 16, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} style={{ color: 'var(--accent)' }} />
              <span>Placement Standings</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {winners.map((w, i) => {
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
              })}
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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
