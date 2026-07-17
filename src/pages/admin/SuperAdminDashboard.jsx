import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getClients, saveClient, deleteClient, resetToDefault, getResults, uploadClientLogo } from '../../lib/db';
import { Plus, Users, Award, Download, Power, Calendar, Shield, Settings, Trash2, RotateCcw, AlertTriangle, FileText, CheckCircle, ExternalLink, Image } from 'lucide-react';

const renderLogo = (logoStr, size = '2.5rem', fontSize = '1.4rem', borderRadius = '12px') => {
  if (logoStr && (logoStr.startsWith('http') || logoStr.startsWith('data:image'))) {
    return (
      <img 
        src={logoStr} 
        alt="Logo" 
        style={{ width: size, height: size, objectFit: 'cover', borderRadius }} 
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius, fontSize,
      background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {logoStr || '🏆'}
    </div>
  );
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Dashboard Metrics
  const [totalResultsCount, setTotalResultsCount] = useState(0);

  // Client Onboarding Modal / Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  // Client Form State
  const [clientId, setClientId] = useState('');
  const [orgName, setOrgName] = useState('');
  const [eventName, setEventName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('🏆');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [secondaryColor, setSecondaryColor] = useState('#0EA5E9');
  const [accentColor, setAccentColor] = useState('#F59E0B');
  const [adminPassword, setAdminPassword] = useState('password');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expiryDays, setExpiryDays] = useState('30'); // Default expiry 30 days
  const [clientStatus, setClientStatus] = useState('active');

  // Verify Super Admin Login on Mount
  useEffect(() => {
    if (sessionStorage.getItem('super_admin_logged_in') !== 'true') {
      navigate('/sadmin');
    }
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);

    // Compute total results count across all clients
    let total = 0;
    for (const client of data) {
      const results = await getResults(client.id);
      total += results.length;
    }
    setTotalResultsCount(total);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('super_admin_logged_in');
    navigate('/sadmin');
  };

  const openNewClientWizard = () => {
    setClientId('');
    setOrgName('');
    setEventName('');
    setSlug('');
    setLogo('🏆');
    setPrimaryColor('#7C3AED');
    setSecondaryColor('#0EA5E9');
    setAccentColor('#F59E0B');
    setAdminPassword('password');
    setStartDate('');
    setEndDate('');
    setExpiryDays('30');
    setClientStatus('active');
    setSlugManuallyEdited(false);
    setWizardStep(1);
    setShowWizard(true);
  };

  const openEditClientWizard = (client) => {
    setClientId(client.id);
    setOrgName(client.organization_name);
    setEventName(client.event_name);
    setSlug(client.slug);
    setLogo(client.logo || '🏆');
    setPrimaryColor(client.primary_color || '#7C3AED');
    setSecondaryColor(client.secondary_color || '#0EA5E9');
    setAccentColor(client.accent_color || '#F59E0B');
    setAdminPassword(client.admin_password || 'password');
    setStartDate(client.start_date || '');
    setEndDate(client.end_date || '');
    setClientStatus(client.status || 'active');
    setSlugManuallyEdited(true);
    
    // Compute current remaining days from expiry_date
    const diffTime = new Date(client.expiry_date) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setExpiryDays(diffDays > 0 ? String(diffDays) : '0');

    setWizardStep(1);
    setShowWizard(true);
  };

  const handleSaveClient = async () => {
    if (!orgName.trim() || !eventName.trim() || !slug.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const isSlugTaken = slug.trim() && clients.some(c => c.slug === slug.trim().toLowerCase() && c.id !== clientId);
    if (isSlugTaken) {
      alert('This Username / Slug is already taken by another event.');
      return;
    }

    // Set expiry_date based on current time + expiryDays
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays || '30', 10));

    const saved = await saveClient({
      id: clientId || undefined,
      organization_name: orgName.trim(),
      event_name: eventName.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, ''),
      logo: logo.trim(),
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      admin_password: adminPassword.trim(),
      start_date: startDate || null,
      end_date: endDate || null,
      expiry_date: expiryDate.toISOString(),
      status: clientStatus,
    });

    if (saved) {
      setSuccessMsg(clientId ? 'Client details updated successfully!' : 'New Client onboarded successfully!');
      setShowWizard(false);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert('Failed to save client. Slug might be taken.');
    }
  };

  const handleDeleteClient = async (id, name) => {
    if (!window.confirm(`⚠️ DANGER: Permanent Delete Client "${name}"? This wipes all results & templates under this tenant.`)) return;
    const ok = await deleteClient(id);
    if (ok) {
      if (selectedClient?.id === id) setSelectedClient(null);
      await loadData();
    } else {
      alert('Failed to delete client.');
    }
  };

  const handleToggleSuspend = async (client) => {
    const nextStatus = client.status === 'active' ? 'suspended' : 'active';
    const saved = await saveClient({
      ...client,
      status: nextStatus
    });
    if (saved) {
      await loadData();
      if (selectedClient?.id === client.id) {
        setSelectedClient({ ...selectedClient, status: nextStatus });
      }
    }
  };

  const handleExtendExpiry = async (client) => {
    const daysStr = window.prompt("Extend license duration. Enter additional number of days:", "14");
    const days = parseInt(daysStr, 10);
    if (isNaN(days) || days <= 0) return;

    const currentExpiry = new Date(client.expiry_date);
    const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
    newExpiry.setDate(newExpiry.getDate() + days);

    const saved = await saveClient({
      ...client,
      expiry_date: newExpiry.toISOString()
    });

    if (saved) {
      alert(`License extended! New expiry: ${newExpiry.toLocaleDateString()}`);
      await loadData();
      if (selectedClient?.id === client.id) {
        setSelectedClient({ ...selectedClient, expiry_date: newExpiry.toISOString() });
      }
    }
  };

  const handleResetClientData = async (client) => {
    if (!window.confirm(`⚠️ WARNING: Permanently delete all results, templates, and placements for "${client.event_name}"? This restores default seed layouts.`)) return;
    const ok = await resetToDefault(client.id);
    if (ok) {
      alert('Event records wiped and reset.');
      await loadData();
    } else {
      alert('Failed to reset event data.');
    }
  };

  const totalActive = clients.filter(c => c.status === 'active' && new Date(c.expiry_date) > new Date()).length;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* Super Admin Top Header */}
      <header style={{ background: '#0F172A', color: 'white', padding: '16px 0', borderBottom: '1px solid #1E293B' }}>
        <div className="container nav-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="landing-logo-icon" style={{ background: 'linear-gradient(135deg, #0EA5E9, #0284C7)' }}>S</div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.02em' }}>ResultFlow Cloud</span>
              <span className="badge" style={{ background: '#38BDF8', color: '#0F172A', fontSize: '0.65rem', marginLeft: 8, padding: '3px 8px' }}>SUPER ADMIN</span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ color: '#94A3B8', borderColor: '#334155' }} onClick={handleLogout}>
            Logout Panel
          </button>
        </div>
      </header>

      <main className="container section-padding" style={{ paddingTop: 32 }}>
        {/* Banner messages */}
        {successMsg && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '14px 20px', borderRadius: 12, marginBottom: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 4 }}>Control Center</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage client tenants, subscription parameters, and global system health.</p>
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={openNewClientWizard}>
            <Plus size={18} /> Onboard New Tenant
          </button>
        </div>

        {/* Analytics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Total Clients', value: clients.length, icon: <Users size={22} />, color: '#7C3AED' },
            { label: 'Active Events', value: totalActive, icon: <Calendar size={22} />, color: '#10B981' },
            { label: 'Total Published Results', value: totalResultsCount, icon: <Award size={22} />, color: '#0EA5E9' },
            { label: 'Total Poster Downloads', value: totalResultsCount * 67, icon: <Download size={22} />, color: '#F59E0B' } // Simulated metric
          ].map(m => (
            <div key={m.label} className="bento-card" style={{ padding: 24 }}>
              <div className="icon-badge" style={{ color: m.color, background: `${m.color}15`, marginBottom: 16 }}>{m.icon}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>{m.value}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
          {/* Left: Client List */}
          <div className="card-form" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Event Clients List</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{clients.length} Total</span>
            </div>

            {loading ? (
              <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading client records…</p>
            ) : clients.length === 0 ? (
              <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No clients onboarded yet. Create your first client event!</p>
            ) : (
              <div className="published-list-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Organization / Event</th>
                      <th>Slug Page</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => {
                      const isExpired = new Date(c.expiry_date) <= new Date();
                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedClient(c)}
                          style={{ cursor: 'pointer', background: selectedClient?.id === c.id ? '#F1F5F9' : 'transparent' }}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {renderLogo(c.logo, '36px', '1.1rem', '8px')}
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.event_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.organization_name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <a
                              href={`/event/${c.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}
                            >
                              <span>/{c.slug}</span> <ExternalLink size={12} />
                            </a>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: isExpired ? '#EF4444' : 'var(--text-primary)', fontWeight: isExpired ? 700 : 500 }}>
                              {new Date(c.expiry_date).toLocaleDateString()}
                              {isExpired && ' (Expired)'}
                            </span>
                          </td>
                          <td>
                            <span className="badge" style={{
                              background: c.status === 'suspended' ? '#FEE2E2' : isExpired ? '#FEF3C7' : '#D1FAE5',
                              color: c.status === 'suspended' ? '#EF4444' : isExpired ? '#D97706' : '#10B981',
                              fontSize: '0.75rem', padding: '3px 8px'
                            }}>
                              {c.status === 'suspended' ? 'Suspended' : isExpired ? 'Expired' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns" onClick={e => e.stopPropagation()}>
                              <button className="btn btn-outline btn-sm" style={{ padding: '6px 10px' }} onClick={() => openEditClientWizard(c)}>
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Selected Client Details Panel */}
          <div>
            {!selectedClient ? (
              <div className="card-form" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 24px' }}>
                <Users size={32} style={{ color: 'var(--border-color)', marginBottom: 12, margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select a client from the table to view settings and manage event access.</p>
              </div>
            ) : (
              <div className="card-form" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Client header details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {renderLogo(selectedClient.logo, '56px', '1.8rem', '14px')}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', lineHeight: 1.2 }}>{selectedClient.event_name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>{selectedClient.organization_name}</p>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border-color)' }} />

                {/* Scope Theme Info */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branding Config</h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#F1F5F9', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedClient.primary_color }} />
                      Primary: {selectedClient.primary_color}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#F1F5F9', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedClient.secondary_color }} />
                      Secondary: {selectedClient.secondary_color}
                    </div>
                  </div>
                </div>

                {/* Scope Expiry Info */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subscription status</h4>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    Expiry Date: <span style={{ color: new Date(selectedClient.expiry_date) < new Date() ? '#EF4444' : 'inherit' }}>
                      {new Date(selectedClient.expiry_date).toLocaleDateString()} {new Date(selectedClient.expiry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Admin Password: <code>{selectedClient.admin_password}</code>
                  </p>
                </div>

                <div style={{ height: 1, background: 'var(--border-color)' }} />

                {/* Operations & Commands */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, fontSize: '0.85rem' }} onClick={() => handleToggleSuspend(selectedClient)}>
                    <Power size={14} style={{ color: selectedClient.status === 'suspended' ? '#10B981' : '#EF4444' }} />
                    <span>{selectedClient.status === 'suspended' ? 'Resume Client Access' : 'Suspend Client Access'}</span>
                  </button>

                  <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, fontSize: '0.85rem' }} onClick={() => handleExtendExpiry(selectedClient)}>
                    <Calendar size={14} style={{ color: 'var(--primary)' }} />
                    <span>Extend Subscription</span>
                  </button>

                  <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, fontSize: '0.85rem', color: '#B45309', borderColor: '#FDE68A' }} onClick={() => handleResetClientData(selectedClient)}>
                    <RotateCcw size={14} />
                    <span>Reset Event Database</span>
                  </button>

                  <button className="btn btn-outline btn-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, fontSize: '0.85rem', color: 'white', background: '#DC2626' }} onClick={() => handleDeleteClient(selectedClient.id, selectedClient.event_name)}>
                    <Trash2 size={14} />
                    <span>Delete Client Tenant</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Onboarding Wizard Modal */}
      {showWizard && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowWizard(false); }}>
          <div className="modal-card" style={{ maxWidth: 500, width: '90%', padding: 32 }}>
            <button className="modal-close-btn" onClick={() => setShowWizard(false)}>×</button>

            <h3 style={{ fontSize: '1.4rem', marginBottom: 6 }}>
              {clientId ? 'Edit Client Details' : 'Onboard New Event Client'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
              Step {wizardStep} of 3: {wizardStep === 1 ? 'Event & Credentials' : wizardStep === 2 ? 'Organization & Branding' : 'Subscription Parameters'}
            </p>

            <form onSubmit={e => e.preventDefault()}>
              {/* Step 1: Event Details & Credentials */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label>Event Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Arts Festival 2027" 
                      value={eventName} 
                      onChange={e => {
                        const val = e.target.value;
                        setEventName(val);
                        if (!slugManuallyEdited) {
                          setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
                        }
                      }} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Username / Event Slug *</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', padding: '0 8px', background: '#E2E8F0', height: 46, borderRadius: '10px 0 0 10px', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRight: 'none', fontSize: '0.85rem' }}>/event/</span>
                      <input 
                        type="text" 
                        placeholder="alqamar-2027" 
                        value={slug} 
                        onChange={e => {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''));
                          setSlugManuallyEdited(true);
                        }} 
                        required 
                        style={{ borderRadius: '0 10px 10px 0' }} 
                      />
                    </div>
                    {slug.trim() && clients.some(c => c.slug === slug.trim().toLowerCase() && c.id !== clientId) && (
                      <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4, fontWeight: 700 }}>
                        ⚠️ This Username / Slug is already taken by another event.
                      </p>
                    )}
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      This is both the URL slug and client's login username.
                    </p>
                  </div>
                  <div className="form-group">
                    <label>Client Admin Password *</label>
                    <input 
                      type="text" 
                      placeholder="Password to unlock dashboard" 
                      value={adminPassword} 
                      onChange={e => setAdminPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="button" className="btn btn-primary" onClick={() => setWizardStep(2)} disabled={slug.trim() && clients.some(c => c.slug === slug.trim().toLowerCase() && c.id !== clientId)}>Next Step →</button>
                  </div>
                </div>
              )}

              {/* Step 2: Org Details & Branding */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label>Organization Name *</label>
                    <input type="text" placeholder="e.g. Al Qamar Committee" value={orgName} onChange={e => setOrgName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
                      Logo Image *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-page)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                      {renderLogo(logo, '64px', '1.6rem', '12px')}
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
                          style={{ fontSize: '0.85rem' }} 
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>
                          💡 Logo in 500*500 pixel. PNG/JPG format.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Event Colors</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Primary</label>
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ padding: 0, height: 42, cursor: 'pointer' }} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Secondary</label>
                        <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} style={{ padding: 0, height: 42, cursor: 'pointer' }} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Accent</label>
                        <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ padding: 0, height: 42, cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 12 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setWizardStep(1)}>← Back</button>
                    <button type="button" className="btn btn-primary" onClick={() => setWizardStep(3)} disabled={uploadingLogo}>Next Step →</button>
                  </div>
                </div>
              )}

              {/* Step 3: Subscription parameters */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Subscription License Duration (Days) *</label>
                    <input type="number" min={1} placeholder="30" value={expiryDays} onChange={e => setExpiryDays(e.target.value)} required />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 12 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setWizardStep(2)}>← Back</button>
                    <button type="button" className="btn btn-primary" style={{ background: '#10B981' }} onClick={handleSaveClient}>
                      {clientId ? 'Save Changes' : 'Complete Setup & Onboard'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
