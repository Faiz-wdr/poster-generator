import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../lib/db';
import { Save, Plus, Trash2, Trophy } from 'lucide-react';

export default function TeamPoints({ isExpired, clientId }) {
  const [teams, setTeams] = useState([]);
  const [teamPoints, setTeamPoints] = useState([]);
  const [afterResults, setAfterResults] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const s = await getSettings(clientId);
      const settingsTeams = Array.isArray(s?.teams) ? s.teams : [];
      const existingPoints = Array.isArray(s?.teamPoints) ? s.teamPoints : [];
      const afterRes = s?.teamPointsAfterResults || 0;

      setTeams(settingsTeams);
      setAfterResults(afterRes);

      // Merge: ensure every team in settings has an entry, preserve existing points
      const merged = settingsTeams.map(tName => {
        const existing = existingPoints.find(tp => tp.name === tName);
        return { name: tName, points: existing ? existing.points : 0 };
      });
      // Also keep any points for teams not currently in settings list (in case teams were removed)
      existingPoints.forEach(tp => {
        if (!merged.find(m => m.name === tp.name)) {
          merged.push(tp);
        }
      });
      setTeamPoints(merged);
      setLoading(false);
    }
    load();
  }, [clientId]);

  const updatePoints = (index, value) => {
    const numVal = parseInt(value) || 0;
    setTeamPoints(prev => prev.map((tp, i) => i === index ? { ...tp, points: numVal } : tp));
  };

  const addCustomTeam = () => {
    const name = prompt('Enter team name:');
    if (!name || !name.trim()) return;
    if (teamPoints.find(tp => tp.name === name.trim())) {
      alert('Team already exists.');
      return;
    }
    setTeamPoints(prev => [...prev, { name: name.trim(), points: 0 }]);
  };

  const removeTeam = (index) => {
    if (!window.confirm(`Remove "${teamPoints[index].name}" from points table?`)) return;
    setTeamPoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    setSaving(true);
    setSavedMsg('');

    // Sort by points descending before saving
    const sorted = [...teamPoints].sort((a, b) => b.points - a.points);

    const ok = await saveSettings(clientId, {
      teamPoints: sorted,
      teamPointsAfterResults: afterResults,
    });

    setSaving(false);
    if (ok) {
      setTeamPoints(sorted);
      setSavedMsg('Team points saved successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } else {
      alert('Failed to save team points.');
    }
  };

  // Sort display by points descending
  const sortedDisplay = [...teamPoints].sort((a, b) => b.points - a.points);

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)', fontWeight: 600, padding: 32 }}>Loading team points…</p>;
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Team Points</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manually enter and update team point standings for the public leaderboard.</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={handleSave}
          disabled={isExpired || saving}
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save Points'}
        </button>
      </div>

      {savedMsg && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', marginBottom: 20, border: '1px solid #A7F3D0' }}>
          ✓ {savedMsg}
        </div>
      )}

      {/* After Results Counter */}
      <div className="card-form" style={{ marginBottom: 24, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy size={20} style={{ color: 'var(--primary)' }} />
            <label style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
              After how many results:
            </label>
          </div>
          <input
            type="number"
            min="0"
            value={afterResults}
            onChange={e => setAfterResults(parseInt(e.target.value) || 0)}
            style={{ width: 100, padding: '8px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}
          />
          <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.88rem' }}>
            (Displayed as "After #{afterResults} Results" on the public site)
          </span>
        </div>
      </div>

      {/* Team Points Table */}
      <div className="card-form" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            Team Standings ({teamPoints.length} teams)
          </h3>
          <button
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={addCustomTeam}
            disabled={isExpired}
          >
            <Plus size={14} /> Add Team
          </button>
        </div>

        {teamPoints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
            <p style={{ fontWeight: 700, marginBottom: 8, color: '#0F172A' }}>No teams configured.</p>
            <p style={{ fontSize: '0.9rem' }}>Add teams in <strong>Settings → Teams</strong> first, or click "Add Team" above.</p>
          </div>
        ) : (
          <div className="published-list-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Team Name</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Points</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedDisplay.map((tp, sortedIdx) => {
                  const originalIdx = teamPoints.findIndex(t => t.name === tp.name);
                  return (
                    <tr key={tp.name}>
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        #{sortedIdx + 1}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>
                        {tp.name}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          value={tp.points}
                          onChange={e => updatePoints(originalIdx, e.target.value)}
                          disabled={isExpired}
                          style={{
                            width: 80,
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: '2px solid #DDD6FE',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            textAlign: 'center',
                            color: 'var(--primary)',
                            background: '#F5F3FF'
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => removeTeam(originalIdx)}
                          disabled={isExpired}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4
                          }}
                          title="Remove team"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
