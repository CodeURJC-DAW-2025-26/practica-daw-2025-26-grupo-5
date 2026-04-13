import { Outlet } from 'react-router';
import Sidebar from '~/components/Sidebar';

export default function AdminLayout() {
  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: "fa-chart-line" },
    { to: "/admin/users", label: "User Management", icon: "fa-users-gear" },
    { to: "/admin/inventory", label: "Global Inventory", icon: "fa-box-archive" },
    { to: "/admin/transactions", label: "Transactions", icon: "fa-money-bill-transfer" },
    { to: "/admin/valorations", label: "Global Valorations", icon: "fa-star" },
  ];

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar title="Admin Menu" links={adminLinks} isAdmin={true} />
      <main className="flex-grow-1 overflow-auto" style={{ maxHeight: '100vh' }}>
        <div className="p-4 p-md-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
