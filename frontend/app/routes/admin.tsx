import AdminLayout from '~/components/admin/AdminLayout';
import { Navigate, useNavigate } from 'react-router';
import { Spinner, Container, Alert, Row, Col, Button, Stack, Image, Card } from 'react-bootstrap';
import type { Route } from './+types/admin';
import { useUserStore } from '~/stores/useUserStore';
import logo from "../assets/logo.png";

/**
 * Admin Layout Route
 * Enforces role-based access control (RBAC).
 * Renders the 403 Forbidden screen natively to avoid React Router 404 bugs,
 * mirroring the exact layout of the global ErrorPage.
 */
export default function AdminRoute({ }: Route.ComponentProps) {
  const { user, isAuthLoading } = useUserStore();
  const navigate = useNavigate();

  // 1. Wait for authentication check to complete
  if (isAuthLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // 2. Redirect guests to the login page
  if (!user) {
    return <Navigate to="/login-page" replace />;
  }

  // 3. Check if the authenticated user has administrator privileges
  const roles = user.roles || [];
  const isAdmin = roles.includes("ROLE_ADMIN");

  // 4. If registered but not an admin, render the 403 screen directly
  if (!isAdmin) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Card className="border-0 p-5 text-center shadow-sm">
                <Card.Body>
                  <div className="mb-5 d-flex justify-content-center">
                    <div className="d-flex align-items-center justify-content-center bg-light shadow-sm rounded-4" style={{ width: '100px', height: '100px' }}>
                      <Image src={logo} alt="Stilnovo" width="60" />
                    </div>
                  </div>

                  {/* Now showing the REAL status */}
                  <h1 className="fw-800 text-danger mb-2" style={{ fontSize: '72px', letterSpacing: '-2px' }}>
                    403
                  </h1>
                  <h2 className="fw-800 text-dark mb-4" style={{ fontSize: '32px' }}>Access Denied</h2>
                  <p className="text-muted fw-600 mb-5 px-md-4" style={{ lineHeight: '1.6' }}>
                    You do not have the necessary permissions to view the administration panel. This area is strictly restricted to administrator accounts.
                  </p>

                  <Stack direction="horizontal" gap={3} className="justify-content-center flex-wrap">
                    <Button variant="primary" className="fw-700 px-4 py-3 rounded-pill shadow-sm border-0" style={{ backgroundColor: '#2f6ced' }} onClick={() => navigate("/")}>
                      <i className="fa-solid fa-house me-2"></i> Back to Homepage
                    </Button>
                    <Button variant="outline-secondary" className="fw-700 px-4 py-3 rounded-pill border-2" onClick={() => navigate(-1)}>
                      <i className="fa-solid fa-arrow-left me-2"></i> Go Back
                    </Button>
                  </Stack>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // 5. Authorized administrators are granted access to the admin layout
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <AdminLayout />
    </div>
  );
}


export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const navigate = useNavigate();

  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error in Admin Panel!</Alert.Heading>
        <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button
          variant="outline-danger"
          onClick={() => navigate('/')}
        >
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}
