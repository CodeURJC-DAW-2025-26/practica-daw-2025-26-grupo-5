import { Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router'; // Añadimos useNavigate para redirigir tras logout
import { useState } from 'react';
import { useUserStore } from '~/stores/useUserStore';

/**
 * Admin Sidebar Navigation Component
 */
export default function AdminSidebar() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const logoutUser = useUserStore((state) => state.logoutUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      {/* Logo Section - Limpio para evitar duplicados */}
      <div className="mb-4">
        <Link to="/admin" className="text-decoration-none d-flex align-items-center gap-2">
          <img src="/logo.png" alt="Logo" width="35" />
          <span className="fw-800 fs-5" style={{ color: '#1A365D' }}>
            Stilnovo
          </span>
          <span className="badge bg-dark text-white" style={{ fontSize: '0.65rem' }}>
            ADMIN
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="d-flex flex-column gap-2">
        <Link to="/admin" className="nav-link-stilnovo text-decoration-none d-flex align-items-center gap-2 p-3 rounded-3 shadow-sm-hover">
          <i className="fa-solid fa-chart-line" />
          <span>Dashboard</span>
        </Link>
        
        <Link to="/admin/users" className="nav-link-stilnovo text-decoration-none d-flex align-items-center gap-2 p-3 rounded-3 shadow-sm-hover">
          <i className="fa-solid fa-users-gear" />
          <span>User Management</span>
        </Link>

        <Link to="/admin/inventory" className="nav-link-stilnovo text-decoration-none d-flex align-items-center gap-2 p-3 rounded-3 shadow-sm-hover">
          <i className="fa-solid fa-box-archive" />
          <span>Global Inventory</span>
        </Link>

        <Link to="/admin/transactions" className="nav-link-stilnovo text-decoration-none d-flex align-items-center gap-2 p-3 rounded-3 shadow-sm-hover">
          <i className="fa-solid fa-money-bill-transfer" />
          <span>Transactions</span>
        </Link>

        <Link to="/admin/valorations" className="nav-link-stilnovo text-decoration-none d-flex align-items-center gap-2 p-3 rounded-3 shadow-sm-hover">
          <i className="fa-solid fa-star" />
          <span>Global Valorations</span>
        </Link>
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 border-top">
        {/* Enlace al Market - Corregido Link/Link */}
        <Link
          to="/"
          className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none mb-3 shadow-sm"
          style={{ height: '45px', borderRadius: '12px', fontWeight: 700 }}
        >
          <i className="fa-solid fa-shop" />
          Browse Market
        </Link>

        {/* Botón de Logout - Implementado */}
        <Button
          variant="outline-danger"
          className="w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
          style={{ height: '45px', borderRadius: '12px', fontWeight: 700 }}
        >
          <i className="fa-solid fa-right-from-bracket" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="d-none d-lg-flex flex-column p-4 shadow-sm"
        style={{
          width: '280px',
          minWidth: '280px',
          height: '100vh',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Menu Button */}
      <div className="d-lg-none position-fixed top-0 start-0 p-3" style={{ zIndex: 1050 }}>
        <Button
          variant="white"
          onClick={() => setShowOffcanvas(true)}
          className="shadow-sm border"
          style={{ borderRadius: '12px', width: '46px', height: '46px' }}
        >
          <i className="fa-solid fa-bars" />
        </Button>
      </div>

      {/* Mobile Offcanvas */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="start">
        <Offcanvas.Header closeButton className="border-0">
          <Offcanvas.Title className="fw-800">Admin Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-4 d-flex flex-column">
          {sidebarContent}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}