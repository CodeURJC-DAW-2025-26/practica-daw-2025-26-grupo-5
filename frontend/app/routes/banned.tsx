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
import { Container, Card, Button, Alert, Stack, Image } from 'react-bootstrap';
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

      {/* Main Content */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <Container style={{ maxWidth: '520px' }}>
          <Card className="clay-card border-0 p-3">
            <Card.Body className="p-4 p-md-5">
              
              {/* Icon Circle */}
              <div className="text-center mb-4">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#fee2e2' }}
                >
                  <i className="fa-solid fa-ban" style={{ fontSize: '3rem', color: '#dc2626' }} />
                </div>
                <h1 className="fw-800 mb-3 text-dark" style={{ fontSize: '28px' }}>Account Suspended</h1>
                <p className="text-muted fw-600 mb-4" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Your account has been temporarily suspended. We take community guidelines seriously to maintain a safe and respectful marketplace for all users.
                </p>
              </div>

              {/* Info Box */}
              <Alert variant="danger" className="border-0 rounded-4 p-4 mb-4" style={{ backgroundColor: '#fef2f2' }}>
                <p className="mb-2 fw-800 text-danger">
                  <i className="fa-solid fa-circle-info me-2" />
                  Why was my account suspended?
                </p>
                <p className="mb-0 small fw-600 text-danger opacity-75" style={{ lineHeight: '1.5' }}>
                  Your account was suspended due to activity that violates our Terms of Service or Community Guidelines. If you believe this was a mistake, our support team is here to help.
                </p>
              </Alert>

              {/* User Info */}
              <Card className="bg-light border-0 mb-4 rounded-4">
                <Card.Body className="text-center p-3">
                  <p className="small fw-700 text-muted text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Suspended User</p>
                  <p className="fw-800 text-dark mb-0 fs-5">{user.name}</p>
                  <p className="small fw-600 text-muted mb-0">{user.email}</p>
                </Card.Body>
              </Card>

              {/* Actions */}
              <Stack gap={3} className="mb-4">
                <Button variant="danger" className="fw-700 rounded-pill py-3 shadow-sm" onClick={handleLogout}>
                  <i className="fa-solid fa-sign-out-alt me-2" /> Logout
                </Button>

                <Button variant="outline-secondary" className="fw-700 rounded-pill py-3" href="mailto:stilnovo.noreply@gmail.com" as="a">
                  <i className="fa-solid fa-envelope me-2" /> Appeal Suspension
                </Button>
              </Stack>

              {/* Footer Message */}
              <p className="text-center small fw-600 text-muted mb-0">
                Questions? Email us at <strong className="text-dark">stilnovo.noreply@gmail.com</strong>
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