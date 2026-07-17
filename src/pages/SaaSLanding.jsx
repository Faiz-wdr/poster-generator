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
      {/* Dynamic styles to override basic header/page defaults for landing page branding */}
      <style>{`
        .landing-header {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid var(--border-color);
          padding: 18px 0;
        }
        .landing-logo-icon {
          background: linear-gradient(135deg, #7C3AED, #DB2777);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
        }
        .landing-logo-text {
          font-weight: 800;
          font-size: 1.3rem;
          color: var(--text-primary);
        }
        .landing-nav a {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          margin-right: 28px;
          transition: color var(--transition-fast);
        }
        .landing-nav a:hover {
          color: #7C3AED;
        }
        .landing-section {
          padding: 100px 0;
        }
        .landing-title {
          font-size: 3rem;
          line-height: 1.2;
          text-align: center;
          margin-bottom: 20px;
          font-family: var(--font-title);
          background: linear-gradient(135deg, var(--text-primary) 60%, #7C3AED);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .landing-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          text-align: center;
          max-width: 650px;
          margin: 0 auto 48px;
        }
        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-md);
          border-color: rgba(124, 58, 237, 0.2);
        }
        .feature-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(124, 58, 237, 0.08);
          color: #7C3AED;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pricing-card {
          background: white;
          border-radius: 24px;
          padding: 40px 32px;
          border: 1px solid var(--border-color);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s ease;
        }
        .pricing-card.premium {
          border-color: #7C3AED;
          box-shadow: 0 16px 40px rgba(124, 58, 237, 0.08);
        }
        .pricing-card.premium::after {
          content: 'MOST POPULAR';
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #7C3AED, #DB2777);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 14px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
        }
        .faq-item {
          border-bottom: 1px solid var(--border-color);
          padding: 20px 0;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text-primary);
          cursor: pointer;
          user-select: none;
        }
        .faq-answer {
          margin-top: 12px;
          color: var(--text-secondary);
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
          border-radius: 20px;
          border: 6px solid #1E293B;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }
        .mockup-header {
          background: #1E293B;
          height: 38px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 6px;
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
        }
        .mockup-nav-item {
          height: 28px;
          border-radius: 6px;
          background: #F1F5F9;
          margin-bottom: 8px;
        }
        .mockup-nav-item.active {
          background: #EEF2FF;
          border-left: 3px solid #7C3AED;
        }
        .mockup-content {
          flex-grow: 1;
          padding: 16px;
        }
        .mockup-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .mockup-card {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 12px;
        }
        .mockup-canvas {
          background: white;
          aspect-ratio: 4/5;
          max-width: 240px;
          margin: 0 auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          border: 1.5px solid #F3F4F6;
        }
        .mockup-canvas-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border: 8px solid #F59E0B;
          border-top: 24px solid #7C3AED;
          border-radius: 8px;
          opacity: 0.15;
        }
      `}</style>

      {/* Header */}
      <header className="landing-header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="landing-logo-icon">R</div>
            <span className="landing-logo-text">ResultFlow</span>
          </Link>

          <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center' }}>
            <a href="#features">Features</a>
            <a href="#usecases">Use Cases</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <Link to="/login" className="btn btn-outline btn-sm" style={{ marginRight: 12, padding: '8px 16px' }}>Login</Link>
            <a href="#demo" className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>Request Demo</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-section" style={{ background: 'linear-gradient(180deg, #F1F5F9 0%, var(--bg-page) 100%)', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 850, margin: '0 auto 60px' }}>
            <span className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex', gap: 6, padding: '6px 16px' }}>
              <Sparkles size={14} /> Multi-Tenant Result Poster Engine
            </span>
            <h1 className="landing-title" style={{ fontSize: '3.8rem', fontWeight: 800 }}>
              Dynamic Result Posters For Festivals &amp; Competitions
            </h1>
            <p className="landing-subtitle">
              Publish event results, customize beautiful layouts, and download print-quality branded posters instantly. Sell and deploy to multiple festivals, colleges, and schools from a single system.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link to="/event/wandoor-sahityotsav-2026" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>View Sample Event</span> <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline">
                Admin Login Portal
              </Link>
            </div>
          </div>

          {/* Actual Mockup Screens */}
          <div className="app-mockup">
            <div className="mockup-header">
              <div className="mockup-dot" style={{ background: '#EF4444' }} />
              <div className="mockup-dot" style={{ background: '#F59E0B' }} />
              <div className="mockup-dot" style={{ background: '#10B981' }} />
              <div style={{ marginLeft: 20, background: '#0F172A', color: '#94A3B8', fontSize: '0.75rem', padding: '2px 16px', borderRadius: 4, fontFamily: 'monospace' }}>
                https://resultflow.io/event/alqamar-2027
              </div>
            </div>
            <div className="mockup-body" style={{ display: 'flex', minHeight: 460 }}>
              {/* Mockup Sidebar */}
              <div className="mockup-sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: '#7C3AED' }} />
                    <div style={{ height: 10, width: 80, background: '#94A3B8', borderRadius: 2 }} />
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
                    <div style={{ height: 14, width: 140, background: '#1E293B', borderRadius: 3, marginBottom: 6 }} />
                    <div style={{ height: 10, width: 220, background: '#94A3B8', borderRadius: 2 }} />
                  </div>
                  <div style={{ height: 32, width: 120, background: '#7C3AED', borderRadius: 6 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20 }}>
                  {/* Left Column: Data Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="mockup-card">
                      <div style={{ height: 10, width: 100, background: '#94A3B8', borderRadius: 2, marginBottom: 8 }} />
                      <div style={{ height: 32, background: '#F1F5F9', borderRadius: 6 }} />
                    </div>
                    <div className="mockup-card">
                      <div style={{ height: 10, width: 80, background: '#94A3B8', borderRadius: 2, marginBottom: 8 }} />
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <div style={{ height: 28, flex: 1, background: '#F1F5F9', borderRadius: 6 }} />
                        <div style={{ height: 28, flex: 1, background: '#F1F5F9', borderRadius: 6 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ height: 28, flex: 1, background: '#F1F5F9', borderRadius: 6 }} />
                        <div style={{ height: 28, flex: 1, background: '#F1F5F9', borderRadius: 6 }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
                      <div style={{ height: 28, width: 90, background: '#E2E8F0', borderRadius: 6 }} />
                      <div style={{ height: 28, width: 90, background: '#10B981', borderRadius: 6 }} />
                    </div>
                  </div>

                  {/* Right Column: Poster Canvas */}
                  <div className="mockup-canvas">
                    <div className="mockup-canvas-bg" />
                    <div style={{ position: 'relative', height: '100%', padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ height: 6, width: 60, background: '#7C3AED', borderRadius: 1, margin: '2px auto 4px' }} />
                        <div style={{ height: 12, width: 140, background: '#111827', borderRadius: 2, margin: '0 auto' }} />
                        <div style={{ height: 8, width: 80, background: '#EC4899', borderRadius: 2, margin: '6px auto' }} />
                      </div>

                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', padding: 4, borderRadius: 4, border: '0.5px solid #E5E7EB' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 800 }}>1</div>
                          <div style={{ height: 6, width: 60, background: '#111827', borderRadius: 1 }} />
                          <div style={{ height: 6, width: 30, background: '#94A3B8', borderRadius: 1 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', padding: 4, borderRadius: 4, border: '0.5px solid #E5E7EB' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 800 }}>2</div>
                          <div style={{ height: 6, width: 55, background: '#111827', borderRadius: 1 }} />
                          <div style={{ height: 6, width: 25, background: '#94A3B8', borderRadius: 1 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', padding: 4, borderRadius: 4, border: '0.5px solid #E5E7EB' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: 'white', fontWeight: 800 }}>3</div>
                          <div style={{ height: 6, width: 50, background: '#111827', borderRadius: 1 }} />
                          <div style={{ height: 6, width: 35, background: '#94A3B8', borderRadius: 1 }} />
                        </div>
                      </div>

                      <div style={{ height: 6, width: 40, background: '#94A3B8', borderRadius: 1 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-section" id="features" style={{ background: 'white' }}>
        <div className="container">
          <h2 className="landing-title">Engineered For Rapid Results Announcements</h2>
          <p className="landing-subtitle">
            Say goodbye to Photoshop templates, manual typing, and broken fonts. Get all the features you need to manage cultural fests from one system.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 48 }}>
            <div className="feature-card">
              <div className="feature-card-icon"><ClipboardList size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>Instant Result Publishing</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Enter scores and placements through a clean interface and publish results live for parents, students, and attendees immediately.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon"><Trophy size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>Dynamic Poster Generation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Announcements are instantly compiled into beautiful graphics matching your predefined templates—no manual layout editing required.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon"><Palette size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>Multiple Poster Templates</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Create or choose from multiple design packages (Classic Elite, Cyber Pulse, Sunset Glow) matching the aesthetic of different events.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon"><Monitor size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>Real-Time Preview</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Check changes as you type. Dynamic canvas adjustments ensure names and team codes sit perfectly inside safe margin zones.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon"><Layers size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>Template Layout Editor</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                An elite built-in creator tool lets you drag, resize, align, and re-theme fields like placement names, team badges, and category labels.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon"><Layout size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>Mobile-Friendly Dashboard</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Completely responsive admin page lets coordinators write, publish, and delete result drafts straight from their smartphones.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon"><Settings size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>Custom Branding</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Dynamic branding variables ensure that every client page inherits their logo, header headers, and primary, secondary, and accent colors.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon"><Download size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>High-Quality Downloads</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Save results flyers as pixel-perfect, crisp JPGs ready for download, distribution, and printing at full 1080x1350px size.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon"><Shield size={22} /></div>
              <h3 style={{ fontSize: '1.25rem' }}>Multi-Tenant Architecture</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Hosts multiple events and committees on a single system. Keep client results, assets, and coordinator credentials safely segmented.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="landing-section" id="usecases" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <h2 className="landing-title">Perfect For Any Competition</h2>
          <p className="landing-subtitle">
            From large-scale national cultural festivals to local community events, our platform adapts to your organizational requirements.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 48 }}>
            {[
              { title: 'Arts Festivals', desc: 'Manage hundreds of stage events, music slots, drawing programs, and drama standings.' },
              { title: 'School Competitions', desc: 'Announce inter-class athletic rankings, spelling bees, and science fairs immediately.' },
              { title: 'College Fests', desc: 'Brand technical hackathons, cultural concerts, and fashion shows under separate layout grids.' },
              { title: 'Cultural Events', desc: 'Announce literary, debating, and talent search champions on branded certificate flyers.' },
              { title: 'Educational Orgs', desc: 'Display board rankings, scholarship exam results, and olympiad awards professionally.' },
              { title: 'Community Programs', desc: 'Promote local club tournaments, chess championships, and charity runs.' }
            ].map(uc => (
              <div key={uc.title} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>{uc.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="landing-section" style={{ background: 'white' }}>
        <div className="container">
          <h2 className="landing-title">Announce Winners In Four Simple Steps</h2>
          <p className="landing-subtitle">
            Get your result portal live, customized, and ready for your audience in less than ten minutes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, marginTop: 48 }}>
            {[
              { step: '01', title: 'Create Event', desc: 'Input details, slug name (e.g. /event/sys-2026), and event dates in the Super Admin dashboard.' },
              { step: '02', title: 'Configure Branding', desc: 'Upload your organization logo and choose your event primary, secondary, and accent colors.' },
              { step: '03', title: 'Publish Results', desc: 'Input competition categories, standings, and winner names to generate result posters dynamically.' },
              { step: '04', title: 'Audience Downloads', desc: 'Provide your audience with your portal link to let them search, view, and download flyers.' }
            ].map((step, idx) => (
              <div key={step.step} style={{ position: 'relative' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'rgba(124, 58, 237, 0.12)', lineHeight: 1, fontFamily: 'var(--font-title)', marginBottom: 12 }}>{step.step}</div>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>{step.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="landing-section" id="pricing" style={{ background: 'var(--bg-page)' }}>
        <div className="container">
          <h2 className="landing-title">Flexible Pricing Model</h2>
          <p className="landing-subtitle">
            Choose a plan tailored to your event duration and audience scale. No long-term lock-ins, just active licenses when your competition is running.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, marginTop: 48, maxWidth: 1100, margin: '48px auto 0' }}>
            <div className="pricing-card">
              <div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 8 }}>Starter</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>Perfect for local clubs and small school tournaments.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$49</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: 6 }}>/ event license</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-color)', marginBottom: 24 }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Up to 50 program results</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> 1 template choice</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Dynamic results gallery</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> 14-day admin editing access</li>
                </ul>
              </div>
              <a href="#demo" className="btn btn-outline" style={{ width: '100%', marginTop: 32 }}>Request Starter Demo</a>
            </div>

            <div className="pricing-card premium">
              <div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 8 }}>Professional</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>Ideal for sector arts festivals and college fests.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$99</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: 6 }}>/ event license</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-color)', marginBottom: 24 }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#7C3AED' }} /> Unlimited published results</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#7C3AED' }} /> All poster templates</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#7C3AED' }} /> Custom logos &amp; theme colors</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#7C3AED' }} /> Custom canvas template editor</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#7C3AED' }} /> 30-day admin editing access</li>
                </ul>
              </div>
              <a href="#demo" className="btn btn-primary" style={{ width: '100%', marginTop: 32 }}>Select Professional</a>
            </div>

            <div className="pricing-card">
              <div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 8 }}>Enterprise</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>For state-level committees and event agencies.</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 24 }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>Custom</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: 6 }}>/ customized setup</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-color)', marginBottom: 24 }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Multiple sub-event portals</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Custom domain integration</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Custom design services for assets</li>
                  <li style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} style={{ color: '#10B981' }} /> Extended editing &amp; dedicated support</li>
                </ul>
              </div>
              <a href="#demo" className="btn btn-outline" style={{ width: '100%', marginTop: 32 }}>Contact Sales</a>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ⚠️ <em>All plans feature permanent archiving: public result galleries and poster downloads remain live forever even after admin editing closes.</em>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section" style={{ background: 'white' }}>
        <div className="container">
          <h2 className="landing-title">Trusted By Event Committees</h2>
          <p className="landing-subtitle">
            See how coordinators save days of design work and keep attendees thrilled with instant announcement posters.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 48 }}>
            {[
              { q: "We published over 150 arts result flyers within minutes of the official announcements. Parents and students were downloading high-res posters from our URL before the coordinators even left the staging rooms. Absolute game-changer!", auth: "K. P. Hashim", role: "Sahityotsav Sector Committee Chair" },
              { q: "Our college cultural fest has always struggled with spelling errors on poster announcements. The validation checks and templates here prevented errors, kept our sponsors branded, and gave us the perfect Instagram feeds.", auth: "Dr. Ananya Roy", role: "Cultural Dean, Tech-Arts University" },
              { q: "Having the ability to drag and edit template text grids directly on the canvas without leaving the dashboard saved us hours of custom CSS positioning. Best investment we made for our regional talent search.", auth: "Manoj Kumar", role: "Public Relations Officer, Kerala Arts Guild" }
            ].map((t, idx) => (
              <div key={idx} style={{ background: 'var(--bg-page)', borderRadius: 20, padding: 32, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.95rem', lineHeight: 1.6 }}>"{t.q}"</p>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.auth}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="landing-section" id="faq" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 className="landing-title">Frequently Asked Questions</h2>
          <p className="landing-subtitle">Have questions about integrations or license durations? Here are our answers.</p>

          <div style={{ background: 'white', borderRadius: 24, padding: '24px 40px', border: '1px solid var(--border-color)', marginTop: 48 }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
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
      <section className="landing-section" id="demo" style={{ background: 'white', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: 650, textAlign: 'center' }}>
          <h2 className="landing-title">Ready To Transform Your Next Festival?</h2>
          <p className="landing-subtitle">
            Get a personalized sandbox environment populated with mock event data to test layout templates and real-time previews.
          </p>

          {demoRequested ? (
            <div style={{ background: '#D1FAE5', color: '#065F46', padding: '16px 24px', borderRadius: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} />
              <span>Request received! Our team will contact you within 24 hours.</span>
            </div>
          ) : (
            <form onSubmit={handleDemoSubmit} style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 500, margin: '0 auto' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: '14px 20px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-page)', flexGrow: 1, fontFamily: 'var(--font-body)' }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Request Free Demo</button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '60px 0 40px', fontSize: '0.9rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: 16 }}>
                <div className="landing-logo-icon">R</div>
                <span>ResultFlow</span>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                An elite cloud poster generation framework designed for competitive festivals, committees, colleges, and athletic associations.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: 16 }}>Features</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="#features" style={{ color: '#94A3B8' }}>Announcements</a></li>
                <li><a href="#features" style={{ color: '#94A3B8' }}>Poster Builder</a></li>
                <li><a href="#features" style={{ color: '#94A3B8' }}>Multi-Tenancy</a></li>
                <li><a href="#features" style={{ color: '#94A3B8' }}>Custom Themes</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: 16 }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="#faq" style={{ color: '#94A3B8' }}>Help &amp; FAQs</a></li>
                <li><a href="#demo" style={{ color: '#94A3B8' }}>Request Info</a></li>
                <li><Link to="/login" style={{ color: '#94A3B8' }}>Admin Login</Link></li>
                <li><Link to="/sadmin" style={{ color: '#94A3B8' }}>Super Admin Login</Link></li>
                <li><Link to="/event/wandoor-sahityotsav-2026" style={{ color: '#94A3B8' }}>Sample Event</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: 16 }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="#" style={{ color: '#94A3B8' }}>Terms of Service</a></li>
                <li><a href="#" style={{ color: '#94A3B8' }}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: '#94A3B8' }}>Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 20, textAlign: 'center', fontSize: '0.8rem' }}>
            <p>© {new Date().getFullYear()} ResultFlow SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
