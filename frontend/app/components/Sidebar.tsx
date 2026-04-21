/**
 * Sidebar Navigation Component
 *
 * Reusable navigation sidebar for admin and user dashboard pages.
 * Provides responsive navigation that works on desktop and mobile.
 *
 * Features:
 * - Desktop sidebar: Fixed left panel (sticky)
 * - Mobile sidebar: Offcanvas drawer (hidden by default)
 * - Logo and branding section
 * - Admin badge indicator
 * - Dynamic navigation links
 * - Active page highlighting
 * - "Browse Market" call-to-action button
 * - Logout functionality
 * - Responsive icons using Font Awesome
 *
 * Props:
 * - title (string): Title displayed in mobile header
 * - links (SidebarLink[]): Array of navigation links
 *    - to: Route path
 *    - label: Display text
 *    - icon: Font Awesome icon class (e.g., 'fa-users')
 * - isAdmin (boolean): If true, shows ADMIN badge
 * - activePage (string): Optional page to highlight
 *
 * Responsive Behavior:
 * - Desktop: Always visible, sticky positioning
 * - Mobile: Toggle button in top-left corner
 * - Offcanvas drawer slides in from left
 * - Automatic close on navigation
 *
 * Active Link Highlighting:
 * - Compares current route with link.to
 * - Or compares activePage prop with link label
 * - Applies 'active' class for styling
 *
 * Layout:
 * - Header with logo and branding
 * - Navigation section with dynamic links
 * - Bottom section with market button and logout
 * - Flexible height: Content grows, logout sticks to bottom
 *
 * State Management:
 * - showOffcanvas: Tracks mobile drawer visibility
 * - Uses useLocation() to detect current page
 * - Uses Zustand logoutUser action
 *
 * @component
 * @param {SidebarProps} props - Component props
 * @returns React component for dashboard navigation
 */

import { Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { useUserStore } from '~/stores/useUserStore';

/**
 * Navigation Link Interface
 * Defines structure for sidebar navigation items
 */
interface SidebarLink {
    to: string;
    label: string;
    icon: string;
}

/**
 * Sidebar Props Interface
 * Defines component input properties
 */
interface SidebarProps {
    title: string;
    links: SidebarLink[];
    isAdmin?: boolean;
    activePage?: string;
}

/**
 * Sidebar Component Implementation
 * 
 * Renders responsive sidebar with desktop and mobile layouts.
 * Provides primary navigation for dashboard pages.
 */
export default function Sidebar({ title, links, isAdmin = false, activePage }: SidebarProps) {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const { logoutUser } = useUserStore();
    const location = useLocation();

    /**
     * Sidebar Content (Shared between desktop and mobile)
     * 
     * Includes:
     * - Logo header
     * - Navigation links with active highlighting
     * - Market browse button
     * - Logout button
     */
    const sidebarContent = (
        <div className="d-flex flex-column h-100">

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
                <button onClick={() => logoutUser()} className="dropdown-item text-danger fw-700 small border-0 bg-transparent w-100 text-start">
                    <i className="fa-solid fa-sign-out-alt me-2" /> Log out
                </button>
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