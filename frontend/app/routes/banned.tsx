/**
 * Banned Account Page
 *
 * Page displayed when a user with a banned/suspended account tries to access the marketplace.
 * Shows account suspension status and provides appeal/logout options.
 *
 * Features:
 * - Clear notification of account suspension status
 * - User information display (name, email)
 * - Explanation of why account was suspended
 * - Appeal suspension button (mailto link)
 * - Logout button
 * - Support contact information
 * - Protection against non-banned users (redirects to home)
 * - Responsive design for mobile/desktop
 *
 * Flow:
 * 1. User with banned account navigates to any protected route
 * 2. protected-layout.tsx detects banned status
 * 3. Redirects to /banned route
 * 4. This component renders suspension message
 * 5. User can:
 *    - Logout
 *    - Appeal suspension (email support)
 *    - Contact support
 *
 * Security:
 * - Only displays if user.banned === true
 * - Redirects non-banned users to homepage
 * - useEffect cleanup on navigation
 * - Prevents access to marketplace features
 *
 * Visual Design:
 * - Warning color scheme (red/danger)
 * - Large ban icon
 * - Card-based centered layout
 * - Simple, clear messaging
 * - Contact email provided
 *
 * State Management:
 * - Uses Zustand user store
 * - logoutUser action for logout
 * - user.banned flag for conditional rendering
 *
 * @component
 * @returns React component showing account suspension message
 */

import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Image, Stack, Alert } from 'react-bootstrap';
import logo from "../assets/logo.png";
import { useUserStore } from '~/stores/useUserStore';

/**
 * Banned Page Component
 * 
 * Displays suspension message for banned users.
 * Allows logout or appeal of suspension.
 */
export default function Banned() {
  const navigate = useNavigate();
  const { logoutUser, user } = useUserStore();

  /**
   * Redirect Non-Banned Users to Home
   * 
   * Effect:
   * - Checks if user is no longer banned
   * - If banned flag is false, navigates to home
   * - Prevents banned page from being shown to non-banned users
   * - Uses replace: true to replace history entry
   */
  useEffect(() => {
    if (user && !user.banned) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  /**
   * Handle Logout Action
   * 
   * Process:
   * 1. Call logoutUser() from store
   * 2. Navigate to login page
   * 3. Clear auth token and user data
   */
  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  /**
   * Show Nothing if Not Banned
   * Prevents brief display of banned page before redirect
   */
  if (!user || !user.banned) {
    return null;
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Header */}
      <header className="navbar container-fluid px-lg-5 py-3 bg-white border-bottom shadow-sm">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <Image src={logo} alt="Stilnovo" width="35" />
          <span className="brand fw-800 text-primary mb-0 fs-4">Stilnovo</span>
        </Link>
      </header>

      {/* Main Content - Ensanchado para evitar scroll vertical innecesario */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-4">
        <Container style={{ maxWidth: '720px' }}> {/* Aumentado de 520px a 720px */}
          <Card className="clay-card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
            <Card.Body className="p-4 p-md-5">

              {/* Icon Circle & Title */}
              <div className="text-center mb-4">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#fee2e2' }}
                >
                  <i className="fa-solid fa-ban" style={{ fontSize: '3rem', color: '#dc2626' }} />
                </div>
                <h1 className="fw-800 mb-2 text-dark" style={{ fontSize: '32px', letterSpacing: '-0.5px' }}>
                  Account Suspended
                </h1>
                <p className="text-muted fw-600 mb-0" style={{ fontSize: '16px' }}>
                  Your access to the Stilnovo marketplace has been restricted.
                </p>
              </div>

              <hr className="my-4 opacity-10" />

              {/* Layout de dos columnas para Info y User (Solo en desktop para aprovechar el ancho) */}
              <div className="row g-4 mb-4">
                <div className="col-lg-7">
                  <Alert variant="danger" className="border-0 rounded-4 h-100 p-4 mb-0" style={{ backgroundColor: '#fef2f2' }}>
                    <p className="mb-2 fw-800 text-danger">
                      <i className="fa-solid fa-circle-info me-2" />
                      Policy Violation
                    </p>
                    <p className="mb-0 small fw-600 text-danger opacity-75" style={{ lineHeight: '1.5' }}>
                      To maintain a safe community, we suspend accounts that violate our Terms of Service. If you believe this is an error, please appeal below.
                    </p>
                  </Alert>
                </div>

                <div className="col-lg-5">
                  <Card className="bg-light border-0 h-100 rounded-4 d-flex align-items-center justify-content-center">
                    <Card.Body className="text-center p-3">
                      <p className="x-small fw-700 text-muted text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Profile</p>
                      <p className="fw-800 text-dark mb-0 text-truncate" style={{ maxWidth: '180px' }}>{user.name}</p>
                      <p className="small fw-600 text-muted mb-0 text-truncate" style={{ maxWidth: '180px' }}>{user.email}</p>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              {/* Actions - Horizontal Stack para ahorrar espacio vertical */}
              <div className="d-flex flex-column flex-md-row gap-3 mb-4">
                <Button variant="danger" className="w-100 fw-700 rounded-pill py-3 shadow-sm border-0" onClick={handleLogout}>
                  <i className="fa-solid fa-sign-out-alt me-2" /> Logout
                </Button>

                <Button
                  variant="outline-secondary"
                  className="w-100 fw-700 rounded-pill py-3 border-2"
                  href="mailto:stilnovo.support@gmail.com"
                  as="a"
                >
                  <i className="fa-solid fa-envelope me-2" /> Appeal Suspension
                </Button>
              </div>

              {/* Footer Message */}
              <p className="text-center small fw-600 text-muted mb-0">
                Need help? Contact <strong className="text-dark">stilnovo.support@gmail.com</strong>
              </p>
            </Card.Body>
          </Card>
        </Container>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center bg-white border-top">
        <p className="mb-0 small fw-700 text-muted">© 2026 Stilnovo. All rights reserved.</p>
      </footer>
    </div>
  );
}