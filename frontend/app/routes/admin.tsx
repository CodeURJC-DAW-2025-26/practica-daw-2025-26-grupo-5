import AdminLayout from '~/components/admin/AdminLayout';
import { Navigate, useLocation } from 'react-router';
import { Alert, Button, Container } from 'react-bootstrap';
import type { Route } from './+types/admin';
import { useUserStore } from '~/stores/useUserStore';

/**
 * Admin Layout Route
 * Wraps all admin pages with the admin sidebar and main layout
 */
export default function AdminRoute({ }: Route.ComponentProps) {
  const { user } = useUserStore();
  const location = useLocation();

  const isAdmin = user?.roles.includes("ROLE_ADMIN")
  // Global protection: Check if the user is logged, and if he is not redirect him to login page
  if (!isAdmin) {
    // If they are a standard user, kick them back to the home page
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <AdminLayout />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error in Admin Panel!</Alert.Heading>
        <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button
          variant="outline-danger"
          onClick={() => (window.location.href = '/')}
        >
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}
