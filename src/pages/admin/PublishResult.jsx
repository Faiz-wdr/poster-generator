import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getResult, getTemplates, saveResult } from '../../lib/db';
import { posterEngine } from '../../lib/posterEngine';
import { CATEGORY_OPTIONS, TEAM_OPTIONS } from '../../data/defaults';
import { CheckCircle, Plus, X, Save, Send } from 'lucide-react';

const EMPTY_WINNER = () => ({ position: '01', name: '', team: '' });

export default function PublishResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editId = params.get('edit');

  const [programName, setProgramName] = useState('');
  const [category, setCategory] = useState('Junior');
  const [winners, setWinners] = useState([EMPTY_WINNER()]);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editResultId, setEditResultId] = useState(null);

  const previewRef = useRef(null);

  useEffect(() => {
    async function load() {
      const t = await getTemplates();
      setTemplates(t);
      setActiveTemplate(t[0] || null);

      if (editId) {
        const r = await getResult(editId);
        if (r) {
          setProgramName(r.programName);
          setCategory(r.category);
          setWinners(r.winners?.length ? r.winners : [EMPTY_WINNER()]);
          setIsEditing(true);
          setEditResultId(r.id);
        }
      }
    }
    load();
  }, [editId]);

  // Live preview
  useEffect(() => {
    if (!previewRef.current || !activeTemplate) return;
    const result = { programName, category, winners };
    const cleanup = posterEngine.render(previewRef.current, result, activeTemplate, {});
    return cleanup;
  }, [programName, category, winners, activeTemplate]);

  const addWinner = () => setWinners(w => [...w, EMPTY_WINNER()]);
  const removeWinner = (i) => setWinners(w => w.filter((_, idx) => idx !== i));
  const updateWinner = (i, field, val) => {
    setWinners(w => w.map((win, idx) => idx === i ? { ...win, [field]: val } : win));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programName.trim()) { alert('Please enter a program name.'); return; }
    const validWinners = winners.filter(w => w.name.trim());
    if (validWinners.length === 0) { alert('Please add at least one winner.'); return; }

    setSaving(true);
    const result = await saveResult({
      id: editResultId || undefined,
      programName: programName.trim(),
      category,
      winners: validWinners,
    });

    setSaving(false);
    if (result) {
      setSavedMsg(isEditing ? 'Result updated successfully!' : 'Result published successfully!');
      setTimeout(() => {
        setSavedMsg('');
        navigate('/admin/published');
      }, 2000);
    } else {
      alert('Failed to save result. Please check console for errors.');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }} id="upload-form-title">
            {isEditing ? 'Edit Published Result' : 'Publish New Result'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Fill in the program details and winner placements, then save.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '14px 20px', borderRadius: 12, marginBottom: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={18} />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="upload-grid">
        {/* Form */}
        <div className="card-form">
          <form onSubmit={handleSubmit} id="result-publish-form">
            <div className="form-group">
              <label htmlFor="form-program-name">Program / Event Name *</label>
              <input
                id="form-program-name"
                type="text"
                placeholder="e.g. Classical Violin Symphony Solo"
                value={programName}
                onChange={e => setProgramName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="form-category">Category *</label>
              <select id="form-category" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontWeight: 700, fontSize: '0.95rem' }}>Winner Placements *</label>
                <button
                  type="button"
                  id="btn-add-winner-row"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={addWinner}
                  disabled={winners.length >= 6}
                >
                  <Plus size={14} /> Add Winner
                </button>
              </div>

              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr auto', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 4px' }}>Position</span>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 4px' }}>Winner Name *</span>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 4px' }}>Team / Group</span>
                <span />
              </div>

              {winners.map((w, i) => (
                <div key={i} className="winner-entry-row" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                  <select
                    value={w.position}
                    onChange={e => updateWinner(i, 'position', e.target.value)}
                    style={{ padding: '12px 8px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                  >
                    {['01','02','03','04','05','06'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={w.name}
                    onChange={e => updateWinner(i, 'name', e.target.value)}
                    style={{ padding: '12px 14px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
                  />
                  <select
                    value={w.team}
                    onChange={e => updateWinner(i, 'team', e.target.value)}
                    style={{ padding: '12px 8px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                  >
                    <option value="">Select team</option>
                    {TEAM_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: '#EF4444', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => removeWinner(i)}
                    disabled={winners.length === 1}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Template picker */}
            {templates.length > 0 && (
              <div className="form-group">
                <label>Preview Template</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {templates.map(t => (
                    <button
                      type="button"
                      key={t.id}
                      className={`filter-pill ${activeTemplate?.id === t.id ? 'active' : ''}`}
                      onClick={() => setActiveTemplate(t)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} disabled={saving} id="btn-submit-result">
                {saving ? (
                  <span>Saving…</span>
                ) : isEditing ? (
                  <>
                    <Save size={18} />
                    <span>Update Published Poster</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Publish Result</span>
                  </>
                )}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/published')}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div className="card-form" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Live Preview</h3>
            <div ref={previewRef} className="poster-preview-container" />
          </div>
        </div>
      </div>
    </div>
  );
}
