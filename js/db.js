/**
 * Database Persistence Module using LocalStorage
 * seeds default templates and sample result data.
 */

const DB_PREFIX = "arts_posters_";

const DEFAULT_TEMPLATES = [
  {
    id: "classic-elite",
    name: "Classic Elite",
    background: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
        <rect width="1080" height="1350" fill="#FFFDF9"/>
        <rect x="35" y="35" width="1010" height="1280" fill="none" stroke="#F59E0B" stroke-width="4" rx="20"/>
        <rect x="50" y="50" width="980" height="1250" fill="none" stroke="#7C3AED" stroke-width="2" rx="15"/>
        <path d="M50 150 C 150 150, 150 50, 150 50" fill="none" stroke="#F59E0B" stroke-width="3"/>
        <path d="M1030 150 C 930 150, 930 50, 930 50" fill="none" stroke="#F59E0B" stroke-width="3"/>
        <circle cx="540" cy="-60" r="260" fill="none" stroke="#7C3AED" stroke-dasharray="12 16" stroke-width="2" opacity="0.35"/>
        <path d="M340 110 L 740 110 L 710 160 L 370 160 Z" fill="#7C3AED"/>
        <text x="540" y="142" fill="#FFFFFF" font-family="'Outfit', sans-serif" font-size="22" font-weight="800" text-anchor="middle" letter-spacing="4">ARTS CHAMPIONSHIP</text>
        <path d="M 540 1200 C 460 1180, 440 1130, 420 1100" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
        <path d="M 540 1200 C 620 1180, 640 1130, 660 1100" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
        <circle cx="540" cy="1200" r="10" fill="#7C3AED"/>
      </svg>
    `.trim())}`,
    fields: {
      programName: { left: 90,  top: 200, width: 900, height: 160, fontSize: 72, color: "#7C3AED", align: "center", shadow: false },
      category:    { left: 290, top: 380, width: 500, height: 60,  fontSize: 32, color: "#EC4899", align: "center", shadow: false },
      placement_1: { left: 140, top: 470, width: 800, height: 130, fontSize: 32, color: "#7C3AED", align: "center", shadow: false },
      placement_2: { left: 140, top: 615, width: 800, height: 130, fontSize: 32, color: "#7C3AED", align: "center", shadow: false },
      placement_3: { left: 140, top: 760, width: 800, height: 130, fontSize: 32, color: "#7C3AED", align: "center", shadow: false },
      placement_4: { left: 140, top: 905, width: 800, height: 110, fontSize: 28, color: "#7C3AED", align: "center", shadow: false },
      placement_5: { left: 140, top: 1030, width: 800, height: 100, fontSize: 26, color: "#7C3AED", align: "center", shadow: false },
      placement_6: { left: 140, top: 1145, width: 800, height: 90,  fontSize: 24, color: "#7C3AED", align: "center", shadow: false }
    }
  },
  {
    id: "cyber-pulse",
    name: "Cyber Pulse",
    background: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
        <defs>
          <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F0FDFA"/>
            <stop offset="100%" stop-color="#FFF5F7"/>
          </linearGradient>
          <linearGradient id="primary-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#06B6D4"/>
            <stop offset="100%" stop-color="#EC4899"/>
          </linearGradient>
        </defs>
        <rect width="1080" height="1350" fill="url(#cyber-grad)"/>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#E5E7EB" stroke-width="1"/>
        </pattern>
        <rect width="1080" height="1350" fill="url(#grid)" opacity="0.3"/>
        <path d="M0 0 L 320 0 L 270 70 L 0 70 Z" fill="#06B6D4" opacity="0.85"/>
        <path d="M1080 1350 L 760 1350 L 810 1280 L 1080 1280 Z" fill="#EC4899" opacity="0.85"/>
        <circle cx="960" cy="180" r="140" fill="none" stroke="url(#primary-grad)" stroke-width="8" opacity="0.2"/>
        <rect x="60" y="1130" width="90" height="90" rx="18" fill="none" stroke="#7C3AED" stroke-width="5" transform="rotate(45 105 1175)" opacity="0.25"/>
        <rect x="390" y="45" width="300" height="40" rx="20" fill="url(#primary-grad)"/>
        <text x="540" y="70" fill="#FFFFFF" font-family="'Outfit', sans-serif" font-size="16" font-weight="800" text-anchor="middle" letter-spacing="3">FESTIVAL OF ARTS</text>
      </svg>
    `.trim())}`,
    fields: {
      programName: { left: 80,  top: 150, width: 920, height: 180, fontSize: 80, color: "#111827", align: "center", shadow: false },
      category:    { left: 290, top: 350, width: 500, height: 60,  fontSize: 30, color: "#06B6D4", align: "center", shadow: false },
      placement_1: { left: 100, top: 440, width: 880, height: 130, fontSize: 30, color: "#7C3AED", align: "center", shadow: false },
      placement_2: { left: 100, top: 585, width: 880, height: 130, fontSize: 30, color: "#7C3AED", align: "center", shadow: false },
      placement_3: { left: 100, top: 730, width: 880, height: 130, fontSize: 30, color: "#7C3AED", align: "center", shadow: false },
      placement_4: { left: 100, top: 875, width: 880, height: 110, fontSize: 26, color: "#7C3AED", align: "center", shadow: false },
      placement_5: { left: 100, top: 1000, width: 880, height: 100, fontSize: 24, color: "#7C3AED", align: "center", shadow: false },
      placement_6: { left: 100, top: 1115, width: 880, height: 90,  fontSize: 22, color: "#7C3AED", align: "center", shadow: false }
    }
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    background: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
        <defs>
          <linearGradient id="sunset-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFF8F0"/>
            <stop offset="60%" stop-color="#FFEDD5"/>
            <stop offset="100%" stop-color="#FCE7F3"/>
          </linearGradient>
          <linearGradient id="sun-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#EC4899" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.25"/>
          </linearGradient>
        </defs>
        <rect width="1080" height="1350" fill="url(#sunset-bg)"/>
        <circle cx="540" cy="1350" r="580" fill="url(#sun-grad)"/>
        <circle cx="540" cy="1350" r="420" fill="none" stroke="#F59E0B" stroke-width="2" opacity="0.25"/>
        <circle cx="540" cy="1350" r="280" fill="none" stroke="#EC4899" stroke-width="2.5" stroke-dasharray="16 8" opacity="0.3"/>
        <line x1="100" y1="100" x2="980" y2="100" stroke="#EC4899" stroke-width="3" opacity="0.4"/>
        <line x1="100" y1="1250" x2="980" y2="1250" stroke="#F59E0B" stroke-width="3" opacity="0.4"/>
        <circle cx="540" cy="100" r="14" fill="#F59E0B"/>
        <text x="540" y="155" fill="#EC4899" font-family="'Outfit', sans-serif" font-size="20" font-weight="800" text-anchor="middle" letter-spacing="5">ANNUAL CREATIVE CONCLAVE</text>
      </svg>
    `.trim())}`,
    fields: {
      programName: { left: 100, top: 190, width: 880, height: 160, fontSize: 76, color: "#F59E0B", align: "center", shadow: false },
      category:    { left: 290, top: 370, width: 500, height: 60,  fontSize: 28, color: "#EC4899", align: "center", shadow: false },
      placement_1: { left: 100, top: 460, width: 880, height: 125, fontSize: 28, color: "#111827", align: "center", shadow: false },
      placement_2: { left: 100, top: 600, width: 880, height: 125, fontSize: 28, color: "#111827", align: "center", shadow: false },
      placement_3: { left: 100, top: 740, width: 880, height: 125, fontSize: 28, color: "#111827", align: "center", shadow: false },
      placement_4: { left: 100, top: 880, width: 880, height: 105, fontSize: 24, color: "#111827", align: "center", shadow: false },
      placement_5: { left: 100, top: 1000, width: 880, height: 95,  fontSize: 22, color: "#111827", align: "center", shadow: false },
      placement_6: { left: 100, top: 1110, width: 880, height: 85,  fontSize: 20, color: "#111827", align: "center", shadow: false }
    }
  }
];

