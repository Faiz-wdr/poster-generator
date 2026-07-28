import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClientBySlug } from '../lib/db';
import { applyClientTheme } from '../lib/theme';
import { ArrowLeft, ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export default function RulesAndRegulations({ overrideSlug }) {
  const { slug: pathSlug } = useParams();
  const slug = overrideSlug || pathSlug;

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const c = await getClientBySlug(slug);
      if (c) {
        setClient(c);
        applyClientTheme(c);
        document.title = `Rules & Regulations — ${c.event_name}`;
      }
      setLoading(false);
    }
    load();

    return () => {
      applyClientTheme(null);
    };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
          Loading official event rules…
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 12, color: '#0F172A' }}>Event Portal Not Found</h2>
        <Link to="/" className="hz-btn-dark">Return to Homepage</Link>
      </div>
    );
  }

  const backLink = overrideSlug ? '/' : `/event/${client.slug}`;

  const RULE_SECTIONS = [
    {
      id: 'general',
      category: 'General Rules',
      title: 'General Rules (Applicable to All Events)',
      badge: 'Mandatory',
      rules: [
        'The Annual Sports Meet will be conducted among three groups: Group A, Group B, and Group C.',
        'Every participant shall represent only their allotted group.',
        'Each participant may participate in a maximum of 3 individual events. There is no limit for team events.',
        'Participants must report 15 minutes before the scheduled event.',
        'The decision of the Referees and the Organizing Committee shall be final.',
        'Any act of indiscipline, misconduct, or unfair play may result in disqualification.',
        'Only registered participants are eligible to compete.'
      ]
    },
    {
      id: 'track',
      category: 'Track Events',
      title: 'Track Events (100m, 200m, 400m, 800m & 1500m)',
      badge: 'Athletics',
      rules: [
        'Events will be conducted among participants representing the three groups.',
        'Athletes must start only after the official starting signal.',
        'False starts may result in disqualification.',
        'The participants who complete the heats in the shortest time shall qualify for the Finals.',
        'Obstructing or interfering with another athlete will result in disqualification.'
      ]
    },
    {
      id: 'shotput',
      category: 'Shot Put',
      title: 'Shot Put',
      badge: 'Field Event',
      rules: [
        'Three attempts shall be given to each participant.',
        'The participant with the longest valid throw shall be declared the winner.',
        'Fouls will not be measured.'
      ]
    },
    {
      id: 'discus',
      category: 'Discus Throw',
      title: 'Discus Throw',
      badge: 'Field Event',
      rules: [
        'Three attempts shall be given to each participant.',
        'The discus must land within the marked sector.',
        'The participant with the longest valid throw shall be declared the winner.'
      ]
    },
    {
      id: 'javelin',
      category: 'Javelin Throw',
      title: 'Javelin Throw',
      badge: 'Field Event',
      rules: [
        'Three attempts shall be given to each participant.',
        'The javelin must land tip-first within the marked sector.',
        'The participant with the longest valid throw shall be declared the winner.'
      ]
    },
    {
      id: 'longjump',
      category: 'Long Jump',
      title: 'Long Jump',
      badge: 'Field Event',
      rules: [
        'Three attempts shall be given to each participant.',
        'Crossing the take-off line shall be considered a foul.',
        'The participant with the longest valid jump shall be declared the winner.'
      ]
    },
    {
      id: 'relay',
      category: '4×100m Relay',
      title: '4×100m Relay',
      badge: 'Track Event',
      rules: [
        'Each team shall consist of four athletes from the same group.',
        'Baton exchange must take place within the designated exchange zone.',
        'If dropped, the baton can be retrieved by the athlete who dropped it, provided they do not impede other runners or shorten the overall running distance.',
        'The team completing the race in the shortest time shall be declared the winner.',
        'Athletes must not leave their assigned lane during the race.'
      ]
    },
    {
      id: 'teamgames',
      category: 'Team Games',
      title: 'Team Games (Football, Cricket, Volleyball & Handball)',
      badge: 'League Format',
      fixtures: [
        'Match 1: Group A vs Group B',
        'Match 2: Group B vs Group C',
        'Match 3: Group C vs Group A'
      ],
      customContent: (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>Each group shall play two matches in a league format.</p>
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Points System:</h5>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: '0.85rem', color: '#334155' }}>
              <li><strong>Win:</strong> 3 Points</li>
              <li><strong>Draw:</strong> 1 Point each (Where applicable)</li>
              <li><strong>Loss:</strong> 0 Points</li>
            </ul>
          </div>
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Champion &amp; Tie-break:</h5>
            <p style={{ fontSize: '0.85rem', color: '#334155', marginBottom: 6 }}>The group securing the highest points shall be declared the Champion.</p>
            <ol style={{ paddingLeft: 20, margin: 0, fontSize: '0.85rem', color: '#334155' }}>
              <li>Goal / Run Difference / Set Difference</li>
              <li>Goals / Runs Scored</li>
              <li>Head-to-Head Result</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'cricket',
      category: 'Cricket',
      title: 'Cricket',
      badge: 'Team Game',
      rules: [
        'Standard cricket rules shall apply.',
        'Each match shall consist of 6 overs per side.',
        'Overthrows shall not be allowed.',
        'There shall be no Last Man Batting.',
        'If the match ends in a tie, the winner shall be decided by a Super Over.',
        'If the Super Over ends in a tie, the team with fewer wickets lost shall be declared the winner.',
        'The team scoring the highest number of runs shall be declared the winner.'
      ]
    },
    {
      id: 'volleyball',
      category: 'Volleyball',
      title: 'Volleyball',
      badge: 'Team Game',
      rules: [
        'Standard volleyball rules shall apply.',
        'The team winning the match shall be awarded 3 points.',
        'The match shall be played in a Best of 3 Sets format.',
        'The first two sets will be played up to 15 points.',
        'If required, the third set will be played up to 11 points.',
        'A player is not allowed to touch the ball twice consecutively (except during a block touch).',
        'Holding, catching, or throwing the ball is not allowed.'
      ]
    },
    {
      id: 'handball',
      category: 'Handball',
      title: 'Handball',
      badge: 'Team Game',
      rules: [
        'Standard handball rules shall apply.',
        'The team scoring the highest number of goals shall be declared the winner.',
        'Each half will be played for 7 minutes.',
        'Players other than the goalkeeper are not allowed to enter the goal area line.',
        'A player is not allowed to hold the ball for too long.',
        'A player is not allowed to take too many steps while holding the ball.'
      ]
    },
    {
      id: 'football',
      category: 'Football',
      title: 'Football',
      badge: 'Team Game',
      rules: [
        '5-a-side format',
        'Duration: 6 + 1 + 6 minutes',
        'Rolling substitutions allowed',
        'No offside rule',
        'The team scoring the highest number of goals wins'
      ]
    },
    {
      id: 'chess',
      category: 'Chess',
      title: 'Chess',
      badge: 'Indoor Game',
      rules: [
        'Individual event.',
        '10 minutes per player.',
        'No increment will be provided.',
        'A player who runs out of time will lose the game.',
        'The decision of the Referee/Arbiter shall be final.',
        'Checkmate/official win wins.',
        'Players are not allowed to talk unnecessarily or disturb the opponent during the game.'
      ]
    },
    {
      id: 'armwrestling',
      category: 'Arm Wrestling',
      title: 'Arm Wrestling',
      badge: 'Knockout',
      rules: [
        'Individual knockout.',
        'Elbow must remain on the pad.',
        'The first pin wins.'
      ]
    },
    {
      id: 'badminton',
      category: 'Badminton',
      title: 'Badminton',
      badge: 'Racquet Sport',
      rules: [
        'The match shall be played in a Best of 3 Games format.',
        'Each game will be played up to 11 points.',
        'The serving side will change according to the score.',
        'The serve must be delivered to the diagonally opposite service court.',
        'If the score is even (0, 2, 4...), the serve must be taken from the right service court.',
        'If the score is odd (1, 3, 5...), the serve must be taken from the left service court.',
        'A point will be awarded if the opponent commits a fault.'
      ]
    },
    {
      id: 'carroms',
      category: 'Carroms',
      title: 'Carroms',
      badge: 'Team Event',
      rules: [
        'Team event.',
        '15 minutes time limit format.',
        'If the game is not completed within 15 minutes: The team with the highest points will be declared the winner.',
        'In case of a tie, the result may be decided based on the Queen position / remaining coins.',
        'Any foul committed by a player will result in the loss of turn, and any improperly pocketed coin will be returned to the board.'
      ]
    }
  ];

  const filteredSections = RULE_SECTIONS.filter(sec => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return activeTab === 'all' || sec.id === activeTab;
    return sec.title.toLowerCase().includes(q) ||
      sec.category.toLowerCase().includes(q) ||
      sec.rules?.some(r => r.toLowerCase().includes(q));
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', fontFamily: 'var(--font-body)' }}>
      {/* Header Bar */}
      <header style={{ background: 'rgba(244, 245, 247, 0.95)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50, padding: '16px 0', borderBottom: '1px solid #E2E8F0' }}>
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
                MLC FIESTA 26
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to={backLink} className="hz-btn-light" style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} /> Back to Event Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flexGrow: 1, padding: '32px 16px 60px' }}>
        {/* Title Hero */}
        <div className="hz-card" style={{ padding: '40px 32px', textAlign: 'center', marginBottom: 32 }}>
          <span className="hz-pill-badge" style={{ marginBottom: 12 }}>
            <ShieldAlert size={14} style={{ color: '#0066FF' }} /> Official Rulebook
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A', margin: '8px 0', letterSpacing: '-0.02em' }}>
            Rules &amp; Regulations
          </h1>
          <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: 640, margin: '0 auto 20px', lineHeight: 1.6 }}>
            Official guidelines, scoring criteria, and discipline policies for Fuego Athletica'26 — MLC Annual Sports Meet.
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Search rules e.g. cricket, relay, fouls, points…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '12px 18px', borderRadius: 9999,
                border: '1px solid #CBD5E1', background: '#F8FAFC',
                fontSize: '0.95rem', color: '#0F172A', outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 24, scrollbarWidth: 'none' }}>
          <button
            onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
            className={activeTab === 'all' && !searchQuery ? "hz-btn-dark" : "hz-btn-light"}
            style={{ padding: '6px 16px', fontSize: '0.82rem', whitespace: 'nowrap' }}
          >
            All Categories ({RULE_SECTIONS.length})
          </button>
          {RULE_SECTIONS.map(sec => (
            <button
              key={sec.id}
              onClick={() => { setActiveTab(sec.id); setSearchQuery(''); }}
              className={activeTab === sec.id && !searchQuery ? "hz-btn-dark" : "hz-btn-light"}
              style={{ padding: '6px 16px', fontSize: '0.82rem', whitespace: 'nowrap' }}
            >
              {sec.category}
            </button>
          ))}
        </div>

        {/* Rules Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {filteredSections.map(sec => (
            <div key={sec.id} className="hz-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {sec.title}
                  </h3>
                  <span className="hz-pill-badge" style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#0066FF', border: 'none' }}>
                    {sec.badge}
                  </span>
                </div>

                {sec.fixtures && (
                  <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 14 }}>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6, textTransform: 'uppercase' }}>Fixtures:</h5>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: '0.85rem', color: '#334155' }}>
                      {sec.fixtures.map((f, idx) => <li key={idx}>{f}</li>)}
                    </ul>
                  </div>
                )}

                {sec.rules && (
                  <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sec.rules.map((rule, idx) => (
                      <li key={idx} style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                        {rule}
                      </li>
                    ))}
                  </ul>
                )}

                {sec.customContent}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="public-footer" style={{ background: '#0F172A', color: '#94A3B8', padding: '40px 0 50px', fontSize: '0.9rem' }}>
        <div className="container public-footer-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
              {client.event_name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              MLC FIESTA 26
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link to={backLink} style={{ color: '#94A3B8', fontWeight: 600 }}>Event Portal</Link>
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
