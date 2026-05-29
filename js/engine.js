/**
 * Poster Rendering & Exporting Engine
 */

const posterEngine = {
  // Fields to render — all winner elements are independent editable layers
  FIELDS: [
    'resultNo', 'programName', 'category',
    'winner_1_pos', 'winner_1_name', 'winner_1_team',
    'winner_2_pos', 'winner_2_name', 'winner_2_team',
    'winner_3_pos', 'winner_3_name', 'winner_3_team',
    'winner_4_pos', 'winner_4_name', 'winner_4_team',
    'winner_5_pos', 'winner_5_name', 'winner_5_team',
    'winner_6_pos', 'winner_6_name', 'winner_6_team'
  ],

  // Human-readable label for field IDs
  getFieldLabel(fKey) {
    if (fKey === 'resultNo') return 'Result No.';
    if (fKey === 'programName') return 'Program Name';
    if (fKey === 'category') return 'Category';
    const m = fKey.match(/^winner_(\d+)_(pos|name|team)$/);
    if (m) {
      const idx = m[1];
      const type = m[2] === 'pos' ? 'Position' : m[2] === 'name' ? 'Name' : 'Team';
      return `Winner ${idx} ${type}`;
    }
    return fKey;
  },

  getLabelForField(fieldName, value, result) {
    if (fieldName === 'resultNo') {
      return value || "";
    }
    if (fieldName === 'category') {
      return value ? value.toUpperCase() : "";
    }

    const winnerMatch = fieldName.match(/^winner_(\d+)_(pos|name|team)$/);
    if (winnerMatch) {
      const idx = parseInt(winnerMatch[1]) - 1; // 0-indexed
      const type = winnerMatch[2]; // 'pos', 'name', 'team'
      const winners = result && result.winners ? result.winners : [];
      const w = winners[idx];
      if (!w || !w.name) return ""; // Hide if no winner data exists

      if (type === 'pos') return w.position || "";
      if (type === 'name') return w.name || "";
      if (type === 'team') return w.team || "";
    }

    return value || "";
  },

  // Editor placeholder content for empty slots
  getEditorPlaceholderForField(fKey) {
    const m = fKey.match(/^winner_(\d+)_(pos|name|team)$/);
    if (m) {
      const idx = m[1];
      const type = m[2] === 'pos' ? 'Pos' : m[2] === 'name' ? 'Name' : 'Team';
      return `<div style="opacity:0.35;font-style:italic;font-size:0.8em;padding:10px 0;text-align:inherit;">[ W${idx} ${type} ]</div>`;
    }
    return `<div style="opacity:0.35;font-style:italic;font-size:0.8em;padding:10px 0;">${fKey}</div>`;
  },

  /**
   * Renders a poster inside a parent container element
   * @param {HTMLElement} container - Responsive wrapper element
   * @param {Object} result - Result record {programName, category, winners: [...]}
   * @param {Object} template - Template schema {id, name, background, fields: {...}}
   * @param {Object} opts - Optional settings {editable: false, onSelectField: null, activeFieldId: null}
   */
  render(container, result, template, opts = {}) {
    if (!container || !template) return;
    
    // Clear container
    container.innerHTML = "";
    
    // Create poster canvas wrapper (strictly 1080x1350 internally)
    const canvas = document.createElement("div");
    canvas.className = "poster-canvas" + (opts.editable ? " editable-active" : "");
    canvas.id = "poster-engine-canvas";
    canvas.style.width = "1080px";
    canvas.style.height = "1350px";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.transformOrigin = "top left";
    canvas.style.backgroundImage = `url("${template.background}")`;
    canvas.style.backgroundSize = "cover";
    canvas.style.backgroundPosition = "center";
    
    // Create text overlays
    this.FIELDS.forEach(fKey => {
      let fDef = template.fields[fKey];
      if (!fDef) {
        if (fKey === 'resultNo') {
          // Provide generic default fallback so it can be edited/rendered
          fDef = { left: 90, top: 160, width: 900, height: 40, fontSize: 24, color: "#7C3AED", align: "center", shadow: false, visible: true };
        } else {
          return;
        }
      }
      
      const fieldDiv = document.createElement("div");
      fieldDiv.className = "poster-field";
      fieldDiv.dataset.field = fKey;
      
      // Visibility and data checks
      const isVisible = fDef.visible !== false;
      const isWinnerField = /^winner_/.test(fKey);
      
      let hasWinnerData = false;
      if (isWinnerField) {
        const m = fKey.match(/^winner_(\d+)_/);
        const idx = m ? parseInt(m[1]) - 1 : -1;
        const winners = result && result.winners ? result.winners : [];
        hasWinnerData = idx >= 0 && winners[idx] && winners[idx].name;
      }

      // Poster mode (non-editable): hide invisible layers OR empty winner slots entirely
      if (!opts.editable) {
        if (!isVisible) return;
        if (isWinnerField && !hasWinnerData) return;
      }

      // Highlight selection if active in editor
      if (opts.editable) {
        if (opts.activeFieldId === fKey || (opts.selectedFieldIds && opts.selectedFieldIds.includes(fKey))) {
          fieldDiv.classList.add("selected-field");
        }
        
        // Highlight hidden field style visually in editor
        if (!isVisible) {
          fieldDiv.classList.add("hidden-field");
          fieldDiv.style.opacity = "0.3";
          fieldDiv.style.border = "1px dashed rgba(239, 68, 68, 0.5)";
        }
        
        // Add click listener to select this field in editor
        fieldDiv.addEventListener("mousedown", (e) => {
          if (opts.onSelectField) {
            opts.onSelectField(fKey, e);
          }
        });
      }
      
      // Position settings
      fieldDiv.style.left = `${fDef.left}px`;
      fieldDiv.style.top = `${fDef.top}px`;
      fieldDiv.style.width = `${fDef.width}px`;
      fieldDiv.style.height = `${fDef.height}px`;
      fieldDiv.style.color = fDef.color || "#111827";
      fieldDiv.style.textAlign = fDef.align || "center";

      // Center vertically using flex layouts aligned to text alignment setting
      fieldDiv.style.justifyContent = fDef.align === "left" ? "flex-start" : fDef.align === "right" ? "flex-end" : "center";
      fieldDiv.style.textShadow = "none";
      
      // Inner text element for auto-wrapping & resizing calculations
      const textSpan = document.createElement("div");
      textSpan.className = "poster-field-text";
      textSpan.style.fontFamily = fDef.fontFamily || (fKey === 'programName' ? "var(--font-title)" : "var(--font-body)");
      textSpan.style.fontWeight = (fKey === 'category' || fKey === 'resultNo') ? "700" : "800";
      textSpan.style.letterSpacing = (fKey === 'category' || fKey === 'resultNo') ? "0.08em" : "normal";

      // Determine content
      if (isWinnerField) {
        if (hasWinnerData || opts.editable) {
          textSpan.innerHTML = this.getLabelForField(fKey, "", result);
          // If in editable mode and no data, overlay a placeholder
          if (opts.editable && !hasWinnerData) {
            textSpan.innerHTML = this.getEditorPlaceholderForField(fKey);
          }
        }
      } else {
        textSpan.innerHTML = this.getLabelForField(fKey, result[fKey] || (opts.editable ? `[ ${fKey} ]` : ""), result);
      }
      
      // Append handles if editable
      if (opts.editable) {
        const handle = document.createElement("div");
        handle.className = "resize-handle";
        fieldDiv.appendChild(handle);
      }
      
      fieldDiv.appendChild(textSpan);
      canvas.appendChild(fieldDiv);
    });
    
    container.appendChild(canvas);
    
    // Perform responsive scaling sizing
    const adjustScale = () => {
      const containerWidth = container.clientWidth || 320;
      const scale = containerWidth / 1080;
      canvas.style.transform = `scale(${scale})`;
    };
    
    // Run scale calculation
    adjustScale();
    
    // Auto-fit text scale sizes across all fields
    this.FIELDS.forEach(fKey => {
      const fDef = template.fields[fKey];
      const fieldDiv = canvas.querySelector(`[data-field="${fKey}"]`);
      if (fieldDiv) {
        this.fitText(fieldDiv, fDef.fontSize || 48);
      }
    });
    
    // Bind to window resize
    window.addEventListener("resize", adjustScale);
    container._adjustScaleFn = adjustScale; // Save pointer to unbind
  },

  /**
   * Adjusts the font size of a field element dynamically so text wraps
   * and fits precisely inside client width and height boundaries.
   * @param {HTMLElement} fieldEl - Bounding box DOM node
   * @param {number} maxFontSize - Base size to start shrinking from
   */
  fitText(fieldEl, maxFontSize) {
    const textEl = fieldEl.querySelector(".poster-field-text");
    if (!textEl) return;
    
    let size = maxFontSize;
    textEl.style.fontSize = `${size}px`;
    
    // Keep reducing text font size in 2px increments if overflow exists
    while (
      (textEl.scrollWidth > fieldEl.clientWidth || 
       textEl.scrollHeight > fieldEl.clientHeight) && 
      size > 14
    ) {
      size -= 2;
      textEl.style.fontSize = `${size}px`;
    }
  },

  /**
   * Generates a high-quality JPG poster download directly
   * @param {HTMLElement} container - Original target container containing the canvas
   * @param {string} fileName - Destination name of downloaded file
   */
  exportJpg(container, fileName = "arts-poster.jpg") {
    const activeCanvas = container.querySelector(".poster-canvas");
    if (!activeCanvas) {
      alert("No active canvas render found for exporting!");
      return;
    }
    
    // Create loading overlay
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.background = "rgba(17,24,39,0.7)";
    overlay.style.backdropFilter = "blur(8px)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "99999";
    overlay.style.fontFamily = "var(--font-body)";
    overlay.style.fontWeight = "700";
    overlay.innerHTML = `
      <div style="width:50px;height:50px;border:5px solid var(--primary-light);border-top:5px solid var(--primary);border-radius:50%;animation:spin 1s linear infinite;margin-bottom:16px;"></div>
      <p style="font-size:1.1rem;letter-spacing:1px;">GENERATING HIGH-RES POSTER (1080 × 1350)...</p>
      <style>@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }</style>
    `;
    document.body.appendChild(overlay);
    
    // Create cloned offscreen canvas at full scale
    const clone = activeCanvas.cloneNode(true);
    clone.style.transform = "none";
    clone.style.position = "fixed";
    clone.style.left = "-1080px";
    clone.style.top = "-1350px";
    clone.style.width = "1080px";
    clone.style.height = "1350px";
    clone.classList.remove("editable-active");
    
    // Force clean borders
    const selectedOutline = clone.querySelector(".selected-field");
    if (selectedOutline) selectedOutline.classList.remove("selected-field");
    
    // Hide visual editor dashes on cloned fields
    const hiddenFields = clone.querySelectorAll(".hidden-field");
    hiddenFields.forEach(hf => {
      hf.style.opacity = "0";
      hf.style.border = "none";
      hf.style.display = "none";
    });

    document.body.appendChild(clone);
    
    // Wait for DOM to attach clone
    setTimeout(() => {
      // Re-trigger text scaling on the cloned full-size elements explicitly
      const fields = clone.querySelectorAll(".poster-field");
      fields.forEach(fEl => {
        const fKey = fEl.dataset.field;
        const orgField = activeCanvas.querySelector(`[data-field="${fKey}"]`);
        
        // Find maximum configured font size
        const textSpan = fEl.querySelector(".poster-field-text");
        if (textSpan && orgField) {
          const orgTextSpan = orgField.querySelector(".poster-field-text");
          textSpan.style.fontSize = orgTextSpan.style.fontSize; // Align to scale
        }
      });
      
      // Call html2canvas
      html2canvas(clone, {
        width: 1080,
        height: 1350,
        scale: 2, // Double resolution scale for premium printing density
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      }).then(canvas => {
        // Create download link
        const link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
        
        // Cleanup DOM
        document.body.removeChild(clone);
        document.body.removeChild(overlay);
      }).catch(err => {
        console.error("Export error:", err);
        alert("Failed to render and export poster. Please try again.");
        document.body.removeChild(clone);
        document.body.removeChild(overlay);
      });
    }, 400);
  }
};

window.posterEngine = posterEngine;
