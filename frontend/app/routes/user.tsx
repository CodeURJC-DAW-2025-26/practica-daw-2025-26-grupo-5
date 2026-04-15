import { Navigate, Outlet, useLocation } from 'react-router';
import UserLayout from '~/components/user/UserLayout';
import type { Route } from './+types/admin';
import { useUserStore } from '~/stores/useUserStore';
import Loader from "~/components/Loader";


/**
 * User Layout Route
 * Wraps all admin pages with the admin sidebar and main layout
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
        <div className="alert alert-danger m-5" role="alert">
            <h4 className="alert-heading">Error in User Panel!</h4>
            <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
            <button className="btn btn-outline-danger" onClick={() => (window.location.href = '/')}>
                Back to home
            </button>
        </div>
    );
}
