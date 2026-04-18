import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Stack } from 'react-bootstrap';
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
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header className="navbar container-fluid px-lg-5 py-3" style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <img src={logo} alt="Stilnovo" className="logo-img" width="35" />
          <span className="brand fw-800">Stilnovo</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <Container style={{ maxWidth: '520px' }}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              {/* Icon Circle */}
              <div className="text-center mb-4">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                  }}
                >
                  <i className="fa-solid fa-ban" style={{ fontSize: '3rem', color: '#dc2626' }} />
                </div>

                {/* Heading */}
                <h1 className="fw-800 mb-3" style={{ fontSize: '28px', color: '#111827' }}>
                  Account Suspended
                </h1>

                {/* Main Message */}
                <p className="text-muted mb-4" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  Your account has been temporarily suspended. We take community guidelines seriously to maintain a safe and respectful marketplace for all users.
                </p>
              </div>

              {/* Info Box */}
              <Alert variant="danger" className="mb-4">
                <p className="mb-2" style={{ fontSize: '13px', fontWeight: '600' }}>
                  <i className="fa-solid fa-circle-info me-2" />
                  Why was my account suspended?
                </p>
                <p className="mb-0" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  Your account was suspended due to activity that violates our Terms of Service or Community Guidelines. If you believe this was a mistake, our support team is here to help.
                </p>
              </Alert>

              {/* User Info */}
              <div className="text-center mb-4">
                <p className="small text-muted mb-1">Suspended User</p>
                <p className="fw-bold" style={{ fontSize: '16px' }}>
                  {user.name}
                </p>
                <p className="small text-muted">{user.email}</p>
              </div>

              {/* Actions */}
              <Stack gap={2} className="mb-4">
                <Button
                  variant="danger"
                  className="fw-600 py-2"
                  onClick={handleLogout}
                >
                  <i className="fa-solid fa-sign-out-alt me-2" />
                  Logout
                </Button>

                <Button
                  variant="outline-secondary"
                  className="fw-600 py-2"
                  href="mailto:stilnovo.noreply@gmail.com"
                  as="a"
                >
                  <i className="fa-solid fa-envelope me-2" />
                  Appeal Suspension
                </Button>
              </Stack>

              {/* Footer Message */}
              <p className="text-center small text-muted" style={{ fontSize: '12px' }}>
                Questions? Email us at <strong>stilnovo.noreply@gmail.com</strong>
              </p>
            </Card.Body>
          </Card>
        </Container>
      </main>

      {/* Footer */}
      <footer
        className="mt-auto py-4 text-center text-muted small"
        style={{ backgroundColor: '#fff', borderTop: '1px solid #e5e7eb' }}
      >
        <p className="mb-0">© 2026 Stilnovo. All rights reserved.</p>
      </footer>
    </div>
  );
}
