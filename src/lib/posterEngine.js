/**
 * Poster Rendering & Exporting Engine — ES Module
 * Ported from js/engine.js with same imperative DOM API.
 * Used via useRef + useEffect in React components.
 */

export const posterEngine = {
  FIELDS: [
    'programName', 'category',
    'winner_1_pos', 'winner_1_name', 'winner_1_team',
    'winner_2_pos', 'winner_2_name', 'winner_2_team',
    'winner_3_pos', 'winner_3_name', 'winner_3_team',
    'winner_4_pos', 'winner_4_name', 'winner_4_team',
    'winner_5_pos', 'winner_5_name', 'winner_5_team',
    'winner_6_pos', 'winner_6_name', 'winner_6_team',
  ],

  getFieldLabel(fKey) {
    if (fKey === 'programName') return 'Program Name';
    if (fKey === 'category') return 'Category';
    const m = fKey.match(/^winner_(\d+)_(pos|name|team)$/);
    if (m) {
      const type = m[2] === 'pos' ? 'Position' : m[2] === 'name' ? 'Name' : 'Team';
      return `Winner ${m[1]} ${type}`;
    }
    return fKey;
  },

  getLabelForField(fieldName, value, result) {
    if (fieldName === 'category') return value ? value.toUpperCase() : '';

    const m = fieldName.match(/^winner_(\d+)_(pos|name|team)$/);
    if (m) {
      const idx = parseInt(m[1]) - 1;
      const type = m[2];
      const winners = result?.winners ?? [];
      const w = winners[idx];
      if (!w || !w.name) return '';
      if (type === 'pos') return w.position || '';
      if (type === 'name') return w.name || '';
      if (type === 'team') return w.team || '';
    }

    return value || '';
  },

  getEditorPlaceholderForField(fKey) {
    const m = fKey.match(/^winner_(\d+)_(pos|name|team)$/);
    if (m) {
      const type = m[2] === 'pos' ? 'Pos' : m[2] === 'name' ? 'Name' : 'Team';
      return `<div style="opacity:0.35;font-style:italic;font-size:0.8em;padding:10px 0;text-align:inherit;">[ W${m[1]} ${type} ]</div>`;
    }
    return `<div style="opacity:0.35;font-style:italic;font-size:0.8em;padding:10px 0;">${fKey}</div>`;
  },

  /**
   * Renders a poster inside a container element.
   * Returns cleanup function for resize listener.
   */
  render(container, result, template, opts = {}) {
    if (!container || !template) return () => {};

    // Remove previous resize listener if any
    if (container._adjustScaleFn) {
      window.removeEventListener('resize', container._adjustScaleFn);
      container._adjustScaleFn = null;
    }

    container.innerHTML = '';

    const canvas = document.createElement('div');
    canvas.className = 'poster-canvas' + (opts.editable ? ' editable-active' : '');
    canvas.id = 'poster-engine-canvas';
    canvas.style.cssText = `
      width: 1080px; height: 1350px;
      position: absolute; top: 0; left: 0;
      transform-origin: top left;
      background-image: url("${template.background}");
      background-size: cover; background-position: center;
    `;

    this.FIELDS.forEach(fKey => {
      const fDef = template.fields?.[fKey];
      if (!fDef) return;

      const isVisible = fDef.visible !== false;
      const isWinnerField = /^winner_/.test(fKey);

      let hasWinnerData = false;
      if (isWinnerField) {
        const m = fKey.match(/^winner_(\d+)_/);
        const idx = m ? parseInt(m[1]) - 1 : -1;
        const winners = result?.winners ?? [];
        hasWinnerData = idx >= 0 && !!winners[idx]?.name;
      }

      if (!opts.editable) {
        if (!isVisible) return;
        if (isWinnerField && !hasWinnerData) return;
      }

      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'poster-field';
      fieldDiv.dataset.field = fKey;

      if (opts.editable) {
        if (opts.activeFieldId === fKey || opts.selectedFieldIds?.includes(fKey)) {
          fieldDiv.classList.add('selected-field');
        }
        if (!isVisible) {
          fieldDiv.classList.add('hidden-field');
          fieldDiv.style.opacity = '0.3';
          fieldDiv.style.border = '1px dashed rgba(239,68,68,0.5)';
        }
        fieldDiv.addEventListener('mousedown', e => opts.onSelectField?.(fKey, e));
      }

      Object.assign(fieldDiv.style, {
        left: `${fDef.left}px`,
        top: `${fDef.top}px`,
        width: `${fDef.width}px`,
        height: `${fDef.height}px`,
        color: fDef.color || '#111827',
        textAlign: fDef.align || 'center',
        justifyContent: fDef.align === 'left' ? 'flex-start' : fDef.align === 'right' ? 'flex-end' : 'center',
        textShadow: 'none',
      });

      const textSpan = document.createElement('div');
      textSpan.className = 'poster-field-text';
      textSpan.style.fontFamily = fDef.fontFamily || (fKey === 'programName' ? 'var(--font-title)' : 'var(--font-body)');
      textSpan.style.fontWeight = fKey === 'category' ? '700' : '800';
      textSpan.style.letterSpacing = fKey === 'category' ? '0.08em' : 'normal';

      if (isWinnerField) {
        if (hasWinnerData || opts.editable) {
          textSpan.innerHTML = this.getLabelForField(fKey, '', result);
          if (opts.editable && !hasWinnerData) {
            textSpan.innerHTML = this.getEditorPlaceholderForField(fKey);
          }
        }
      } else {
        textSpan.innerHTML = this.getLabelForField(fKey, result?.[fKey] || (opts.editable ? `[ ${fKey} ]` : ''), result);
      }

      if (opts.editable) {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        fieldDiv.appendChild(handle);
      }

      fieldDiv.appendChild(textSpan);
      canvas.appendChild(fieldDiv);
    });

    container.appendChild(canvas);

    const adjustScale = () => {
      const w = container.clientWidth || 320;
      canvas.style.transform = `scale(${w / 1080})`;
    };

    adjustScale();

    this.FIELDS.forEach(fKey => {
      const fDef = template.fields?.[fKey];
      const el = canvas.querySelector(`[data-field="${fKey}"]`);
      if (el && fDef) this.fitText(el, fDef.fontSize || 48);
    });

    window.addEventListener('resize', adjustScale);
    container._adjustScaleFn = adjustScale;

    // Return cleanup function
    return () => window.removeEventListener('resize', adjustScale);
  },

  fitText(fieldEl, maxFontSize) {
    const textEl = fieldEl.querySelector('.poster-field-text');
    if (!textEl) return;
    let size = maxFontSize;
    textEl.style.fontSize = `${size}px`;
    while ((textEl.scrollWidth > fieldEl.clientWidth || textEl.scrollHeight > fieldEl.clientHeight) && size > 14) {
      size -= 2;
      textEl.style.fontSize = `${size}px`;
    }
  },

  exportJpg(container, fileName = 'arts-poster.jpg') {
    const activeCanvas = container.querySelector('.poster-canvas');
    if (!activeCanvas) { alert('No canvas found for export!'); return; }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;
      background:rgba(17,24,39,0.7);backdrop-filter:blur(8px);
      color:white;display:flex;flex-direction:column;
      align-items:center;justify-content:center;z-index:99999;
      font-family:var(--font-body);font-weight:700;
    `;
    overlay.innerHTML = `
      <div style="width:50px;height:50px;border:5px solid #a78bfa;border-top:5px solid #7C3AED;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:16px;"></div>
      <p style="font-size:1.1rem;letter-spacing:1px;">GENERATING HIGH-RES POSTER (1080 × 1350)...</p>
      <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(overlay);

    const clone = activeCanvas.cloneNode(true);
    Object.assign(clone.style, {
      transform: 'none', position: 'fixed',
      left: '-1080px', top: '-1350px',
      width: '1080px', height: '1350px',
    });
    clone.classList.remove('editable-active');
    clone.querySelectorAll('.selected-field').forEach(el => el.classList.remove('selected-field'));
    clone.querySelectorAll('.hidden-field').forEach(el => {
      el.style.opacity = '0'; el.style.border = 'none'; el.style.display = 'none';
    });
    document.body.appendChild(clone);

    setTimeout(async () => {
      const fields = clone.querySelectorAll('.poster-field');
      fields.forEach(fEl => {
        const orgSpan = activeCanvas.querySelector(`[data-field="${fEl.dataset.field}"] .poster-field-text`);
        const cloneSpan = fEl.querySelector('.poster-field-text');
        if (orgSpan && cloneSpan) cloneSpan.style.fontSize = orgSpan.style.fontSize;
      });

      try {
        const { default: html2canvas } = await import('html2canvas');
        const cvs = await html2canvas(clone, {
          width: 1080, height: 1350, scale: 2,
          useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
        });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = cvs.toDataURL('image/jpeg', 0.95);
        link.click();
      } catch (err) {
        console.error('Export error:', err);
        alert('Failed to export poster. Please try again.');
      } finally {
        document.body.removeChild(clone);
        document.body.removeChild(overlay);
      }
    }, 400);
  },
};

export default posterEngine;