const DEFAULT_RESULTS = [
  {
    id: "result-1",
    programName: "Classical Violin Symphony Solo",
    category: "Music",
    placements: [
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
    ],
    created: "2026-05-24T18:30:00Z"
  },
  {
    id: "result-2",
    programName: "Contemporary Fusion Ballet",
    category: "Dance",
    placements: [
      {
        rank: "First Place",
        winners: [
          { name: "Mikhail Baryshnikov", team: "Vaniyambalam" },
          { name: "Natalia Makarova", team: "Old Vaniyambalam" }
        ]
      },
      {
        rank: "Second Place",
        winners: [
          { name: "Elena Rostova", team: "Thekkumpuram" }
        ]
      }
    ],
    created: "2026-05-25T10:15:00Z"
  },
  {
    id: "result-3",
    programName: "Dynamic Canvas Oil Painting",
    category: "Fine Arts",
    placements: [
      {
        rank: "First Place",
        winners: [
          { name: "Leonardo Da Vinci", team: "Koorad" }
        ]
      },
      {
        rank: "Second Place",
        winners: [
          { name: "Vincent Van Gogh", team: "Wandoor" }
        ]
      },
      {
        rank: "Third Place",
        winners: [
          { name: "Georgia O'Keeffe", team: "Emangad" }
        ]
      }
    ],
    created: "2026-05-25T12:00:00Z"
  },
  {
    id: "result-4",
    programName: "Shakespearean Dramatic Soliloquy",
    category: "Theatre",
    placements: [
      {
        rank: "First Place",
        winners: [
          { name: "Benedict Cumberbatch", team: "Kuttiyil" }
        ]
      },
      {
        rank: "Second Place",
        winners: [
          { name: "Viola Davis", team: "Thekkumpuram" }
        ]
      },
      {
        rank: "Third Place",
        winners: [
          { name: "Ian McKellen", team: "Vaniyambalam" }
        ]
      }
    ],
    created: "2026-05-25T14:40:00Z"
  }
];

