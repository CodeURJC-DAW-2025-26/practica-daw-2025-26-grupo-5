import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Container, Card, Button, Alert, Stack, Image } from 'react-bootstrap';
import logo from "../assets/logo.png";
import { useUserStore } from '~/stores/useUserStore';

export default function Banned() {
  const navigate = useNavigate();
  const { logoutUser, user } = useUserStore();

  useEffect(() => {
    if (user && !user.banned) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

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