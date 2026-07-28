import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, Palette, ClipboardList, Shield, Layers, Layout, Download, Settings, Users, CheckCircle, ArrowRight, HelpCircle, ChevronDown, Monitor } from 'lucide-react';

export default function SaaSLanding() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [demoRequested, setDemoRequested] = useState(false);
  const [email, setEmail] = useState('');

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setDemoRequested(true);
      setTimeout(() => {
        setDemoRequested(false);
        setEmail('');
      }, 3000);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const FAQS = [
    {
      q: "Can I use my own event branding?",
      a: "Absolutely! You can upload your organization logo and define custom primary, secondary, and accent colors. These branding configurations will dynamically apply to all public event pages, results lists, and poster download screens."
    },
    {
      q: "Can multiple staff members manage results?",
      a: "Yes! Client Admin accounts let your team log into a dedicated dashboard scoped only to your event. They can publish results, upload custom backgrounds, and edit details without seeing any other organization's dashboard."
    },
    {
      q: "How long is event access provided?",
      a: "Access is duration-based. Admin editing functions lock after your event license expires, but public results and poster downloads remain live and searchable for your audience to enjoy as an archive."
    },
    {
      q: "Can I export posters in high quality?",
      a: "Yes. All poster templates render in high-resolution vector-like layouts in the browser. You can export them instantly to 1080x1350px high-resolution JPG files suitable for sharing on Instagram, WhatsApp, or printing."
    },
    {
      q: "Can I use custom domains for my public event pages?",
      a: "Yes, custom domain routing (e.g. results.yourfestival.com) is fully supported under our Enterprise plan. Contact our sales team during setup."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* Horizon Courts Design System Styles */}
      <style>{`
        .landing-header {
          background: rgba(244, 245, 247, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 16px 0;
        }
        .landing-logo-icon {
          background: #0F172A;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
        }
        .landing-logo-text {
          font-weight: 800;
          font-size: 1.25rem;
          color: #0F172A;
          letter-spacing: -0.02em;
        }
        .landing-nav-pill {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 6px 12px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .landing-nav-pill a {
          color: #475569;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 6px 16px;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }
        .landing-nav-pill a:hover {
          color: #0F172A;
          background: #F1F5F9;
        }
        .landing-section {
          padding: 90px 0;
        }
        .landing-title {
          font-size: 2.8rem;
          line-height: 1.18;
          text-align: center;
          margin-bottom: 18px;
          font-family: var(--font-title);
          color: #0F172A;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .landing-subtitle {
          font-size: 1.1rem;
          color: #64748B;
          text-align: center;
          max-width: 640px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }
        .bento-grid-landing {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }
        .faq-item {
          border-bottom: 1px solid #E2E8F0;
          padding: 20px 0;
        }
        .faq-item:last-child {
          border-bottom: none;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-size: 1.05rem;
          color: #0F172A;
          cursor: pointer;
          user-select: none;
        }
        .faq-answer {
          margin-top: 12px;
          color: #64748B;
          font-size: 0.95rem;
          line-height: 1.6;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0, 1, 0, 1);
        }
        .faq-answer.open {
          max-height: 500px;
          transition: max-height 0.3s cubic-bezier(1, 0, 1, 0);
        }
        .app-mockup {
          background: #0F172A;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 70px -15px rgba(15, 23, 42, 0.25);
          overflow: hidden;
          width: 100%;
          max-width: 940px;
          margin: 0 auto;
        }
        .mockup-header {
          background: #1E293B;
          height: 42px;
          display: flex;
          align-items: center;
          padding: 0 18px;
          gap: 8px;
        }
        .mockup-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .mockup-body {
          background: #F8FAFC;
          color: #1E293B;
          padding: 24px;
        }
        .mockup-sidebar {
          background: white;
          border-right: 1px solid #E2E8F0;
          padding: 16px;
          width: 180px;
          border-radius: 16px;
        }
        .mockup-nav-item {
          height: 28px;
          border-radius: 9999px;
          background: #F1F5F9;
          margin-bottom: 8px;
        }
        .mockup-nav-item.active {
          background: #E0E7FF;
          border-left: 3px solid #0066FF;
        }
        .mockup-content {
          flex-grow: 1;
          padding: 16px;
        }
        .mockup-card {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 12px;
        }
        .mockup-canvas {
          background: white;
          aspect-ratio: 4/5;
          max-width: 240px;
          margin: 0 auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          border: 1.5px solid #F3F4F6;
        }
        .mockup-canvas-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border: 8px solid #F59E0B;
          border-top: 24px solid #0066FF;
          border-radius: 14px;
          opacity: 0.15;
        }
      `}</style>

      {/* Header — Horizon Courts Pill Header Layout */}
      <header className="landing-header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="landing-logo-icon">R</div>
            <span className="landing-logo-text">ResultFlow</span>
          </Link>

          {/* Floating Pill Nav Bar */}
          <nav className="landing-nav-pill">
            <a href="#features">Features</a>
            <a href="#usecases">Use Cases</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>

          {/* Right Pill Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" className="hz-btn-light" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Login</Link>
            <a href="#demo" className="hz-btn-dark" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              <span>Request Demo</span> <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section — Horizon Courts Large Rounded Container */}
      <section className="landing-section" style={{ paddingTop: 20, paddingBottom: 60 }}>
        <div className="container">
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-color)',
            padding: '72px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
              <span className="hz-pill-badge" style={{ marginBottom: 20 }}>
                <Sparkles size={14} style={{ color: '#0066FF' }} /> Multi-Tenant Result Poster Engine
              </span>

              <h1 className="landing-title" style={{ fontSize: '3.6rem', marginBottom: 20 }}>
                Dynamic Result Posters For Festivals &amp; Competitions
              </h1>

              <p className="landing-subtitle">
                Publish event results, customize beautiful layouts, and download print-quality branded posters instantly. Sell and deploy to multiple festivals, colleges, and schools from a single system.
              </p>

              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
                <Link to="/event/wandoor-sahityotsav-2026" className="hz-btn-dark" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
                  <span>View Sample Event</span> <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="hz-btn-light" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
                  Admin Login Portal
                </Link>
              </div>
            </div>

            {/* Actual App Mockup Screen */}
            <div className="app-mockup">
              <div className="mockup-header">
                <div className="mockup-dot" style={{ background: '#EF4444' }} />
                <div className="mockup-dot" style={{ background: '#F59E0B' }} />
                <div className="mockup-dot" style={{ background: '#10B981' }} />
                <div style={{ marginLeft: 20, background: '#0F172A', color: '#94A3B8', fontSize: '0.75rem', padding: '3px 18px', borderRadius: 9999, fontFamily: 'monospace' }}>
                  https://resultflow.io/event/alqamar-2027
                </div>
              </div>
              <div className="mockup-body" style={{ display: 'flex', minHeight: 440 }}>
                {/* Mockup Sidebar */}
                <div className="mockup-sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0F172A' }} />
                      <div style={{ height: 10, width: 80, background: '#94A3B8', borderRadius: 9999 }} />
                    </div>
                    <div className="mockup-nav-item active" />
                    <div className="mockup-nav-item" />
                    <div className="mockup-nav-item" />
                    <div className="mockup-nav-item" />
                  </div>
                  <div className="mockup-nav-item" style={{ background: '#FCA5A5' }} />
                </div>

                {/* Mockup Workspace */}
                <div className="mockup-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <div style={{ height: 14, width: 140, background: '#1E293B', borderRadius: 4, marginBottom: 6 }} />
                      <div style={{ height: 10, width: 220, background: '#94A3B8', borderRadius: 4 }} />
                    </div>
                    <div style={{ height: 32, width: 120, background: '#0066FF', borderRadius: 9999 }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20 }}>
                    {/* Left Column: Data Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="mockup-card">
                        <div style={{ height: 10, width: 100, background: '#94A3B8', borderRadius: 4, marginBottom: 8 }} />
                        <div style={{ height: 32, background: '#F1F5F9', borderRadius: 8 }} />
                      </div>
                      <div className="mockup-card">
                        <div style={{ height: 10, width: 80, background: '#94A3B8', borderRadius: 4, marginBottom: 8 }} />
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <div style={{ height: 28, flex: 1, background: '#F1F5F9', borderRadius: 8 }} />
                          <div style={{ height: 28, flex: 1, background: '#F1F5F9', borderRadius: 8 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{ height: 28, flex: 1, background: '#F1F5F9', borderRadius: 8 }} />
                          <div style={{ height: 28, flex: 1, background: '#F1F5F9', borderRadius: 8 }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
                        <div style={{ height: 28, width: 90, background: '#E2E8F0', borderRadius: 9999 }} />
                        <div style={{ height: 28, width: 90, background: '#0F172A', borderRadius: 9999 }} />
                      </div>
                    </div>

                    {/* Right Column: Poster Canvas */}
                    <div className="mockup-canvas">
                      <div className="mockup-canvas-bg" />
                      <div style={{ position: 'relative', height: '100%', padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ height: 6, width: 60, background: '#0066FF', borderRadius: 9999, margin: '2px auto 4px' }} />
                          <div style={{ height: 12, width: 140, background: '#111827', borderRadius: 4, margin: '0 auto' }} />
                          <div style={{ height: 8, width: 80, background: '#EC4899', borderRadius: 4, margin: '6px auto' }} />
                        </div>

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', padding: 4, borderRadius: 6, border: '0.5px solid #E5E7EB' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 800 }}>1</div>
                            <div style={{ height: 6, width: 60, background: '#111827', borderRadius: 2 }} />
                            <div style={{ height: 6, width: 30, background: '#94A3B8', borderRadius: 2 }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', padding: 4, borderRadius: 6, border: '0.5px solid #E5E7EB' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 800 }}>2</div>
                            <div style={{ height: 6, width: 55, background: '#111827', borderRadius: 2 }} />
                            <div style={{ height: 6, width: 25, background: '#94A3B8', borderRadius: 2 }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', padding: 4, borderRadius: 6, border: '0.5px solid #E5E7EB' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 800 }}>3</div>
                            <div style={{ height: 6, width: 50, background: '#111827', borderRadius: 2 }} />
                            <div style={{ height: 6, width: 35, background: '#94A3B8', borderRadius: 2 }} />
                          </div>
                        </div>

                        <div style={{ height: 6, width: 40, background: '#94A3B8', borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Facts in Numbers — Horizon Courts Stat Counter Row */}
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 20 }}>
              Facts about us in numbers
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginTop: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="hz-stat-num">12 000+</div>
                <div className="hz-stat-label">Hours of editing saved</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="hz-stat-num">89%</div>
                <div className="hz-stat-label">Faster announcement speed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="hz-stat-num">1,200+</div>
                <div className="hz-stat-label">Active competition portals</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="hz-stat-num">125+</div>
                <div className="hz-stat-label">Annual partner festivals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid — Bento Layout matching Horizon Courts aesthetic */}
      <section className="landing-section" id="features" style={{ paddingTop: 40 }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 12 }}>
              Features &amp; Capabilities
            </span>
            <h2 className="landing-title">Engineered For Rapid Results Announcements</h2>
            <p className="landing-subtitle">
              Say goodbye to Photoshop templates, manual typing, and broken fonts. Get all the features you need to manage cultural fests from one system.
            </p>
          </div>

          {/* Bento Card Grid with Horizon Courts Dark Navy, Vibrant Blue, and Stat Matrix Cards */}
          <div className="bento-grid-landing">
            {/* Card 1: Dark Navy Contrast Card */}
            <div className="hz-card-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                    <ClipboardList size={22} />
                  </div>
                  <span className="hz-pill-badge-dark">Instant Sync</span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>Instant Result Publishing</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Enter scores and placements through a clean interface and publish results live for parents, students, and attendees immediately.
                </p>
              </div>
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', padding: '10px 16px', borderRadius: 9999, width: 'fit-content' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E2E8F0' }}>Live Status Ready</span>
              </div>
            </div>

            {/* Card 2: Electric Blue Accent Card */}
            <div className="hz-card-blue" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                    <Trophy size={22} />
                  </div>
                  <span className="hz-pill-badge-dark">Auto Layout</span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>Dynamic Poster Generation</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Announcements are instantly compiled into beautiful graphics matching your predefined templates—no manual layout editing required.
                </p>
              </div>
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="hz-pill-badge-dark" style={{ fontSize: '0.78rem' }}>1080x1350px Output</span>
              </div>
            </div>

            {/* Card 3: Light Pro Card with Dot Matrix Bar */}
            <div className="hz-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                    <Palette size={22} />
                  </div>
                  <span className="hz-pill-badge">Templates</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Multiple Poster Templates</h3>
                <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 16 }}>
                  Create or choose from multiple design packages (Classic Elite, Cyber Pulse, Sunset Glow) matching the aesthetic of different events.
                </p>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: 6 }}>Template Varieties</div>
                <div className="hz-dot-row">
                  <span className="hz-dot" />
                  <span className="hz-dot" />
                  <span className="hz-dot" />
                  <span className="hz-dot" />
                  <span className="hz-dot" />
                  <span className="hz-dot" />
                  <span className="hz-dot" />
                  <span className="hz-dot hz-dot-muted" />
                  <span className="hz-dot hz-dot-muted" />
                </div>
              </div>
            </div>

            {/* Remaining Feature Cards in Sleek White Horizon Style */}
            <div className="hz-card">
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', marginBottom: 20 }}>
                <Monitor size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Real-Time Preview</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Check changes as you type. Dynamic canvas adjustments ensure names and team codes sit perfectly inside safe margin zones.
              </p>
            </div>

            <div className="hz-card">
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', marginBottom: 20 }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Template Layout Editor</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6 }}>
                An elite built-in creator tool lets you drag, resize, align, and re-theme fields like placement names, team badges, and category labels.
              </p>
            </div>

            <div className="hz-card">
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', marginBottom: 20 }}>
                <Layout size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Mobile-Friendly Dashboard</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Completely responsive admin page lets coordinators write, publish, and delete result drafts straight from their smartphones.
              </p>
            </div>

            <div className="hz-card">
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', marginBottom: 20 }}>
                <Settings size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Custom Branding</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Dynamic branding variables ensure that every client page inherits their logo, header headers, and primary, secondary, and accent colors.
              </p>
            </div>

            <div className="hz-card">
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', marginBottom: 20 }}>
                <Download size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>High-Quality Downloads</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Save results flyers as pixel-perfect, crisp JPGs ready for download, distribution, and printing at full 1080x1350px size.
              </p>
            </div>

            <div className="hz-card">
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', marginBottom: 20 }}>
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Multi-Tenant Architecture</h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Hosts multiple events and committees on a single system. Keep client results, assets, and coordinator credentials safely segmented.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="landing-section" id="usecases">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 12 }}>
              Use Cases &amp; Solutions
            </span>
            <h2 className="landing-title">Perfect For Any Competition</h2>
            <p className="landing-subtitle">
              From large-scale national cultural festivals to local community events, our platform adapts to your organizational requirements.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 40 }}>
            {[
              { title: 'Arts Festivals', desc: 'Manage hundreds of stage events, music slots, drawing programs, and drama standings.' },
              { title: 'School Competitions', desc: 'Announce inter-class athletic rankings, spelling bees, and science fairs immediately.' },
              { title: 'College Fests', desc: 'Brand technical hackathons, cultural concerts, and fashion shows under separate layout grids.' },
              { title: 'Cultural Events', desc: 'Announce literary, debating, and talent search champions on branded certificate flyers.' },
              { title: 'Educational Orgs', desc: 'Display board rankings, scholarship exam results, and olympiad awards professionally.' },
              { title: 'Community Programs', desc: 'Promote local club tournaments, chess championships, and charity runs.' }
            ].map(uc => (
              <div key={uc.title} className="hz-card" style={{ padding: 28 }}>
                <span className="hz-pill-badge" style={{ marginBottom: 14, fontSize: '0.75rem' }}>{uc.title}</span>
                <h4 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 800, marginBottom: 8 }}>{uc.title}</h4>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="landing-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 12 }}>
              Workflow Steps
            </span>
            <h2 className="landing-title">Announce Winners In Four Simple Steps</h2>
            <p className="landing-subtitle">
              Get your result portal live, customized, and ready for your audience in less than ten minutes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginTop: 40 }}>
            {[
              { step: '01', title: 'Create Event', desc: 'Input details, slug name (e.g. /event/sys-2026), and event dates in the Super Admin dashboard.' },
              { step: '02', title: 'Configure Branding', desc: 'Upload your organization logo and choose your event primary, secondary, and accent colors.' },
              { step: '03', title: 'Publish Results', desc: 'Input competition categories, standings, and winner names to generate result posters dynamically.' },
              { step: '04', title: 'Audience Downloads', desc: 'Provide your audience with your portal link to let them search, view, and download flyers.' }
            ].map((step) => (
              <div key={step.step} className="hz-card" style={{ position: 'relative', padding: 32 }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0F172A', lineHeight: 1, fontFamily: 'var(--font-title)', marginBottom: 16 }}>{step.step}</div>
                <h4 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 800, marginBottom: 8 }}>{step.title}</h4>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="landing-section" id="pricing">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 12 }}>
              Flexible Licensing
            </span>
            <h2 className="landing-title">Flexible Pricing Model</h2>
            <p className="landing-subtitle">
              Choose a plan tailored to your event duration and audience scale. No long-term lock-ins, just active licenses when your competition is running.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, marginTop: 40, maxWidth: 1120, margin: '40px auto 0' }}>
            {/* Starter Plan */}
            <div className="hz-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 36 }}>
              <div>
                <span className="hz-pill-badge" style={{ marginBottom: 16 }}>Starter</span>
                <h4 style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: 800, marginBottom: 6 }}>Starter</h4>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 24 }}>Perfect for local clubs and small school tournaments.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0F172A' }}>$49</span>
                  <span style={{ color: '#64748B', fontSize: '0.9rem', marginLeft: 6 }}>/ event license</span>
                </div>
                <div style={{ height: 1, background: '#E2E8F0', marginBottom: 24 }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, color: '#475569', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Up to 50 program results</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> 1 template choice</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Dynamic results gallery</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> 14-day admin editing access</li>
                </ul>
              </div>
              <a href="#demo" className="hz-btn-light" style={{ width: '100%', marginTop: 32 }}>Request Starter Demo</a>
            </div>

            {/* Professional Plan (High Contrast Dark Navy Accent Card) */}
            <div className="hz-card-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 36, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 18, right: 20 }}>
                <span style={{ background: '#0066FF', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '4px 14px', borderRadius: 9999, letterSpacing: '0.05em' }}>
                  MOST POPULAR
                </span>
              </div>
              <div>
                <span className="hz-pill-badge-dark" style={{ marginBottom: 16 }}>Professional</span>
                <h4 style={{ fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 800, marginBottom: 6 }}>Professional</h4>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: 24 }}>Ideal for sector arts festivals and college fests.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: 800, color: '#FFFFFF' }}>$99</span>
                  <span style={{ color: '#94A3B8', fontSize: '0.9rem', marginLeft: 6 }}>/ event license</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginBottom: 24 }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, color: '#E2E8F0', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#0066FF' }} /> Unlimited published results</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#0066FF' }} /> All poster templates</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#0066FF' }} /> Custom logos &amp; theme colors</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#0066FF' }} /> Custom canvas template editor</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#0066FF' }} /> 30-day admin editing access</li>
                </ul>
              </div>
              <a href="#demo" className="hz-btn-vibrant" style={{ width: '100%', marginTop: 32 }}>
                <span>Select Professional</span> <ArrowRight size={16} />
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="hz-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 36 }}>
              <div>
                <span className="hz-pill-badge" style={{ marginBottom: 16 }}>Enterprise</span>
                <h4 style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: 800, marginBottom: 6 }}>Enterprise</h4>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 24 }}>For state-level committees and event agencies.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0F172A' }}>Custom</span>
                  <span style={{ color: '#64748B', fontSize: '0.9rem', marginLeft: 6 }}>/ customized setup</span>
                </div>
                <div style={{ height: 1, background: '#E2E8F0', marginBottom: 24 }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, color: '#475569', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Multiple sub-event portals</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Custom domain integration</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Custom design services for assets</li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Extended editing &amp; dedicated support</li>
                </ul>
              </div>
              <a href="#demo" className="hz-btn-light" style={{ width: '100%', marginTop: 32 }}>Contact Sales</a>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: '0.85rem', color: '#64748B' }}>
            ⚠️ <em>All plans feature permanent archiving: public result galleries and poster downloads remain live forever even after admin editing closes.</em>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 12 }}>
              Customer Stories
            </span>
            <h2 className="landing-title">Trusted By Event Committees</h2>
            <p className="landing-subtitle">
              See how coordinators save days of design work and keep attendees thrilled with instant announcement posters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 40 }}>
            {[
              { q: "We published over 150 arts result flyers within minutes of the official announcements. Parents and students were downloading high-res posters from our URL before the coordinators even left the staging rooms. Absolute game-changer!", auth: "K. P. Hashim", role: "Sahityotsav Sector Committee Chair" },
              { q: "Our college cultural fest has always struggled with spelling errors on poster announcements. The validation checks and templates here prevented errors, kept our sponsors branded, and gave us the perfect Instagram feeds.", auth: "Dr. Ananya Roy", role: "Cultural Dean, Tech-Arts University" },
              { q: "Having the ability to drag and edit template text grids directly on the canvas without leaving the dashboard saved us hours of custom CSS positioning. Best investment we made for our regional talent search.", auth: "Manoj Kumar", role: "Public Relations Officer, Kerala Arts Guild" }
            ].map((t, idx) => (
              <div key={idx} className="hz-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: 24, fontSize: '0.95rem', lineHeight: 1.6 }}>"{t.q}"</p>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>{t.auth}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="landing-section" id="faq">
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ textAlign: 'center' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 12 }}>
              Questions &amp; Answers
            </span>
            <h2 className="landing-title">Frequently Asked Questions</h2>
            <p className="landing-subtitle">Have questions about integrations or license durations? Here are our answers.</p>
          </div>

          <div className="hz-card" style={{ padding: '24px 40px', marginTop: 40 }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#0066FF' }} />
                </div>
                <div className={`faq-answer ${openFaq === idx ? 'open' : ''}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Sign Up */}
      <section className="landing-section" id="demo">
        <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
          <div className="hz-card" style={{ padding: '48px 36px' }}>
            <span className="hz-pill-badge" style={{ marginBottom: 16 }}>
              Get Started
            </span>
            <h2 className="landing-title" style={{ fontSize: '2.3rem' }}>Ready To Transform Your Next Festival?</h2>
            <p className="landing-subtitle" style={{ marginBottom: 32 }}>
              Get a personalized sandbox environment populated with mock event data to test layout templates and real-time previews.
            </p>

            {demoRequested ? (
              <div style={{ background: '#D1FAE5', color: '#065F46', padding: '16px 24px', borderRadius: 9999, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} />
                <span>Request received! Our team will contact you within 24 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 500, margin: '0 auto', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    padding: '14px 22px', borderRadius: 9999, border: '1px solid #CBD5E1',
                    background: '#F8FAFC', flexGrow: 1, fontFamily: 'var(--font-body)', fontSize: '0.95rem'
                  }}
                  required
                />
                <button type="submit" className="hz-btn-dark" style={{ flexShrink: 0 }}>
                  <span>Request Free Demo</span> <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer — Horizon Dark Navy Style */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '64px 0 40px', fontSize: '0.9rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'white', fontWeight: 800, fontSize: '1.25rem', marginBottom: 16 }}>
                <div className="landing-logo-icon" style={{ background: '#FFFFFF', color: '#0F172A' }}>R</div>
                <span>ResultFlow</span>
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#94A3B8' }}>
                An elite cloud poster generation framework designed for competitive festivals, committees, colleges, and athletic associations.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: 16, fontWeight: 700 }}>Features</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="#features" style={{ color: '#94A3B8' }}>Announcements</a></li>
                <li><a href="#features" style={{ color: '#94A3B8' }}>Poster Builder</a></li>
                <li><a href="#features" style={{ color: '#94A3B8' }}>Multi-Tenancy</a></li>
                <li><a href="#features" style={{ color: '#94A3B8' }}>Custom Themes</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: 16, fontWeight: 700 }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="#faq" style={{ color: '#94A3B8' }}>Help &amp; FAQs</a></li>
                <li><a href="#demo" style={{ color: '#94A3B8' }}>Request Info</a></li>
                <li><Link to="/login" style={{ color: '#94A3B8' }}>Admin Login</Link></li>
                <li><Link to="/sadmin" style={{ color: '#94A3B8' }}>Super Admin Login</Link></li>
                <li><Link to="/event/wandoor-sahityotsav-2026" style={{ color: '#94A3B8' }}>Sample Event</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: 16, fontWeight: 700 }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="#" style={{ color: '#94A3B8' }}>Terms of Service</a></li>
                <li><a href="#" style={{ color: '#94A3B8' }}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: '#94A3B8' }}>Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, textAlign: 'center', fontSize: '0.85rem' }}>
            <p>© {new Date().getFullYear()} ResultFlow SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
