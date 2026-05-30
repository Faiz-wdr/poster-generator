/**
 * Admin Dashboard Controller
 */

function runAdminController() {
  // --- STATE VARIABLES ---
  let activeTab = "dashboard";
  let currentEditorTemplate = null;
  let activeEditorField = "programName"; // last active field
  let selectedFieldIds = ["programName"]; // multi-select array

  // --- UNDO / REDO HISTORY ---
  let undoStack = [];   // Array of JSON strings (snapshots of template.fields)
  let redoStack = [];
  const MAX_HISTORY = 50;

  function snapshotHistory() {
    if (!currentEditorTemplate) return;
    const snapshot = JSON.stringify(currentEditorTemplate.fields);
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === snapshot) return;
    undoStack.push(snapshot);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = []; // Clear redo
  }

  function applyUndo() {
    if (undoStack.length === 0 || !currentEditorTemplate) return;
    redoStack.push(JSON.stringify(currentEditorTemplate.fields));
    const prev = undoStack.pop();
    currentEditorTemplate.fields = JSON.parse(prev);
    renderEditorPosterCanvas();
    loadActiveFieldStylesToSidebar();
  }

  function applyRedo() {
    if (redoStack.length === 0 || !currentEditorTemplate) return;
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
  window.switchTab = async function(tabId) {
    activeTab = tabId;
    
    navItems.forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    tabSections.forEach(section => {
      if (section.id === `tab-${tabId}`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    if (sidebarMenu) sidebarMenu.classList.remove("mobile-open");
    if (adminOverlay) adminOverlay.classList.remove("active");
    if (adminHamburger) adminHamburger.classList.remove("open");

    if (tabId === "dashboard") {
      await loadDashboardStats();
    } else if (tabId === "upload") {
      await initUploadResultForm();
    } else if (tabId === "templates") {
      await initTemplateManager();
    } else if (tabId === "published") {
      await loadPublishedResults();
    } else if (tabId === "settings") {
      await loadSettingsView();
    }
  };

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.dataset.tab;
      switchTab(tabId);
    });
  });

  // --- 1. DASHBOARD CONTROLLER ---
  async function loadDashboardStats() {
    const results = await db.getResults();
    const templates = await db.getTemplates();
    
    document.getElementById("stat-total-results").innerText = results.length;
    
    const cats = new Set(results.map(r => r.category));
    document.getElementById("stat-total-categories").innerText = cats.size || 0;
    document.getElementById("stat-total-templates").innerText = templates.length;

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
          
          let topWinnerName = "";
          if (r.winners && r.winners.length > 0) {
            topWinnerName = r.winners[0].name + (r.winners[0].team ? ` (${r.winners[0].team})` : "");
          } else {
            topWinnerName = "[ No Winners ]";
          }
          
          row.innerHTML = `
            <div class="result-list-main" style="gap: 16px;">
              <span class="badge badge-primary result-list-category">${r.category}</span>
              <div class="result-list-title-wrap">
                <div class="result-list-title" style="font-size: 1.05rem;">
                  ${r.resultNo ? `<span style="color:var(--primary);margin-right:8px;">#${r.resultNo}</span>` : ""}
                  ${r.programName}
                </div>
                <div class="result-list-winner" style="font-size: 0.85rem;">🥇 Top Winner: <strong>${topWinnerName}</strong></div>
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

  // --- FLAT DYNAMIC WINNERS FORM SYSTEM ---
  const teamOptionsList = ["Emangad", "Koorad", "Kuttiyil", "Old Vaniyambalam", "Thekkumpuram", "Vaniyambalam", "Wandoor"];

  function addWinnerRow(position = "", name = "", team = "") {
    const container = document.getElementById("winners-rows-container");
    if (!container) return;

    if (!position) {
      const existingRows = container.querySelectorAll(".winner-entry-row").length;
      position = String(existingRows + 1).padStart(2, '0');
    }

    const row = document.createElement("div");
    row.className = "winner-entry-row";
    row.style.display = "grid";
    row.style.gridTemplateColumns = "80px 1fr 1fr auto";
    row.style.gap = "10px";
    row.style.alignItems = "center";

    const posInput = document.createElement("input");
    posInput.type = "text";
    posInput.className = "winner-pos-input";
    posInput.placeholder = "e.g. 01";
    posInput.value = position;
    posInput.style.padding = "10px 12px";
    posInput.style.borderRadius = "var(--radius-input)";
    posInput.style.border = "1px solid var(--border-color)";
    posInput.style.backgroundColor = "var(--bg-page)";
    posInput.style.fontFamily = "var(--font-body)";
    posInput.style.fontSize = "0.9rem";
    posInput.style.fontWeight = "700";
    posInput.style.textAlign = "center";
    posInput.style.color = "var(--primary)";

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
    defaultOpt.innerText = "Choose Team...";
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

    posInput.addEventListener("input", debouncedPreviewUpdate);
    nameInput.addEventListener("input", debouncedPreviewUpdate);
    teamSelect.addEventListener("change", updateUploadLivePreview);

    row.appendChild(posInput);
    row.appendChild(nameInput);
    row.appendChild(teamSelect);
    row.appendChild(removeBtn);
    container.appendChild(row);

    updateUploadLivePreview();
  }

  function getWinnersData() {
    const container = document.getElementById("winners-rows-container");
    const result = { winners: [] };
    if (!container) return result;

    const rows = container.querySelectorAll(".winner-entry-row");
    rows.forEach(row => {
      const posInput = row.querySelector(".winner-pos-input");
      const nameInput = row.querySelector(".winner-name-input");
      const teamSelect = row.querySelector(".winner-team-select");
      
      const position = posInput ? posInput.value.trim() : "";
      const name = nameInput ? nameInput.value.trim() : "";
      const team = teamSelect ? teamSelect.value : "";
      
      if (name) {
        result.winners.push({ position, name, team });
      }
    });

    return result;
  }

  function populateWinners(r) {
    const container = document.getElementById("winners-rows-container");
    if (!container) return;
    container.innerHTML = "";

    const winners = r && r.winners ? r.winners : [];
    if (winners.length > 0) {
      winners.forEach(w => {
        addWinnerRow(w.position, w.name, w.team);
      });
    } else {
      // Seed default 3 rows with 01, 02, 03
      addWinnerRow("01", "", "");
      addWinnerRow("02", "", "");
      addWinnerRow("03", "", "");
    }
  }

  // Bind Dynamic Winner Row Add button
  const addWinnerRowBtn = document.getElementById("btn-add-winner-row");
  if (addWinnerRowBtn) {
    addWinnerRowBtn.onclick = () => {
      addWinnerRow("", "", "");
    };
  }

  window.triggerEditResult = async function(id) {
    const r = await db.getResult(id);
    if (r) {
      switchTab("upload");
      document.getElementById("edit-result-id").value = r.id;
      document.getElementById("form-result-no").value = r.resultNo || "";
      document.getElementById("form-program-name").value = r.programName;
      document.getElementById("form-category").value = r.category;
      
      populateWinners(r);
      
      document.getElementById("upload-form-title").innerText = "Edit Published Result";
      document.getElementById("btn-submit-result").innerText = "Update Published Poster";
      await updateUploadLivePreview();
    }
  };

  // --- 2. UPLOAD RESULT & REAL-TIME PREVIEW ---
  let uploadPreviewTimer = null;

  function calculateNextResultNo(results) {
    if (!results || results.length === 0) return '01';
    let maxNum = 0;
    results.forEach(r => {
      const match = String(r.resultNo || '').match(/^(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return String(nextNum).padStart(2, '0');
  }
  
  async function initUploadResultForm() {
    const form = document.getElementById("result-publish-form");
    const templates = await db.getTemplates();
    const templateSelect = document.getElementById("form-template-selector");
    
    templateSelect.innerHTML = "";
    templates.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.innerText = t.name;
      templateSelect.appendChild(opt);
    });

    const editIdInput = document.getElementById("edit-result-id");
    if (!editIdInput.value) {
      form.reset();
      document.getElementById("upload-form-title").innerText = "Publish Result Poster";
      document.getElementById("btn-submit-result").innerText = "Publish Result Poster";
      
      const results = await db.getResults();
      const nextNo = calculateNextResultNo(results);
      document.getElementById("form-result-no").value = nextNo;
      
      populateWinners(null);
    }

    await updateUploadLivePreview();

    const staticInputIds = ["form-result-no", "form-program-name", "form-category", "form-template-selector"];
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

  async function updateUploadLivePreview() {
    const previewWrap = document.getElementById("preview-poster-wrap");
    if (!previewWrap) return;
    
    const resultNo = document.getElementById("form-result-no").value || "01";
    const programName = document.getElementById("form-program-name").value || "[ Program Name ]";
    const category = document.getElementById("form-category").value || "Category";
    
    const data = getWinnersData();
    const isEdit = !!document.getElementById("edit-result-id").value;
    const tId = document.getElementById("form-template-selector").value;

    const templates = await db.getTemplates();
    const template = (await db.getTemplate(tId)) || templates[0];
    if (!template) return;

    const activeTemplateLabel = document.getElementById("lbl-active-template-name");
    if (activeTemplateLabel) {
      activeTemplateLabel.innerText = template.name;
    }

    let winners = data.winners;
    if (!isEdit && (!winners || winners.length === 0 || (winners.length === 3 && winners.every(w => !w.name)))) {
      winners = [
        { position: "01", name: "Audrey Hepburn", team: "Wandoor" },
        { position: "02", name: "Liam Henderson", team: "Emangad" },
        { position: "03", name: "Zoe Patel", team: "Kuttiyil" }
      ];
    }

    const mockResult = { 
      resultNo, programName, category, 
      winners
    };
    posterEngine.render(previewWrap, mockResult, template);
  }

  // --- TEMPLATE SWAPPER ON UPLOAD PREVIEW ---
  async function shiftUploadTemplate(offset) {
    const templateSelect = document.getElementById("form-template-selector");
    if (!templateSelect) return;
    
    const templates = await db.getTemplates();
    if (templates.length === 0) return;
    
    const currentId = templateSelect.value;
    let idx = templates.findIndex(t => t.id === currentId);
    if (idx === -1) idx = 0;
    
    idx = (idx + offset + templates.length) % templates.length;
    
    const nextTemplate = templates[idx];
    templateSelect.value = nextTemplate.id;
    
    await updateUploadLivePreview();
  }

  const prevBtn = document.getElementById("btn-prev-template");
  const nextBtn = document.getElementById("btn-next-template");
  
  if (prevBtn) prevBtn.onclick = () => shiftUploadTemplate(-1);
  if (nextBtn) nextBtn.onclick = () => shiftUploadTemplate(1);

  // Handle Form Submit
  const resultForm = document.getElementById("result-publish-form");
  const draftBtn = document.getElementById("btn-draft-result");

  let submitStatus = "published";

  if (draftBtn) {
    draftBtn.onclick = async () => {
      submitStatus = "pending";
      if (resultForm) {
        if (resultForm.reportValidity()) {
          resultForm.dispatchEvent(new Event('submit'));
        }
      }
    };
  }

  if (resultForm) {
    const submitBtn = document.getElementById("btn-submit-result");
    if (submitBtn) {
      submitBtn.onclick = () => {
        submitStatus = "published";
      };
    }

    resultForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const editId = document.getElementById("edit-result-id").value;
      const data = getWinnersData();

      const resultData = {
        resultNo: document.getElementById("form-result-no").value,
        programName: document.getElementById("form-program-name").value,
        category: document.getElementById("form-category").value,
        winners: data.winners,
        status: submitStatus
      };

      if (editId) resultData.id = editId;

      const saved = await db.saveResult(resultData);
      
      document.getElementById("edit-result-id").value = "";
      resultForm.reset();

      if (saved) {
        if (submitStatus === "pending") {
          alert(`Draft saved successfully for: ${saved.programName}!`);
        } else {
          alert(`Poster published successfully for: ${saved.programName}!`);
        }
      } else {
        alert(`Failed to save result.`);
      }
      switchTab("published");
    });
  }

  const downloadPreviewBtn = document.getElementById("btn-download-preview");
  if (downloadPreviewBtn) {
    downloadPreviewBtn.addEventListener("click", () => {
      const previewWrap = document.getElementById("preview-poster-wrap");
      const programName = document.getElementById("form-program-name").value || "arts-program";
      posterEngine.exportJpg(previewWrap, `${programName}-result.jpg`);
    });
  }

  // --- 3. TEMPLATE MANAGER & TYPOGRAPHY EDITOR ---
  async function initTemplateManager() {
    const templates = await db.getTemplates();
    const templateSelect = document.getElementById("editor-template-select");
    
    templateSelect.innerHTML = "";
    templates.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.innerText = t.name;
      templateSelect.appendChild(opt);
    });

    if (!currentEditorTemplate) {
      currentEditorTemplate = JSON.parse(JSON.stringify(templates[0]));
    } else {
      const fresh = await db.getTemplate(currentEditorTemplate.id);
      if (fresh) currentEditorTemplate = JSON.parse(JSON.stringify(fresh));
    }

    templateSelect.value = currentEditorTemplate.id;
    
    templateSelect.removeEventListener("change", handleEditorTemplateChange);
    templateSelect.addEventListener("change", handleEditorTemplateChange);

    renderEditorPosterCanvas();
    populateFieldSelectorList();
    loadActiveFieldStylesToSidebar();
    updateSelectionStatusLabel();
  }

  async function handleEditorTemplateChange(e) {
    const tId = e.target.value;
    const tData = await db.getTemplate(tId);
    if (tData) {
      currentEditorTemplate = JSON.parse(JSON.stringify(tData));
      renderEditorPosterCanvas();
      populateFieldSelectorList();
      loadActiveFieldStylesToSidebar();
    }
  }

  function renderEditorPosterCanvas() {
    const wrap = document.getElementById("editor-canvas-wrap");
    if (!wrap || !currentEditorTemplate) return;
    
    const mockResult = {
      programName: "Grand Symphony Instrumental",
      category: "Music",
      winners: [
        { position: "01", name: "Alex Mercer", team: "Wandoor" },
        { position: "02", name: "Jordan Lee", team: "Emangad" },
        { position: "03", name: "Samantha Croft", team: "Kuttiyil" },
        { position: "04", name: "Liam Neeson", team: "Vaniyambalam" },
        { position: "05", name: "Priya Nair", team: "Thekkumpuram" },
        { position: "06", name: "Rohan Das", team: "Koorad" }
      ]
    };

    posterEngine.render(wrap, mockResult, currentEditorTemplate, {
      editable: true,
      activeFieldId: activeEditorField,
      selectedFieldIds: selectedFieldIds,
      onSelectField: (fKey, event) => {
        // Blur active input to enable keyboard controls immediately
        if (document.activeElement && typeof document.activeElement.blur === "function") {
          document.activeElement.blur();
        }

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

        activeEditorField = fKey;

        const fields = wrap.querySelectorAll(".poster-field");
        fields.forEach(f => {
          if (selectedFieldIds.includes(f.dataset.field)) {
            f.classList.add("selected-field");
          } else {
            f.classList.remove("selected-field");
          }
        });

        populateFieldSelectorList();
        loadActiveFieldStylesToSidebar();
        updateSelectionStatusLabel();
      }
    });

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
      if (typeof setupInteract === 'function') setupInteract();
    }, 60);
  }

  function populateFieldSelectorList() {
    const list = document.getElementById("editor-field-selector-list");
    if (!list || !currentEditorTemplate) return;
    list.innerHTML = "";
    
    const infoHeader = document.createElement("div");
    infoHeader.style = "padding: 8px 14px 4px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary);";
    infoHeader.innerText = "ℹ️ Global Info Layers";
    list.appendChild(infoHeader);
    
    posterEngine.FIELDS.forEach(fKey => {
      if (fKey === 'winner_1_pos') {
        const winHeader = document.createElement("div");
        winHeader.style = "padding: 8px 14px 4px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary); border-top: 1px solid var(--border-color); margin-top: 6px;";
        winHeader.innerText = "🏆 Winner Standing Slots";
        list.appendChild(winHeader);
      }
      
      const btn = document.createElement("button");
      btn.className = "field-selector-btn";
      btn.dataset.fieldId = fKey;
      
      const isSelected = selectedFieldIds.includes(fKey);
      if (isSelected) btn.classList.add("active");
      
      const fieldDef = currentEditorTemplate.fields[fKey];
      const isVisible = fieldDef && fieldDef.visible !== false;
      const eyeIcon = isVisible ? "👁️" : "🙈";
      
      const labelName = posterEngine.getFieldLabel(fKey);
      
      btn.innerHTML = `
        <span style="${isVisible ? '' : 'color: var(--text-secondary); text-decoration: line-through; opacity: 0.6; font-style: italic;'}">${labelName}</span>
        <span style="font-size: 0.8rem; opacity: 0.7;">${eyeIcon}</span>
      `;
      
      btn.addEventListener("click", (e) => {
        // Blur active input to enable keyboard controls immediately
        if (document.activeElement && typeof document.activeElement.blur === "function") {
          document.activeElement.blur();
        }

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
        
        activeEditorField = fKey;
        renderEditorPosterCanvas();
        populateFieldSelectorList();
        loadActiveFieldStylesToSidebar();
        updateSelectionStatusLabel();
      });
      
      list.appendChild(btn);
    });
  }

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

  function loadActiveFieldStylesToSidebar() {
    if (!currentEditorTemplate) return;
    
    const fieldDef = currentEditorTemplate.fields[activeEditorField];
    if (!fieldDef) return;

    const posX = document.getElementById("editor-pos-x");
    const posY = document.getElementById("editor-pos-y");
    const posW = document.getElementById("editor-pos-w");
    const posH = document.getElementById("editor-pos-h");
    if (posX) posX.value = Math.round(fieldDef.left || 0);
    if (posY) posY.value = Math.round(fieldDef.top || 0);
    if (posW) posW.value = Math.round(fieldDef.width || 200);
    if (posH) posH.value = Math.round(fieldDef.height || 60);

    const fontSelect = document.getElementById("editor-font-family-select");
    if (fontSelect && fieldDef.fontFamily) {
      fontSelect.value = fieldDef.fontFamily;
    } else if (fontSelect) {
      fontSelect.value = activeEditorField === 'programName' ? "Outfit" : "Plus Jakarta Sans";
    }

    const fontSizeSlider = document.getElementById("editor-font-size-slider");
    const fontSizeInput = document.getElementById("editor-font-size-input");
    fontSizeSlider.value = fieldDef.fontSize || 40;
    fontSizeInput.value = fieldDef.fontSize || 40;

    const alignBtns = document.querySelectorAll(".align-toggle-btn");
    alignBtns.forEach(b => {
      if (b.dataset.align === (fieldDef.align || "center")) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    const colorSwatches = document.querySelectorAll(".color-swatch");
    colorSwatches.forEach(sw => {
      if (sw.dataset.color.toLowerCase() === (fieldDef.color || "#111827").toLowerCase()) {
        sw.classList.add("active");
      } else {
        sw.classList.remove("active");
      }
    });
    
    const color = fieldDef.color || "#111827";
    document.getElementById("editor-custom-color-picker").value = color;
    document.getElementById("editor-custom-color-hex").value = color.toUpperCase();

    // Visibility Checkbox sync
    const visibilityCheckbox = document.getElementById("editor-field-visibility");
    if (visibilityCheckbox) {
      visibilityCheckbox.checked = fieldDef.visible !== false;
    }
  }

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
      
      const fieldEl = wrap ? wrap.querySelector(`[data-field="${id}"]`) : null;
      if (fieldEl) {
        fieldEl.style.left = `${fieldDef.left}px`;
        fieldEl.style.top = `${fieldDef.top}px`;
        fieldEl.style.width = `${fieldDef.width}px`;
        fieldEl.style.height = `${fieldDef.height}px`;
        posterEngine.fitText(fieldEl, fieldDef.fontSize);
      }
    });
    
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

  // Visibility Checkbox trigger
  const visibilityCheckbox = document.getElementById("editor-field-visibility");
  if (visibilityCheckbox) {
    visibilityCheckbox.addEventListener("change", (e) => {
      if (!currentEditorTemplate) return;
      const isVisible = e.target.checked;
      snapshotHistory();
      
      selectedFieldIds.forEach(id => {
        if (currentEditorTemplate.fields[id]) {
          currentEditorTemplate.fields[id].visible = isVisible;
          
          const wrap = document.getElementById("editor-canvas-wrap");
          const fieldEl = wrap ? wrap.querySelector(`[data-field="${id}"]`) : null;
          if (fieldEl) {
            if (isVisible) {
              fieldEl.classList.remove("hidden-field");
              fieldEl.style.opacity = "1";
              fieldEl.style.border = "";
            } else {
              fieldEl.classList.add("hidden-field");
              fieldEl.style.opacity = "0.3";
              fieldEl.style.border = "1px dashed rgba(239, 68, 68, 0.5)";
            }
          }
        }
      });
      
      populateFieldSelectorList();
    });
  }

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

  // Unified Font Size updater
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

  // Unified Text Color updater
  function updateTextColor(hex) {
    if (!hex.startsWith("#")) hex = "#" + hex;
    const isValidHex = /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(hex);
    if (!isValidHex) return;

    document.getElementById("editor-custom-color-picker").value = hex;
    document.getElementById("editor-custom-color-hex").value = hex.toUpperCase();

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
      if (id === refId) return;
      
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

      const fieldDiv = wrap.querySelector(`[data-field="${id}"]`);
      if (fieldDiv) {
        fieldDiv.style.left = `${fieldDef.left}px`;
        fieldDiv.style.width = `${fieldDef.width}px`;
        
        posterEngine.fitText(fieldDiv, fieldDef.fontSize);
      }
    });
  }

  document.getElementById("btn-snap-left").addEventListener("click", () => alignSelectedFields("left"));
  document.getElementById("btn-snap-center").addEventListener("click", () => alignSelectedFields("center"));
  document.getElementById("btn-snap-right").addEventListener("click", () => alignSelectedFields("right"));
  document.getElementById("btn-snap-width").addEventListener("click", () => alignSelectedFields("width"));

  // --- KEYBOARD NAVIGATION (ARROW KEYS + UNDO/REDO) ---
  document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName.toLowerCase();
    const inInput = (tag === "input" || tag === "select" || tag === "textarea" || e.target.isContentEditable);

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      if (activeTab === "templates") {
        e.preventDefault();
        applyUndo();
        return;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey) {
      if (activeTab === "templates") {
        e.preventDefault();
        applyRedo();
        return;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      if (activeTab === "templates") {
        e.preventDefault();
        applyRedo();
        return;
      }
    }

    if (inInput) return;
    if (activeTab !== "templates" || !currentEditorTemplate) return;

    let dx = 0;
    let dy = 0;
    const step = e.shiftKey ? 10 : 1;

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
    saveTemplateBtn.addEventListener("click", async () => {
      if (!currentEditorTemplate) return;
      await db.saveTemplate(currentEditorTemplate);
      undoStack = [];
      redoStack = [];
      alert(`Coordinates & typography styling saved successfully for template: "${currentEditorTemplate.name}"!`);
      await initTemplateManager();
    });
  }

  // --- UPLOAD CUSTOM TEMPLATE BACKGROUND ---
  const fileUploaderBox = document.getElementById("template-upload-trigger");
  const fileInput = document.getElementById("template-bg-file-input");
  
  if (fileUploaderBox && fileInput) {
    fileUploaderBox.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const publicUrl = await db.uploadTemplateBackground(file, file.name);
      if (!publicUrl) {
        alert("Failed to upload background image to storage.");
        return;
      }

      const templates = await db.getTemplates();
      const defaultTemplateFields = templates[0] ? templates[0].fields : {};
      
      const newTemplate = {
        id: "custom-template-" + Date.now(),
        name: file.name.split(".")[0] || "Custom Graphic Upload",
        background: publicUrl,
        fields: JSON.parse(JSON.stringify(defaultTemplateFields))
      };

      await db.saveTemplate(newTemplate);
      currentEditorTemplate = newTemplate;
      
      alert(`New background template "${newTemplate.name}" uploaded & registered successfully!`);
      await initTemplateManager();
    });
  }

  // --- BINDING INTERACTJS DRAG AND RESIZE ---
  function setupInteract() {
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

            const canvasRect = canvasEl.getBoundingClientRect();
            const scale = canvasRect.width / 1080;

            const dx = event.dx / scale;
            const dy = event.dy / scale;

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

            loadActiveFieldStylesToSidebar();
          }
        }
      })
      .resizable({
        edges: { bottom: true, right: true, bottomRight: true, top: false, left: false, topLeft: false },
        margin: 12,
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

            w += event.deltaRect.width / scale;
            h += event.deltaRect.height / scale;

            const l = parseFloat(target.style.left) || 0;
            const t = parseFloat(target.style.top) || 0;
            w = Math.max(120, Math.min(1080 - l, w));
            h = Math.max(30, Math.min(1350 - t, h));

            target.style.width = `${w}px`;
            target.style.height = `${h}px`;

            currentEditorTemplate.fields[fKey].width = Math.round(w);
            currentEditorTemplate.fields[fKey].height = Math.round(h);

            posterEngine.fitText(target, currentEditorTemplate.fields[fKey].fontSize);
            loadActiveFieldStylesToSidebar();
          }
        }
      });
  }

  setupInteract();

  // --- 4. PUBLISHED RESULTS VIEWS ---
  let activeCategoryFilter = "All";

  async function loadPublishedResults() {
    const listContainer = document.getElementById("published-results-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    const searchVal = document.getElementById("admin-search-results").value.toLowerCase();
    
    let results = await db.getResults();

    if (activeCategoryFilter !== "All") {
      results = results.filter(r => r.category === activeCategoryFilter);
    }

    if (searchVal) {
      results = results.filter(r => {
        const matchesProgram = r.programName.toLowerCase().includes(searchVal);
        const winners = r.winners || [];
        const matchesWinners = winners.some(w => w.name.toLowerCase().includes(searchVal));
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
      const winners = r.winners || [];
      winners.forEach(w => {
        if (winnersList) winnersList += " | ";
        winnersList += `<strong>${w.name}</strong> (Pos ${w.position})${w.team ? ` [${w.team}]` : ""}`;
      });

      const statusHtml = r.status === 'pending'
        ? `<span class="badge" style="background:#FEF3C7;color:#D97706;border:1px solid #FCD34D;font-size:0.75rem;padding:4px 10px;border-radius:20px;">Pending</span>`
        : `<span class="badge" style="background:#D1FAE5;color:#059669;border:1px solid #A7F3D0;font-size:0.75rem;padding:4px 10px;border-radius:20px;">Published</span>`;

      row.innerHTML = `
        <div class="result-list-main">
          <span class="badge badge-primary result-list-category">${r.category}</span>
          ${statusHtml}
          <div class="result-list-title-wrap">
            <div class="result-list-title">
              ${r.resultNo ? `<span style="color:var(--primary);margin-right:8px;">#${r.resultNo}</span>` : ""}
              ${r.programName}
            </div>
            <div class="result-list-winner">
              ${winnersList}
            </div>
          </div>
        </div>
        <div class="action-btns" style="display:flex;gap:8px;align-items:center;">
          ${r.status === 'pending' ? `<button class="btn btn-primary btn-sm" onclick="publishDraftDirect('${r.id}')" style="background:#10B981;border-color:#10B981;color:white;font-weight:700;">Publish</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="triggerEditResult('${r.id}')">✏️ Edit</button>
          <button class="btn btn-secondary btn-sm" onclick="triggerDirectDownload('${r.id}')">⬇️ Download</button>
          <button class="btn btn-outline btn-sm btn-danger" onclick="deletePublishedResult('${r.id}', '${r.programName}')" style="color: #EF4444; border-color: #FEE2E2; padding: 8px 12px;">🗑️ Delete</button>
        </div>
      `;
      listContainer.appendChild(row);
    });
  }

  const adminSearchInput = document.getElementById("admin-search-results");
  if (adminSearchInput) {
    adminSearchInput.addEventListener("input", loadPublishedResults);
  }

  const adminCategoryPills = document.querySelectorAll("#admin-category-filters .filter-pill");
  adminCategoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      adminCategoryPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      
      activeCategoryFilter = pill.dataset.category;
      loadPublishedResults();
    });
  });

  window.triggerDirectDownload = async function(id) {
    const result = await db.getResult(id);
    const templates = await db.getTemplates();
    const template = templates[0]; // Default template
    if (!result || !template) return;
    
    const tmpDiv = document.createElement("div");
    tmpDiv.className = "hidden-export-container";
    document.body.appendChild(tmpDiv);
    
    posterEngine.render(tmpDiv, result, template);
    
    setTimeout(() => {
      posterEngine.exportJpg(tmpDiv, `${result.programName}.jpg`);
      setTimeout(() => {
        document.body.removeChild(tmpDiv);
      }, 1000);
    }, 200);
  };

  window.publishDraftDirect = async function(id) {
    const result = await db.getResult(id);
    if (!result) return;
    result.status = 'published';
    const ok = await db.saveResult(result);
    if (ok) {
      await loadPublishedResults();
    } else {
      alert("Failed to publish result.");
    }
  };

  window.deletePublishedResult = async function(id, name) {
    if (confirm(`Are you sure you want to permanently delete the published result for "${name}"?`)) {
      const deleted = await db.deleteResult(id);
      if (deleted) {
        await loadPublishedResults();
      } else {
        alert("Failed to delete result.");
      }
    }
  };

  // --- 5. SETTINGS PANEL SYSTEM ---
  async function loadSettingsView() {
    const settings = await db.getSettings();
    document.getElementById("settings-institution").value = settings.institutionName || "";
  }

  const saveSettingsBtn = document.getElementById("btn-save-settings");
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", async () => {
      const instName = document.getElementById("settings-institution").value;
      await db.saveSettings({ institutionName: instName });
      alert("Application settings updated successfully!");
    });
  }

  const resetBtn = document.getElementById("btn-factory-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      if (confirm("⚠️ WARNING: This will permanently wipe all results, custom template positions, and uploaded backgrounds. Do you wish to proceed?")) {
        await db.resetToDefault();
        alert("Database successfully reset! All results and templates have been deleted.");
        window.location.reload();
      }
    });
  }

  // --- START INITIAL VIEW LOAD ---
  const params = new URLSearchParams(window.location.search);
  const startTab = params.get("tab") || "dashboard";
  
  const editId = params.get("edit");
  if (editId) {
    (async () => {
      const r = await db.getResult(editId);
      if (r) {
        setTimeout(async () => {
          await switchTab("upload");
          document.getElementById("edit-result-id").value = r.id;
          document.getElementById("form-program-name").value = r.programName;
          document.getElementById("form-category").value = r.category;
          
          populateWinners(r);
          
          document.getElementById("upload-form-title").innerText = "Edit Published Result";
          document.getElementById("btn-submit-result").innerText = "Update Published Poster";
          await updateUploadLivePreview();
        }, 100);
      } else {
        await switchTab(startTab);
      }
    })();
  } else {
    switchTab(startTab);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runAdminController);
} else {
  runAdminController();
}
