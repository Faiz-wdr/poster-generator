import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pressTimerRef = useRef(null);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const startPress = () => {
    pressTimerRef.current = setTimeout(() => navigate('/admin'), 1200);
  };
  const endPress = () => clearTimeout(pressTimerRef.current);

  return (
    <header>
      <div className="container nav-flex">
        <Link
          to="/"
          className="logo-group"
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
        >
          <div className="logo-icon">A</div>
          <div className="logo-text">Arts Posters</div>
        </Link>

        <nav className="nav-links" id="desktop-nav">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/gallery" className={isActive('/gallery')}>Results Gallery</Link>
        </nav>

        <button
          className={`nav-mobile-toggle ${mobileOpen ? 'open' : ''}`}
          id="public-hamburger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-nav-panel ${mobileOpen ? 'open' : ''}`} id="mobile-nav">
        <Link to="/" className={isActive('/')} onClick={() => setMobileOpen(false)}>Home</Link>
        <Link to="/gallery" className={isActive('/gallery')} onClick={() => setMobileOpen(false)}>Results Gallery</Link>
      </div>
    </header>
  );
}
