import { useState, useEffect, useRef, useCallback } from 'react';
import interact from 'interactjs';
import { getTemplates, saveTemplate, uploadTemplateBackground, deleteTemplate } from '../../lib/db';
import { posterEngine } from '../../lib/posterEngine';
import { DEFAULT_TEMPLATES } from '../../data/defaults';
import { Undo, Redo, Save, CheckCircle, Upload, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

const COLOR_SWATCHES = [
  '#111827', '#7C3AED', '#EC4899', '#F59E0B', '#10B981',
  '#0EA5E9', '#EF4444', '#6B7280', '#FFFFFF', '#1E3A5F',
];

const FONT_FAMILIES = [
  { value: 'Outfit', label: 'Outfit (Title)' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Body)' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
];

export default function TemplateEditor() {
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const canvasWrapRef = useRef(null);
  const currentTemplateRef = useRef(null);
  const selectedFieldIdsRef = useRef([]);
  const activeFieldIdRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { currentTemplateRef.current = currentTemplate; }, [currentTemplate]);
  useEffect(() => { selectedFieldIdsRef.current = selectedFieldIds; }, [selectedFieldIds]);
  useEffect(() => { activeFieldIdRef.current = activeFieldId; }, [activeFieldId]);

  useEffect(() => {
    getTemplates().then(t => {
      setTemplates(t);
      if (t.length) selectTemplate(t[0]);
    });
  }, []);

  const selectTemplate = (tpl) => {
    // Deep clone so edits don't mutate original
    const clone = JSON.parse(JSON.stringify(tpl));
    setCurrentTemplate(clone);
    setSelectedFieldIds([]);
    setActiveFieldId(null);
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleDeleteTemplate = async (id, name) => {
    if (!window.confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    const ok = await deleteTemplate(id);
    if (ok) {
      const updated = await getTemplates();
      setTemplates(updated);
      if (currentTemplate?.id === id && updated.length) {
        selectTemplate(updated[0]);
      }
    } else {
      alert('Failed to delete template.');
    }
  };

  // Render editor canvas when template structure or values change
  useEffect(() => {
    if (!canvasWrapRef.current || !currentTemplate) return;
    const dummyResult = { programName: 'Program Name', category: 'Category', winners: [] };
    
    // Render using latest selections from refs to prevent rendering triggers
    posterEngine.render(canvasWrapRef.current, dummyResult, currentTemplate, {
      editable: true,
      selectedFieldIds: selectedFieldIdsRef.current,
      activeFieldId: activeFieldIdRef.current,
      onSelectField: (fKey, e) => {
        const shift = e.ctrlKey || e.metaKey || e.shiftKey;
        setSelectedFieldIds(prev => {
          if (shift) {
            const idx = prev.indexOf(fKey);
            if (idx !== -1) return prev.length > 1 ? prev.filter(id => id !== fKey) : prev;
            return [...prev, fKey];
          }
          return [fKey];
        });
        setActiveFieldId(fKey);
      },
    });
    
    // Re-setup interact after canvas DOM elements are created
    setupInteract();
  }, [currentTemplate]);

  // Handle selection styling directly in DOM to avoid full canvas re-renders
  useEffect(() => {
    const canvasEl = document.getElementById('poster-engine-canvas');
    if (!canvasEl) return;
    const fields = canvasEl.querySelectorAll('.poster-field');
    fields.forEach(el => {
      const fKey = el.dataset.field;
      if (selectedFieldIds.includes(fKey) || activeFieldId === fKey) {
        el.classList.add('selected-field');
      } else {
        el.classList.remove('selected-field');
      }
    });
  }, [selectedFieldIds, activeFieldId]);

  // interact.js drag + resize setup
  const setupInteract = useCallback(() => {
    interact('.editable-active .poster-field').unset();
    interact('.editable-active .poster-field')
      .draggable({
        inertia: false,
        autoScroll: false,
        listeners: {
          start: () => snapshotHistory(),
          move(event) {
            const tpl = currentTemplateRef.current;
            const canvasEl = document.getElementById('poster-engine-canvas');
            if (!canvasEl || !tpl) return;
            const scale = canvasEl.getBoundingClientRect().width / 1080;
            const dx = event.dx / scale;
            const dy = event.dy / scale;
            const fKey = event.target.dataset.field;
            const toMove = selectedFieldIdsRef.current.includes(fKey)
              ? selectedFieldIdsRef.current : [fKey];

            toMove.forEach(id => {
              const el = canvasEl.querySelector(`[data-field="${id}"]`);
              const fd = tpl.fields[id];
              if (!el || !fd) return;
              let x = parseFloat(el.style.left) + dx;
              let y = parseFloat(el.style.top) + dy;
              x = Math.max(0, Math.min(1080 - fd.width, x));
              y = Math.max(0, Math.min(1350 - fd.height, y));
              el.style.left = `${x}px`;
              el.style.top = `${y}px`;
              fd.left = Math.round(x);
              fd.top = Math.round(y);
            });
          },
          end() {
            // Commit drag changes to state to sync layout and trigger re-fitting if needed
            const tpl = currentTemplateRef.current;
            if (!tpl) return;
            setCurrentTemplate(prev => ({
              ...prev,
              fields: JSON.parse(JSON.stringify(tpl.fields))
            }));
          }
        },
      })
      .resizable({
        edges: { bottom: true, right: true, bottomRight: true },
        margin: 12,
        listeners: {
          start: () => snapshotHistory(),
          move(event) {
            const tpl = currentTemplateRef.current;
            const canvasEl = document.getElementById('poster-engine-canvas');
            if (!canvasEl || !tpl) return;
            const scale = canvasEl.getBoundingClientRect().width / 1080;
            const el = event.target;
            const fKey = el.dataset.field;
            const fd = tpl.fields[fKey];
            if (!fd) return;

            let w = parseFloat(el.style.width) + event.deltaRect.width / scale;
            let h = parseFloat(el.style.height) + event.deltaRect.height / scale;
            const l = parseFloat(el.style.left) || 0;
            const t = parseFloat(el.style.top) || 0;
            w = Math.max(120, Math.min(1080 - l, w));
            h = Math.max(30, Math.min(1350 - t, h));
            el.style.width = `${w}px`;
            el.style.height = `${h}px`;
            fd.width = Math.round(w);
            fd.height = Math.round(h);
            posterEngine.fitText(el, fd.fontSize);
          },
          end() {
            // Commit resize changes to state
            const tpl = currentTemplateRef.current;
            if (!tpl) return;
            setCurrentTemplate(prev => ({
              ...prev,
              fields: JSON.parse(JSON.stringify(tpl.fields))
            }));
          }
        },
      });
  }, []);

  // Cleanup interact on unmount
  useEffect(() => {
    return () => { try { interact('.editable-active .poster-field').unset(); } catch {} };
  }, []);

  // Keyboard arrow nudge + undo/redo
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const inInput = ['input', 'select', 'textarea'].includes(tag) || e.target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); applyUndo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); applyRedo(); return; }
      if (inInput) return;

      let dx = 0, dy = 0;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') { dx = -step; e.preventDefault(); }
      else if (e.key === 'ArrowRight') { dx = step; e.preventDefault(); }
      else if (e.key === 'ArrowUp') { dy = -step; e.preventDefault(); }
      else if (e.key === 'ArrowDown') { dy = step; e.preventDefault(); }
      else return;

      const tpl = currentTemplateRef.current;
      const ids = selectedFieldIdsRef.current;
      if (!tpl || !ids.length) return;

      const canvasEl = document.getElementById('poster-engine-canvas');
      if (!canvasEl) return;
      snapshotHistory();

      ids.forEach(id => {
        const el = canvasEl.querySelector(`[data-field="${id}"]`);
        const fd = tpl.fields[id];
        if (!el || !fd) return;
        let x = fd.left + dx;
        let y = fd.top + dy;
        x = Math.max(0, Math.min(1080 - fd.width, x));
        y = Math.max(0, Math.min(1350 - fd.height, y));
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        fd.left = Math.round(x);
        fd.top = Math.round(y);
      });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const snapshotHistory = () => {
    const tpl = currentTemplateRef.current;
    if (!tpl) return;
    setUndoStack(prev => [...prev.slice(-30), JSON.parse(JSON.stringify(tpl.fields))]);
    setRedoStack([]);
  };

  const applyUndo = () => {
    if (!undoStack.length || !currentTemplateRef.current) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, JSON.parse(JSON.stringify(currentTemplateRef.current.fields))]);
    setUndoStack(u => u.slice(0, -1));
    setCurrentTemplate(t => ({ ...t, fields: prev }));
  };

  const applyRedo = () => {
    if (!redoStack.length || !currentTemplateRef.current) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, JSON.parse(JSON.stringify(currentTemplateRef.current.fields))]);
    setRedoStack(r => r.slice(0, -1));
    setCurrentTemplate(t => ({ ...t, fields: next }));
  };

  const getActiveDef = () => {
    if (!currentTemplate || !activeFieldId) return null;
    return currentTemplate.fields[activeFieldId];
  };

  const updateActiveFields = (prop, val) => {
    snapshotHistory();
    setCurrentTemplate(tpl => {
      const updated = { ...tpl, fields: { ...tpl.fields } };
      selectedFieldIds.forEach(id => {
        if (updated.fields[id]) updated.fields[id] = { ...updated.fields[id], [prop]: val };
      });
      return updated;
    });
  };

  const handleSave = async () => {
    if (!currentTemplate) return;
    setSaving(true);
    await saveTemplate(currentTemplate);
    setUndoStack([]);
    setRedoStack([]);
    setSaving(false);
    setSavedMsg('✅ Template saved!');
    const t = await getTemplates();
    setTemplates(t);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleUploadBg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadTemplateBackground(file, file.name);
    if (!url) { alert('Failed to upload background image.'); return; }

    const allTemplates = await getTemplates();
    const defaultFields = allTemplates[0]?.fields || DEFAULT_TEMPLATES[0].fields;

    const newTpl = {
      id: 'custom-template-' + Date.now(),
      name: file.name.split('.')[0] || 'Custom Template',
      background: url,
      fields: JSON.parse(JSON.stringify(defaultFields)),
    };
    await saveTemplate(newTpl);
    const updated = await getTemplates();
    setTemplates(updated);
    selectTemplate(newTpl);
    alert(`Template "${newTpl.name}" uploaded & registered!`);
  };

  const activeDef = getActiveDef();

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Template Editor</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Drag, resize and style text fields on the poster canvas. Ctrl+Z to undo.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} id="btn-editor-undo" onClick={applyUndo} disabled={!undoStack.length} title="Undo (Ctrl+Z)"><Undo size={14} /> Undo</button>
          <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} id="btn-editor-redo" onClick={applyRedo} disabled={!redoStack.length} title="Redo (Ctrl+Y)"><Redo size={14} /> Redo</button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} id="btn-save-template-layout" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving…' : 'Save Layout'}</span>
          </button>
        </div>
      </div>

      {savedMsg && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 18px', borderRadius: 10, marginBottom: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="editor-layout">
        {/* Left Sidebar — Field Selector */}
        <div className="editor-sidebar-left">
          {/* Template switcher */}
          <div>
            <div className="editor-title-desc">
              <h4 style={{ marginBottom: 4 }}>Active Template</h4>
              <p id="lbl-active-template-name" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                {currentTemplate?.name || '—'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {templates.map(tpl => (
                <div key={tpl.id} style={{ display: 'flex', gap: 6, width: '100%' }}>
                  <button
                    className={`field-selector-btn ${currentTemplate?.id === tpl.id ? 'active' : ''}`}
                    onClick={() => selectTemplate(tpl)}
                    style={{ flexGrow: 1, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>{tpl.name}</span>
                    {currentTemplate?.id === tpl.id && <span style={{ marginLeft: 6 }}>✓</span>}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    style={{ padding: '8px 12px', borderColor: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={`Delete template "${tpl.name}"`}
                    disabled={templates.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload custom background */}
          <div>
            <h4 style={{ marginBottom: 10 }}>Upload Custom Background</h4>
            <label
              className="bg-upload-box"
              htmlFor="template-bg-file-input"
              id="template-upload-trigger"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <Upload size={28} style={{ color: 'var(--primary)', marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Click to upload image
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                PNG, JPG — 1080×1350 recommended
              </p>
            </label>
            <input
              id="template-bg-file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUploadBg}
            />
          </div>

          {/* Fields list */}
          <div>
            <h4 style={{ marginBottom: 8 }}>Poster Layers</h4>
            {selectedFieldIds.length > 0 && (
              <div
                id="editor-selection-status"
                style={{
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, marginBottom: 10,
                }}
              >
                <strong>{selectedFieldIds.length} layer(s) selected</strong>:<br />
                {selectedFieldIds.map(id => posterEngine.getFieldLabel(id)).join(', ')}
              </div>
            )}
            <div className="editor-field-selector-list" id="editor-field-selector-list">
              <div style={{ padding: '4px 14px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                ℹ️ Global Info Layers
              </div>
              {posterEngine.FIELDS.map(fKey => {
                if (fKey === 'winner_1_pos') {
                  return [
                    <div key="win-header" style={{ padding: '8px 14px 4px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', marginTop: 6 }}>
                      🏆 Winner Standing Slots
                    </div>,
                    <FieldBtn key={fKey} fKey={fKey} currentTemplate={currentTemplate} selectedFieldIds={selectedFieldIds} activeFieldId={activeFieldId} setSelectedFieldIds={setSelectedFieldIds} setActiveFieldId={setActiveFieldId} />,
                  ];
                }
                return (
                  <FieldBtn key={fKey} fKey={fKey} currentTemplate={currentTemplate} selectedFieldIds={selectedFieldIds} activeFieldId={activeFieldId} setSelectedFieldIds={setSelectedFieldIds} setActiveFieldId={setActiveFieldId} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="editor-canvas-area">
          <div
            ref={canvasWrapRef}
            id="editor-canvas-wrap"
            className="poster-preview-container"
            style={{ maxWidth: 380, width: '100%' }}
          />
        </div>

        {/* Right Sidebar — Controls */}
        <div className="editor-sidebar-right">
          {!activeDef ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 32 }}>
              <p style={{ fontWeight: 600 }}>Select a layer on the canvas or from the list to edit its properties.</p>
            </div>
          ) : (
            <>
              <div className="editor-title-desc">
                <h4>{posterEngine.getFieldLabel(activeFieldId)}</h4>
                <p>Editing position, size and typography.</p>
              </div>

              {/* Position & Size */}
              <div className="control-panel-group">
                <label>Position & Size (px)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['X', 'left', 'editor-pos-x'], ['Y', 'top', 'editor-pos-y'], ['W', 'width', 'editor-pos-w'], ['H', 'height', 'editor-pos-h']].map(([lbl, prop, id]) => (
                    <div key={prop}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{lbl}</label>
                      <input
                        id={id}
                        type="number"
                        value={Math.round(activeDef[prop === 'left' ? 'left' : prop === 'top' ? 'top' : prop === 'width' ? 'width' : 'height'] || 0)}
                        onChange={e => updateActiveFields(prop === 'left' ? 'left' : prop === 'top' ? 'top' : prop === 'width' ? 'width' : 'height', parseInt(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Font */}
              <div className="control-panel-group">
                <label>Font Family</label>
                <select
                  id="editor-font-family-select"
                  value={activeDef.fontFamily || (activeFieldId === 'programName' ? 'Outfit' : 'Plus Jakarta Sans')}
                  onChange={e => updateActiveFields('fontFamily', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
                >
                  {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              {/* Font Size */}
              <div className="control-panel-group">
                <label>Font Size: {activeDef.fontSize || 40}px</label>
                <input
                  id="editor-font-size-slider"
                  type="range"
                  min={16}
                  max={130}
                  value={activeDef.fontSize || 40}
                  onChange={e => updateActiveFields('fontSize', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <input
                  id="editor-font-size-input"
                  type="number"
                  min={16}
                  max={130}
                  value={activeDef.fontSize || 40}
                  onChange={e => updateActiveFields('fontSize', parseInt(e.target.value))}
                  style={{ width: 80, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              {/* Alignment */}
              <div className="control-panel-group">
                <label>Text Alignment</label>
                <div className="align-toggle-group">
                  {['left', 'center', 'right'].map(a => (
                    <button
                      key={a}
                      className={`align-toggle-btn ${(activeDef.align || 'center') === a ? 'active' : ''}`}
                      data-align={a}
                      onClick={() => updateActiveFields('align', a)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {a === 'left' ? <AlignLeft size={16} /> : a === 'center' ? <AlignCenter size={16} /> : <AlignRight size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="control-panel-group">
                <label>Text Color</label>
                <div className="color-swatches">
                  {COLOR_SWATCHES.map(c => (
                    <div
                      key={c}
                      className={`color-swatch ${(activeDef.color || '#111827').toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                      data-color={c}
                      style={{ background: c, border: c === '#FFFFFF' ? '1px solid #E5E7EB' : 'none' }}
                      onClick={() => updateActiveFields('color', c)}
                      title={c}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <input
                    id="editor-custom-color-picker"
                    type="color"
                    value={activeDef.color || '#111827'}
                    onChange={e => updateActiveFields('color', e.target.value)}
                    style={{ width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer' }}
                  />
                  <input
                    id="editor-custom-color-hex"
                    type="text"
                    value={(activeDef.color || '#111827').toUpperCase()}
                    onChange={e => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(v)) updateActiveFields('color', v);
                    }}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-page)', fontFamily: 'monospace', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Visibility */}
              <div className="control-panel-group">
                <label>
                  <input
                    id="editor-field-visibility"
                    type="checkbox"
                    checked={activeDef.visible !== false}
                    onChange={e => updateActiveFields('visible', e.target.checked)}
                    style={{ marginRight: 8 }}
                  />
                  Visible on poster
                </label>
              </div>

              {/* Snap Alignment */}
              <div className="control-panel-group">
                <label>Snap Alignment (multi-select)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    ['Left Edge', 'left', 'btn-snap-left'],
                    ['Center H', 'center', 'btn-snap-center'],
                    ['Right Edge', 'right', 'btn-snap-right'],
                    ['Match Width', 'width', 'btn-snap-width'],
                  ].map(([label, type, id]) => (
                    <button
                      key={type}
                      id={id}
                      className="btn btn-outline btn-sm"
                      onClick={() => alignFields(type)}
                      disabled={selectedFieldIds.length < 2}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  function alignFields(alignType) {
    if (!currentTemplate || selectedFieldIds.length < 2) return;
    const refId = activeFieldId;
    const refDef = currentTemplate.fields[refId];
    if (!refDef) return;

    setCurrentTemplate(tpl => {
      const updated = { ...tpl, fields: { ...tpl.fields } };
      selectedFieldIds.forEach(id => {
        if (id === refId) return;
        const fd = { ...updated.fields[id] };
        if (!fd) return;
        if (alignType === 'left') fd.left = refDef.left;
        else if (alignType === 'center') fd.left = Math.round(refDef.left + refDef.width / 2 - fd.width / 2);
        else if (alignType === 'right') fd.left = refDef.left + refDef.width - fd.width;
        else if (alignType === 'width') fd.width = refDef.width;
        updated.fields[id] = fd;
      });
      return updated;
    });
  }
}

function FieldBtn({ fKey, currentTemplate, selectedFieldIds, activeFieldId, setSelectedFieldIds, setActiveFieldId }) {
  const isSelected = selectedFieldIds.includes(fKey);
  const fieldDef = currentTemplate?.fields[fKey];
  const isVisible = fieldDef?.visible !== false;

  return (
    <button
      className={`field-selector-btn ${isSelected ? 'active' : ''}`}
      data-field-id={fKey}
      onClick={e => {
        if (document.activeElement?.blur) document.activeElement.blur();
        const shift = e.ctrlKey || e.metaKey || e.shiftKey;
        setSelectedFieldIds(prev => {
          if (shift) {
            const idx = prev.indexOf(fKey);
            if (idx !== -1) return prev.length > 1 ? prev.filter(id => id !== fKey) : prev;
            return [...prev, fKey];
          }
          return [fKey];
        });
        setActiveFieldId(fKey);
      }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
    >
      <span style={!isVisible ? { color: 'var(--text-secondary)', textDecoration: 'line-through', opacity: 0.6, fontStyle: 'italic' } : {}}>
        {posterEngine.getFieldLabel(fKey)}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>{isVisible ? <Eye size={14} /> : <EyeOff size={14} />}</span>
    </button>
  );
}
