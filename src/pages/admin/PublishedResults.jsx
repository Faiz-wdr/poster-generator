import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults, getTemplates, deleteResult, saveResult, getSettings } from '../../lib/db';
import { posterEngine } from '../../lib/posterEngine';
import { CATEGORY_OPTIONS } from '../../data/defaults';
import { Plus, Search, Pencil, Download, Trash2 } from 'lucide-react';

export default function PublishedResults({ isExpired, clientId }) {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [clientCategories, setClientCategories] = useState([]);

  const load = async () => {
    const [r, t, s] = await Promise.all([
      getResults(clientId),
      getTemplates(clientId),
      getSettings(clientId)
    ]);
    setResults(r);
    setTemplates(t);
    setClientCategories(s.categories || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  const filtered = results.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.programName?.toLowerCase().includes(q) ||
      r.winners?.some(w => w.name?.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleDelete = async (id, name) => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    if (!window.confirm(`Delete "${name}"? This is permanent.`)) return;
    const ok = await deleteResult(id);
    if (ok) await load();
    else alert('Failed to delete result.');
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

  const handleDownload = (result) => {
    if (!templates.length) return;
    const tpl = templates[0];
    const tmp = document.createElement('div');
    tmp.className = 'hidden-export-container';
    document.body.appendChild(tmp);
    posterEngine.render(tmp, result, tpl, {});
    setTimeout(() => {
      posterEngine.exportJpg(tmp, `${result.programName}.jpg`);
      setTimeout(() => { try { document.body.removeChild(tmp); } catch {} }, 1200);
    }, 200);
  };

  const categories = ['All', ...(clientCategories && clientCategories.length ? clientCategories : CATEGORY_OPTIONS)];

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Program Records</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage standings — draft drafts, publish, edit, download or delete.</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate('/admin/upload')}
          disabled={isExpired}
        >
          <Plus size={16} /> Create Result
        </button>
      </div>

      {/* Search + Filter */}
      <div className="search-filter-bar" style={{ marginBottom: 28 }}>
        <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} className="search-icon" style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)' }} />
          <input
            id="admin-search-results"
            type="search"
            placeholder="Search program or winner…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 42 }}
          />
        </div>
        <div className="filter-pills" id="admin-category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
              data-category={cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading records…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32, fontWeight: 600 }}>
          No results found. Try adjusting filters or search.
        </div>
      ) : (
        <div className="results-list-container" id="published-results-list">
          {filtered.map(r => {
            const winners = r.winners || [];
            return (
              <div key={r.id} className="result-list-item" style={{ cursor: 'default' }}>
                <div className="result-list-main">
                  <span className="badge badge-primary" style={{ marginRight: 8 }}>{r.category}</span>
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
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => navigate(`/admin/upload?edit=${r.id}`)}
                  >
                    <Pencil size={14} /> {isExpired ? 'View' : 'Edit'}
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => handleDownload(r)}>
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
    </div>
  );
}
