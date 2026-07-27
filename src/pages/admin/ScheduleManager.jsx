import { useState, useEffect } from 'react';
import { getSchedule, saveSchedule } from '../../lib/db';
import { Calendar, Clock, Plus, Upload, Trash2, Pencil, FileSpreadsheet, Info, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function ScheduleManager({ isExpired, clientId }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCsvInfo, setShowCsvInfo] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 10:30 AM');
  const [event, setEvent] = useState('');
  const [stage, setStage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getSchedule(clientId);
      setSchedule(data || []);
      setLoading(false);
    }
    load();
  }, [clientId]);

  const resetForm = () => {
    setEditingId(null);
    setDate('');
    setTime('10:00 AM - 10:30 AM');
    setEvent('');
    setStage('');
    setShowAddForm(false);
  };

  const handleStartEdit = (item) => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    setEditingId(item.id);
    setDate(item.date || '');
    setTime(item.time || '');
    setEvent(item.event || '');
    setStage(item.stage || '');
    setShowAddForm(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    if (!event.trim()) return;

    const activeDate = date || new Date().toISOString().split('T')[0];

    let updated;
    if (editingId) {
      // Update existing schedule item
      updated = schedule.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            date: activeDate,
            time: time.trim(),
            event: event.trim(),
            stage: stage.trim()
          };
        }
        return item;
      });
    } else {
      // Add new schedule item
      const newItem = {
        id: Date.now().toString(),
        date: activeDate,
        time: time.trim(),
        event: event.trim(),
        stage: stage.trim()
      };
      updated = [...schedule, newItem];
    }

    setSchedule(updated);
    await saveSchedule(clientId, updated);
    resetForm();
  };

  const handleDeleteItem = async (id) => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    if (!window.confirm('Remove this schedule item?')) return;
    const updated = schedule.filter(item => item.id !== id);
    setSchedule(updated);
    await saveSchedule(clientId, updated);
  };

  const handleClearSchedule = async () => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    if (!window.confirm('Clear ALL schedule items? This cannot be undone.')) return;
    setSchedule([]);
    await saveSchedule(clientId, []);
  };

  // CSV File Import Handler
  const handleCsvUpload = async (e) => {
    if (isExpired) { alert('Action locked: Event license expired.'); return; }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({ type: 'loading', message: 'Parsing CSV schedule file…' });

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result || '';
        const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(Boolean);

        if (lines.length < 2) {
          setUploadStatus({ type: 'error', message: 'CSV file is empty or missing headers.' });
          return;
        }

        // Parse Header line
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

        const dateIdx = headers.findIndex(h => h.includes('date'));
        const timeIdx = headers.findIndex(h => h.includes('time'));
        const eventIdx = headers.findIndex(h => h.includes('event') || h.includes('program') || h.includes('title'));
        const stageIdx = headers.findIndex(h => h.includes('stage') || h.includes('venue') || h.includes('location'));

        if (eventIdx === -1) {
          setUploadStatus({
            type: 'error',
            message: 'Invalid CSV format. Missing required "Event" column header.'
          });
          return;
        }

        const parsedItems = [];
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          if (!cols || cols.length === 0) continue;

          const eventVal = cols[eventIdx] || '';
          if (!eventVal.trim()) continue;

          parsedItems.push({
            id: `${Date.now()}_${i}`,
            date: dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx].trim() : todayStr,
            time: timeIdx !== -1 && cols[timeIdx] ? cols[timeIdx].trim() : '10:00 AM - 10:30 AM',
            event: eventVal.trim(),
            stage: stageIdx !== -1 && cols[stageIdx] ? cols[stageIdx].trim() : ''
          });
        }

        if (parsedItems.length === 0) {
          setUploadStatus({ type: 'error', message: 'No valid schedule rows found in CSV file.' });
          return;
        }

        const merged = [...schedule, ...parsedItems];
        setSchedule(merged);
        await saveSchedule(clientId, merged);

        setUploadStatus({
          type: 'success',
          message: `Successfully imported ${parsedItems.length} schedule item${parsedItems.length !== 1 ? 's' : ''}!`
        });
      } catch (err) {
        setUploadStatus({ type: 'error', message: `Failed to parse CSV file: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  // Helper to parse CSV line handling quotes
  const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''));
    return values;
  };

  // Download Sample CSV template
  const handleDownloadSampleCsv = () => {
    const csvContent = [
      'Date,Time,Event,Stage',
      '2027-01-01,09:30 AM - 10:00 AM,Inauguration Ceremony,Main Auditorium',
      '2027-01-01,10:00 AM - 11:30 AM,Classical Dance (Lower Primary),Stage A',
      '2027-01-01,11:30 AM - 01:00 PM,Light Music (High School),Stage B',
      '2027-01-02,09:30 AM - 11:00 AM,Mime Competition,Stage A',
      '2027-01-02,11:00 AM - 12:30 PM,Folk Dance (Higher Secondary),Main Auditorium'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_event_schedule.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Group schedule items by Date
  const groupedSchedule = schedule.reduce((acc, item) => {
    const key = item.date || 'Scheduled Date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Event Schedule Manager</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage competition timetables, dates, and stage slots for attendees.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            onClick={() => setShowCsvInfo(!showCsvInfo)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Info size={16} /> CSV Format Guide
          </button>

          <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isExpired ? 'not-allowed' : 'pointer', margin: 0 }}>
            <Upload size={16} /> Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              disabled={isExpired}
              style={{ display: 'none' }}
            />
          </label>

          <button
            className="btn btn-primary"
            onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
            disabled={isExpired}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Add Slot
          </button>
        </div>
      </div>

      {/* CSV Status Messages */}
      {uploadStatus && (
        <div style={{
          background: uploadStatus.type === 'success' ? '#D1FAE5' : uploadStatus.type === 'error' ? '#FEE2E2' : '#EFF6FF',
          color: uploadStatus.type === 'success' ? '#065F46' : uploadStatus.type === 'error' ? '#991B1B' : '#1E40AF',
          padding: '14px 20px', borderRadius: 12, marginBottom: 24, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {uploadStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{uploadStatus.message}</span>
          </div>
          <button onClick={() => setUploadStatus(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}>×</button>
        </div>
      )}

      {/* CSV Guidance Banner */}
      {showCsvInfo && (
        <div className="card-form" style={{ marginBottom: 28, background: '#F8FAFC', border: '1px solid #CBD5E1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <FileSpreadsheet size={24} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#0F172A', margin: 0 }}>CSV File Column Instructions</h3>
          </div>

          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: 16 }}>
            To bulk upload your event schedule, prepare a <strong>.CSV file</strong> with the following exact column headers:
          </p>

          <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 16, fontFamily: 'monospace', fontSize: '0.88rem' }}>
            <strong>Date, Time, Event, Stage</strong>
          </div>

          <table className="admin-table" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
            <thead>
              <tr>
                <th>Column</th>
                <th>Required</th>
                <th>Format Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>Date</code></td>
                <td>Optional (Default: Today)</td>
                <td><code>2027-01-01</code> or <code>Jan 1, 2027</code></td>
              </tr>
              <tr>
                <td><code>Time</code></td>
                <td>Optional</td>
                <td><code>10:00 AM - 10:30 AM</code></td>
              </tr>
              <tr>
                <td><code>Event</code></td>
                <td><strong>Required</strong></td>
                <td><code>Classical Dance (Lower Primary)</code></td>
              </tr>
              <tr>
                <td><code>Stage</code></td>
                <td>Optional</td>
                <td><code>Main Auditorium</code> or <code>Stage A</code></td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={handleDownloadSampleCsv}>
              Download Sample CSV File
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowCsvInfo(false)}>
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      {showAddForm && (
        <div className="card-form" style={{ marginBottom: 32, border: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
              {editingId ? '✏️ Edit Schedule Item' : '➕ Add Schedule Item'}
            </h3>
            <button className="btn btn-outline btn-sm" onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={14} /> Cancel
            </button>
          </div>

          <form onSubmit={handleSaveItem}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Time Slot *</label>
                <input
                  type="text"
                  placeholder="10:00 AM - 10:30 AM"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium"
                  value={stage}
                  onChange={e => setStage(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Event*</label>
              <input
                type="text"
                placeholder="e.g. Light Music Competition (High School)"
                value={event}
                onChange={e => setEvent(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                {editingId ? 'Update Schedule Item' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule Items Grouped View */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading schedule records…</p>
      ) : schedule.length === 0 ? (
        <div className="card-form" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
          <Calendar size={36} style={{ color: 'var(--border-color)', marginBottom: 12, margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: 6 }}>No Schedule Added Yet</h3>
          <p style={{ maxWidth: 460, margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Add competition time slots manually or upload a CSV file to display schedule tables on your event portal.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowAddForm(true); }} disabled={isExpired}>
              <Plus size={16} /> Add First Item
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowCsvInfo(true)}>
              <Info size={16} /> View CSV Guide
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Total {schedule.length} schedule slot{schedule.length !== 1 ? 's' : ''} across {Object.keys(groupedSchedule).length} date{Object.keys(groupedSchedule).length !== 1 ? 's' : ''}
            </div>
            <button className="btn btn-outline btn-sm" style={{ color: '#EF4444', borderColor: '#FEE2E2' }} onClick={handleClearSchedule} disabled={isExpired}>
              <Trash2 size={14} /> Clear All
            </button>
          </div>

          {Object.entries(groupedSchedule).map(([dateGroup, items]) => (
            <div key={dateGroup} className="card-form" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: '#F8FAFC', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#0F172A', margin: 0 }}>Date: {dateGroup}</h3>
              </div>

              <div className="published-list-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '220px' }}>Time</th>
                      <th>Event / Program</th>
                      <th style={{ width: '200px' }}>Stage / Venue</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                          {item.time}
                        </td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>
                          {item.event}
                        </td>
                        <td>
                          {item.stage ? (
                            <span className="badge" style={{ background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', fontSize: '0.75rem', borderRadius: '6px' }}>
                              {item.stage}
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px' }}
                              onClick={() => handleStartEdit(item)}
                              disabled={isExpired}
                              title="Edit item"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: '#EF4444', borderColor: '#FEE2E2', padding: '4px 8px' }}
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={isExpired}
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
