import { useState, useEffect } from 'react';
import { getSettings, saveSettings, resetToDefault, uploadClientLogo, getClients } from '../../lib/db';
import { applyClientTheme } from '../../lib/theme';
import { School, CheckCircle, Save, AlertTriangle, RotateCcw, Palette, Image, ClipboardList, Plus, Trash2, Eye, EyeOff, Upload, Download } from 'lucide-react';

export default function Settings({ isExpired, clientId }) {
  const [orgName, setOrgName] = useState('');
  const [eventName, setEventName] = useState('');
  const [logo, setLogo] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [secondaryColor, setSecondaryColor] = useState('#0EA5E9');
  const [accentColor, setAccentColor] = useState('#F59E0B');
  const [slug, setSlug] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [existingSlugs, setExistingSlugs] = useState([]);

  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [newProgName, setNewProgName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);

  const [unifiedCsvError, setUnifiedCsvError] = useState('');
  const [unifiedCsvSuccess, setUnifiedCsvSuccess] = useState('');
  const [manualError, setManualError] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');

  const persistLists = async (newProgs, newCats, newTeams) => {
    try {
      await saveSettings(clientId, {
        programs: newProgs,
        categories: newCats,
        teams: newTeams
      });
    } catch (err) {
      console.error("Failed to auto-save lists", err);
    }
  };

  const handleAddProgram = (e) => {
    e.preventDefault();
    if (!newProgName.trim()) {
      setManualError('Please enter a program name.');
      setManualSuccess('');
      return;
    }
    const name = newProgName.trim();
    if (programs.some(p => typeof p === 'string' && p.toLowerCase() === name.toLowerCase())) {
      setManualError('This program already exists.');
      setManualSuccess('');
      return;
    }
    const updated = [...programs, name];
    setPrograms(updated);
    setNewProgName('');
    setManualSuccess('Program added and saved successfully!');
    setManualError('');
    persistLists(updated, categories, teams);
  };

  const handleDeleteProgram = (idxToDelete) => {
    const updated = programs.filter((_, idx) => idx !== idxToDelete);
    setPrograms(updated);
    setManualSuccess('Program removed and saved successfully!');
    setManualError('');
    persistLists(updated, categories, teams);
  };

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setManualError('Please enter a team name.');
      setManualSuccess('');
      return;
    }
    const name = newTeamName.trim();
    if (teams.some(t => typeof t === 'string' && t.toLowerCase() === name.toLowerCase())) {
      setManualError('This team already exists.');
      setManualSuccess('');
      return;
    }
    const updated = [...teams, name];
    setTeams(updated);
    setNewTeamName('');
    setManualSuccess('Team added and saved successfully!');
    setManualError('');
    persistLists(programs, categories, updated);
  };

  const handleDeleteTeam = (idxToDelete) => {
    const updated = teams.filter((_, idx) => idx !== idxToDelete);
    setTeams(updated);
    setManualSuccess('Team removed and saved successfully!');
    setManualError('');
    persistLists(programs, categories, updated);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setManualError('Please enter a category name.');
      setManualSuccess('');
      return;
    }
    const name = newCatName.trim();
    if (categories.some(c => typeof c === 'string' && c.toLowerCase() === name.toLowerCase())) {
      setManualError('This category already exists.');
      setManualSuccess('');
      return;
    }
    const updated = [...categories, name];
    setCategories(updated);
    setNewCatName('');
    setManualSuccess('Category added and saved successfully!');
    setManualError('');
    persistLists(programs, updated, teams);
  };

  const handleDeleteCategory = (idxToDelete) => {
    const updated = categories.filter((_, idx) => idx !== idxToDelete);
    setCategories(updated);
    setManualSuccess('Category removed and saved successfully!');
    setManualError('');
    persistLists(programs, updated, teams);
  };

  useEffect(() => {
    async function load() {
      const s = await getSettings(clientId);
      setOrgName(s.organizationName || '');
      setEventName(s.eventName || '');
      setLogo(s.logo || '');
      setPrimaryColor(s.primaryColor || '#7C3AED');
      setSecondaryColor(s.secondaryColor || '#0EA5E9');
      setAccentColor(s.accentColor || '#F59E0B');
      setSlug(s.slug || '');
      setAdminPassword(s.adminPassword || '');
      
      const rawProgs = s.programs || [];
      const cleanProgs = rawProgs.map(p => typeof p === 'object' ? p.name : p);
      setPrograms(cleanProgs);
      setCategories(s.categories || []);
      setTeams(s.teams || []);

      // Load all client slugs to check for collisions
      try {
        const allClients = await getClients();
        setExistingSlugs(Array.isArray(allClients) ? allClients.map(c => ({ id: c.id, slug: c.slug })) : []);
      } catch (err) {
        console.error("Failed to load client slugs", err);
      }
    }
    load();
  }, [clientId]);

  const handleColorTextChange = (setter, val) => {
    let formatted = val.trim();
    if (formatted && !formatted.startsWith('#') && formatted.length <= 6) {
      formatted = '#' + formatted;
    }
    setter(formatted);
  };

  const handleSave = async () => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    if (!orgName.trim() || !eventName.trim()) { alert('Please enter both organization and event names.'); return; }
    if (!slug.trim()) { alert('Please enter a username / event slug.'); return; }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    const isTaken = cleanSlug && existingSlugs.some(item => item.slug === cleanSlug && item.id !== clientId);
    if (isTaken) {
      alert('This Username / Slug is already taken by another event.');
      return;
    }

    const ok = await saveSettings(clientId, {
      organizationName: orgName.trim(),
      eventName: eventName.trim(),
      logo: logo.trim(),
      primaryColor,
      secondaryColor,
      accentColor,
      slug: cleanSlug,
      adminPassword: adminPassword.trim(),
      programs,
      categories,
      teams,
    });

    if (ok) {
      setSaved(true);
      // Update session storage details
      sessionStorage.setItem('client_slug', cleanSlug);
      // Instantly apply color re-theming live in the dashboard!
      applyClientTheme({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor
      });
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Failed to save settings.');
    }
  };

  const handleReset = async () => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    if (!window.confirm('⚠️ WARNING: This will permanently wipe all results and templates for this event. Do you wish to proceed?')) return;
    setResetting(true);
    const ok = await resetToDefault(clientId);
    setResetting(false);
    if (ok) {
      alert('Database successfully reset! All results and templates for this event have been deleted.');
      window.location.reload();
    } else {
      alert('Failed to reset database.');
    }
  };

  const handleUnifiedCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUnifiedCsvError('');
    setUnifiedCsvSuccess('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseUnifiedCSV(text);
      if (parsed.error) {
        setUnifiedCsvError(parsed.error);
      } else {
        setPrograms(parsed.programs);
        setCategories(parsed.categories);
        setTeams(parsed.teams);
        setUnifiedCsvSuccess(`Successfully loaded and saved ${parsed.programs.length} programs, ${parsed.categories.length} categories, and ${parsed.teams.length} teams!`);
        persistLists(parsed.programs, parsed.categories, parsed.teams);
      }
    };
    reader.onerror = () => {
      setUnifiedCsvError('Failed to read the CSV file.');
    };
    reader.readAsText(file);
  };

  const getSampleUnifiedCSVUrl = () => {
    const csvContent = "Program Name,Category,Team Name\nClassical Violin Solo,Junior,Emangad\nContemporary fusion dance,High School,Koorad\nPencil Drawing,Upper Primary,Wandoor\nClassical Music Vocal,Senior,Vaniyambalam\n,,Kuttiyil\n,,Thekkumpuram\n,,Kokkadankunnu";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  };

  const parseUnifiedCSV = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0 || !lines[0].trim()) {
      return { programs: [], categories: [], teams: [], error: 'Empty file' };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const programIdx = headers.findIndex(h => h.includes('program'));
    const categoryIdx = headers.findIndex(h => h.includes('category'));
    const teamIdx = headers.findIndex(h => h.includes('team'));

    if (programIdx === -1 && categoryIdx === -1 && teamIdx === -1) {
      return { 
        programs: [], 
        categories: [], 
        teams: [], 
        error: 'CSV must contain at least one column of "Program Name", "Category", or "Team Name".' 
      };
    }

    const programsSet = new Set();
    const categoriesSet = new Set();
    const teamsSet = new Set();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let row = [];
      let inQuotes = false;
      let currentToken = '';
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentToken.trim().replace(/^["']|["']$/g, ''));
          currentToken = '';
        } else {
          currentToken += char;
        }
      }
      row.push(currentToken.trim().replace(/^["']|["']$/g, ''));

      if (programIdx !== -1 && row[programIdx]) {
        const val = row[programIdx].trim();
        if (val) programsSet.add(val);
      }
      if (categoryIdx !== -1 && row[categoryIdx]) {
        const val = row[categoryIdx].trim();
        if (val) categoriesSet.add(val);
      }
      if (teamIdx !== -1 && row[teamIdx]) {
        const val = row[teamIdx].trim();
        if (val) teamsSet.add(val);
      }
    }

    return {
      programs: Array.from(programsSet).sort(),
      categories: Array.from(categoriesSet).sort(),
      teams: Array.from(teamsSet).sort(),
      error: null
    };
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Program Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure event details, brand colors, programs, and categories.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Branding & Info Settings */}
        <div className="card-form">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <School size={20} style={{ color: 'var(--primary)' }} />
            <span>Organization &amp; Event Details</span>
          </h3>
          
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="settings-organization">Organization Name *</label>
            <input
              id="settings-organization"
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="e.g. Wandoor Arts Committee"
              disabled={isExpired}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="settings-event">Event Name *</label>
            <input
              id="settings-event"
              type="text"
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="e.g. Sahityotsav 2026"
              disabled={isExpired}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="settings-slug">Login Username / URL Slug *</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', padding: '0 8px', background: '#E2E8F0', height: 46, borderRadius: '10px 0 0 10px', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRight: 'none', fontSize: '0.85rem' }}>/event/</span>
              <input
                id="settings-slug"
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                placeholder="e.g. wandoor-sahityotsav-2026"
                disabled={isExpired}
                required
                style={{ borderRadius: '0 10px 10px 0' }}
              />
            </div>
            {slug.trim() && existingSlugs.some(item => item.slug === slug.trim().toLowerCase() && item.id !== clientId) && (
              <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4, fontWeight: 700 }}>
                ⚠️ This Username / Slug is already taken by another event.
              </p>
            )}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Changing this updates both your login username and your public page web address.
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="settings-password">Login Password *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="settings-password"
                type={showSettingsPassword ? "text" : "password"}
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Enter new dashboard password"
                disabled={isExpired}
                required
                style={{ width: '100%', paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showSettingsPassword ? "Hide password" : "Show password"}
              >
                {showSettingsPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
              Logo Image *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-page)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              {logo && (logo.startsWith('http') || logo.startsWith('data:image')) ? (
                <img 
                  src={logo} 
                  alt="Logo Preview" 
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-color)' }} 
                />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 12, background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid var(--border-color)' }}>
                  {logo || '🏆'}
                </div>
              )}
              <div style={{ flexGrow: 1 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingLogo(true);
                    try {
                      const url = await uploadClientLogo(file, file.name);
                      if (url) {
                        setLogo(url);
                      } else {
                        alert('Failed to upload logo.');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Error uploading logo.');
                    } finally {
                      setUploadingLogo(false);
                    }
                  }}
                  disabled={isExpired}
                  style={{ fontSize: '0.85rem' }} 
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>
                  💡 Recommended logo in 500*500 pixel. PNG/JPG format.
                </p>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
            <Palette size={20} style={{ color: 'var(--secondary)' }} />
            <span>Custom Branding Colors</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div className="form-group">
              <label>Primary Theme</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={primaryColor.startsWith('#') && primaryColor.length === 7 ? primaryColor : '#000000'}
                  onChange={e => setPrimaryColor(e.target.value)}
                  disabled={isExpired}
                  style={{ padding: 0, width: 42, height: 42, cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: 8 }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => handleColorTextChange(setPrimaryColor, e.target.value)}
                  placeholder="#7C3AED"
                  disabled={isExpired}
                  maxLength={7}
                  style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8 }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Secondary Theme</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={secondaryColor.startsWith('#') && secondaryColor.length === 7 ? secondaryColor : '#000000'}
                  onChange={e => setSecondaryColor(e.target.value)}
                  disabled={isExpired}
                  style={{ padding: 0, width: 42, height: 42, cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: 8 }}
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={e => handleColorTextChange(setSecondaryColor, e.target.value)}
                  placeholder="#0EA5E9"
                  disabled={isExpired}
                  maxLength={7}
                  style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8 }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Accent</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={accentColor.startsWith('#') && accentColor.length === 7 ? accentColor : '#000000'}
                  onChange={e => setAccentColor(e.target.value)}
                  disabled={isExpired}
                  style={{ padding: 0, width: 42, height: 42, cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: 8 }}
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={e => handleColorTextChange(setAccentColor, e.target.value)}
                  placeholder="#F59E0B"
                  disabled={isExpired}
                  maxLength={7}
                  style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8 }}
                />
              </div>
            </div>
          </div>

          {saved && (
            <p style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} />
              <span>Settings updated successfully!</span>
            </p>
          )}

          <button
            className="btn btn-primary"
            id="btn-save-settings"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={handleSave}
            disabled={isExpired || uploadingLogo || (slug.trim() && existingSlugs.some(item => item.slug === slug.trim().toLowerCase() && item.id !== clientId))}
          >
            <Save size={18} /> {uploadingLogo ? 'Uploading logo...' : 'Save Program Settings'}
          </button>
        </div>

        {/* Right side: Categories, Programs, Teams & Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Card 1: Add Manually */}
          <div className="card-form">
            <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={20} style={{ color: 'var(--primary)' }} />
              <span>Add Manually</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              Add a new category, program name, or team name manually to the lists.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Add Category */}
              <div>
                <label htmlFor="manual-cat-input" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Add Category</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    id="manual-cat-input"
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="e.g. Junior, Senior"
                    disabled={isExpired}
                    style={{ padding: '8px 12px', fontSize: '0.85rem', height: 38, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={isExpired}
                    className="btn btn-primary"
                    style={{ height: 38, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Add Program */}
              <div>
                <label htmlFor="manual-prog-input" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Add Program Name</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    id="manual-prog-input"
                    type="text"
                    value={newProgName}
                    onChange={e => setNewProgName(e.target.value)}
                    placeholder="e.g. Classical Violin Solo"
                    disabled={isExpired}
                    style={{ padding: '8px 12px', fontSize: '0.85rem', height: 38, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddProgram}
                    disabled={isExpired}
                    className="btn btn-primary"
                    style={{ height: 38, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Add Team */}
              <div>
                <label htmlFor="manual-team-input" style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Add Team Name</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    id="manual-team-input"
                    type="text"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    placeholder="e.g. Red House, Blue House"
                    disabled={isExpired}
                    style={{ padding: '8px 12px', fontSize: '0.85rem', height: 38, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTeam}
                    disabled={isExpired}
                    className="btn btn-primary"
                    style={{ height: 38, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {manualError && <p style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, marginTop: 12 }}>❌ {manualError}</p>}
            {manualSuccess && <p style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700, marginTop: 12 }}>{manualSuccess}</p>}
          </div>

          {/* Card 2: Bulk Upload */}
          <div className="card-form">
            <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Upload size={20} style={{ color: 'var(--primary)' }} />
              <span>Bulk Upload via CSV</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              Upload your entire event setup using a single CSV file. 
            </p>

            <div style={{ background: 'var(--bg-page)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>CSV Format Rules:</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
                The CSV file should contain at least one of these columns as headers: <strong>Program Name</strong>, <strong>Category</strong>, <strong>Team Name</strong>. Rows will populate the respective active lists.
              </p>
              <a 
                href={getSampleUnifiedCSVUrl()} 
                download="event_settings_template.csv" 
                style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Download size={13} />
                <span>Download Unified CSV Template</span>
              </a>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label htmlFor="csv-unified-upload-input" style={{ display: 'block', marginBottom: 8, fontSize: '0.8rem', fontWeight: 600 }}>Select CSV File</label>
              <input 
                id="csv-unified-upload-input"
                type="file" 
                accept=".csv,.txt" 
                onChange={handleUnifiedCSVUpload}
                disabled={isExpired}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
            </div>

            {unifiedCsvError && <p style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, marginTop: 12 }}>❌ {unifiedCsvError}</p>}
            {unifiedCsvSuccess && <p style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700, marginTop: 12 }}>{unifiedCsvSuccess}</p>}
          </div>

          {/* Card 3: Active Lists Grid (3 columns side-by-side) */}
          <div className="card-form" style={{ maxWidth: '100%' }}>
            <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClipboardList size={20} style={{ color: 'var(--primary)' }} />
              <span>Active Event Lists</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              Review or delete loaded data categories, program/contest names, and active teams.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {/* Categories Column */}
              <div style={{ background: 'var(--bg-page)', padding: 12, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Categories</span>
                  <span style={{ background: 'var(--primary-light, #DDD6FE)', color: 'var(--primary)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    {categories.length}
                  </span>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto', borderRadius: 8, background: 'white', border: '1px solid var(--border-color)' }}>
                  {categories.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: 12, textAlign: 'center' }}>No categories</p>
                  ) : (
                    <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                      <tbody>
                        {categories.map((c, idx) => (
                          <tr key={idx} style={{ borderBottom: idx < categories.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                            <td style={{ padding: '6px 10px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{c}</td>
                            <td style={{ padding: '6px 10px', width: 30, textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(idx)}
                                disabled={isExpired}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 2 }}
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Programs Column */}
              <div style={{ background: 'var(--bg-page)', padding: 12, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Programs</span>
                  <span style={{ background: 'var(--primary-light, #DDD6FE)', color: 'var(--primary)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    {programs.length}
                  </span>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto', borderRadius: 8, background: 'white', border: '1px solid var(--border-color)' }}>
                  {programs.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: 12, textAlign: 'center' }}>No programs</p>
                  ) : (
                    <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                      <tbody>
                        {programs.map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: idx < programs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                            <td style={{ padding: '6px 10px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{p}</td>
                            <td style={{ padding: '6px 10px', width: 30, textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteProgram(idx)}
                                disabled={isExpired}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 2 }}
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Teams Column */}
              <div style={{ background: 'var(--bg-page)', padding: 12, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Teams</span>
                  <span style={{ background: 'var(--primary-light, #DDD6FE)', color: 'var(--primary)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    {teams.length}
                  </span>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto', borderRadius: 8, background: 'white', border: '1px solid var(--border-color)' }}>
                  {teams.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: 12, textAlign: 'center' }}>No teams</p>
                  ) : (
                    <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                      <tbody>
                        {teams.map((t, idx) => (
                          <tr key={idx} style={{ borderBottom: idx < teams.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                            <td style={{ padding: '6px 10px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{t}</td>
                            <td style={{ padding: '6px 10px', width: 30, textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteTeam(idx)}
                                disabled={isExpired}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 2 }}
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card-form" style={{ borderColor: '#FCA5A5' }}>
            <h3 style={{ marginBottom: 8, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={20} />
              <span>Danger Zone</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Wiping event database clears <strong>all published result standings and template modifications</strong> scoped to this client event. This action <strong>cannot be undone</strong>.
            </p>
            <button
              className="btn"
              style={{ background: '#DC2626', color: 'white', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              id="btn-factory-reset"
              onClick={handleReset}
              disabled={isExpired || resetting}
            >
              {resetting ? (
                <span>Resetting records…</span>
              ) : (
                <>
                  <RotateCcw size={18} />
                  <span>Reset Event Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
