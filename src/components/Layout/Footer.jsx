import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-logo-desc">
            <div className="logo-group">
              <div className="logo-icon" style={{ color: '#111827', background: 'white' }}>A</div>
              <div className="logo-text" style={{ background: 'white', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Arts Posters
              </div>
            </div>
            <p>
              An elite, responsive generation system for overlaying competition results onto brand assets and printing pixel-perfect posters.
            </p>
          </div>

          <div className="footer-links-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/gallery">Results Gallery</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Socials</h4>
            <ul>
              <li><Link to="https://www.facebook.com/ssfwandoor/">Facebook</Link></li>
              <li><Link to="https://www.instagram.com/ssfwandoorsector?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==">Instagram</Link></li>
              <li><Link to="https://wa.me/918086199683">WhatsApp</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Wandoor Sector Sahityotsav. All rights reserved.</p>
          <p>Built with ❤️ for Wandoor Sector</p>
        </div>
      </div>
    </footer>
  );
}
