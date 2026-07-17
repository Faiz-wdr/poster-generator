import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults, getTemplates } from '../../lib/db';
import { ClipboardList, Trophy, Palette, Pencil, Plus } from 'lucide-react';

export default function Dashboard({ isExpired, clientId }) {
  const [results, setResults] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [r, t] = await Promise.all([
        getResults(clientId),
        getTemplates(clientId)
      ]);
      setResults(r);
      setTemplates(t);
      setLoading(false);
    }
    load();
  }, [clientId]);

  const totalWinners = results.reduce((acc, r) => acc + (r.winners?.length || 0), 0);
  const recent = results.slice(0, 5);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to your event coordinator control center.</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate('/admin/upload')}
          disabled={isExpired}
        >
          <Plus size={16} /> Publish New Result
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading statistics…</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20, marginBottom: 40 }}>
            {[
              { label: 'Total Published Results', value: results.length, icon: <ClipboardList size={24} />, color: 'var(--primary)' },
              { label: 'Total Winners Recorded', value: totalWinners, icon: <Trophy size={24} />, color: 'var(--accent)' },
              { label: 'Design Templates', value: templates.length, icon: <Palette size={24} />, color: 'var(--secondary)' },
            ].map(s => (
              <div key={s.label} className="bento-card">
                <div className="icon-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Results */}
          <div className="card-form">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Recent Announcements</h3>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/results')}>
                View All Records
              </button>
            </div>

            {recent.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>
                No results published yet.{' '}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/admin/upload')}
                  disabled={isExpired}
                >
                  Publish first result!
                </button>
              </p>
            ) : (
              <div className="published-list-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Category</th>
                      <th>Winners</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700 }}>
                          {r.resultNo && <span style={{ color: 'var(--primary)', marginRight: 8, fontStyle: 'normal' }}>#{r.resultNo}</span>}
                          {r.programName}
                        </td>
                        <td><span className="badge badge-primary">{r.category}</span></td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {r.winners?.length || 0} placements
                        </td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                              onClick={() => navigate(`/admin/upload?edit=${r.id}`)}
                            >
                              <Pencil size={14} /> {isExpired ? 'View' : 'Edit'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
