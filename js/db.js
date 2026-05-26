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
      programName:   { left: 90,  top: 200, width: 900, height: 160, fontSize: 72, color: "#7C3AED", align: "center", shadow: false, visible: true },
      category:      { left: 290, top: 380, width: 500, height: 60,  fontSize: 32, color: "#EC4899", align: "center", shadow: false, visible: true },
      winner_1_pos:  { left: 140, top: 480, width: 90,  height: 80,  fontSize: 32, color: "#F59E0B", align: "left",   shadow: false, visible: true },
      winner_1_name: { left: 250, top: 480, width: 500, height: 80,  fontSize: 32, color: "#7C3AED", align: "left",   shadow: false, visible: true },
      winner_1_team: { left: 770, top: 480, width: 170, height: 80,  fontSize: 26, color: "#6B7280", align: "right",  shadow: false, visible: true },
      winner_2_pos:  { left: 140, top: 610, width: 90,  height: 80,  fontSize: 32, color: "#F59E0B", align: "left",   shadow: false, visible: true },
      winner_2_name: { left: 250, top: 610, width: 500, height: 80,  fontSize: 32, color: "#7C3AED", align: "left",   shadow: false, visible: true },
      winner_2_team: { left: 770, top: 610, width: 170, height: 80,  fontSize: 26, color: "#6B7280", align: "right",  shadow: false, visible: true },
      winner_3_pos:  { left: 140, top: 740, width: 90,  height: 80,  fontSize: 32, color: "#F59E0B", align: "left",   shadow: false, visible: true },
      winner_3_name: { left: 250, top: 740, width: 500, height: 80,  fontSize: 32, color: "#7C3AED", align: "left",   shadow: false, visible: true },
      winner_3_team: { left: 770, top: 740, width: 170, height: 80,  fontSize: 26, color: "#6B7280", align: "right",  shadow: false, visible: true },
      winner_4_pos:  { left: 140, top: 870, width: 90,  height: 80,  fontSize: 28, color: "#F59E0B", align: "left",   shadow: false, visible: true },
      winner_4_name: { left: 250, top: 870, width: 500, height: 80,  fontSize: 28, color: "#7C3AED", align: "left",   shadow: false, visible: true },
      winner_4_team: { left: 770, top: 870, width: 170, height: 80,  fontSize: 24, color: "#6B7280", align: "right",  shadow: false, visible: true },
      winner_5_pos:  { left: 140, top: 1000, width: 90,  height: 80,  fontSize: 26, color: "#F59E0B", align: "left",   shadow: false, visible: true },
      winner_5_name: { left: 250, top: 1000, width: 500, height: 80,  fontSize: 26, color: "#7C3AED", align: "left",   shadow: false, visible: true },
      winner_5_team: { left: 770, top: 1000, width: 170, height: 80,  fontSize: 22, color: "#6B7280", align: "right",  shadow: false, visible: true },
      winner_6_pos:  { left: 140, top: 1130, width: 90,  height: 80,  fontSize: 24, color: "#F59E0B", align: "left",   shadow: false, visible: true },
      winner_6_name: { left: 250, top: 1130, width: 500, height: 80,  fontSize: 24, color: "#7C3AED", align: "left",   shadow: false, visible: true },
      winner_6_team: { left: 770, top: 1130, width: 170, height: 80,  fontSize: 20, color: "#6B7280", align: "right",  shadow: false, visible: true }
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
      programName:   { left: 80,  top: 150, width: 920, height: 180, fontSize: 80, color: "#111827", align: "center", shadow: false, visible: true },
      category:      { left: 290, top: 350, width: 500, height: 60,  fontSize: 30, color: "#06B6D4", align: "center", shadow: false, visible: true },
      winner_1_pos:  { left: 100, top: 450, width: 90,  height: 80,  fontSize: 30, color: "#06B6D4", align: "left",   shadow: false, visible: true },
      winner_1_name: { left: 210, top: 450, width: 540, height: 80,  fontSize: 30, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_1_team: { left: 770, top: 450, width: 210, height: 80,  fontSize: 24, color: "#EC4899", align: "right",  shadow: false, visible: true },
      winner_2_pos:  { left: 100, top: 580, width: 90,  height: 80,  fontSize: 30, color: "#06B6D4", align: "left",   shadow: false, visible: true },
      winner_2_name: { left: 210, top: 580, width: 540, height: 80,  fontSize: 30, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_2_team: { left: 770, top: 580, width: 210, height: 80,  fontSize: 24, color: "#EC4899", align: "right",  shadow: false, visible: true },
      winner_3_pos:  { left: 100, top: 710, width: 90,  height: 80,  fontSize: 30, color: "#06B6D4", align: "left",   shadow: false, visible: true },
      winner_3_name: { left: 210, top: 710, width: 540, height: 80,  fontSize: 30, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_3_team: { left: 770, top: 710, width: 210, height: 80,  fontSize: 24, color: "#EC4899", align: "right",  shadow: false, visible: true },
      winner_4_pos:  { left: 100, top: 840, width: 90,  height: 80,  fontSize: 26, color: "#06B6D4", align: "left",   shadow: false, visible: true },
      winner_4_name: { left: 210, top: 840, width: 540, height: 80,  fontSize: 26, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_4_team: { left: 770, top: 840, width: 210, height: 80,  fontSize: 22, color: "#EC4899", align: "right",  shadow: false, visible: true },
      winner_5_pos:  { left: 100, top: 970, width: 90,  height: 80,  fontSize: 24, color: "#06B6D4", align: "left",   shadow: false, visible: true },
      winner_5_name: { left: 210, top: 970, width: 540, height: 80,  fontSize: 24, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_5_team: { left: 770, top: 970, width: 210, height: 80,  fontSize: 20, color: "#EC4899", align: "right",  shadow: false, visible: true },
      winner_6_pos:  { left: 100, top: 1100, width: 90,  height: 80,  fontSize: 22, color: "#06B6D4", align: "left",   shadow: false, visible: true },
      winner_6_name: { left: 210, top: 1100, width: 540, height: 80,  fontSize: 22, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_6_team: { left: 770, top: 1100, width: 210, height: 80,  fontSize: 18, color: "#EC4899", align: "right",  shadow: false, visible: true }
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
      programName:   { left: 100, top: 190, width: 880, height: 160, fontSize: 76, color: "#F59E0B", align: "center", shadow: false, visible: true },
      category:      { left: 290, top: 370, width: 500, height: 60,  fontSize: 28, color: "#EC4899", align: "center", shadow: false, visible: true },
      winner_1_pos:  { left: 100, top: 470, width: 90,  height: 80,  fontSize: 28, color: "#EC4899", align: "left",   shadow: false, visible: true },
      winner_1_name: { left: 210, top: 470, width: 540, height: 80,  fontSize: 28, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_1_team: { left: 770, top: 470, width: 210, height: 80,  fontSize: 22, color: "#F59E0B", align: "right",  shadow: false, visible: true },
      winner_2_pos:  { left: 100, top: 600, width: 90,  height: 80,  fontSize: 28, color: "#EC4899", align: "left",   shadow: false, visible: true },
      winner_2_name: { left: 210, top: 600, width: 540, height: 80,  fontSize: 28, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_2_team: { left: 770, top: 600, width: 210, height: 80,  fontSize: 22, color: "#F59E0B", align: "right",  shadow: false, visible: true },
      winner_3_pos:  { left: 100, top: 730, width: 90,  height: 80,  fontSize: 28, color: "#EC4899", align: "left",   shadow: false, visible: true },
      winner_3_name: { left: 210, top: 730, width: 540, height: 80,  fontSize: 28, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_3_team: { left: 770, top: 730, width: 210, height: 80,  fontSize: 22, color: "#F59E0B", align: "right",  shadow: false, visible: true },
      winner_4_pos:  { left: 100, top: 860, width: 90,  height: 80,  fontSize: 24, color: "#EC4899", align: "left",   shadow: false, visible: true },
      winner_4_name: { left: 210, top: 860, width: 540, height: 80,  fontSize: 24, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_4_team: { left: 770, top: 860, width: 210, height: 80,  fontSize: 18, color: "#F59E0B", align: "right",  shadow: false, visible: true },
      winner_5_pos:  { left: 100, top: 990, width: 90,  height: 80,  fontSize: 22, color: "#EC4899", align: "left",   shadow: false, visible: true },
      winner_5_name: { left: 210, top: 990, width: 540, height: 80,  fontSize: 22, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_5_team: { left: 770, top: 990, width: 210, height: 80,  fontSize: 16, color: "#F59E0B", align: "right",  shadow: false, visible: true },
      winner_6_pos:  { left: 100, top: 1120, width: 90,  height: 80,  fontSize: 20, color: "#EC4899", align: "left",   shadow: false, visible: true },
      winner_6_name: { left: 210, top: 1120, width: 540, height: 80,  fontSize: 20, color: "#111827", align: "left",   shadow: false, visible: true },
      winner_6_team: { left: 770, top: 1120, width: 210, height: 80,  fontSize: 14, color: "#F59E0B", align: "right",  shadow: false, visible: true }
    }
  }
];

const DEFAULT_RESULTS = [
  {
    id: "result-1",
    programName: "Classical Violin Symphony Solo",
    category: "Junior",
    winners: [
      { position: "01", name: "Audrey Hepburn", team: "Wandoor" },
      { position: "02", name: "Liam Henderson", team: "Emangad" },
      { position: "03", name: "Zoe Patel", team: "Kuttiyil" }
    ],
    created: "2026-05-24T18:30:00Z"
  },
  {
    id: "result-2",
    programName: "Contemporary Fusion Ballet",
    category: "High School",
    winners: [
      { position: "01", name: "Mikhail Baryshnikov", team: "Vaniyambalam" },
      { position: "01", name: "Natalia Makarova", team: "Old Vaniyambalam" },
      { position: "02", name: "Elena Rostova", team: "Thekkumpuram" }
    ],
    created: "2026-05-25T10:15:00Z"
  },
  {
    id: "result-3",
    programName: "Dynamic Canvas Oil Painting",
    category: "Higher Secondary",
    winners: [
      { position: "01", name: "Leonardo Da Vinci", team: "Koorad" },
      { position: "02", name: "Vincent Van Gogh", team: "Wandoor" },
      { position: "03", name: "Georgia O'Keeffe", team: "Emangad" }
    ],
    created: "2026-05-25T12:00:00Z"
  },
  {
    id: "result-4",
    programName: "Shakespearean Dramatic Soliloquy",
    category: "Senior",
    winners: [
      { position: "01", name: "Benedict Cumberbatch", team: "Kuttiyil" },
      { position: "02", name: "Viola Davis", team: "Thekkumpuram" },
      { position: "03", name: "Ian McKellen", team: "Vaniyambalam" }
    ],
    created: "2026-05-25T14:40:00Z"
  }
];

const db = {
  // --- UTILS ---
  isConfigured() {
    return supabase !== null;
  },

  showDbError(action, errorObj) {
    const msg = errorObj ? (errorObj.message || errorObj) : "Unknown error";
    console.error(`Database Error during ${action}:`, errorObj);
    
    // Check if DOM is loaded
    if (typeof document === 'undefined' || !document.body) return;
    
    let banner = document.getElementById("supabase-error-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "supabase-error-banner";
      banner.style = "background: #FEE2E2; color: #991B1B; padding: 12px 20px; border-bottom: 2px solid #FCA5A5; font-family: system-ui, sans-serif; font-size: 0.9rem; font-weight: 600; text-align: center; position: sticky; top: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; gap: 8px;";
      document.body.insertBefore(banner, document.body.firstChild);
    }
    banner.innerHTML = `⚠️ <strong>Database Error (${action}):</strong> ${msg} (Check your Supabase Dashboard or RLS Policies)`;
  },

  // --- RESULTS API ---
  async getResults() {
    if (!this.isConfigured()) {
      let results = localStorage.getItem(DB_PREFIX + "results");
      if (!results) {
        localStorage.setItem(DB_PREFIX + "results", JSON.stringify(DEFAULT_RESULTS));
        return DEFAULT_RESULTS;
      }
      const list = JSON.parse(results);
      list.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
      return list;
    }
    
    // Fetch results and join with placements
    const { data, error } = await supabase
      .from('results')
      .select(`
        id,
        programName:program_name,
        category,
        created:created_at,
        winners:placements (
          position,
          name,
          team
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      this.showDbError("fetching results", error);
      return [];
    }

    // Auto-seed mock results if database is completely empty
    if (!data || data.length === 0) {
      console.log("No results found in Supabase. Seeding default winners mock database...");
      for (const r of DEFAULT_RESULTS) {
        const { error: resErr } = await supabase.from('results').insert({
          id: r.id,
          program_name: r.programName,
          category: r.category
        });
        if (resErr) {
          console.error("Error seeding result:", resErr);
          continue;
        }
        const placements = r.winners.map(w => ({
          result_id: r.id,
          position: w.position,
          name: w.name,
          team: w.team
        }));
        await supabase.from('placements').insert(placements);
      }
      return DEFAULT_RESULTS;
    }

    // Sort placements by position inside each result for uniform standing lists
    if (data) {
      data.forEach(r => {
        if (r.winners) {
          r.winners.sort((a, b) => (a.position || "").localeCompare(b.position || ""));
        }
      });
    }

    return data || [];
  },

  async getResult(id) {
    if (!this.isConfigured()) {
      const results = await this.getResults();
      return results.find(r => r.id === id) || null;
    }

    const { data, error } = await supabase
      .from('results')
      .select(`
        id,
        programName:program_name,
        category,
        created:created_at,
        winners:placements (
          position,
          name,
          team
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching result:", error);
      return null;
    }

    if (data && data.winners) {
      data.winners.sort((a, b) => (a.position || "").localeCompare(b.position || ""));
    }

    return data;
  },

  async saveResult(resultData) {
    const id = resultData.id || "result_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    
    if (!this.isConfigured()) {
      const results = await this.getResults();
      
      const newResult = {
        ...resultData,
        id,
        created: resultData.created || new Date().toISOString()
      };
      
      const idx = results.findIndex(r => r.id === id);
      if (idx !== -1) {
        results[idx] = newResult;
      } else {
        results.push(newResult);
      }
      
      localStorage.setItem(DB_PREFIX + "results", JSON.stringify(results));
      return newResult;
    }

    // 1. Upsert into results table
    const resultRow = {
      id: id,
      program_name: resultData.programName,
      category: resultData.category
    };

    const { error: resultErr } = await supabase
      .from('results')
      .upsert(resultRow);

    if (resultErr) {
      this.showDbError("saving results table", resultErr);
      return null;
    }

    // 2. Clear existing placements for this result
    const { error: delErr } = await supabase
      .from('placements')
      .delete()
      .eq('result_id', id);

    if (delErr) {
      console.error("Error deleting placements:", delErr);
      return null;
    }

    // 3. Insert newly added placements
    const placements = (resultData.winners || []).map(w => ({
      result_id: id,
      position: w.position,
      name: w.name,
      team: w.team
    }));

    if (placements.length > 0) {
      const { error: insErr } = await supabase
        .from('placements')
        .insert(placements);

      if (insErr) {
        this.showDbError("inserting placements table", insErr);
        return null;
      }
    }

    return { ...resultData, id };
  },

  async deleteResult(id) {
    if (!this.isConfigured()) {
      let results = await this.getResults();
      results = results.filter(r => r.id !== id);
      localStorage.setItem(DB_PREFIX + "results", JSON.stringify(results));
      return true;
    }

    // Relational ON DELETE CASCADE automatically sweeps linked placements!
    const { error } = await supabase
      .from('results')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting result:", error);
      return false;
    }
    return true;
  },

  // --- TEMPLATES API ---
  async getTemplates() {
    if (!this.isConfigured()) {
      let templates = localStorage.getItem(DB_PREFIX + "templates");
      if (!templates) {
        localStorage.setItem(DB_PREFIX + "templates", JSON.stringify(DEFAULT_TEMPLATES));
        return DEFAULT_TEMPLATES;
      }
      return JSON.parse(templates);
    }

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      this.showDbError("fetching templates", error);
      return [];
    }

    // Auto-seed templates table if database is completely empty
    if (!data || data.length === 0) {
      console.log("No templates found in Supabase. Seeding default visual templates...");
      const { error: seedErr } = await supabase
        .from('templates')
        .insert(DEFAULT_TEMPLATES);

      if (seedErr) {
        console.error("Error seeding default templates:", seedErr);
        return [];
      }
      return DEFAULT_TEMPLATES;
    }

    return data || [];
  },

  async getTemplate(id) {
    if (!this.isConfigured()) {
      const templates = await this.getTemplates();
      return templates.find(t => t.id === id) || null;
    }

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching template:", error);
      return null;
    }
    return data;
  },

  async saveTemplate(templateData) {
    if (!this.isConfigured()) {
      const templates = await this.getTemplates();
      const idx = templates.findIndex(t => t.id === templateData.id);
      
      const cleanTemplate = {
        id: templateData.id,
        name: templateData.name,
        background: templateData.background,
        fields: templateData.fields
      };
      
      if (idx !== -1) {
        templates[idx] = cleanTemplate;
      } else {
        templates.push(cleanTemplate);
      }
      
      localStorage.setItem(DB_PREFIX + "templates", JSON.stringify(templates));
      return templateData;
    }

    // Strip created_at to avoid database overwrite constraints
    const cleanTemplate = {
      id: templateData.id,
      name: templateData.name,
      background: templateData.background,
      fields: templateData.fields
    };

    const { error } = await supabase
      .from('templates')
      .upsert(cleanTemplate);

    if (error) {
      this.showDbError("saving template", error);
      return null;
    }
    return templateData;
  },

  async deleteTemplate(id) {
    if (!this.isConfigured()) {
      let templates = await this.getTemplates();
      templates = templates.filter(t => t.id !== id);
      localStorage.setItem(DB_PREFIX + "templates", JSON.stringify(templates));
      return true;
    }

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting template:", error);
      return false;
    }
    return true;
  },

  // --- STORAGE IMAGE UPLOADS ---
  async uploadTemplateBackground(file, fileName) {
    if (!this.isConfigured()) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => {
          console.error("FileReader error:", err);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    const cleanName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { data, error } = await supabase
      .storage
      .from('template-backgrounds')
      .upload(cleanName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      this.showDbError("uploading template background to storage", error);
      return null;
    }

    // Resolve public URL for database storage
    const { data: urlData } = supabase
      .storage
      .from('template-backgrounds')
      .getPublicUrl(cleanName);

    return urlData ? urlData.publicUrl : null;
  },

  // --- SETTINGS API ---
  async getSettings() {
    let settings = localStorage.getItem(DB_PREFIX + "settings");
    if (!settings) {
      settings = {
        institutionName: "National Academy of Creative Arts",
        enableFirebasePlaceholder: false,
        theme: "light-premium"
      };
      localStorage.setItem(DB_PREFIX + "settings", JSON.stringify(settings));
      return settings;
    }
    return JSON.parse(settings);
  },

  async saveSettings(settingsData) {
    const current = await this.getSettings();
    localStorage.setItem(DB_PREFIX + "settings", JSON.stringify({ ...current, ...settingsData }));
    return true;
  },

  // --- DATABASE FACTORY RESET ---
  async resetToDefault() {
    if (!this.isConfigured()) {
      localStorage.removeItem(DB_PREFIX + "results");
      localStorage.removeItem(DB_PREFIX + "templates");
      localStorage.removeItem(DB_PREFIX + "settings");
      return true;
    }

    // 1. Wipe out tables using clean delete operators
    await supabase.from('placements').delete().neq('result_id', 'dummy');
    await supabase.from('results').delete().neq('id', 'dummy');
    await supabase.from('templates').delete().neq('id', 'dummy');

    // 2. Re-seed default layouts
    const { error: tempErr } = await supabase.from('templates').insert(DEFAULT_TEMPLATES);
    if (tempErr) console.error("Error seeding templates:", tempErr);

    // 3. Re-seed default mock results
    for (const r of DEFAULT_RESULTS) {
      const { error: resErr } = await supabase.from('results').insert({
        id: r.id,
        program_name: r.programName,
        category: r.category
      });
      if (resErr) {
        console.error("Error seeding result:", resErr);
        continue;
      }
      const placements = r.winners.map(w => ({
        result_id: r.id,
        position: w.position,
        name: w.name,
        team: w.team
      }));
      await supabase.from('placements').insert(placements);
    }

    return true;
  }
};

// Expose credentials configurations
const { createClient } = window.supabase || {};
let supabase = null;

if (window.supabase && window.ENV && window.ENV.SUPABASE_URL && window.ENV.SUPABASE_ANON_KEY) {
  supabase = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
} else {
  console.warn("Supabase credentials missing! Please configure js/config.js");
}

// Export window namespace
window.db = db;
