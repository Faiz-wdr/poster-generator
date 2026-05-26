/**
 * Client Public Controller - Arts Result Posters Portal
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- PAGE DETECTION ROUTER ---
  const isHome = document.getElementById("home-results-list") !== null;
  const isGallery = document.getElementById("gallery-results-list") !== null;
  const isDetail = document.getElementById("detail-poster-wrap") !== null;

  if (isHome) {
    initHomePage();
  } else if (isGallery) {
    initGalleryPage();
  } else if (isDetail) {
    initDetailPage();
  }

  // Modal close handlers (attached once globally)
  const modal = document.getElementById("poster-modal");
  const closeModalBtn = document.getElementById("btn-close-modal");
  if (modal && closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // --- COMMON DYNAMIC ASSETS COMPONENT ---
  // Helper to create a premium results list item dynamically
  function createResultRow(result) {
    const row = document.createElement("div");
    row.className = "result-list-item";
    
    const firstGroup = result.placements && result.placements[0] ? result.placements[0] : null;
    let winnersList = "";
    if (firstGroup && firstGroup.winners) {
      firstGroup.winners.forEach(w => {
        if (winnersList) winnersList += " & ";
        winnersList += w.name + (w.team ? ` (${w.team})` : "");
      });
    }
    const displayWinners = winnersList || "[ No Placements Selections ]";

    row.innerHTML = `
      <div class="result-list-main">
        <span class="badge badge-primary result-list-category">${result.category}</span>
        <div class="result-list-title-wrap">
          <div class="result-list-title">${result.programName}</div>
          <div class="result-list-winner">🥇 1st Place: <strong>${displayWinners}</strong></div>
        </div>
      </div>
      <button class="btn btn-outline btn-sm">View Poster</button>
    `;
    row.addEventListener("click", () => {
      openPosterModal(result);
    });
    return row;
  }

  // --- INTERACTIVE POSTER MODAL POPUP ---
  function openPosterModal(result) {
    const modal = document.getElementById("poster-modal");
    if (!modal) return;

    // Show modal
    modal.style.display = "flex";

    const modalPosterWrap = document.getElementById("modal-poster-wrap");

    // Load templates
    const templates = db.getTemplates();
    if (templates.length === 0) return;

    let activeTemplateIndex = 0;
    let activeTemplate = templates[activeTemplateIndex];

    // Render initially inside modal preview container
    posterEngine.render(modalPosterWrap, result, activeTemplate);

    // Wire "Next Template" cycling button - clear old listener by replacing button clone
    const nextTemplateBtn = document.getElementById("btn-modal-next-template");
    if (nextTemplateBtn) {
      const newNextBtn = nextTemplateBtn.cloneNode(true);
      nextTemplateBtn.parentNode.replaceChild(newNextBtn, nextTemplateBtn);
      
      newNextBtn.addEventListener("click", () => {
        activeTemplateIndex = (activeTemplateIndex + 1) % templates.length;
        activeTemplate = templates[activeTemplateIndex];
        posterEngine.render(modalPosterWrap, result, activeTemplate);
      });
    }

    // Wire Download action button - clear old listener by replacing button clone
    const downloadBtn = document.getElementById("btn-modal-download");
    if (downloadBtn) {
      const newDownloadBtn = downloadBtn.cloneNode(true);
      downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
      
      newDownloadBtn.addEventListener("click", () => {
        posterEngine.exportJpg(modalPosterWrap, `${result.programName}.jpg`);
      });
    }

    // Force scale refresh since modal display block/flex might toggle container size
    setTimeout(() => {
      if (modalPosterWrap && modalPosterWrap._adjustScaleFn) {
        modalPosterWrap._adjustScaleFn();
      }
    }, 50);
  }

  // --- 1. HOME PORTAL PAGE ---
  function initHomePage() {
    const results = db.getResults();
    const templates = db.getTemplates();
    const settings = db.getSettings();

    // Render Bento Stats (Safeguarded because these elements are removed in public homepage)
    const homeStatResults = document.getElementById("home-stat-results");
    if (homeStatResults) homeStatResults.innerText = results.length;
    
    const cats = new Set(results.map(r => r.category));
    const homeStatCategories = document.getElementById("home-stat-categories");
    if (homeStatCategories) homeStatCategories.innerText = cats.size || 0;
    
    const homeStatTemplates = document.getElementById("home-stat-templates");
    if (homeStatTemplates) homeStatTemplates.innerText = templates.length;
    
    const homeStatInstitution = document.getElementById("home-stat-institution");
    if (homeStatInstitution) homeStatInstitution.innerText = settings.institutionName || "Arts Academy";

    // Dynamic hero featured poster preview card
    const heroPreviewWrap = document.getElementById("hero-poster-preview-wrap");
    if (heroPreviewWrap && results.length > 0 && templates.length > 0) {
      // Pick first result as featured item
      posterEngine.render(heroPreviewWrap, results[0], templates[0]);
    }

    // Render Latest Results List (Max 3 items)
    const latestListContainer = document.getElementById("home-results-list");
    if (latestListContainer) {
      latestListContainer.innerHTML = "";
      
      const latestList = results.slice(0, 3);
      if (latestList.length === 0) {
        latestListContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px; font-weight: 600; width: 100%;">No published results available yet.</div>`;
      } else {
        latestList.forEach(r => {
          const row = createResultRow(r);
          latestListContainer.appendChild(row);
        });
      }
    }

    // Render Horizontal Template Slider (Safeguarded)
    const tempSlider = document.getElementById("home-template-slider");
    if (tempSlider) {
      tempSlider.innerHTML = "";

      templates.forEach(t => {
        const slide = document.createElement("div");
        slide.className = "template-slide";
        slide.addEventListener("click", () => {
          window.location.href = `admin.html?tab=templates`;
        });

        const img = document.createElement("div");
        img.className = "template-slide-img";
        img.style.backgroundImage = `url("${t.background}")`;
        img.style.backgroundSize = "cover";
        img.style.backgroundPosition = "center";
        
        const label = document.createElement("div");
        label.className = "template-slide-name";
        label.innerText = t.name;

        slide.appendChild(img);
        slide.appendChild(label);
        tempSlider.appendChild(slide);
      });
    }
  }

  // --- 2. RESULTS GALLERY VIEW ---
  let activeGalleryCategory = "All";

  function initGalleryPage() {
    // Render dynamic list
    renderGalleryList();

    // Attach search event
    const searchInput = document.getElementById("gallery-search");
    if (searchInput) {
      searchInput.addEventListener("input", renderGalleryList);
    }

    // Category Filter pill listeners
    const pills = document.querySelectorAll("#gallery-category-filters .filter-pill");
    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        
        activeGalleryCategory = pill.dataset.category;
        renderGalleryList();
      });
    });
  }

  function renderGalleryList() {
    const listContainer = document.getElementById("gallery-results-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    
    const searchInput = document.getElementById("gallery-search");
    const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
    
    let results = db.getResults();

    // Apply category pill filter
    if (activeGalleryCategory !== "All") {
      results = results.filter(r => r.category === activeGalleryCategory);
    }

    // Apply keyword search
    if (searchVal) {
      results = results.filter(r => 
        r.programName.toLowerCase().includes(searchVal) ||
        r.firstPlace.toLowerCase().includes(searchVal) ||
        r.secondPlace.toLowerCase().includes(searchVal) ||
        r.thirdPlace.toLowerCase().includes(searchVal) ||
        r.category.toLowerCase().includes(searchVal)
      );
    }

    if (results.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 80px 0; font-weight: 600; width: 100%;">No result posters match your search.</div>`;
      return;
    }

    results.forEach(r => {
      const row = createResultRow(r);
      listContainer.appendChild(row);
    });
  }

  // --- 3. DYNAMIC RESULT DETAIL PAGE ---
  function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const resultId = urlParams.get("id");
    
    if (!resultId) {
      alert("No result identifier provided!");
      window.location.href = "gallery.html";
      return;
    }

    const result = db.getResult(resultId);
    if (!result) {
      alert("Result record not found in database!");
      window.location.href = "gallery.html";
      return;
    }

    // Populate descriptive winner profile details on right side
    document.getElementById("detail-badge-category").innerText = result.category;
    document.getElementById("detail-program-name").innerText = result.programName;
    
    const winnersListContainer = document.getElementById("detail-winners-list");
    if (winnersListContainer) {
      winnersListContainer.innerHTML = "";
      const placements = result.placements || [];
      
      placements.forEach((g, idx) => {
        const item = document.createElement("div");
        item.className = `winner-item winner-item-${idx < 3 ? idx + 1 : 'others'}`;
        item.style.alignItems = "flex-start";
        
        let placeLabel = g.rank;
        let titleLabel = g.rank;
        
        let medalLabel = "🏆";
        if (g.rank.toLowerCase().includes("first") || g.rank.toLowerCase().includes("1st")) {
          medalLabel = "1st";
        } else if (g.rank.toLowerCase().includes("second") || g.rank.toLowerCase().includes("2nd")) {
          medalLabel = "2nd";
        } else if (g.rank.toLowerCase().includes("third") || g.rank.toLowerCase().includes("3rd")) {
          medalLabel = "3rd";
        } else {
          medalLabel = "Prize";
        }

        let winnersHtml = "";
        g.winners.forEach(w => {
          if (winnersHtml) winnersHtml += "<br>";
          winnersHtml += `<div class="winner-name" style="font-size: 1.05rem; font-weight: 800;">${w.name}${w.team ? ` <span style="font-size: 0.8em; font-weight: 600; opacity: 0.85;">(${w.team})</span>` : ""}</div>`;
        });

        item.innerHTML = `
          <div class="winner-place winner-place-${idx < 3 ? idx + 1 : 'others'}" style="font-size: 0.9rem; font-weight: 800; text-transform: uppercase;">${medalLabel}</div>
          <div style="flex-grow: 1;">
            <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${titleLabel}</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${winnersHtml}
            </div>
          </div>
        `;
        winnersListContainer.appendChild(item);
      });
    }

    // Load templates for live template picker
    const templates = db.getTemplates();
    const pickerWrap = document.getElementById("detail-template-picker");
    const posterWrap = document.getElementById("detail-poster-wrap");
    
    let activeTemplate = templates[0];
    
    // Initial high-fidelity canvas render
    posterEngine.render(posterWrap, result, activeTemplate);

    // Build the visual selector thumbnails list
    pickerWrap.innerHTML = "";
    templates.forEach(t => {
      const slide = document.createElement("div");
      slide.className = "template-slide" + (t.id === activeTemplate.id ? " active" : "");
      
      const img = document.createElement("div");
      img.className = "template-slide-img";
      img.style.backgroundImage = `url("${t.background}")`;
      img.style.backgroundSize = "cover";
      img.style.backgroundPosition = "center";
      
      const label = document.createElement("div");
      label.className = "template-slide-name";
      label.innerText = t.name;

      slide.appendChild(img);
      slide.appendChild(label);
      pickerWrap.appendChild(slide);

      // Slide click swapper logic
      slide.addEventListener("click", () => {
        // Toggle active thumbnail styling
        const allSlides = pickerWrap.querySelectorAll(".template-slide");
        allSlides.forEach(s => s.classList.remove("active"));
        slide.classList.add("active");

        // Instant preview swap
        activeTemplate = t;
        posterEngine.render(posterWrap, result, activeTemplate);
      });
    });

    // Wire Detail download action button
    const downloadBtn = document.getElementById("btn-detail-download");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        posterEngine.exportJpg(posterWrap, `${result.programName}.jpg`);
      });
    }

    // Quick Admin Edit Shortcut
    const editBtn = document.getElementById("btn-admin-edit");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.location.href = `admin.html?edit=${result.id}`;
      });
    }

    // Quick Admin Delete Shortcut
    const deleteBtn = document.getElementById("btn-admin-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Are you sure you want to permanently delete the result for "${result.programName}"?`)) {
          db.deleteResult(result.id);
          alert("Result deleted successfully.");
          window.location.href = "gallery.html";
        }
      });
    }
  }
});
