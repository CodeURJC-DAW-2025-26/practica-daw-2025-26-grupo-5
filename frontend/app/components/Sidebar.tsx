import { Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { useUserStore } from '~/stores/useUserStore';

// Definimos la estructura de un link para que sea siempre igual
interface SidebarLink {
    to: string;
    label: string;
    icon: string;
}

interface SidebarProps {
    title: string;
    links: SidebarLink[];
    isAdmin?: boolean;
}

export default function Sidebar({ title, links, isAdmin = false }: SidebarProps) {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const logoutUser = useUserStore((state) => state.logoutUser);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const sidebarContent = (
        <>
            {/* Logo Section */}
            <div className="mb-4">
                <Link to={isAdmin ? "/admin" : "/user-page"} className="text-decoration-none d-flex align-items-center gap-2">
                    <img src="/logo.png" alt="Logo" width="35" />
                    <span className="brand">Stilnovo</span>
                    {isAdmin && (
                        <span className="badge bg-dark text-white" style={{ fontSize: '0.65rem' }}>ADMIN</span>
                    )}
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="d-flex flex-column gap-2">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`nav-link-stilnovo text-decoration-none d-flex align-items-center gap-2 p-3 rounded-3 ${location.pathname === link.to ? 'active' : ''
                            }`}
                    >
                        <i className={`fa-solid ${link.icon}`} />
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 border-top">
                <Link to="/" className="btn-sell w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none shadow-sm mb-3" style={{ height: '45px'}}>
                    <i className="fa-solid fa-shop" />
                    Browse Market
                </Link>
                <Button variant="outline-danger" className="nav-link-stilnovo logout-link border-0 bg-transparent w-100 text-start" onClick={handleLogout} style={{ height: '45px', borderRadius: '12px', fontWeight: 700 }}>
                    <i className="fa-solid fa-arrow-right-from-bracket" />
                    Logout
                </Button>
            </div>
        </>
    );

    return (
        <>
            <aside className="d-none d-lg-flex flex-column p-4 shadow-sm" style={{ width: '280px', minWidth: '280px', height: '100vh', backgroundColor: 'white', position: 'sticky', top: 0 }}>
                {sidebarContent}
            </aside>

            <div className="d-lg-none position-fixed top-0 start-0 p-3" style={{ zIndex: 1050 }}>
                <Button variant="white" onClick={() => setShowOffcanvas(true)} className="shadow-sm border" style={{ borderRadius: '12px', width: '46px', height: '46px' }}>
                    <i className="fa-solid fa-bars" />
                </Button>
            </div>

            <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="start">
                <Offcanvas.Header closeButton className="border-0">
                    <Offcanvas.Title className="fw-800">{title}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-4 d-flex flex-column">
                    {sidebarContent}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}