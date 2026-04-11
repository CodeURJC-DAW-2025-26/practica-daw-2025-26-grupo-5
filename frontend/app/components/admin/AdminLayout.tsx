import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router';
import AdminSidebar from './AdminSidebar';

/**
 * Main Admin Layout Component
 * Combines sidebar + main content area
 */
export default function AdminLayout() {
  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar />
      <main className="flex-grow-1 overflow-auto" style={{ maxHeight: '100vh' }}>
        <div className="p-4 p-md-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
