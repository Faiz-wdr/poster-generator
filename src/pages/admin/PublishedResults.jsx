import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults, getTemplates, deleteResult, saveResult, getSettings, sortResultsByResultNoDesc } from '../../lib/db';
import { posterEngine } from '../../lib/posterEngine';
import { CATEGORY_OPTIONS } from '../../data/defaults';
import { Plus, Search, Pencil, Download, Trash2, Eye, CheckSquare, Square, X, Layers } from 'lucide-react';

export default function PublishedResults({ isExpired, clientId }) {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientCategories, setClientCategories] = useState([]);

  // Batch Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchTemplateId, setBatchTemplateId] = useState('');
  const [isExportingBatch, setIsExportingBatch] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

  // View Live Preview Modal State
  const [previewResult, setPreviewResult] = useState(null);
  const [previewTemplateId, setPreviewTemplateId] = useState('');
  const previewCanvasRef = useRef(null);

  const load = async () => {
    const [r, t, s] = await Promise.all([
      getResults(clientId),
      getTemplates(clientId),
      getSettings(clientId)
    ]);
    const settings = s || {};
    const loadedTemplates = t || [];
    setResults(sortResultsByResultNoDesc(r || []));
    setTemplates(loadedTemplates);
    if (loadedTemplates.length > 0) {
      setBatchTemplateId(loadedTemplates[0].id);
      setPreviewTemplateId(loadedTemplates[0].id);
    }
    setClientCategories(settings.categories || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  const filtered = results.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      r.programName?.toLowerCase().includes(q) ||
      r.winners?.some(w => w.name?.toLowerCase().includes(q));
  });

  // Select / Deselect All
  const allFilteredIds = filtered.map(r => r.id);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async (id, name) => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    if (!window.confirm(`Delete "${name}"? This is permanent.`)) return;
    const ok = await deleteResult(id);
    if (ok) {
      setSelectedIds(prev => prev.filter(i => i !== id));
      await load();
    } else {
      alert('Failed to delete result.');
    }
  };

  const handlePublish = async (r) => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    const ok = await saveResult({
      ...r,
      status: 'published'
    }, clientId);
    if (ok) await load();
    else alert('Failed to publish result.');
  };

  const handleSingleDownload = (result, customTpl = null) => {
    const tpl = customTpl || (templates.find(t => t.id === previewTemplateId) || templates[0]);
    if (!tpl) {
      alert('No template available for download.');
      return;
    }
    const tmp = document.createElement('div');
    tmp.className = 'hidden-export-container';
    document.body.appendChild(tmp);
    posterEngine.render(tmp, result, tpl, {});
    setTimeout(() => {
      posterEngine.exportJpg(tmp, `${result.programName || 'Result'}_${result.resultNo || '01'}.jpg`);
      setTimeout(() => { try { document.body.removeChild(tmp); } catch {} }, 1200);
    }, 200);
  };

  // Batch Export Handler
  const startBatchExport = async () => {
    if (!selectedIds.length) return;
    const chosenTemplate = templates.find(t => t.id === batchTemplateId) || templates[0];
    if (!chosenTemplate) {
      alert('Please select a template to generate posters.');
      return;
    }

    setIsExportingBatch(true);
    const selectedResults = results.filter(r => selectedIds.includes(r.id));
    setExportProgress({ current: 0, total: selectedResults.length });

    for (let i = 0; i < selectedResults.length; i++) {
      const res = selectedResults[i];
      setExportProgress({ current: i + 1, total: selectedResults.length });

      const tmp = document.createElement('div');
      tmp.className = 'hidden-export-container';
      document.body.appendChild(tmp);

      posterEngine.render(tmp, res, chosenTemplate, {});
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const fileName = `${res.programName || 'Result'}_#${res.resultNo || i + 1}.jpg`;
      posterEngine.exportJpg(tmp, fileName);

      // Stagger downloads to prevent browser popup blocking
      await new Promise(resolve => setTimeout(resolve, 800));
      try { document.body.removeChild(tmp); } catch {}
    }

    setIsExportingBatch(false);
    setShowBatchModal(false);
    setSelectedIds([]);
  };

  // Render Live Preview inside Modal Canvas
  useEffect(() => {
    if (previewResult && previewCanvasRef.current) {
      const activeTpl = templates.find(t => t.id === previewTemplateId) || templates[0];
      if (activeTpl) {
        posterEngine.render(previewCanvasRef.current, previewResult, activeTpl, { editable: false });
      }
    }
  }, [previewResult, previewTemplateId, templates]);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Program Records</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage standings — publish results, view in template, or bulk download posters.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <button
              className="btn btn-primary"
              style={{ background: '#7C3AED', borderColor: '#7C3AED', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowBatchModal(true)}
            >
              <Download size={16} /> Download Selected ({selectedIds.length})
            </button>
          )}
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('/admin/upload')}
            disabled={isExpired}
          >
            <Plus size={16} /> Create Result
          </button>
        </div>
      </div>

      {/* Search & Selection Action Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        <div className="search-filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)' }} />
            <input
              id="admin-search-results"
              type="search"
              placeholder="Search program or winner…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 42, width: '100%' }}
            />
          </div>
        </div>

        {/* Checkbox Selection Bar */}
        {filtered.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '10px 16px', borderRadius: '10px',
            fontSize: '0.88rem', fontWeight: 600, color: '#334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={toggleSelectAll}>
              <div style={{ color: isAllSelected ? 'var(--primary)' : '#94A3B8', display: 'flex', alignItems: 'center' }}>
                {isAllSelected ? <CheckSquare size={18} /> : <Square size={18} />}
              </div>
              <span>Select All Shown ({filtered.length})</span>
            </div>

            {selectedIds.length > 0 && (
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {selectedIds.length} result{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading records…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32, fontWeight: 600 }}>
          No results found. Try adjusting search criteria.
        </div>
      ) : (
        <div className="results-list-container" id="published-results-list">
          {filtered.map(r => {
            const winners = r.winners || [];
            const isSelected = selectedIds.includes(r.id);

            return (
              <div
                key={r.id}
                className="result-list-item"
                style={{
                  cursor: 'default',
                  borderLeft: isSelected ? '4px solid var(--primary)' : '1px solid #E2E8F0',
                  background: isSelected ? '#F5F3FF' : '#FFFFFF',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Selection Checkbox */}
                <div
                  onClick={() => toggleSelectOne(r.id)}
                  style={{ cursor: 'pointer', color: isSelected ? 'var(--primary)' : '#CBD5E1', display: 'flex', alignItems: 'center', paddingRight: 8 }}
                >
                  {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>

                <div className="result-list-main">
                  {r.category && <span className="badge badge-primary" style={{ marginRight: 8 }}>{r.category}</span>}
                  {r.status === 'pending' ? (
                    <span className="badge" style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D', fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20 }}>Pending</span>
                  ) : (
                    <span className="badge" style={{ background: '#D1FAE5', color: '#059669', border: '1px solid #A7F3D0', fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20 }}>Published</span>
                  )}
                  <div className="result-list-title-wrap">
                    <div className="result-list-title">
                      {r.resultNo && <span style={{ color: 'var(--primary)', marginRight: 8 }}>#{r.resultNo}</span>}
                      {r.programName}
                    </div>
                    <div className="result-list-winner">
                      {winners.map((w, i) => (
                        <span key={i}>
                          {i > 0 && ' | '}
                          <strong>{w.name}</strong>
                          {` (Pos ${w.position})`}
                          {w.team && ` [${w.team}]`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="action-btns" style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {r.status === 'pending' && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ background: '#10B981', borderColor: '#10B981', color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => handlePublish(r)}
                      disabled={isExpired}
                    >
                      Publish
                    </button>
                  )}

                  {/* View Poster Modal Option */}
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4F46E5', borderColor: '#C7D2FE' }}
                    onClick={() => {
                      setPreviewResult(r);
                      if (templates.length > 0) setPreviewTemplateId(templates[0].id);
                    }}
                  >
                    <Eye size={14} /> View Poster
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => navigate(`/admin/upload?edit=${r.id}`)}
                  >
                    <Pencil size={14} /> {isExpired ? 'View' : 'Edit'}
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => handleSingleDownload(r)}
                  >
                    <Download size={14} /> Download
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    style={{ color: '#EF4444', borderColor: '#FEE2E2', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => handleDelete(r.id, r.programName)}
                    disabled={isExpired}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 1. BATCH TEMPLATE SELECTION & DOWNLOAD MODAL ────────────────────── */}
      {showBatchModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="modal-card" style={{ maxWidth: 540, width: '100%', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#F5F3FF', color: 'var(--primary)', padding: 8, borderRadius: 10 }}>
                  <Layers size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  Select Poster Template
                </h3>
              </div>
              {!isExportingBatch && (
                <button onClick={() => setShowBatchModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: 20 }}>
              Choose which poster design template to use for generating high-resolution posters for the <strong>{selectedIds.length} selected program results</strong>.
            </p>

            {/* Template Selection List */}
            {templates.length === 0 ? (
              <p style={{ color: '#EF4444', fontWeight: 600 }}>No templates uploaded yet. Please add a template in Template Editor first.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, maxHeight: 240, overflowY: 'auto' }}>
                {templates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setBatchTemplateId(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      border: batchTemplateId === t.id ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                      background: batchTemplateId === t.id ? '#F5F3FF' : '#F8FAFC',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{t.name}</div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: batchTemplateId === t.id ? '6px solid var(--primary)' : '2px solid #CBD5E1', background: '#FFFFFF' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Export Progress Indicator */}
            {isExportingBatch && (
              <div style={{ marginBottom: 20, padding: 14, background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 10, textAlign: 'center' }}>
                <p style={{ color: 'var(--primary)', fontWeight: 800, margin: '0 0 6px', fontSize: '0.95rem' }}>
                  Generating Posters ({exportProgress.current} of {exportProgress.total})…
                </p>
                <div style={{ width: '100%', height: 8, background: '#EDE9FE', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setShowBatchModal(false)} disabled={isExportingBatch}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={startBatchExport}
                disabled={isExportingBatch || templates.length === 0}
              >
                <Download size={16} /> Start Download ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. VIEW POSTER LIVE PREVIEW MODAL ────────────────────────────────── */}
      {previewResult && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ maxWidth: 640, width: '100%', maxHeight: '92vh', background: '#FFFFFF', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Poster Live Preview
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  {previewResult.programName}
                </h3>
              </div>

              {/* Template Picker Dropdown inside View Preview */}
              {templates.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    value={previewTemplateId}
                    onChange={e => setPreviewTemplateId(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700, background: '#F8FAFC', color: '#0F172A' }}
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button onClick={() => setPreviewResult(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Canvas Render */}
            <div style={{ padding: 24, background: '#0F172A', flexGrow: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div ref={previewCanvasRef} style={{ width: 360, height: 450, position: 'relative', overflow: 'hidden', borderRadius: 12, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }} />
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                Category: <strong>{previewResult.category || 'Standard'}</strong>
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setPreviewResult(null)}>Close</button>
                <button
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    const activeTpl = templates.find(t => t.id === previewTemplateId) || templates[0];
                    handleSingleDownload(previewResult, activeTpl);
                  }}
                >
                  <Download size={16} /> Download Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
