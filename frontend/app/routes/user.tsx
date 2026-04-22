import { Navigate, useLocation } from 'react-router';
import { Alert, Button, Container } from 'react-bootstrap';
import UserLayout from '~/components/user/UserLayout';
import type { Route } from './+types/admin';
import { useUserStore } from '~/stores/useUserStore';

/**
 * User Layout Route
 * Wraps all user pages with the user sidebar and main layout
 */
export default function UserRoute({ }: Route.ComponentProps) {
    const { user } = useUserStore();
    const location = useLocation();
    
    // Global protection: Check if the user is logged, and if he is not redirect him to login page
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <UserLayout />
        </div>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    return (
        <Container className="mt-5">
            <Alert variant="danger">
                <Alert.Heading>Error in User Panel!</Alert.Heading>
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
