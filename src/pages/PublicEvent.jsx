import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClientBySlug, getResults, getSchedule, getSettings, sortResultsByResultNoDesc } from '../lib/db';
import { applyClientTheme } from '../lib/theme';
import { Search, Trophy, Calendar, Award, Home, ChevronDown, ChevronUp, Sparkles, Flame, Megaphone, Zap } from 'lucide-react';

function PublicResultAccordionCard({ result }) {
  const [isOpen, setIsOpen] = useState(false);
  const winners = result.winners || [];

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        marginBottom: '8px',
        overflow: 'hidden',
        boxShadow: isOpen ? '0 10px 24px rgba(15, 23, 42, 0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header — Click to Expand / Collapse */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          background: isOpen ? '#F8FAFC' : '#FFFFFF',
          borderBottom: isOpen ? '1px solid #E2E8F0' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexGrow: 1 }}>
          {result.resultNo && (
            <span className="hz-pill-badge" style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.78rem',
              padding: '4px 12px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              #{result.resultNo}
            </span>
          )}
          <h4 style={{
            margin: 0,
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#0F172A',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {result.programName}
          </h4>
          {result.category && (
            <span style={{
              color: '#64748B',
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              • {result.category}
            </span>
          )}
        </div>

        <div style={{ color: '#0066FF', display: 'flex', alignItems: 'center', paddingLeft: 12, flexShrink: 0 }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Inline Body — Winner Standings */}
      {isOpen && (
        <div style={{ padding: '20px 24px', background: '#FFFFFF' }}>
          {winners.length === 0 ? (
            <p style={{ color: '#64748B', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
              No winner details recorded yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9', textAlign: 'left', color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '8px 12px 8px 0', width: '70px' }}>Rank</th>
                    <th style={{ padding: '8px 12px' }}>Winner Name</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Team / Group</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((w, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < winners.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '12px 12px 12px 0', fontWeight: 800, color: '#0066FF' }}>
                        {w.position || `0${idx + 1}`}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#0F172A' }}>
                        {w.name}
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#475569', fontWeight: 600 }}>
                        {w.team ? (
                          <span className="hz-pill-badge" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                            {w.team}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PublicEvent({ overrideSlug }) {
  const { slug: routeSlug } = useParams();
  const slug = overrideSlug || routeSlug;

  const [client, setClient] = useState(null);
  const [results, setResults] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeScheduleDate, setActiveScheduleDate] = useState('');
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [teamPoints, setTeamPoints] = useState([]);
  const [teamPointsAfterResults, setTeamPointsAfterResults] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const c = await getClientBySlug(slug);
      if (!c) {
        setClient(null);
        setLoading(false);
        return;
      }
      setClient(c);
      applyClientTheme(c);

      // Set Website Title & Meta Description to Event Name & Description
      document.title = `${c.event_name} — ${c.organization_name}`;
      let metaDesc = document.querySelector('meta[name="description"]');
      const pageDesc = `${c.event_name} by ${c.organization_name}. Browse official program standings, team point tallies, competition schedules, and verified winner placements.`;
      if (metaDesc) {
        metaDesc.setAttribute('content', pageDesc);
      } else {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        metaDesc.content = pageDesc;
        document.head.appendChild(metaDesc);
      }

      const [r, s] = await Promise.all([
        getResults(c.id),
        getSchedule(c.id)
      ]);

      const published = r.filter(item => item.status === 'published');
      setResults(published);
      setSchedule(s || []);

      // Load manual team points from settings
      const settings = await getSettings(c.id);
      if (settings) {
        const pts = Array.isArray(settings.teamPoints) ? settings.teamPoints : [];
        // Sort by points descending
        setTeamPoints([...pts].sort((a, b) => b.points - a.points));
        setTeamPointsAfterResults(settings.teamPointsAfterResults || 0);
      }

      if (s && s.length > 0) {
        setActiveScheduleDate(s[0].date || 'Scheduled Date');
      }

      setLoading(false);
    }
    load();

    return () => {
      applyClientTheme(null);
      document.title = 'ResultFlow - Dynamic Result Poster Engine';
    };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
          Loading event portal…
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#0F172A' }}>Event Portal Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: 24, maxWidth: 420 }}>
          The event URL you are trying to access does not exist or has been removed.
        </p>
        <Link to="/" className="hz-btn-dark">Return to Homepage</Link>
      </div>
    );
  }

  if (client.status === 'suspended') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#EF4444' }}>Event Access Suspended</h2>
        <p style={{ color: '#64748B', marginBottom: 24, maxWidth: 420 }}>
          This event portal has been suspended by the administrator. Please contact support.
        </p>
        <Link to="/" className="hz-btn-dark">Return to Homepage</Link>
      </div>
    );
  }

  const filtered = results.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      r.programName?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.winners?.some(w => w.name?.toLowerCase().includes(q));
  });

  // Schedule Date Groupings
  const scheduleDates = Array.from(new Set(schedule.map(s => s.date || 'Scheduled Date'))).sort();
  const currentActiveDate = (activeScheduleDate && scheduleDates.includes(activeScheduleDate))
    ? activeScheduleDate
    : (scheduleDates[0] || '');
  const activeDateItems = schedule.filter(s => (s.date || 'Scheduled Date') === currentActiveDate);

  // Show team points section ONLY when at least one team has points > 0
  const hasAnyTeamPoints = teamPoints.length > 0 && teamPoints.some(t => (Number(t.points) || 0) > 0);

  // Scroll Helper for Navigation Bar
  const scrollToSection = (sectionId, tabName) => {
    setActiveNavTab(tabName);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}>
      {/* Event Header — Horizon Courts Header Style */}
      <header style={{ background: 'rgba(244, 245, 247, 0.95)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50, padding: '16px 0' }}>
        <div className="container nav-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {client.logo && (client.logo.startsWith('http') || client.logo.startsWith('data:image') || client.logo.startsWith('/')) ? (
                <img src={client.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <img src="/logo.svg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {client.event_name}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {client.organization_name}
              </div>
            </div>
          </div>

          <div className="header-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => scrollToSection('public-results-section', 'results')} className="hz-btn-light" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Results
            </button>
            <Link to="/login" className="hz-btn-dark" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Admin Access
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flexGrow: 1, paddingBottom: 100 }}>

        {/* 1. HERO SECTION — Horizon Courts Rounded Card Container */}
        <section id="public-hero-section" style={{ margin: '24px 0 32px' }}>
          <div className="hz-card" style={{ padding: '48px 32px', textAlign: 'center' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 14 }}>
              Official Competition Portal
            </span>
            
            {/* Organization Name — Smaller & Thin Font */}
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 10, marginBottom: 16 }}>
              {client.organization_name}
            </div>

            {/* Event Hero Logo Image (/fuego -centr.svg) */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 22 }}>
              <img
                src="/fuego -centr.svg"
                alt={client.event_name || "Fuego Athletica"}
                style={{
                  height: '68px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  filter: 'brightness(0.08)'
                }}
              />
            </div>
            <p style={{ color: '#64748B', fontSize: '1.05rem', textAlign: 'center', maxWidth: 600, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Browse official program standings, team point tallies, competition schedules, and verified winner placements.
            </p>

            {/* Stat Counters Row — Horizon Courts Style */}
            <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', justifyContent: 'center', paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="hz-stat-num" style={{ fontSize: '2.4rem' }}>{results.length}</div>
                <div className="hz-stat-label">Programs Announced</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="hz-stat-num" style={{ fontSize: '2.4rem' }}>{teamPoints.length}</div>
                <div className="hz-stat-label">Teams Competing</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="hz-stat-num" style={{ fontSize: '2.4rem' }}>{schedule.length}</div>
                <div className="hz-stat-label">Scheduled Events</div>
              </div>
            </div>
          </div>
        </section>

        {/* FESTIVAL THEME & IDENTITY SECTION */}
        <section id="public-theme-section" style={{ marginBottom: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span className="hz-pill-badge" style={{ marginBottom: 10 }}>
              <Sparkles size={14} style={{ color: '#0066FF' }} /> Festival Identity &amp; Motto
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              The Spirit of the Fest
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
            {/* Card 1: MLC FIESTA '26 */}
            <div className="hz-card-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span className="hz-pill-badge-dark" style={{ fontSize: '0.78rem' }}>
                    <Megaphone size={14} style={{ color: '#A7F3D0' }} /> Cultural Fest Theme
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>EDITION '26</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <img
                    src="/mlc-lef.svg"
                    alt="MLC FIESTA '26"
                    style={{ height: '52px', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <p style={{ color: '#E2E8F0', fontSize: '0.96rem', lineHeight: 1.65, fontStyle: 'italic' }}>
                  "This generation is the echo of every voice that has gone <span style={{ color: '#FCD34D', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: '4px' }}>unheard</span>. It stands as a reminder that silence is never destiny, that questioning is never a crime, and that every voice raised in the pursuit of justice becomes a new line in the pages of history."
                </p>
              </div>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Official Cultural Declaration
                </span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              </div>
            </div>

            {/* Card 2: NIVĀRA (Arts Theme) */}
            <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', borderRadius: '28px', padding: '32px 28px', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span className="hz-pill-badge-dark" style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                    <Award size={14} style={{ color: '#C084FC' }} /> Arts Theme
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.05em' }}>EXPRESSION</span>
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 14, letterSpacing: '0.04em' }}>
                  NIVĀRA
                </h3>
                <p style={{ color: '#E0E7FF', fontSize: '0.96rem', lineHeight: 1.65 }}>
                  NIVĀRA is where silence transforms into expression. A stage where art is more than entertainment—it is truth, resistance, and hope. Every performance becomes a voice, every creation a statement, and every participant a reminder that no story deserves to remain <span style={{ color: '#F472B6', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: '4px' }}>unheard</span>.
                </p>
              </div>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Silence Transforms into Expression
                </span>
                <Award size={16} style={{ color: '#C084FC' }} />
              </div>
            </div>

            {/* Card 3: FUEGO ATHLETICA '26 */}
            <div className="hz-card-blue" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span className="hz-pill-badge-dark" style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <Flame size={14} style={{ color: '#FCD34D' }} /> Sports Identity
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: '0.05em' }}>ATHLETICA '26</span>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <img
                    src="/fuego.svg"
                    alt="FUEGO ATHLETICA '26"
                    style={{ height: '40px', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                  Not every victory is seen. Not every effort is applauded. But every athlete deserves a moment to shine. This year, we celebrate determination over doubt, discipline over limits, and the unbreakable spirit of competition. Presenting the official identity of FUEGO ATHLETICA'26 — where passion ignites, champions rise, and every finish line marks the beginning of a greater journey.
                </p>
              </div>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Passion Ignites • Champions Rise
                </span>
                <Flame size={16} style={{ color: '#FFFFFF' }} />
              </div>
            </div>
          </div>

          {/* Card 3: Our Three Teams Grid */}
          <div className="hz-card" style={{ padding: '32px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span className="hz-pill-badge" style={{ marginBottom: 6, fontSize: '0.78rem' }}>
                  House Alliances
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Our Three Teams
                </h3>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                3 Official Competing Houses
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {/* Team 1: AAWAZ */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '20px', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="hz-pill-badge" style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', padding: '4px 14px', fontSize: '0.78rem' }}>
                    AAWAZ
                  </span>
                  <Megaphone size={16} style={{ color: '#0F172A' }} />
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                  AAWAZ
                </div>
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
                  The Voice that dares to speak.
                </div>
              </div>

              {/* Team 2: RAFTAR */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '20px', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="hz-pill-badge" style={{ background: '#0066FF', color: '#FFFFFF', border: 'none', padding: '4px 14px', fontSize: '0.78rem' }}>
                    RAFTAR
                  </span>
                  <Zap size={16} style={{ color: '#0066FF' }} />
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                  RAFTAR
                </div>
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
                  The Momentum that refuses to stop.
                </div>
              </div>

              {/* Team 3: JWALA */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '20px', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="hz-pill-badge" style={{ background: '#DC2626', color: '#FFFFFF', border: 'none', padding: '4px 14px', fontSize: '0.78rem' }}>
                    JWALA
                  </span>
                  <Flame size={16} style={{ color: '#DC2626' }} />
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                  JWALA
                </div>
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, lineHeight: 1.4 }}>
                  The Flame that ignites change.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROGRAM RESULTS SECTION */}
        <section id="public-results-section" style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Program Results</h2>
            <span className="hz-pill-badge">
              Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Program Search Bar Under Heading */}
          <div className="hz-card" style={{ padding: '14px 18px', borderRadius: 9999, marginBottom: 20 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <Search size={20} style={{ position: 'absolute', left: 16, color: '#0066FF' }} />
              <input
                type="search"
                placeholder="Search program or winner name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 20px 12px 48px',
                  borderRadius: 9999,
                  border: 'none',
                  background: '#F8FAFC',
                  fontSize: '0.98rem',
                  fontFamily: 'var(--font-body)',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="hz-card" style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 6, color: '#0F172A' }}>No results found.</p>
              <p style={{ fontSize: '0.95rem' }}>Try searching another program or winner name.</p>
            </div>
          ) : (
            <div className="results-list-container">
              {filtered.map(r => (
                <PublicResultAccordionCard key={r.id} result={r} />
              ))}
            </div>
          )}
        </section>

        {/* 4. POINTS & TEAM STANDINGS SECTION — Only shown when points > 0 */}
        {hasAnyTeamPoints && (
          <section id="public-points-section" style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Team Points</h2>
              {teamPointsAfterResults > 0 && (
                <span className="hz-pill-badge">
                  After #{teamPointsAfterResults} Results
                </span>
              )}
            </div>

            <div className="hz-card" style={{ padding: 0 }}>
              <div className="published-list-table-wrapper">
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '0.78rem', color: '#64748B' }}>
                      <th style={{ width: '80px', padding: '16px 24px' }}>Rank</th>
                      <th style={{ padding: '16px 24px' }}>Team Name</th>
                      <th style={{ width: '140px', textAlign: 'right', padding: '16px 24px' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPoints.map((t, idx) => (
                      <tr key={t.name} style={{ borderBottom: idx < teamPoints.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0066FF' }}>
                          <span className="hz-pill-badge" style={{ background: idx === 0 ? '#0F172A' : '#F1F5F9', color: idx === 0 ? '#FFFFFF' : '#0F172A', border: 'none' }}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                          {t.name}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 800, color: '#0066FF', fontSize: '1.2rem' }}>
                          {t.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 5. EVENT SCHEDULE & TIMETABLE SECTION */}
        {schedule.length > 0 && (
          <section id="public-schedule-section" style={{ marginBottom: 40 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Event Schedule &amp; Timetable</h2>
            </div>

            {/* Schedule Date Tabs */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              {scheduleDates.map(dateStr => (
                <button
                  key={dateStr}
                  onClick={() => setActiveScheduleDate(dateStr)}
                  className={currentActiveDate === dateStr ? "hz-btn-dark" : "hz-btn-light"}
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  <span>{dateStr}</span>
                </button>
              ))}
            </div>

            {/* Schedule Table */}
            <div className="hz-card" style={{ padding: 0 }}>
              <div className="published-list-table-wrapper">
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '0.78rem', color: '#64748B' }}>
                      <th style={{ width: '220px', padding: '16px 24px' }}>Time Slot</th>
                      <th style={{ padding: '16px 24px' }}>Event</th>
                      <th style={{ width: '200px', padding: '16px 24px' }}>Venue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDateItems.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: idx < activeDateItems.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0066FF', whiteSpace: 'nowrap' }}>
                          {item.time}
                        </td>
                        <td style={{ padding: '16px 24px', fontWeight: 700, color: '#0F172A' }}>
                          {item.event}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {item.stage ? (
                            <span className="hz-pill-badge" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                              {item.stage}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 6. MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 0 12px',
        zIndex: 999,
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08)'
      }}>
        <button
          onClick={() => scrollToSection('public-hero-section', 'home')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 16px',
            color: activeNavTab === 'home' ? '#0066FF' : '#64748B',
            fontWeight: activeNavTab === 'home' ? 800 : 600, fontSize: '0.75rem'
          }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          onClick={() => scrollToSection('public-results-section', 'results')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 16px',
            color: activeNavTab === 'results' ? '#0066FF' : '#64748B',
            fontWeight: activeNavTab === 'results' ? 800 : 600, fontSize: '0.75rem'
          }}
        >
          <Trophy size={20} />
          <span>Results</span>
        </button>

        {hasAnyTeamPoints && (
          <button
            onClick={() => scrollToSection('public-points-section', 'points')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 16px',
              color: activeNavTab === 'points' ? '#0066FF' : '#64748B',
              fontWeight: activeNavTab === 'points' ? 800 : 600, fontSize: '0.75rem'
            }}
          >
            <Award size={20} />
            <span>Points</span>
          </button>
        )}

        <button
          onClick={() => scrollToSection('public-schedule-section', 'schedule')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 16px',
            color: activeNavTab === 'schedule' ? '#0066FF' : '#64748B',
            fontWeight: activeNavTab === 'schedule' ? 800 : 600, fontSize: '0.75rem'
          }}
        >
          <Calendar size={20} />
          <span>Schedule</span>
        </button>
      </nav>

      {/* 7. FOOTER SECTION */}
      <footer className="public-footer" style={{ background: '#0F172A', color: '#94A3B8', padding: '48px 0 60px', fontSize: '0.9rem' }}>
        <div className="container public-footer-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
              {client.event_name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              {client.organization_name}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/" style={{ color: '#94A3B8', fontWeight: 600 }}>ResultFlow</Link>
            <Link to="/login" style={{ color: '#94A3B8', fontWeight: 600 }}>Admin Login</Link>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
            © {new Date().getFullYear()} {client.organization_name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
