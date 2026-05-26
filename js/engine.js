/**
 * Poster Rendering & Exporting Engine
 */

const posterEngine = {
  // Fields to render — placement_1..6 are independent editable layers
  FIELDS: ['programName', 'category', 'placement_1', 'placement_2', 'placement_3', 'placement_4', 'placement_5', 'placement_6'],

  // Human-readable label for field IDs
  getFieldLabel(fKey) {
    if (fKey === 'programName') return 'Program Name';
    if (fKey === 'category') return 'Category';
    const m = fKey.match(/^placement_(\d+)$/);
    if (m) return `Placement ${m[1]}`;
    return fKey;
  },

  // Labels for rendering formatting
  getLabelForField(fieldName, value, result) {
    if (fieldName === 'category') {
      return value ? value.toUpperCase() : "";
    }

    // Handle placement_N fields
    const placementMatch = fieldName.match(/^placement_(\d+)$/);
    if (placementMatch) {
      const idx = parseInt(placementMatch[1]) - 1; // 0-indexed
      const placements = result && result.placements ? result.placements : [];
      const group = placements[idx];

      if (!group || !group.rank || !group.winners || group.winners.length === 0) {
        // In editor mode, show placeholder; in poster mode, show nothing
        return `<div style="opacity:0;height:0;overflow:hidden;">-</div>`;
      }

      // Rank header
      let html = `<div style="display:block;width:100%;box-sizing:border-box;text-align:inherit;">`;
      html += `<div style="font-size:0.72em;font-weight:800;text-transform:uppercase;letter-spacing:0.14em;opacity:0.85;margin-bottom:6px;text-align:inherit;color:inherit;">${group.rank}</div>`;

      // Winner rows
      group.winners.forEach(w => {
        if (!w.name) return;
        const teamLabel = w.team
          ? `<span style="font-size:0.68em;font-weight:600;opacity:0.75;text-transform:uppercase;margin-left:7px;display:inline-block;">(${w.team})</span>`
          : "";
        html += `<div style="font-size:1em;font-weight:800;line-height:1.35;margin-bottom:3px;text-align:inherit;color:inherit;">${w.name}${teamLabel}</div>`;
      });

      html += `</div>`;
      return html;
    }

    return value || "";
  },

  // Editor placeholder content for empty placement slots
  getEditorPlaceholderForField(fKey) {
    const m = fKey.match(/^placement_(\d+)$/);
    if (m) {
      return `<div style="opacity:0.35;font-style:italic;font-size:0.8em;padding:10px 0;text-align:inherit;">[ Placement ${m[1]} ]</div>`;
    }
    return `<div style="opacity:0.35;font-style:italic;font-size:0.8em;padding:10px 0;">${fKey}</div>`;
  },

  /**
   * Renders a poster inside a parent container element
   * @param {HTMLElement} container - Responsive wrapper element
   * @param {Object} result - Result record {programName, category, firstPlace, ...}
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
      const fDef = template.fields[fKey];
      if (!fDef) return;
      
      const fieldDiv = document.createElement("div");
      fieldDiv.className = "poster-field";
      fieldDiv.dataset.field = fKey;
      
      // For placement fields: check if this slot has data
      const isPlacementField = /^placement_\d+$/.test(fKey);
      const placementIdx = isPlacementField ? parseInt(fKey.split('_')[1]) - 1 : -1;
      const placements = result && result.placements ? result.placements : [];
      const hasPlacementData = isPlacementField && placements[placementIdx] && 
                               placements[placementIdx].rank && 
                               placements[placementIdx].winners && 
                               placements[placementIdx].winners.length > 0;

      // In poster mode (not editable): hide empty placement slots entirely
      if (!opts.editable && isPlacementField && !hasPlacementData) {
        return; // Skip rendering this field entirely
      }

      // Highlight selection if active in editor
      if (opts.editable) {
        if (opts.activeFieldId === fKey || (opts.selectedFieldIds && opts.selectedFieldIds.includes(fKey))) {
          fieldDiv.classList.add("selected-field");
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

      // Placement fields: align content to top so they stack cleanly
      if (isPlacementField) {
        fieldDiv.style.alignItems = "flex-start";
        fieldDiv.style.justifyContent = "flex-start";
      } else {
        fieldDiv.style.justifyContent = fDef.align === "left" ? "flex-start" : fDef.align === "right" ? "flex-end" : "center";
      }
      
      fieldDiv.style.textShadow = "none";
      
      // Inner text element for auto-wrapping & resizing calculations
      const textSpan = document.createElement("div");
      textSpan.className = "poster-field-text";
      textSpan.style.fontFamily = fDef.fontFamily || (fKey === 'programName' ? "var(--font-title)" : "var(--font-body)");
      textSpan.style.fontWeight = fKey === 'category' ? "700" : "800";
      textSpan.style.letterSpacing = fKey === 'category' ? "0.08em" : "normal";

      // Determine content
      if (isPlacementField) {
        if (hasPlacementData || opts.editable) {
          textSpan.innerHTML = this.getLabelForField(fKey, "", result);
          // If in editable mode and no data, overlay a placeholder
          if (opts.editable && !hasPlacementData) {
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
      const containerHeight = container.clientHeight || 400;
      
      // Keep ratio 4/5
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
    container._adjustScaleFn = adjustScale; // Save pointer to unbind if needed
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
    
    // To ensure perfectly crisp renders, we create a temporary clone of the canvas
    // placed exactly off-screen with transform scale reset to 1.
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
