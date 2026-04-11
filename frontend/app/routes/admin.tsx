import { Outlet } from 'react-router';
import AdminLayout from '~/components/admin/AdminLayout';
import type { Route } from './+types/admin';

/**
 * Admin Layout Route
 * Wraps all admin pages with the admin sidebar and main layout
 */
export default function AdminRoute({ }: Route.ComponentProps) {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <AdminLayout />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="alert alert-danger m-5" role="alert">
      <h4 className="alert-heading">Error in Admin Panel!</h4>
      <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      <button className="btn btn-outline-danger" onClick={() => (window.location.href = '/')}>
        Back to home
      </button>
    </div>
  );
}
