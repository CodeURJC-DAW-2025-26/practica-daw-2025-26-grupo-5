import { Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { useUserStore } from '~/stores/useUserStore';

interface SidebarLink {
    to: string;
    label: string;
    icon: string;
}

interface SidebarProps {
    title: string;
    links: SidebarLink[];
    isAdmin?: boolean;
    activePage?: string; 
}

export default function Sidebar({ title, links, isAdmin = false, activePage }: SidebarProps) {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const logoutUser = useUserStore((state) => state.logoutUser);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const sidebarContent = (
        <div className="d-flex flex-column h-100">
            {/* Logo Section - Ahora envía a "/" */}
            <div className="mb-5 pt-2">
                <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
                    <img src="/logo.png" alt="Stilnovo" width="35" />
                    <span className="brand">Stilnovo</span>
                    {isAdmin && (
                        <span className="badge bg-primary text-white ms-1" style={{ fontSize: '0.6rem' }}>ADMIN</span>
                    )}
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="nav flex-column gap-2">
                {links.map((link) => {
                    const isActive = location.pathname === link.to || activePage === link.label.toLowerCase();
                    
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-link-stilnovo d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`}
                        >
                            <i className={`fa-solid ${link.icon} fs-5`} style={{ width: '25px' }} />
                            <span className="fw-700">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 border-top">
                <Link to="/" className="btn-sell w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none shadow-sm mb-3" style={{ height: '48px', borderRadius: '14px' }}>
                    <i className="fa-solid fa-shop" />
                    Browse Market
                </Link>
                <Button 
                    variant="link" 
                    className="nav-link-stilnovo logout-link text-decoration-none border-0 w-100 text-start d-flex align-items-center gap-3" 
                    onClick={handleLogout}
                    style={{ color: '#dc3545' }}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket fs-5" style={{ width: '25px' }} />
                    <span className="fw-700">Logout</span>
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="d-none d-lg-flex flex-column p-4 border-end bg-white" style={{ width: '280px', minWidth: '280px', height: '100vh', position: 'sticky', top: 0 }}>
                {sidebarContent}
            </aside>

            {/* Mobile Trigger */}
            <div className="d-lg-none position-fixed top-0 start-0 p-3" style={{ zIndex: 1050 }}>
                <Button variant="white" onClick={() => setShowOffcanvas(true)} className="shadow-sm border-0 bg-white" style={{ borderRadius: '12px', width: '46px', height: '46px' }}>
                    <i className="fa-solid fa-bars" />
                </Button>
            </div>

            {/* Mobile Menu */}
            <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="start" style={{ width: '280px' }}>
                <Offcanvas.Header closeButton className="px-4 pt-4 border-0">
                    <Offcanvas.Title className="fw-800">{title}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="px-4 pb-4 flex-column">
                    {sidebarContent}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}