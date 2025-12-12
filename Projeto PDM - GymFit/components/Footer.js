// components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="logo-footer">
              <img src="/assets/images/logo.png" alt="GymFit Logo" className="footer-logo" />
              <p>&copy; 2025 GymFit - Todos os direitos reservados.</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="social-links">
              <a href="https://www.instagram.com/rafa_rubia7" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-instagram"></i>
                <span>Rafael</span>
              </a>
              <a href="https://www.instagram.com/monteiro.livs" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-instagram"></i>
                <span>Lívia</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