const db = {
  // --- UTILS ---
  _getItem(key) {
    try {
      const data = localStorage.getItem(DB_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error reading from LocalStorage:", e);
      return null;
    }
  },

  _setItem(key, val) {
    try {
      localStorage.setItem(DB_PREFIX + key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error("Error writing to LocalStorage:", e);
      return false;
    }
  },

  // --- INITIALIZATION ---
  init() {
    let templates = this._getItem("templates");
    if (!templates) {
      this._setItem("templates", DEFAULT_TEMPLATES);
    } else {
      // Self-healing migration
      let migrated = false;
      templates.forEach(t => {
        // Fix old MIME type
        if (t.background && t.background.startsWith("data:image/svg+xml;utf8,")) {
          t.background = t.background.replace("data:image/svg+xml;utf8,", "data:image/svg+xml;charset=utf-8,");
          migrated = true;
        }

        const defaultT = DEFAULT_TEMPLATES.find(dt => dt.id === t.id) || DEFAULT_TEMPLATES[0];
        if (!t.fields) t.fields = {};

        // Migrate: add placement_1..6 if missing
        for (let i = 1; i <= 6; i++) {
          const pk = `placement_${i}`;
          if (!t.fields[pk]) {
            t.fields[pk] = defaultT.fields[pk]
              ? { ...defaultT.fields[pk] }
              : { left: 140, top: 460 + (i - 1) * 140, width: 800, height: 120, fontSize: 30, color: "#7C3AED", align: "center", shadow: false };
            migrated = true;
          }
        }

        // Clean up obsolete fields (winnerSection + old winner keys)
        const obsoleteKeys = [
          'winnerSection',
          'winner_1_name', 'winner_1_team', 'winner_2_name', 'winner_2_team',
          'winner_3_name', 'winner_3_team', 'winner_4_name', 'winner_4_team',
          'winner_5_name', 'winner_5_team',
          'firstPlace', 'firstPlaceTeam', 'secondPlace', 'secondPlaceTeam',
          'thirdPlace', 'thirdPlaceTeam'
        ];
        obsoleteKeys.forEach(k => {
          if (t.fields[k]) {
            delete t.fields[k];
            migrated = true;
          }
        });
      });
      if (migrated) {
        this._setItem("templates", templates);
      }
    }
    if (!this._getItem("results")) {
      this._setItem("results", DEFAULT_RESULTS);
    }
    if (!this._getItem("settings")) {
      this._setItem("settings", {
        institutionName: "National Academy of Creative Arts",
        enableFirebasePlaceholder: false,
        theme: "light-premium"
      });
    }
  },

  // --- RESULTS API ---
  getResults() {
    this.init();
    return this._getItem("results") || [];
  },

  getResult(id) {
    const results = this.getResults();
    return results.find(r => r.id === id) || null;
  },

  saveResult(resultData) {
    const results = this.getResults();
    if (resultData.id) {
      // Edit existing
      const idx = results.findIndex(r => r.id === resultData.id);
      if (idx !== -1) {
        results[idx] = { ...results[idx], ...resultData };
      }
    } else {
      // Create new
      const newResult = {
        id: "result_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        programName: resultData.programName,
        category: resultData.category,
        placements: resultData.placements || [],
        created: new Date().toISOString()
      };
      results.unshift(newResult);
      resultData.id = newResult.id;
    }
    this._setItem("results", results);
    return resultData;
  },

  deleteResult(id) {
    let results = this.getResults();
    results = results.filter(r => r.id !== id);
    this._setItem("results", results);
    return true;
  },

  // --- TEMPLATES API ---
  getTemplates() {
    this.init();
    return this._getItem("templates") || [];
  },

  getTemplate(id) {
    const templates = this.getTemplates();
    return templates.find(t => t.id === id) || null;
  },

  saveTemplate(templateData) {
    const templates = this.getTemplates();
    const idx = templates.findIndex(t => t.id === templateData.id);
    if (idx !== -1) {
      templates[idx] = { ...templates[idx], ...templateData };
    } else {
      templates.push(templateData);
    }
    this._setItem("templates", templates);
    return templateData;
  },

  deleteTemplate(id) {
    let templates = this.getTemplates();
    templates = templates.filter(t => t.id !== id);
    this._setItem("templates", templates);
    return true;
  },

  // --- SETTINGS API ---
  getSettings() {
    this.init();
    return this._getItem("settings") || {};
  },

  saveSettings(settingsData) {
    const current = this.getSettings();
    this._setItem("settings", { ...current, ...settingsData });
    return true;
  },

  // --- DATABASE SYSTEM RESET ---
  resetToDefault() {
    localStorage.removeItem(DB_PREFIX + "templates");
    localStorage.removeItem(DB_PREFIX + "results");
    localStorage.removeItem(DB_PREFIX + "settings");
    this.init();
    return true;
  }
};

// Auto initialize on script load
db.init();

// Export to window for global modular usage
window.db = db;
