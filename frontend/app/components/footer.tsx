import React, { useState } from 'react';
import { Modal, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router'; // Corrected import for v7
import logo from "../assets/logo.png";
import '../app.css';
import { useUserStore } from "~/stores/useUserStore";
import { chatBotHelper } from "~/services/AI/ai-service";

export default function Footer() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showCookie, setShowCookie] = useState(false);

  // Integrated AI Assistant State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleHelpCenter = () => {
    if (user) {
      navigate('/user/help');
    } else {
      setShowHelp(true);
    }
  };

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiLoading) return;

    setIsAiLoading(true);
    try {
      const response = await chatBotHelper(aiQuestion);
      setAiAnswer(response);
    } catch (err) {
      setAiAnswer("I'm having trouble connecting to the Stilnovo brain.");
    } finally {
      setIsAiLoading(false);
      setAiQuestion("");
    }
  };

  const toggleHelp = () => setShowHelp(!showHelp);
  const toggleTerms = () => setShowTerms(!showTerms);
  const togglePrivacy = () => setShowPrivacy(!showPrivacy);
  const toggleSafety = () => setShowSafety(!showSafety);
  const toggleCookie = () => setShowCookie(!showCookie);

  const { user, isAuthLoading } = useUserStore();

  return (
    <>
      <footer className="footer-stilnovo mt-5">
        <div className="container">
          <div className="row g-4">

            {/* Branding Column */}
            <div className="col-lg-4">
              <div className="mb-3">
                <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
                  <img
                    src={logo}
                    alt="Stilnovo"
                    style={{ height: '40px', filter: 'brightness(0) invert(1)' }}
                  />
                  <span className="text-white fw-bold fs-2">Stilnovo</span>
                </Link>
              </div>
              <p>
                Elevate your style, sustain the planet. The ultimate premium marketplace for
                circular fashion and unique designer treasures.
              </p>
              <div className="d-flex gap-3 mt-4">
                <a href="https://www.instagram.com/stilnovo_marketplace/" target="_blank" rel="noopener noreferrer" className="social-link btn-sell">
                  <i className="fa-brands fa-instagram fs-5"></i>
                </a>
                <a href="https://www.youtube.com/@StilnovoWebsite" target="_blank" rel="noopener noreferrer" className="social-link btn-sell">
                  <i className="fa-brands fa-youtube fs-5"></i>
                </a>
              </div>

              {/* AI Assistant - Clean & Minimalist Version */}
              {user && (
                <div className="ai-footer-integration mt-4 p-4 rounded-4 shadow-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className={`fa-solid fa-sparkles text-primary ${isAiLoading ? 'fa-spin' : ''}`}></i>
                    <span className="fw-bold text-white">Stilnovo AI Assistant</span>
                    {isAiLoading && <small className="text-muted ms-2 italic">thinking...</small>}
                  </div>

                  {aiAnswer && (
                    <div className="ai-response-box mb-4 p-3 rounded-3 bg-white shadow-sm animate__animated animate__fadeIn"
                      style={{
                        fontSize: '0.9rem',
                        color: '#334155',
                        lineHeight: '1.6',
                        borderLeft: '3px solid #007bff'
                      }}>
                      {aiAnswer}
                    </div>
                  )}

                  <Form onSubmit={handleAiAsk}>
                    <InputGroup className="overflow-hidden rounded-3 shadow-sm" style={{ border: 'none' }}>
                      <Form.Control
                        className="py-2 px-3 fw-500 border-0"
                        placeholder="How can I help you today?"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        style={{
                          backgroundColor: '#ffffff', 
                          color: '#1e293b',         
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        className="px-4 fw-bold border-0"
                        disabled={isAiLoading || !aiQuestion.trim()}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {isAiLoading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Ask Stilnovo AI"
                        )}
                      </Button>
                    </InputGroup>
                  </Form>

                  <div className="mt-3 opacity-50">
                    <small className="text-white fw-500" style={{ fontSize: '0.75rem' }}>
                      Exclusive access for our community
                    </small>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Column */}
            <div className="col-lg-2 offset-lg-1">
              <h6>PLATFORM</h6>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li><Link to="/about-page" className="footer-link">About Us</Link></li>
                <li><span className="footer-link cursor-pointer" onClick={toggleTerms}>Terms of Service</span></li>
                <li><span className="footer-link cursor-pointer" onClick={toggleSafety}>Safety Rules</span></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="col-lg-2">
              <h6>SUPPORT</h6>
              <ul className="list-unstyled d-flex flex-column gap-3">
                <li><span className="footer-link cursor-pointer" onClick={handleHelpCenter}>Help Center</span></li>
                <li><span className="footer-link cursor-pointer" onClick={togglePrivacy}>Privacy Policy</span></li>
                <li><span className="footer-link cursor-pointer" onClick={toggleCookie}>Cookies</span></li>
              </ul>
            </div>

            {/* Call to Action Column */}
            <div className="col-lg-3">
              {isAuthLoading ? (
                <div style={{ width: '42px', height: '42px' }} className="spinner-border spinner-border-sm text-muted" />
              ) : user ? (
                <>
                  <h6 className="text-uppercase fw-800 text-primary">A PLEASURE TO SEE YOU, {user.name}!</h6>
                  <p className="mb-4 small italic">
                    You've reached the very heart of our gallery. We're thrilled to have a true collector like you with us today.
                  </p>
                  {/* Discovery text and Sell Button group */}
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <i className="fa-solid fa-gem small"></i>
                      <span className="x-small fw-700">Ready for your next discovery?</span>
                    </div>

                    {/* New Sell Treasure Button for logged users */}
                    <Link to="/product/new" className="btn-sell">
                      <i className="fa-solid"></i>
                      SELL NEW TREASURE
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h6 className="fw-800">READY TO START?</h6>
                  <p className="mb-4 small">
                    If you don't have an account, please join our community and start trading unique pieces today.
                  </p>
                  <Link to="/signup" className="btn-sell text-decoration-none shadow-sm">CREATE ACCOUNT</Link>
                </>
              )}
            </div>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} className="my-5" />

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 pb-4">
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }} className="mb-0">
                &copy; 2026 Stilnovo Marketplace. All rights reserved.
              </p>
              <div className="d-flex gap-3 text-white fs-4 opacity-75">
                <i className="fa-brands fa-cc-visa"></i>
                <i className="fa-brands fa-cc-mastercard"></i>
                <i className="fa-brands fa-cc-apple-pay"></i>
              </div>
            </div>
          </div> {/* Row closure */}
        </div> {/* Container closure */}
      </footer>

      {/* Privacy, Safety and Cookie modals follow same logic... */}

      {/* --- MODALS --- */}

      {/* Help Modal */}
      <Modal show={showHelp} onHide={toggleHelp} centered contentClassName="stn-modal-content p-4">
        <Modal.Header closeButton className="border-0 pb-0 btn-close-white">
          <Modal.Title className="stn-modal-title w-100 text-center">Need Assistance?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="stn-modal-body text-center">
          <p>To access our official support and FAQs, please follow this path:</p>
          <div className="stn-path-box my-3">
            My Account <i className="fa-solid fa-chevron-right mx-2 fs-small"></i> Help Center
          </div>
          <p className="text-danger small fw-bold">
            <i className="fa-solid fa-lock me-1"></i> You must be logged in to view this section.
          </p>
          <button className="btn-about" onClick={toggleHelp}>UNDERSTOOD</button>
        </Modal.Body>
      </Modal>

      {/* Terms Modal */}
      <Modal show={showTerms} onHide={toggleTerms} centered size="lg" contentClassName="stn-modal-content p-4">
        <Modal.Header closeButton className="border-0 pb-0 btn-close-white">
          <Modal.Title className="stn-modal-title">Terms of Service</Modal.Title>
        </Modal.Header>
        <Modal.Body className="stn-modal-body">
          <p>
            By using Stilnovo, you agree to our community guidelines. We provide a platform for circular fashion.
            All users must maintain integrity in transactions and respect intellectual property rights.
            We are not liable for direct disputes between users but provide tools to facilitate safe trading.
          </p>
          <button className="btn-about" onClick={toggleTerms}>I accept the terms</button>
        </Modal.Body>
      </Modal>

      {/* Privacy Modal */}
      <Modal show={showPrivacy} onHide={togglePrivacy} centered contentClassName="stn-modal-content p-4">
        <Modal.Header closeButton className="border-0 pb-0 btn-close-white">
          <Modal.Title className="stn-modal-title">Privacy Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body className="stn-modal-body">
          <p>
            Your data is safe with us. We use industry-standard encryption to protect your personal information
            and transaction history. We never sell your data to third parties.
          </p>
          <button className="btn-about" onClick={togglePrivacy}>Close</button>
        </Modal.Body>
      </Modal>

      {/* Safety Modal */}
      <Modal show={showSafety} onHide={toggleSafety} centered contentClassName="stn-modal-content p-4">
        <Modal.Header closeButton className="border-0 pb-0 btn-close-white">
          <Modal.Title className="stn-modal-title">Safety Rules</Modal.Title>
        </Modal.Header>
        <Modal.Body className="stn-modal-body">
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
            <button className="btn-about" onClick={toggleSafety}>Stay safe</button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Cookie Modal */}
      <Modal show={showCookie} onHide={toggleCookie} centered contentClassName="stn-modal-content p-4">
        <Modal.Header closeButton className="border-0 pb-0 btn-close-white" />
        <Modal.Body className="stn-modal-body text-center">
          <i className="fa-solid fa-cookie-bite text-primary fs-1 mb-3"></i>
          <h5 className="stn-modal-title mb-3">Cookie Policy</h5>
          <p>
            We use cookies to personalize your experience and analyze our traffic.
            By continuing to use our site, you accept our cookie usage.
          </p>
          <button className="btn-about" onClick={toggleCookie}>Accept all</button>
        </Modal.Body>
      </Modal>
    </>
  );
}