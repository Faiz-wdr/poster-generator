import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getResults, getResult, getTemplates, saveResult, getSettings } from '../../lib/db';
import { posterEngine } from '../../lib/posterEngine';
import { CATEGORY_OPTIONS, TEAM_OPTIONS } from '../../data/defaults';
import { CheckCircle, Plus, X, Save, Send } from 'lucide-react';

const EMPTY_WINNER = () => ({ position: '01', name: '', team: '' });

function SearchableDropdown({ id, placeholder, value, onChange, options = [], disabled, required, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const containerRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = (options || []).filter(option =>
    String(option || '').toLowerCase().includes(String(searchTerm || '').toLowerCase())
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleOptionClick = (option) => {
    setSearchTerm(option);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          required={required}
          autoComplete="off"
          style={{
            width: '100%',
            padding: '12px 14px',
            paddingRight: '30px',
            borderRadius: 'var(--radius-input, 10px)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-page)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <button
          type="button"
          onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem'
          }}
        >
          ▼
        </button>
      </div>

      {isOpen && !disabled && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-input, 10px)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
            maxHeight: '180px',
            overflowY: 'auto',
            margin: '4px 0 0 0',
            padding: '6px 0',
            listStyle: 'none',
            textAlign: 'left'
          }}
        >
          {filteredOptions.length === 0 ? (
            <li style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No options found
            </li>
          ) : (
            filteredOptions.map((option, idx) => (
              <li
                key={idx}
                onClick={() => handleOptionClick(option)}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function calculateNextResultNo(results) {
  if (!results || results.length === 0) return '01';
  let maxNum = 0;
  results.forEach(r => {
    const match = String(r.resultNo || '').match(/^(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  return String(nextNum).padStart(2, '0');
}

export default function PublishResult({ isExpired, clientId }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editId = params.get('edit');

  const [resultNo, setResultNo] = useState('01');
  const [programName, setProgramName] = useState('');
  const [category, setCategory] = useState('Junior');
  const [winners, setWinners] = useState([EMPTY_WINNER()]);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editResultId, setEditResultId] = useState(null);

  const [clientPrograms, setClientPrograms] = useState([]);
  const [clientCategories, setClientCategories] = useState([]);
  const [clientTeams, setClientTeams] = useState([]);

  const previewRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [t, s] = await Promise.all([
        getTemplates(clientId),
        getSettings(clientId)
      ]);
      setTemplates(t);
      setActiveTemplate(t[0] || null);
      setClientPrograms(s.programs || []);
      setClientCategories(s.categories || []);
      setClientTeams(s.teams || []);

      const cats = s.categories && s.categories.length ? s.categories : CATEGORY_OPTIONS;

      if (editId) {
        const r = await getResult(editId);
        if (r) {
          setProgramName(r.programName);
          setCategory(r.category);
          setResultNo(r.resultNo || '');
          setWinners(r.winners?.length ? r.winners : [EMPTY_WINNER()]);
          setIsEditing(true);
          setEditResultId(r.id);
        }
      } else {
        const allResults = await getResults(clientId);
        const nextNo = calculateNextResultNo(allResults);
        setResultNo(nextNo);
        if (cats.length > 0) {
          setCategory(cats[0]);
        }
      }
    }
    load();
  }, [editId, clientId]);

  // Live preview
  useEffect(() => {
    if (!previewRef.current || !activeTemplate) return;
    const result = { resultNo, programName, category, winners };
    const cleanup = posterEngine.render(previewRef.current, result, activeTemplate, {});
    return cleanup;
  }, [resultNo, programName, category, winners, activeTemplate]);

  const addWinner = () => setWinners(w => [...w, EMPTY_WINNER()]);
  const removeWinner = (i) => setWinners(w => w.filter((_, idx) => idx !== i));
  const updateWinner = (i, field, val) => {
    setWinners(w => w.map((win, idx) => idx === i ? { ...win, [field]: val } : win));
  };

  const handleSave = async (statusToSave) => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    if (!programName.trim()) { alert('Please enter a program name.'); return; }
    const validWinners = winners.filter(w => w.name.trim());
    if (validWinners.length === 0) { alert('Please add at least one winner.'); return; }

    setSaving(true);
    const result = await saveResult({
      id: editResultId || undefined,
      resultNo: resultNo.trim(),
      programName: programName.trim(),
      category,
      winners: validWinners,
      status: statusToSave,
      client_id: clientId
    }, clientId);

    setSaving(false);
    if (result) {
      setSavedMsg(statusToSave === 'pending' ? 'Draft saved successfully!' : 'Result published successfully!');
      setTimeout(() => {
        setSavedMsg('');
        navigate('/admin/results');
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
            {isEditing ? 'Edit Program Result' : 'Publish New Result'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Fill in the program details and winner placements to compile the flyer.
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
          <form onSubmit={(e) => e.preventDefault()} id="result-publish-form">
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="form-result-no">Result No. *</label>
                <input
                  id="form-result-no"
                  type="text"
                  placeholder="01"
                  value={resultNo}
                  onChange={e => setResultNo(e.target.value)}
                  disabled={isExpired}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-program-name">Program / Event Name *</label>
                <SearchableDropdown
                  id="form-program-name"
                  placeholder="e.g. Classical Violin Symphony Solo"
                  value={programName}
                  onChange={setProgramName}
                  options={clientPrograms.map((p) => typeof p === 'string' ? p : p.name || '')}
                  disabled={isExpired}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="form-category">Category *</label>
              <SearchableDropdown
                id="form-category"
                placeholder="e.g. Junior"
                value={category}
                onChange={setCategory}
                options={clientCategories && clientCategories.length ? clientCategories : CATEGORY_OPTIONS}
                disabled={isExpired}
                required
              />
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
                  disabled={isExpired || winners.length >= 6}
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
                    disabled={isExpired}
                    style={{ padding: '12px 8px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                  >
                    {['01','02','03','04','05','06'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={w.name}
                    onChange={e => updateWinner(i, 'name', e.target.value)}
                    disabled={isExpired}
                    style={{ padding: '12px 14px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
                  />
                  <SearchableDropdown
                    placeholder="Team/Group"
                    value={w.team}
                    onChange={val => updateWinner(i, 'team', val)}
                    options={clientTeams && clientTeams.length ? clientTeams : TEAM_OPTIONS}
                    disabled={isExpired}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: '#EF4444', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => removeWinner(i)}
                    disabled={isExpired || winners.length === 1}
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
              <button
                type="button"
                className="btn btn-outline"
                style={{ flexGrow: 1, borderColor: 'var(--primary)', color: 'var(--primary)' }}
                onClick={() => handleSave('pending')}
                disabled={isExpired || saving}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => handleSave('published')}
                disabled={isExpired || saving}
                id="btn-submit-result"
              >
                {saving ? (
                  <span>Saving…</span>
                ) : isEditing ? (
                  <>
                    <Save size={18} />
                    <span>Update &amp; Publish</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Publish Result</span>
                  </>
                )}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/results')}>
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
