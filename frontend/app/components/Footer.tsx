import React, { useState } from 'react';
import { Container, Row, Col, Modal, Form, Button, InputGroup, Spinner, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router'; 
import logo from "../assets/logo.png";
import '../app.css';
import { useUserStore } from "~/stores/useUserStore";
import { chatBotHelper } from "~/services/AI/ai-service";
import StoreLocationMap from './StoreLocationMap';

export default function Footer() {
    const navigate = useNavigate();
    const { user, isAuthLoading } = useUserStore();

    // Modal visibility states
    const [showHelp, setShowHelp] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showSafety, setShowSafety] = useState(false);
    const [showCookie, setShowCookie] = useState(false);

    // AI Assistant states
    const [aiQuestion, setAiQuestion] = useState("");
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleHelpCenter = () => {
        user ? navigate('/user/help') : setShowHelp(true);
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

    return (
        <>
            <footer className="footer-stilnovo mt-5">
                <Container>
                    <Row className="g-4 mb-4">
                        {/* Column 1: Branding & AI */}
                        <Col lg={4} md={6}>
                            <div className="mb-3">
                                <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
                                    <Image 
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

                            {user && (
                                <div className="ai-footer-integration mt-4 p-4 rounded-4 shadow-sm"
                                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <i className={`fa-solid fa-sparkles text-primary ${isAiLoading ? 'fa-spin' : ''}`}></i>
                                        <span className="fw-bold text-white">Stilnovo AI Assistant</span>
                                    </div>

                                    {aiAnswer && (
                                        <div className="ai-response-box mb-4 p-3 rounded-3 bg-white shadow-sm animate__animated animate__fadeIn"
                                            style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', borderLeft: '3px solid #007bff' }}>
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
                                                style={{ backgroundColor: '#ffffff', color: '#1e293b', fontSize: '0.9rem', outline: 'none', boxShadow: 'none' }}
                                            />
                                            <Button type="submit" variant="primary" className="px-2 fw-bold border-0" disabled={isAiLoading || !aiQuestion.trim()}>
                                                {isAiLoading ? <Spinner animation="border" size="sm" /> : "Ask Stilnovo AI"}
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                </div>
                            )}
                        </Col>

                        {/* Column 2: Links & Map */}
                        <Col lg={5} md={6}>
                            <Row className="mb-4">
                                <Col xs={6}>
                                    <h6 className="text-uppercase mb-3">PLATFORM</h6>
                                    <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                                        <li><Link to="/about" className="footer-link">About Us</Link></li>
                                        <li><span className="footer-link cursor-pointer" onClick={toggleTerms}>Terms of Service</span></li>
                                        <li><span className="footer-link cursor-pointer" onClick={toggleSafety}>Safety Rules</span></li>
                                    </ul>
                                </Col>
                                <Col xs={6}>
                                    <h6 className="text-uppercase mb-3">SUPPORT</h6>
                                    <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                                        <li><span className="footer-link cursor-pointer" onClick={handleHelpCenter}>Help Center</span></li>
                                        <li><span className="footer-link cursor-pointer" onClick={togglePrivacy}>Privacy Policy</span></li>
                                        <li><span className="footer-link cursor-pointer" onClick={toggleCookie}>Cookies</span></li>
                                    </ul>
                                </Col>
                            </Row>
                            <div>
                                <h6 className="text-uppercase fw-800 mb-3">OUR LOCATION</h6>
                                <StoreLocationMap />
                            </div>
                        </Col>

                        {/* Column 3: Call to Action */}
                        <Col lg={3} md={12} className="mt-4 mt-lg-0">
                            {isAuthLoading ? (
                                <Spinner animation="border" variant="secondary" size="sm" />
                            ) : user ? (
                                <>
                                    <h6 className="text-uppercase fw-800 text-primary fs-small">A PLEASURE TO SEE YOU!</h6>
                                    <p className="mb-3 small italic">You've reached the very heart of our gallery. We're thrilled to have a true collector like you.</p>
                                    <div className="d-flex flex-column gap-2">
                                        <div className="d-flex align-items-center gap-2 text-muted">
                                            <i className="fa-solid fa-gem small"></i>
                                            <span className="x-small fw-700">Ready for your next discovery?</span>
                                        </div>
                                        <Link to="/product/new" className="btn-sell btn-sm">SELL TREASURE</Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h6 className="fw-800 fs-small">READY TO START?</h6>
                                    <p className="mb-3 small">Join our community and start trading unique pieces today.</p>
                                    <Link to="/signup" className="btn-sell btn-sm text-decoration-none shadow-sm w-100 text-center">CREATE ACCOUNT</Link>
                                </>
                            )}
                        </Col>
                    </Row>

                    <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} className="my-4" />

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 pb-2 text-muted small">
                        <p className="mb-0">&copy; 2026 Stilnovo Marketplace. All rights reserved.</p>
                        <div className="d-flex gap-3 fs-4 opacity-75 text-white">
                            <i className="fa-brands fa-cc-visa"></i>
                            <i className="fa-brands fa-cc-mastercard"></i>
                            <i className="fa-brands fa-cc-apple-pay"></i>
                        </div>
                    </div>
                </Container>
            </footer>

            {/* Modals */}
            <Modal show={showHelp} onHide={toggleHelp} centered contentClassName="bg-primary text-white p-4 rounded-4 border-0 shadow-lg">
                <Modal.Header closeButton closeVariant="white" className="border-0 pb-0" />
                <Modal.Body className="text-center pt-0">
                    <i className="fa-solid fa-circle-question fs-1 mb-3"></i>
                    <h3 className="fw-800 h4 mb-3">Need Assistance?</h3>
                    <p className="opacity-90">To access our official support and FAQs, please follow this path:</p>
                    <div className="bg-white text-primary rounded-3 py-2 px-3 my-3 fw-800 d-inline-block shadow-sm">
                        My Account <i className="fa-solid fa-chevron-right mx-2 fs-small"></i> Help Center
                    </div>
                    <p className="text-white-50 small fw-bold mt-2"><i className="fa-solid fa-lock me-1"></i> Authentication required.</p>
                    <Button variant="light" className="text-primary fw-800 rounded-pill px-5 py-2 mt-3 shadow-sm border-0" onClick={toggleHelp}>UNDERSTOOD</Button>
                </Modal.Body>
            </Modal>

            <Modal show={showTerms} onHide={toggleTerms} centered size="lg" contentClassName="bg-primary text-white p-4 rounded-4 border-0 shadow-lg">
                <Modal.Header closeButton closeVariant="white" className="border-0 pb-0" />
                <Modal.Body className="text-center pt-0">
                    <i className="fa-solid fa-file-contract fs-1 mb-3"></i>
                    <h3 className="fw-800 h4 mb-3">Terms of Service</h3>
                    <div className="text-start opacity-90 mb-4 px-md-4">
                        <p>By using Stilnovo, you agree to our community guidelines. We provide a platform for circular fashion.</p>
                        <p>All users must maintain integrity and respect intellectual property rights.</p>
                    </div>
                    <Button variant="light" className="text-primary fw-800 rounded-pill px-5 py-2 shadow-sm border-0" onClick={toggleTerms}>I ACCEPT</Button>
                </Modal.Body>
            </Modal>

            <Modal show={showPrivacy} onHide={togglePrivacy} centered contentClassName="bg-primary text-white p-4 rounded-4 border-0 shadow-lg">
                <Modal.Header closeButton closeVariant="white" className="border-0 pb-0" />
                <Modal.Body className="text-center pt-0">
                    <i className="fa-solid fa-user-shield fs-1 mb-3"></i>
                    <h3 className="fw-800 h4 mb-3">Privacy Policy</h3>
                    <p className="opacity-90 mb-4">Your data is safe. We use industry-standard encryption and never sell your information.</p>
                    <Button variant="light" className="text-primary fw-800 rounded-pill px-5 py-2 shadow-sm border-0" onClick={togglePrivacy}>CLOSE</Button>
                </Modal.Body>
            </Modal>

            <Modal show={showSafety} onHide={toggleSafety} centered contentClassName="bg-primary text-white p-4 rounded-4 border-0 shadow-lg">
                <Modal.Header closeButton closeVariant="white" className="border-0 pb-0" />
                <Modal.Body className="text-center pt-0">
                    <i className="fa-solid fa-shield-halved fs-1 mb-3"></i>
                    <h3 className="fw-800 h4 mb-4">Safety Rules</h3>
                    <ul className="list-unstyled text-start mb-4 px-md-4 opacity-90 fw-600">
                        <li className="mb-3"><i className="fa-solid fa-check-circle me-3"></i> Only trade through Stilnovo's platform.</li>
                        <li className="mb-3"><i className="fa-solid fa-check-circle me-3"></i> Verify item authenticity.</li>
                        <li><i className="fa-solid fa-check-circle me-3"></i> Report suspicious behavior.</li>
                    </ul>
                    <Button variant="light" className="text-primary fw-800 rounded-pill px-5 py-2 shadow-sm border-0" onClick={toggleSafety}>STAY SAFE</Button>
                </Modal.Body>
            </Modal>

            <Modal show={showCookie} onHide={toggleCookie} centered contentClassName="bg-primary text-white p-4 rounded-4 border-0 shadow-lg">
                <Modal.Header closeButton closeVariant="white" className="border-0 pb-0" />
                <Modal.Body className="text-center pt-0">
                    <i className="fa-solid fa-cookie-bite fs-1 mb-3"></i>
                    <h3 className="fw-800 h4 mb-3">Cookie Policy</h3>
                    <p className="opacity-90 mb-4">We use cookies to personalize your experience and analyze traffic.</p>
                    <Button variant="light" className="text-primary fw-800 rounded-pill px-5 py-2 shadow-sm border-0" onClick={toggleCookie}>ACCEPT ALL</Button>
                </Modal.Body>
            </Modal>
        </>
    );
}