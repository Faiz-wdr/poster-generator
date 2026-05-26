import { useState, useEffect } from 'react';
import { getSettings, saveSettings, resetToDefault } from '../../lib/db';
import { School, CheckCircle, Save, AlertTriangle, RotateCcw } from 'lucide-react';

export default function Settings() {
  const [institutionName, setInstitutionName] = useState('');
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setInstitutionName(s.institutionName || '');
  }, []);

  const handleSave = () => {
    saveSettings({ institutionName });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently wipe all results, templates, and uploaded backgrounds, then restore defaults. Proceed?')) return;
    setResetting(true);
    await resetToDefault();
    setResetting(false);
    alert('Database successfully restored to pristine seed configuration!');
    window.location.reload();
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure your platform preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Institution Settings */}
        <div className="card-form">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <School size={20} style={{ color: 'var(--primary)' }} />
            <span>Institution Info</span>
          </h3>
          <div className="form-group">
            <label htmlFor="settings-institution">Institution / Event Name</label>
            <input
              id="settings-institution"
              type="text"
              value={institutionName}
              onChange={e => setInstitutionName(e.target.value)}
              placeholder="e.g. Wandoor Sector Sahityotsav"
            />
          </div>
          {saved && (
            <p style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} />
              <span>Settings saved!</span>
            </p>
          )}
          <button className="btn btn-primary" id="btn-save-settings" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleSave}>
            <Save size={18} /> Save Settings
          </button>
        </div>

        {/* Danger Zone */}
        <div className="card-form" style={{ borderColor: '#FCA5A5' }}>
          <h3 style={{ marginBottom: 8, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} />
            <span>Danger Zone</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
            Factory reset wipes <strong>all results, templates, and uploaded backgrounds</strong> and restores the default seed data. This action <strong>cannot be undone</strong>.
          </p>
          <button
            className="btn"
            style={{ background: '#DC2626', color: 'white', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            id="btn-factory-reset"
            onClick={handleReset}
            disabled={resetting}
          >
            {resetting ? (
              <span>Resetting…</span>
            ) : (
              <>
                <RotateCcw size={18} />
                <span>Factory Reset Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
