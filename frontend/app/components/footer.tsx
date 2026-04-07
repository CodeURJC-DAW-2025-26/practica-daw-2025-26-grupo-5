import React from 'react';
import '../app.css';
import logo from "../assets/logo.png";

/**
 * Footer Component
 * Global footer displayed at the bottom of every page
 */
export default function Footer() {
  return (
    <>
      <footer className="footer-stilnovo mt-5">
        <div className="container">
          <div className="row g-4">
            {/* Branding Column */}
            <div className="col-lg-4">
              <div className="mb-3">
                <a href="/" className="text-decoration-none d-flex align-items-center gap-2">
                  <img 
                    src={logo} 
                    alt="Stilnovo" 
                    style={{ height: '40px', filter: 'brightness(0) invert(1)' }} 
                  />
                  <span className="text-white fw-bold fs-2">Stilnovo</span>
                </a>
              </div>
              <p>
                Elevate your style, sustain the planet. The ultimate premium marketplace for 
                circular fashion and unique designer treasures.
              </p>
              <div className="d-flex gap-3 mt-4">
                <a 
                  href="https://www.instagram.com/stilnovo_marketplace/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link btn-sell"
                >
                  <i className="fa-brands fa-instagram fs-5"></i>
                </a>
                <a 
                  href="https://www.youtube.com/@StilnovoWebsite" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link btn-sell"
                >
                  <i className="fa-brands fa-youtube fs-5"></i>
                </a>
              </div>
            </div>

            {/* Platform Column */}
            <div className="col-lg-2 offset-lg-1">
              <h6>PLATFORM</h6>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li><a href="/about-page" className="footer-link">About Us</a></li>
                <li>
                  <a 
                    className="footer-link" 
                    style={{ cursor: 'pointer' }}
                    data-bs-toggle="modal" 
                    data-bs-target="#termsModal"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    className="footer-link" 
                    style={{ cursor: 'pointer' }}
                    data-bs-toggle="modal" 
                    data-bs-target="#safetyModal"
                  >
                    Safety Rules
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="col-lg-2">
              <h6>SUPPORT</h6>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li>
                  <a 
                    className="footer-link" 
                    style={{ cursor: 'pointer' }}
                    data-bs-toggle="modal" 
                    data-bs-target="#helpModal"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a 
                    className="footer-link" 
                    style={{ cursor: 'pointer' }}
                    data-bs-toggle="modal" 
                    data-bs-target="#privacyModal"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    className="footer-link" 
                    style={{ cursor: 'pointer' }}
                    data-bs-toggle="modal" 
                    data-bs-target="#cookieModal"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>

            {/* Call to Action Column */}
            <div className="col-lg-3">
              <h6>READY TO START?</h6>
              <p className="mb-4 small">
                If you don't have an account, please join our community and start trading unique pieces today.
              </p>
              <a href="/signup-page" className="btn-sell">CREATE ACCOUNT</a>
            </div>
          </div>

          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} className="my-5" />

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              &copy; 2026 Stilnovo Marketplace. All rights reserved.
            </p>
            <div className="d-flex gap-3 text-white fs-4 opacity-75">
              <i className="fa-brands fa-cc-visa"></i>
              <i className="fa-brands fa-cc-mastercard"></i>
              <i className="fa-brands fa-cc-apple-pay"></i>
            </div>
          </div>
        </div>
      </footer>

      {/* --- MODALS --- */}

      {/* Help Modal */}
      <div className="modal fade" id="helpModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content stn-modal-content p-4 text-center">
            <div className="modal-header border-0 pb-0">
              <h5 className="stn-modal-title w-100">Need Assistance?</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body stn-modal-body">
              <p>To access our official support and FAQs, please follow this path:</p>
              <div className="stn-path-box my-3">
                My Account <i className="fa-solid fa-chevron-right mx-2 fs-small"></i> Help Center
              </div>
              <p className="text-danger small fw-bold">
                <i className="fa-solid fa-lock me-1"></i> You must be logged in to view this section.
              </p>
              <button className="btn-about" data-bs-dismiss="modal">UNDERSTOOD</button>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <div className="modal fade" id="termsModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content stn-modal-content p-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="stn-modal-title">Terms of Service</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body stn-modal-body">
              <p>
                By using Stilnovo, you agree to our community guidelines. We provide a platform for circular fashion. 
                All users must maintain integrity in transactions and respect intellectual property rights. 
                We are not liable for direct disputes between users but provide tools to facilitate safe trading.
              </p>
              <button className="btn-about" data-bs-dismiss="modal">I accept the terms</button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Modal */}
      <div className="modal fade" id="privacyModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content stn-modal-content p-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="stn-modal-title">Privacy Policy</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body stn-modal-body">
              <p>
                Your data is safe with us. We use industry-standard encryption to protect your personal information 
                and transaction history. We never sell your data to third parties.
              </p>
              <button className="btn-about" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Modal */}
      <div className="modal fade" id="safetyModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content stn-modal-content p-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="stn-modal-title">Safety Rules</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body stn-modal-body">
              <ul className="list-unstyled text-start">
                <li className="mb-3">
                  <i className="fa-solid fa-shield-check text-primary me-2"></i> Only trade through Stilnovo's platform.
                </li>
                <li className="mb-3">
                  <i className="fa-solid fa-shield-check text-primary me-2"></i> Verify item authenticity before shipping.
                </li>
                <li>
                  <i className="fa-solid fa-shield-check text-primary me-2"></i> Report suspicious behavior immediately.
                </li>
              </ul>
              <div className="text-center mt-3">
                <button className="btn-about" data-bs-dismiss="modal">Stay safe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Modal */}
      <div className="modal fade" id="cookieModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content stn-modal-content p-4 text-center">
            <div className="modal-header border-0 pb-0">
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body stn-modal-body">
              <i className="fa-solid fa-cookie-bite text-primary fs-1 mb-3"></i>
              <h5 className="stn-modal-title mb-3">Cookie Policy</h5>
              <p>We use cookies to personalize your experience and analyze our traffic. By continuing to use our site, you accept our cookie usage.</p>
              <button className="btn-about" data-bs-dismiss="modal">Accept all</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}