/**
 * Admin Dashboard Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE VARIABLES ---
  let activeTab = "dashboard";
  let currentEditorTemplate = null;
  let activeEditorField = "programName"; // last active field (for loading style values)
  let selectedFieldIds = ["programName"]; // multi-select array

  // --- UNDO / REDO HISTORY ---
  let undoStack = [];   // Array of JSON strings (snapshots of template.fields)
  let redoStack = [];
  const MAX_HISTORY = 50;

  function snapshotHistory() {
    if (!currentEditorTemplate) return;
    const snapshot = JSON.stringify(currentEditorTemplate.fields);
    // Avoid duplicate snapshots
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === snapshot) return;
    undoStack.push(snapshot);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = []; // Clear redo on new change
  }

  function applyUndo() {
    if (undoStack.length === 0 || !currentEditorTemplate) return;
    // Push current to redo
    redoStack.push(JSON.stringify(currentEditorTemplate.fields));
    const prev = undoStack.pop();
    currentEditorTemplate.fields = JSON.parse(prev);
    renderEditorPosterCanvas();
    loadActiveFieldStylesToSidebar();
  }

  function applyRedo() {
    if (redoStack.length === 0 || !currentEditorTemplate) return;
    // Push current to undo
    undoStack.push(JSON.stringify(currentEditorTemplate.fields));
    const next = redoStack.pop();
    currentEditorTemplate.fields = JSON.parse(next);
    renderEditorPosterCanvas();
    loadActiveFieldStylesToSidebar();
  }

  // --- SELECTORS ---
  const sidebarMenu = document.getElementById("sidebar-menu");
  const adminOverlay = document.getElementById("admin-overlay");
  const adminHamburger = document.getElementById("admin-hamburger");
  const tabSections = document.querySelectorAll(".tab-section");
  const navItems = document.querySelectorAll(".admin-nav-item");

  // --- MOBILE NAV TOGGLE ---
  if (adminHamburger) {
    adminHamburger.addEventListener("click", () => {
      sidebarMenu.classList.toggle("mobile-open");
      adminOverlay.classList.toggle("active");
      adminHamburger.classList.toggle("open");
    });
  }

  if (adminOverlay) {
    adminOverlay.addEventListener("click", () => {
      sidebarMenu.classList.remove("mobile-open");
      adminOverlay.classList.remove("active");
      adminHamburger.classList.remove("open");
    });
  }

  // --- TAB NAVIGATION SYSTEM ---
  window.switchTab = function(tabId) {
    activeTab = tabId;
    
    // Toggle nav item highlight
    navItems.forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Toggle visible section
    tabSections.forEach(section => {
      if (section.id === `tab-${tabId}`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    // Close mobile side drawer
    if (sidebarMenu) sidebarMenu.classList.remove("mobile-open");
    if (adminOverlay) adminOverlay.classList.remove("active");
    if (adminHamburger) adminHamburger.classList.remove("open");

    // Perform sub-view loaders
    if (tabId === "dashboard") {
      loadDashboardStats();
    } else if (tabId === "upload") {
      initUploadResultForm();
    } else if (tabId === "templates") {
      initTemplateManager();
    } else if (tabId === "published") {
      loadPublishedResults();
    } else if (tabId === "settings") {
      loadSettingsView();
    }
  };

  // Nav Item click listeners
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.dataset.tab;
      switchTab(tabId);
    });
  });

  // --- 1. DASHBOARD CONTROLLER ---
  function loadDashboardStats() {
    const results = db.getResults();
    const templates = db.getTemplates();
    
    // Numeric stats
    document.getElementById("stat-total-results").innerText = results.length;
    
    // Unique categories count
    const cats = new Set(results.map(r => r.category));
    document.getElementById("stat-total-categories").innerText = cats.size || 0;
    document.getElementById("stat-total-templates").innerText = templates.length;

    // Load recent list
    const recentContainer = document.getElementById("dashboard-recent-list");
    if (recentContainer) {
      recentContainer.innerHTML = "";
      
      const recentList = results.slice(0, 3);
      if (recentList.length === 0) {
        recentContainer.innerHTML = `<div style="text-align:center;color:var(--text-secondary);padding:24px;width:100%;font-weight:600;">No results published yet.</div>`;
      } else {
        recentList.forEach(r => {
          const row = document.createElement("div");
          row.className = "result-list-item";
          row.style.cursor = "default";
          row.style.padding = "14px 20px";
          const teamInfo = r.firstPlaceTeam ? ` (${r.firstPlaceTeam})` : "";
          row.innerHTML = `
            <div class="result-list-main" style="gap: 16px;">
              <span class="badge badge-primary result-list-category">${r.category}</span>
              <div class="result-list-title-wrap">
                <div class="result-list-title" style="font-size: 1.05rem;">${r.programName}</div>
                <div class="result-list-winner" style="font-size: 0.85rem;">🥇 1st Place: <strong>${r.firstPlace}${teamInfo}</strong></div>
              </div>
            </div>
            <div class="action-btns">
              <button class="btn btn-outline btn-sm" onclick="triggerEditResult('${r.id}')">✏️ Edit</button>
            </div>
          `;
          recentContainer.appendChild(row);
        });
      }
    }
  }

  // --- DYNAMIC NESTED PLACEMENTS SYSTEM ---
  const teamOptionsList = ["Emangad", "Koorad", "Kuttiyil", "Old Vaniyambalam", "Thekkumpuram", "Vaniyambalam", "Wandoor"];

  function addPlacementGroup(rankName = "", winners = []) {
    const container = document.getElementById("placements-groups-container");
    if (!container) return;

    const groupDiv = document.createElement("div");
    groupDiv.className = "placement-group-card";
    groupDiv.style.border = "1px solid var(--border-color)";
    groupDiv.style.borderRadius = "var(--radius-input)";
    groupDiv.style.padding = "20px";
    groupDiv.style.marginBottom = "16px";
    groupDiv.style.backgroundColor = "#ffffff";
    groupDiv.style.boxShadow = "var(--shadow-sm)";
    groupDiv.style.transition = "all var(--transition-fast)";

    groupDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap;">
        <div class="form-group" style="margin-bottom: 0; flex-grow: 1; max-width: 320px;">
          <input type="text" class="placement-rank-input" placeholder="e.g. First Place, Special Prize" value="${rankName}" style="padding: 10px 16px; font-weight: 800; color: var(--primary);" required>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button type="button" class="btn btn-outline btn-sm btn-add-winner-to-group" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 700;">
            + Add Winner Name
          </button>
          <button type="button" class="btn btn-outline btn-sm btn-delete-group" style="padding: 6px 10px; color: #EF4444; border-color: #FEE2E2; font-size: 0.85rem;">
            🗑️ Remove Rank
          </button>
        </div>
      </div>
      <div class="group-winners-rows-list" style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Winner rows will go here -->
      </div>
    `;

    const winnersListContainer = groupDiv.querySelector(".group-winners-rows-list");
    const addWinnerBtn = groupDiv.querySelector(".btn-add-winner-to-group");
    const deleteGroupBtn = groupDiv.querySelector(".btn-delete-group");
    const rankInput = groupDiv.querySelector(".placement-rank-input");

    // Add winner button listener
    addWinnerBtn.onclick = () => {
      addWinnerRowToGroup(winnersListContainer, "", "");
    };

    // Remove group button listener
    deleteGroupBtn.onclick = () => {
      groupDiv.remove();
      updateUploadLivePreview();
    };

    // Rank input listener
    rankInput.oninput = debouncedPreviewUpdate;

    // Populate winners if any
    if (winners.length > 0) {
      winners.forEach(w => {
        addWinnerRowToGroup(winnersListContainer, w.name, w.team);
      });
    } else {
      // Seed at least one winner row
      addWinnerRowToGroup(winnersListContainer, "", "");
    }

    container.appendChild(groupDiv);
    updateUploadLivePreview();
  }

  function addWinnerRowToGroup(container, name = "", team = "") {
    const row = document.createElement("div");
    row.className = "winner-entry-row";
    row.style.display = "grid";
    row.style.gridTemplateColumns = "1fr 1fr auto";
    row.style.gap = "10px";
    row.style.alignItems = "center";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "winner-name-input";
    nameInput.placeholder = "Winner Name";
    nameInput.value = name;
    nameInput.style.padding = "10px 16px";
    nameInput.style.borderRadius = "var(--radius-input)";
    nameInput.style.border = "1px solid var(--border-color)";
    nameInput.style.backgroundColor = "var(--bg-page)";
    nameInput.style.fontFamily = "var(--font-body)";
    nameInput.style.fontSize = "0.9rem";
    nameInput.style.color = "var(--text-primary)";

    const teamSelect = document.createElement("select");
    teamSelect.className = "winner-team-select";
    teamSelect.style.padding = "10px 16px";
    teamSelect.style.borderRadius = "var(--radius-input)";
    teamSelect.style.border = "1px solid var(--border-color)";
    teamSelect.style.backgroundColor = "var(--bg-page)";
    teamSelect.style.fontFamily = "var(--font-body)";
    teamSelect.style.fontSize = "0.9rem";
    teamSelect.style.color = "var(--text-primary)";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.innerText = "Select Team...";
    teamSelect.appendChild(defaultOpt);

    teamOptionsList.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.innerText = t;
      teamSelect.appendChild(opt);
    });
    teamSelect.value = team;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-outline btn-sm";
    removeBtn.style.padding = "10px 12px";
    removeBtn.style.color = "#EF4444";
    removeBtn.style.borderColor = "#FEE2E2";
    removeBtn.style.fontSize = "0.85rem";
    removeBtn.innerHTML = "🗑️";
    removeBtn.onclick = () => {
      row.remove();
      updateUploadLivePreview();
    };

    nameInput.addEventListener("input", debouncedPreviewUpdate);
    teamSelect.addEventListener("change", updateUploadLivePreview);

    row.appendChild(nameInput);
    row.appendChild(teamSelect);
    row.appendChild(removeBtn);
    container.appendChild(row);

    updateUploadLivePreview();
  }

  function getWinnersData() {
    const container = document.getElementById("placements-groups-container");
    const result = { placements: [] };
    if (!container) return result;

    const cards = container.querySelectorAll(".placement-group-card");
    cards.forEach(card => {
      const rankInput = card.querySelector(".placement-rank-input");
      const rank = rankInput ? rankInput.value.trim() : "";
      if (!rank) return;

      const winners = [];
      const winnerRows = card.querySelectorAll(".winner-entry-row");
      winnerRows.forEach(row => {
        const nameInput = row.querySelector(".winner-name-input");
        const teamSelect = row.querySelector(".winner-team-select");
        const name = nameInput ? nameInput.value.trim() : "";
        const team = teamSelect ? teamSelect.value : "";
        if (name) {
          winners.push({ name, team });
        }
      });

      if (winners.length > 0) {
        result.placements.push({ rank, winners });
      }
    });

    return result;
  }

  function populateWinners(r) {
    const container = document.getElementById("placements-groups-container");
    if (!container) return;
    container.innerHTML = "";

    const placements = r && r.placements ? r.placements : [];
    if (placements.length > 0) {
      placements.forEach(g => {
        addPlacementGroup(g.rank, g.winners);
      });
    } else {
      // Seed default rank structure
      addPlacementGroup("First Place", []);
      addPlacementGroup("Second Place", []);
      addPlacementGroup("Third Place", []);
    }
  }

  // Bind Dynamic Placement Group Add button inside DOMContentLoaded
  const addGroupBtn = document.getElementById("btn-add-placement-group");
  if (addGroupBtn) {
    addGroupBtn.onclick = () => {
      const container = document.getElementById("placements-groups-container");
      const existing = container ? container.querySelectorAll(".placement-group-card").length : 0;
      let nextRank = "Special Prize";
      if (existing === 0) nextRank = "First Place";
      else if (existing === 1) nextRank = "Second Place";
      else if (existing === 2) nextRank = "Third Place";
      
      addPlacementGroup(nextRank, []);
    };
  }

  window.triggerEditResult = function(id) {
    const r = db.getResult(id);
    if (r) {
      switchTab("upload");
      document.getElementById("edit-result-id").value = r.id;
      document.getElementById("form-program-name").value = r.programName;
      document.getElementById("form-category").value = r.category;
      
      populateWinners(r);
      
      document.getElementById("upload-form-title").innerText = "Edit Published Result";
      document.getElementById("btn-submit-result").innerText = "Update Published Poster";
      updateUploadLivePreview();
    }
  };

  // --- 2. UPLOAD RESULT & REAL-TIME PREVIEW ---
  let uploadPreviewTimer = null;
  
  function initUploadResultForm() {
    const form = document.getElementById("result-publish-form");
    const templates = db.getTemplates();
    const templateSelect = document.getElementById("form-template-selector");
    
    // Populating dropdown
    templateSelect.innerHTML = "";
    templates.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.innerText = t.name;
      templateSelect.appendChild(opt);
    });

    // Reset Form if not in edit mode
    const editIdInput = document.getElementById("edit-result-id");
    if (!editIdInput.value) {
      form.reset();
      document.getElementById("upload-form-title").innerText = "Publish Result Poster";
      document.getElementById("btn-submit-result").innerText = "Publish Result Poster";
      
      // Seed default rows
      populateWinners(null);
    }

    // Trigger preview render
    updateUploadLivePreview();

    // Attach keystroke change events for static fields
    const staticInputIds = ["form-program-name", "form-category", "form-template-selector"];
    staticInputIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.removeEventListener("input", debouncedPreviewUpdate);
        el.addEventListener("input", debouncedPreviewUpdate);
        el.removeEventListener("change", updateUploadLivePreview);
        el.addEventListener("change", updateUploadLivePreview);
      }
    });
  }

  function debouncedPreviewUpdate() {
    clearTimeout(uploadPreviewTimer);
    uploadPreviewTimer = setTimeout(updateUploadLivePreview, 150);
  }

  function updateUploadLivePreview() {
    const previewWrap = document.getElementById("preview-poster-wrap");
    if (!previewWrap) return;
    
    const programName = document.getElementById("form-program-name").value || "[ Program Name ]";
    const category = document.getElementById("form-category").value || "Category";
    
    const data = getWinnersData();
    const isEdit = !!document.getElementById("edit-result-id").value;
    const tId = document.getElementById("form-template-selector").value;

    const template = db.getTemplate(tId) || db.getTemplates()[0];
    if (!template) return;

    // Sync template name display label
    const activeTemplateLabel = document.getElementById("lbl-active-template-name");
    if (activeTemplateLabel) {
      activeTemplateLabel.innerText = template.name;
    }

    // If new form (not edit) and there is no placement inputs written yet, feed a default mock placements so preview looks perfect
    let placements = data.placements;
    if (!isEdit && (!placements || placements.length === 0 || (placements.length === 3 && placements.every(p => p.winners.length === 0)))) {
      placements = [
        {
          rank: "First Place",
          winners: [
            { name: "Audrey Hepburn", team: "Wandoor" }
          ]
        },
        {
          rank: "Second Place",
          winners: [
            { name: "Liam Henderson", team: "Emangad" }
          ]
        },
        {
          rank: "Third Place",
          winners: [
            { name: "Zoe Patel", team: "Kuttiyil" }
          ]
        }
      ];
    }

    const mockResult = { 
      programName, category, 
      placements
    };
    posterEngine.render(previewWrap, mockResult, template);
  }

  // --- TEMPLATE SWAPPER ON UPLOAD PREVIEW ---
  function shiftUploadTemplate(offset) {
    const templateSelect = document.getElementById("form-template-selector");
    if (!templateSelect) return;
    
    const templates = db.getTemplates();
    if (templates.length === 0) return;
    
    const currentId = templateSelect.value;
    let idx = templates.findIndex(t => t.id === currentId);
    if (idx === -1) idx = 0;
    
    // Calculate index wrapping around bounds
    idx = (idx + offset + templates.length) % templates.length;
    
    const nextTemplate = templates[idx];
    templateSelect.value = nextTemplate.id;
    
    // Re-draw live preview canvas
    updateUploadLivePreview();
  }

  const prevBtn = document.getElementById("btn-prev-template");
  const nextBtn = document.getElementById("btn-next-template");
  
  if (prevBtn) {
    prevBtn.onclick = () => shiftUploadTemplate(-1);
  }
  if (nextBtn) {
    nextBtn.onclick = () => shiftUploadTemplate(1);
  }

  // Handle Form Submit
  const resultForm = document.getElementById("result-publish-form");
  if (resultForm) {
    resultForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const editId = document.getElementById("edit-result-id").value;
      const data = getWinnersData();

      const resultData = {
        programName: document.getElementById("form-program-name").value,
        category: document.getElementById("form-category").value,
        placements: data.placements
      };

      if (editId) resultData.id = editId;

      const saved = db.saveResult(resultData);
      
      // Reset edit mode values
      document.getElementById("edit-result-id").value = "";
      resultForm.reset();

      alert(`Poster published successfully for: ${saved.programName}!`);
      switchTab("published");
    });
  }

  // Split-screen direct download preview button
  const downloadPreviewBtn = document.getElementById("btn-download-preview");
  if (downloadPreviewBtn) {
    downloadPreviewBtn.addEventListener("click", () => {
      const previewWrap = document.getElementById("preview-poster-wrap");
      const programName = document.getElementById("form-program-name").value || "arts-program";
      posterEngine.exportJpg(previewWrap, `${programName}-result.jpg`);
    });
  }

  // --- 3. TEMPLATE MANAGER & TYPOGRAPHY EDITOR ---
  function initTemplateManager() {
    const templates = db.getTemplates();
    const templateSelect = document.getElementById("editor-template-select");
    
    templateSelect.innerHTML = "";
    templates.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.innerText = t.name;
      templateSelect.appendChild(opt);
    });

    // Select first template by default if none loaded
    if (!currentEditorTemplate) {
      currentEditorTemplate = JSON.parse(JSON.stringify(templates[0]));
    } else {
      // Reload current templates from DB to preserve additions
      const fresh = db.getTemplate(currentEditorTemplate.id);
      if (fresh) currentEditorTemplate = JSON.parse(JSON.stringify(fresh));
    }

    templateSelect.value = currentEditorTemplate.id;
    
    // Bind template dropdown change
    templateSelect.removeEventListener("change", handleEditorTemplateChange);
    templateSelect.addEventListener("change", handleEditorTemplateChange);

    // Initial Editor Render
    renderEditorPosterCanvas();
    setupActiveFieldSelectorStyles();
    loadActiveFieldStylesToSidebar();
    updateSelectionStatusLabel();
  }

  function handleEditorTemplateChange(e) {
    const tId = e.target.value;
    const tData = db.getTemplate(tId);
    if (tData) {
      currentEditorTemplate = JSON.parse(JSON.stringify(tData));
      renderEditorPosterCanvas();
      loadActiveFieldStylesToSidebar();
    }
  }

  function renderEditorPosterCanvas() {
    const wrap = document.getElementById("editor-canvas-wrap");
    if (!wrap || !currentEditorTemplate) return;
    
    // Mock result to display inside editor
    const mockResult = {
      programName: "Grand Symphony Instrumental",
      category: "Music",
      placements: [
        {
          rank: "First Place",
          winners: [
            { name: "Alex Mercer", team: "Wandoor" },
            { name: "Jordan Lee", team: "Emangad" }
          ]
        },
        {
          rank: "Second Place",
          winners: [
            { name: "Samantha Croft", team: "Kuttiyil" }
          ]
        },
        {
          rank: "Third Place",
          winners: [
            { name: "Liam Neeson", team: "Vaniyambalam" }
          ]
        },
        {
          rank: "Special Prize",
          winners: [
            { name: "Priya Nair", team: "Thekkumpuram" }
          ]
        },
        {
          rank: "Merit Award",
          winners: [
            { name: "Rohan Das", team: "Koorad" }
          ]
        }
      ]
    };

    posterEngine.render(wrap, mockResult, currentEditorTemplate, {
      editable: true,
      activeFieldId: activeEditorField,
      selectedFieldIds: selectedFieldIds,
      onSelectField: (fKey, event) => {
        // Multi-select holding Ctrl or Shift
        if (event && (event.ctrlKey || event.metaKey || event.shiftKey)) {
          const idx = selectedFieldIds.indexOf(fKey);
          if (idx !== -1) {
            if (selectedFieldIds.length > 1) {
              selectedFieldIds.splice(idx, 1);
            }
          } else {
            selectedFieldIds.push(fKey);
          }
        } else {
          selectedFieldIds = [fKey];
        }

        activeEditorField = fKey; // last active field

        // Refresh canvas selected indicators
        const fields = wrap.querySelectorAll(".poster-field");
        fields.forEach(f => {
          if (selectedFieldIds.includes(f.dataset.field)) {
            f.classList.add("selected-field");
          } else {
            f.classList.remove("selected-field");
          }
        });

        setupActiveFieldSelectorStyles();
        loadActiveFieldStylesToSidebar();
        updateSelectionStatusLabel();
      }
    });

    // Apply highlights to all elements in selectedFieldIds
    setTimeout(() => {
      const fields = wrap.querySelectorAll(".poster-field");
      fields.forEach(f => {
        if (selectedFieldIds.includes(f.dataset.field)) {
          f.classList.add("selected-field");
        } else {
          f.classList.remove("selected-field");
        }
      });
      updateSelectionStatusLabel();
      // Re-initialize interact.js bindings on freshly rendered elements
      if (typeof setupInteract === 'function') setupInteract();
    }, 60);
  }

  function setupActiveFieldSelectorStyles() {
    const btns = document.querySelectorAll(".field-selector-btn");
    btns.forEach(btn => {
      if (selectedFieldIds.includes(btn.dataset.fieldId)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Field selector buttons in left sidebar
  const fieldSelectBtns = document.querySelectorAll(".field-selector-btn");
  fieldSelectBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const fKey = btn.dataset.fieldId;
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        const idx = selectedFieldIds.indexOf(fKey);
        if (idx !== -1) {
          if (selectedFieldIds.length > 1) {
            selectedFieldIds.splice(idx, 1);
          }
        } else {
          selectedFieldIds.push(fKey);
        }
      } else {
        selectedFieldIds = [fKey];
      }

      activeEditorField = fKey; // last active
      setupActiveFieldSelectorStyles();
      renderEditorPosterCanvas();
      loadActiveFieldStylesToSidebar();
      updateSelectionStatusLabel();
    });
  });

  function updateSelectionStatusLabel() {
    const label = document.getElementById("editor-selection-status");
    if (!label) return;
    if (selectedFieldIds.length > 0) {
      label.style.display = "block";
      label.innerHTML = `<strong>${selectedFieldIds.length} layer(s) selected</strong>:<br>` + 
        selectedFieldIds.map(id => posterEngine.getFieldLabel(id)).join(', ');
    } else {
      label.style.display = "none";
    }
  }

  // Load field styling values into editor controls
  function loadActiveFieldStylesToSidebar() {
    if (!currentEditorTemplate) return;
    
    const fieldDef = currentEditorTemplate.fields[activeEditorField];
    if (!fieldDef) return;

    // Position & Size inputs sync
    const posX = document.getElementById("editor-pos-x");
    const posY = document.getElementById("editor-pos-y");
    const posW = document.getElementById("editor-pos-w");
    const posH = document.getElementById("editor-pos-h");
    if (posX) posX.value = Math.round(fieldDef.left || 0);
    if (posY) posY.value = Math.round(fieldDef.top || 0);
    if (posW) posW.value = Math.round(fieldDef.width || 200);
    if (posH) posH.value = Math.round(fieldDef.height || 60);

    // Font Family selector dropdown sync
    const fontSelect = document.getElementById("editor-font-family-select");
    if (fontSelect && fieldDef.fontFamily) {
      fontSelect.value = fieldDef.fontFamily;
    } else if (fontSelect) {
      fontSelect.value = activeEditorField === 'programName' ? "Outfit" : "Plus Jakarta Sans";
    }

    // Font size range slider & typable numeric input
    const fontSizeSlider = document.getElementById("editor-font-size-slider");
    const fontSizeInput = document.getElementById("editor-font-size-input");
    fontSizeSlider.value = fieldDef.fontSize || 40;
    fontSizeInput.value = fieldDef.fontSize || 40;

    // Align status toggle
    const alignBtns = document.querySelectorAll(".align-toggle-btn");
    alignBtns.forEach(b => {
      if (b.dataset.align === (fieldDef.align || "center")) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    // Color preset Swatches and Typable HEX input
    const colorSwatches = document.querySelectorAll(".color-swatch");
    colorSwatches.forEach(sw => {
      if (sw.dataset.color.toLowerCase() === (fieldDef.color || "#111827").toLowerCase()) {
        sw.classList.add("active");
      } else {
        sw.classList.remove("active");
      }
    });
    
    // Custom picker sync & Custom Hex sync
    const color = fieldDef.color || "#111827";
    document.getElementById("editor-custom-color-picker").value = color;
    document.getElementById("editor-custom-color-hex").value = color.toUpperCase();
  }

  // --- EDITOR CONTROLS EVENT HANDLERS ---

  // --- POSITION / SIZE INPUTS ---
  function updateFieldPosition(prop, rawVal) {
    const val = parseInt(rawVal);
    if (isNaN(val)) return;
    if (!currentEditorTemplate) return;
    snapshotHistory();
    const wrap = document.getElementById("editor-canvas-wrap");
    selectedFieldIds.forEach(id => {
      const fieldDef = currentEditorTemplate.fields[id];
      if (!fieldDef) return;
      if (prop === 'left') {
        fieldDef.left = Math.max(0, Math.min(1080 - fieldDef.width, val));
      } else if (prop === 'top') {
        fieldDef.top = Math.max(0, Math.min(1350 - fieldDef.height, val));
      } else if (prop === 'width') {
        fieldDef.width = Math.max(50, Math.min(1080 - fieldDef.left, val));
      } else if (prop === 'height') {
        fieldDef.height = Math.max(30, Math.min(1350 - fieldDef.top, val));
      }
      // Apply to DOM
      const fieldEl = wrap ? wrap.querySelector(`[data-field="${id}"]`) : null;
      if (fieldEl) {
        fieldEl.style.left = `${fieldDef.left}px`;
        fieldEl.style.top = `${fieldDef.top}px`;
        fieldEl.style.width = `${fieldDef.width}px`;
        fieldEl.style.height = `${fieldDef.height}px`;
        posterEngine.fitText(fieldEl, fieldDef.fontSize);
      }
    });
    // Sync sidebar inputs with actual clamped values
    const activeDef = currentEditorTemplate.fields[activeEditorField];
    if (activeDef) {
      const posX = document.getElementById("editor-pos-x");
      const posY = document.getElementById("editor-pos-y");
      const posW = document.getElementById("editor-pos-w");
      const posH = document.getElementById("editor-pos-h");
      if (posX) posX.value = Math.round(activeDef.left);
      if (posY) posY.value = Math.round(activeDef.top);
      if (posW) posW.value = Math.round(activeDef.width);
      if (posH) posH.value = Math.round(activeDef.height);
    }
  }

  const posXInput = document.getElementById("editor-pos-x");
  const posYInput = document.getElementById("editor-pos-y");
  const posWInput = document.getElementById("editor-pos-w");
  const posHInput = document.getElementById("editor-pos-h");
  if (posXInput) posXInput.addEventListener("input", (e) => updateFieldPosition('left', e.target.value));
  if (posYInput) posYInput.addEventListener("input", (e) => updateFieldPosition('top', e.target.value));
  if (posWInput) posWInput.addEventListener("input", (e) => updateFieldPosition('width', e.target.value));
  if (posHInput) posHInput.addEventListener("input", (e) => updateFieldPosition('height', e.target.value));

  // Font family selector dropdown change
  const editorFontFamilySelect = document.getElementById("editor-font-family-select");
  if (editorFontFamilySelect) {
    editorFontFamilySelect.addEventListener("change", (e) => {
      const family = e.target.value;
      if (!currentEditorTemplate) return;
      snapshotHistory();
      selectedFieldIds.forEach(id => {
        if (currentEditorTemplate.fields[id]) {
          currentEditorTemplate.fields[id].fontFamily = family;
          
          const wrap = document.getElementById("editor-canvas-wrap");
          const fieldEl = wrap.querySelector(`[data-field="${id}"]`);
          if (fieldEl) {
            const textSpan = fieldEl.querySelector(".poster-field-text");
            if (textSpan) textSpan.style.fontFamily = family;
            posterEngine.fitText(fieldEl, currentEditorTemplate.fields[id].fontSize);
          }
        }
      });
    });
  }

  // Unified Font Size updater (typable input + range slider)
  function updateFontSize(val) {
    if (isNaN(val) || val < 16) val = 16;
    if (val > 130) val = 130;
    
    document.getElementById("editor-font-size-slider").value = val;
    document.getElementById("editor-font-size-input").value = val;
    
    if (!currentEditorTemplate) return;
    snapshotHistory();
    selectedFieldIds.forEach(id => {
      if (currentEditorTemplate.fields[id]) {
        currentEditorTemplate.fields[id].fontSize = val;
        
        const wrap = document.getElementById("editor-canvas-wrap");
        const activeFieldDiv = wrap.querySelector(`[data-field="${id}"]`);
        if (activeFieldDiv) {
          posterEngine.fitText(activeFieldDiv, val);
        }
      }
    });
  }

  const fontSizeSlider = document.getElementById("editor-font-size-slider");
  if (fontSizeSlider) {
    fontSizeSlider.addEventListener("input", (e) => {
      updateFontSize(parseInt(e.target.value));
    });
  }

  const fontSizeInput = document.getElementById("editor-font-size-input");
  if (fontSizeInput) {
    fontSizeInput.addEventListener("input", (e) => {
      updateFontSize(parseInt(e.target.value));
    });
  }

  // Text alignment select
  const alignBtns = document.querySelectorAll(".align-toggle-btn");
  alignBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      alignBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const align = btn.dataset.align;
      if (!currentEditorTemplate) return;
      snapshotHistory();

      selectedFieldIds.forEach(id => {
        if (currentEditorTemplate.fields[id]) {
          currentEditorTemplate.fields[id].align = align;
          
          const wrap = document.getElementById("editor-canvas-wrap");
          const activeFieldDiv = wrap.querySelector(`[data-field="${id}"]`);
          if (activeFieldDiv) {
            activeFieldDiv.style.textAlign = align;
            activeFieldDiv.style.justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
          }
        }
      });
    });
  });

  // Unified Text Color updater (swatches + picker + hex text input)
  function updateTextColor(hex) {
    if (!hex.startsWith("#")) hex = "#" + hex;
    const isValidHex = /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(hex);
    if (!isValidHex) return;

    document.getElementById("editor-custom-color-picker").value = hex;
    document.getElementById("editor-custom-color-hex").value = hex.toUpperCase();

    // Presets swatch highlights
    const colorSwatches = document.querySelectorAll(".color-swatch");
    colorSwatches.forEach(sw => {
      if (sw.dataset.color.toLowerCase() === hex.toLowerCase()) {
        sw.classList.add("active");
      } else {
        sw.classList.remove("active");
      }
    });

    if (!currentEditorTemplate) return;
    snapshotHistory();

    selectedFieldIds.forEach(id => {
      if (currentEditorTemplate.fields[id]) {
        currentEditorTemplate.fields[id].color = hex;
        
        const wrap = document.getElementById("editor-canvas-wrap");
        const fieldDiv = wrap.querySelector(`[data-field="${id}"]`);
        if (fieldDiv) {
          fieldDiv.style.color = hex;
        }
      }
    });
  }

  const colorSwatches = document.querySelectorAll(".color-swatch");
  colorSwatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      updateTextColor(swatch.dataset.color);
    });
  });

  const customColorPicker = document.getElementById("editor-custom-color-picker");
  if (customColorPicker) {
    customColorPicker.addEventListener("input", (e) => {
      updateTextColor(e.target.value);
    });
  }

  const customColorHexInput = document.getElementById("editor-custom-color-hex");
  if (customColorHexInput) {
    customColorHexInput.addEventListener("input", (e) => {
      updateTextColor(e.target.value);
    });
  }

  // --- AUTO-FIT SNAPPING / EDGE ALIGNMENT ---
  function alignSelectedFields(alignType) {
    if (!currentEditorTemplate) return;
    
    const refId = document.getElementById("editor-align-ref-select").value;
    const refDef = currentEditorTemplate.fields[refId];
    if (!refDef) return;

    const wrap = document.getElementById("editor-canvas-wrap");

    selectedFieldIds.forEach(id => {
      if (id === refId) return; // Can't snap element onto itself
      
      const fieldDef = currentEditorTemplate.fields[id];
      if (!fieldDef) return;

      if (alignType === "left") {
        fieldDef.left = refDef.left;
      } else if (alignType === "center") {
        const refCenter = refDef.left + refDef.width / 2;
        fieldDef.left = Math.round(refCenter - fieldDef.width / 2);
      } else if (alignType === "right") {
        fieldDef.left = refDef.left + refDef.width - fieldDef.width;
      } else if (alignType === "width") {
        fieldDef.width = refDef.width;
      }

      // Update visually in editor canvas
      const fieldDiv = wrap.querySelector(`[data-field="${id}"]`);
      if (fieldDiv) {
        fieldDiv.style.left = `${fieldDef.left}px`;
        fieldDiv.style.width = `${fieldDef.width}px`;
        
        posterEngine.fitText(fieldDiv, fieldDef.fontSize);
      }
    });
  }

  // Bind Snapping buttons
  document.getElementById("btn-snap-left").addEventListener("click", () => alignSelectedFields("left"));
  document.getElementById("btn-snap-center").addEventListener("click", () => alignSelectedFields("center"));
  document.getElementById("btn-snap-right").addEventListener("click", () => alignSelectedFields("right"));
  document.getElementById("btn-snap-width").addEventListener("click", () => alignSelectedFields("width"));

  // --- KEYBOARD NAVIGATION (ARROW KEYS + UNDO/REDO) ---
  document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName.toLowerCase();
    const inInput = (tag === "input" || tag === "select" || tag === "textarea" || e.target.isContentEditable);

    // --- Ctrl+Z = Undo, Ctrl+Shift+Z = Redo (works everywhere) ---
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      if (activeTab === "templates") {
        e.preventDefault();
        applyUndo();
        return;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      if (activeTab === "templates") {
        e.preventDefault();
        applyRedo();
        return;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      if (activeTab === "templates") {
        e.preventDefault();
        applyRedo();
        return;
      }
    }

    // Arrow key movement — skip if inside text inputs
    if (inInput) return;
    if (activeTab !== "templates" || !currentEditorTemplate) return;

    let dx = 0;
    let dy = 0;
    const step = e.shiftKey ? 10 : 1; // 10px if shift held, otherwise 1px

    switch (e.key) {
      case "ArrowLeft":  dx = -step; e.preventDefault(); break;
      case "ArrowRight": dx = step;  e.preventDefault(); break;
      case "ArrowUp":    dy = -step; e.preventDefault(); break;
      case "ArrowDown":  dy = step;  e.preventDefault(); break;
      default: return;
    }

    const canvasEl = document.getElementById("poster-engine-canvas");
    if (!canvasEl) return;

    snapshotHistory();
    selectedFieldIds.forEach(id => {
      const targetEl = canvasEl.querySelector(`[data-field="${id}"]`);
      const fieldDef = currentEditorTemplate.fields[id];
      if (!targetEl || !fieldDef) return;

      let x = fieldDef.left + dx;
      let y = fieldDef.top + dy;

      x = Math.max(0, Math.min(1080 - fieldDef.width, x));
      y = Math.max(0, Math.min(1350 - fieldDef.height, y));

      targetEl.style.left = `${x}px`;
      targetEl.style.top = `${y}px`;

      fieldDef.left = Math.round(x);
      fieldDef.top = Math.round(y);
    });

    // Sync position inputs
    loadActiveFieldStylesToSidebar();
  });

  // --- UNDO / REDO BUTTONS ---
  const undoBtn = document.getElementById("btn-editor-undo");
  if (undoBtn) undoBtn.addEventListener("click", () => { if (activeTab === "templates") applyUndo(); });
  const redoBtn = document.getElementById("btn-editor-redo");
  if (redoBtn) redoBtn.addEventListener("click", () => { if (activeTab === "templates") applyRedo(); });

  // --- SAVE TEMPLATE POSITIONS AND ATTRIBUTES ---
  const saveTemplateBtn = document.getElementById("btn-save-template-layout");
  if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener("click", () => {
      if (!currentEditorTemplate) return;
      db.saveTemplate(currentEditorTemplate);
      // Clear undo/redo history on explicit save
      undoStack = [];
      redoStack = [];
      alert(`Coordinates & typography styling saved successfully for template: "${currentEditorTemplate.name}"!`);
      initTemplateManager();
    });
  }

  // --- UPLOAD CUSTOM TEMPLATE BACKGROUND ---
  const fileUploaderBox = document.getElementById("template-upload-trigger");
  const fileInput = document.getElementById("template-bg-file-input");
  
  if (fileUploaderBox && fileInput) {
    fileUploaderBox.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const base64 = evt.target.result;
        
        // Generate new template object
        const defaultTemplateFields = db.getTemplates()[0].fields;
        
        const newTemplate = {
          id: "custom-template-" + Date.now(),
          name: file.name.split(".")[0] || "Custom Graphic Upload",
          background: base64,
          fields: JSON.parse(JSON.stringify(defaultTemplateFields)) // duplicate standard layouts
        };

        db.saveTemplate(newTemplate);
        currentEditorTemplate = newTemplate;
        
        alert(`New background template "${newTemplate.name}" registered successfully!`);
        initTemplateManager();
      };
      
      reader.readAsDataURL(file);
    });
  }

  // --- BINDING INTERACTJS DRAG AND RESIZE ---
  // Uses event delegation via interact's selector - re-applies after each render
  function setupInteract() {
    // Remove old interact bindings to avoid duplicates
    interact(".editable-active .poster-field").unset();

    interact(".editable-active .poster-field")
      .draggable({
        inertia: false,
        autoScroll: false,
        listeners: {
          start(event) {
            snapshotHistory();
          },
          move(event) {
            const target = event.target;
            const fKey = target.dataset.field;
            const canvasEl = document.getElementById("poster-engine-canvas");
            if (!canvasEl || !currentEditorTemplate) return;

            // Get responsive transform scale ratio from the actual bounding rect
            const canvasRect = canvasEl.getBoundingClientRect();
            const scale = canvasRect.width / 1080;

            // Compute shifts accounting for scale divisor
            const dx = event.dx / scale;
            const dy = event.dy / scale;

            // Drag all selected fields simultaneously!
            let fieldsToMove = selectedFieldIds.includes(fKey) ? selectedFieldIds : [fKey];

            fieldsToMove.forEach(id => {
              const targetEl = canvasEl.querySelector(`[data-field="${id}"]`);
              const fieldDef = currentEditorTemplate.fields[id];
              if (!targetEl || !fieldDef) return;

              let x = parseFloat(targetEl.style.left) || 0;
              let y = parseFloat(targetEl.style.top) || 0;
              x += dx;
              y += dy;

              x = Math.max(0, Math.min(1080 - fieldDef.width, x));
              y = Math.max(0, Math.min(1350 - fieldDef.height, y));

              targetEl.style.left = `${x}px`;
              targetEl.style.top = `${y}px`;

              fieldDef.left = Math.round(x);
              fieldDef.top = Math.round(y);
            });

            // Live-sync position sidebar inputs
            loadActiveFieldStylesToSidebar();
          }
        }
      })
      .resizable({
        // Allow resize from the bottom-right handle only
        edges: { bottom: true, right: true, bottomRight: true, top: false, left: false, topLeft: false },
        margin: 12, // pixels from edge that will trigger resize
        listeners: {
          start(event) {
            snapshotHistory();
          },
          move(event) {
            const target = event.target;
            const fKey = target.dataset.field;
            const canvasEl = document.getElementById("poster-engine-canvas");
            if (!canvasEl || !currentEditorTemplate) return;

            const canvasRect = canvasEl.getBoundingClientRect();
            const scale = canvasRect.width / 1080;

            let w = parseFloat(target.style.width) || 200;
            let h = parseFloat(target.style.height) || 60;

            // Width & height adjustments scaled
            w += event.deltaRect.width / scale;
            h += event.deltaRect.height / scale;

            // Minimum boundaries
            const l = parseFloat(target.style.left) || 0;
            const t = parseFloat(target.style.top) || 0;
            w = Math.max(120, Math.min(1080 - l, w));
            h = Math.max(30, Math.min(1350 - t, h));

            // Size elements visually
            target.style.width = `${w}px`;
            target.style.height = `${h}px`;

            currentEditorTemplate.fields[fKey].width = Math.round(w);
            currentEditorTemplate.fields[fKey].height = Math.round(h);

            // Dynamically recalculate font-fitting wrapper bounds
            posterEngine.fitText(target, currentEditorTemplate.fields[fKey].fontSize);

            // Live-sync sidebar
            loadActiveFieldStylesToSidebar();
          }
        }
      });
  }

  // Call once at startup
  setupInteract();

  // --- 4. PUBLISHED RESULTS VIEWS ---
  let activeCategoryFilter = "All";

  function loadPublishedResults() {
    const listContainer = document.getElementById("published-results-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    const searchVal = document.getElementById("admin-search-results").value.toLowerCase();
    
    let results = db.getResults();

    // Category Filter pill
    if (activeCategoryFilter !== "All") {
      results = results.filter(r => r.category === activeCategoryFilter);
    }

    // Keyword Search
    if (searchVal) {
      results = results.filter(r => {
        const matchesProgram = r.programName.toLowerCase().includes(searchVal);
        const placements = r.placements || [];
        const matchesWinners = placements.some(g => 
          g.winners.some(w => w.name.toLowerCase().includes(searchVal))
        );
        return matchesProgram || matchesWinners;
      });
    }

    if (results.length === 0) {
      listContainer.innerHTML = `<div style="text-align:center;color:var(--text-secondary);padding:32px;font-weight:600;">No published results found. Try uploading a result or clear filters.</div>`;
      return;
    }

    results.forEach(r => {
      const row = document.createElement("div");
      row.className = "result-list-item";
      row.style.cursor = "default";
      
      let winnersList = "";
      const placements = r.placements || [];
      placements.forEach(g => {
        g.winners.forEach(w => {
          if (winnersList) winnersList += " | ";
          winnersList += `<strong>${w.name}</strong>${w.team ? ` (${w.team})` : ""}`;
        });
      });

      row.innerHTML = `
        <div class="result-list-main">
          <span class="badge badge-primary result-list-category">${r.category}</span>
          <div class="result-list-title-wrap">
            <div class="result-list-title">${r.programName}</div>
            <div class="result-list-winner">
              ${winnersList}
            </div>
          </div>
        </div>
        <div class="action-btns" style="display:flex;gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="triggerEditResult('${r.id}')">✏️ Edit</button>
          <button class="btn btn-secondary btn-sm" onclick="triggerDirectDownload('${r.id}')">⬇️ Download</button>
          <button class="btn btn-outline btn-sm btn-danger" onclick="deletePublishedResult('${r.id}', '${r.programName}')" style="color: #EF4444; border-color: #FEE2E2; padding: 8px 12px;">🗑️ Delete</button>
        </div>
      `;
      listContainer.appendChild(row);
    });
  }

  // Published Results Table search & filter elements
  const adminSearchInput = document.getElementById("admin-search-results");
  if (adminSearchInput) {
    adminSearchInput.addEventListener("input", loadPublishedResults);
  }

  // Table pills category filters
  const adminCategoryPills = document.querySelectorAll("#admin-category-filters .filter-pill");
  adminCategoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      adminCategoryPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      
      activeCategoryFilter = pill.dataset.category;
      loadPublishedResults();
    });
  });

  // Direct table row triggers
  window.triggerDirectDownload = function(id) {
    const result = db.getResult(id);
    const template = db.getTemplates()[0]; // Default template
    if (!result) return;
    
    // Quick render target
    const tmpDiv = document.createElement("div");
    tmpDiv.className = "hidden-export-container";
    document.body.appendChild(tmpDiv);
    
    posterEngine.render(tmpDiv, result, template);
    
    // Wait and export
    setTimeout(() => {
      posterEngine.exportJpg(tmpDiv, `${result.programName}-results-poster.jpg`);
      
      // Cleanup offscreen element
      setTimeout(() => {
        document.body.removeChild(tmpDiv);
      }, 1000);
    }, 200);
  };

  window.deletePublishedResult = function(id, name) {
    if (confirm(`Are you sure you want to permanently delete the published result for "${name}"?`)) {
      db.deleteResult(id);
      loadPublishedResults();
    }
  };

  // --- 5. SETTINGS PANEL SYSTEM ---
  function loadSettingsView() {
    const settings = db.getSettings();
    document.getElementById("settings-institution").value = settings.institutionName || "";
  }

  const saveSettingsBtn = document.getElementById("btn-save-settings");
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", () => {
      const instName = document.getElementById("settings-institution").value;
      db.saveSettings({ institutionName: instName });
      alert("Application settings updated successfully!");
    });
  }

  // FACTORY SYSTEM RESET
  const resetBtn = document.getElementById("btn-factory-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("⚠️ WARNING: This will permanently wipe all results, custom template positions, uploaded backgrounds, and restore the platform to clean defaults. Do you wish to proceed?")) {
        db.resetToDefault();
        alert("Database successfully restored to pristine seed configuration!");
        window.location.reload();
      }
    });
  }

  // --- START INITIAL VIEW LOAD ---
  // Boot tab
  const params = new URLSearchParams(window.location.search);
  const startTab = params.get("tab") || "dashboard";
  
  // Set initial form states if editing a result passed from detail
  const editId = params.get("edit");
  if (editId) {
    const r = db.getResult(editId);
    if (r) {
      // Defer to when Upload View loads
      setTimeout(() => {
        switchTab("upload");
        document.getElementById("edit-result-id").value = r.id;
        document.getElementById("form-program-name").value = r.programName;
        document.getElementById("form-category").value = r.category;
        
        // Populate dynamic rows container with the values!
        populateWinners(r);
        
        document.getElementById("upload-form-title").innerText = "Edit Published Result";
        document.getElementById("btn-submit-result").innerText = "Update Published Poster";
        updateUploadLivePreview();
      }, 100);
    }
  } else {
    switchTab(startTab);
  }
});
