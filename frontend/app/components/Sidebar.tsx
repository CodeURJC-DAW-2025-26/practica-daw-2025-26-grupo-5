import { Button, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';
import { useState } from 'react';
import { useUserStore } from '~/stores/useUserStore';
import logo from "../assets/logo.png";

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
    const { logoutUser } = useUserStore();
    const location = useLocation();

    const sidebarContent = (
        <div className="d-flex flex-column h-100">
            {/* Logo Section */}
            <div className="mb-5 pt-2">
                <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
                    <img
                        src={logo}
                        alt="Stilnovo"
                        width="35"
                        onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (target.src !== "/logo.png") target.src = "/logo.png";
                        }}
                    />
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
                            onClick={() => setShowOffcanvas(false)} // Close menu on mobile when clicking a link
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
                <button 
                    onClick={() => logoutUser()} 
                    className="dropdown-item text-danger fw-700 small border-0 bg-transparent w-100 d-flex justify-content-center align-items-center"
                >
                    <i className="fa-solid fa-sign-out-alt me-2" /> Log out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Visible from LG upwards) */}
            <aside className="d-none d-lg-flex flex-column p-4 border-end bg-white" style={{ width: '280px', minWidth: '280px', height: '100vh', position: 'sticky', top: 0 }}>
                {sidebarContent}
            </aside>

            {/* Mobile Trigger (Visible below LG) */}
            <div className="d-lg-none position-fixed top-0 start-0 p-3" style={{ zIndex: 1050 }}>
                <Button variant="white" onClick={() => setShowOffcanvas(true)} className="shadow-sm border-0 bg-white" style={{ borderRadius: '12px', width: '46px', height: '46px' }}>
                    <i className="fa-solid fa-bars" />
                </Button>
            </div>

            {/* Mobile Drawer */}
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