import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { posterEngine } from '../lib/posterEngine';
import { Download, Search, Pencil, Award } from 'lucide-react';

/**
 * PosterModal — Full-screen popup with poster preview, template switcher & download
 */
export default function PosterModal({ result, templates, onClose }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const selectedTemplateRef = useRef(templates[0] || null);

  const handleTemplateSelect = (tpl) => {
    selectedTemplateRef.current = tpl;
    if (containerRef.current) {
      posterEngine.render(containerRef.current, result, tpl, {});
    }
    // highlight active slide
    document.querySelectorAll('.modal-template-slide').forEach(el => {
      el.classList.toggle('active', el.dataset.id === tpl.id);
    });
  };

  const handleDownload = () => {
    if (!containerRef.current || !selectedTemplateRef.current) return;
    posterEngine.exportJpg(containerRef.current, `${result.programName}.jpg`);
  };

  // Render poster on first mount
  const onContainerMount = (el) => {
    containerRef.current = el;
    if (el && selectedTemplateRef.current) {
      posterEngine.render(el, result, selectedTemplateRef.current, {});
    }
  };

  const winners = result?.winners || [];
  const getPlaceStyle = (i) => {
    if (i === 0) return 'winner-item-1';
    if (i === 1) return 'winner-item-2';
    if (i === 2) return 'winner-item-3';
    return '';
  };
  const getPlaceBadge = (pos) => {
    if (pos === '01' || pos === '1') return { cls: 'winner-place-1', label: '1st' };
    if (pos === '02' || pos === '2') return { cls: 'winner-place-2', label: '2nd' };
    if (pos === '03' || pos === '3') return { cls: 'winner-place-3', label: '3rd' };
    return { cls: 'winner-place-2', label: pos };
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose}>×</button>

        <div className="modal-grid">
          {/* Poster Preview */}
          <div className="modal-preview-col">
            <div ref={onContainerMount} className="poster-preview-container" />

            {/* Template Switcher */}
            <div className="template-slider-container" style={{ margin: '16px 0 0', width: '100%' }}>
              <div className="template-slider">
                {templates.map((tpl, i) => (
                  <div
                    key={tpl.id}
                    className={`template-slide modal-template-slide ${i === 0 ? 'active' : ''}`}
                    data-id={tpl.id}
                    onClick={() => handleTemplateSelect(tpl)}
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

            {/* Actions */}
            <div className="modal-controls" style={{ display: 'flex', gap: 12, marginTop: 16, width: '100%' }}>
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleDownload}>
                <Download size={16} /> Download Poster
              </button>
              <Link to={`/detail/${result.id}`} className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={onClose}>
                <Search size={16} /> Full Detail
              </Link>
            </div>
          </div>

          {/* Details column */}
          <div className="modal-details-col">
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 12 }}>{result.category}</span>
              <h2 style={{ fontSize: '1.8rem', marginBottom: 20 }}>{result.programName}</h2>

              <div className="detail-divider" />
              <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} style={{ color: 'var(--accent)' }} />
                <span>Placement Standings</span>
              </h3>

              {winners.map((w, i) => {
                const badge = getPlaceBadge(w.position);
                return (
                  <div key={i} className={`winner-item ${getPlaceStyle(i)}`}>
                    <div className={`winner-place ${badge.cls}`}>{badge.label}</div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {w.team}
                      </div>
                      <div className="winner-name">{w.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => { navigate(`/admin/upload?edit=${result.id}`); onClose(); }}
              >
                <Pencil size={14} /> Edit in Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
