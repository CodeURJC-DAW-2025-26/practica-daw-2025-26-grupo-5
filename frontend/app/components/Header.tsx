/**
 * Header Navigation Component
 *
 * The Header component is the main navigation bar of the Stilnovo marketplace.
 * It appears at the top of every page and provides:
 * - Logo and branding
 * - Search functionality (on homepage only)
 * - User authentication status and profile access
 * - Navigation links for logged-in and guest users
 * - Admin access link for administrators
 *
 * User States Handled:
 * 1. Authentication Loading - Shows placeholder while fetching session
 * 2. Logged-in User - Displays profile dropdown with user menu
 * 3. Banned User - Shows online status indicator hidden (no green dot)
 * 4. Guest User - Shows Login/Sign up links
 *
 * Component Dependencies:
 * - React Bootstrap, React Router 7, Zustand
 */

import React, { useEffect, useState } from "react";
import { Modal, Button, NavDropdown } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";
import { Link, useLocation, useNavigate } from "react-router";
import "~/app.css";
import logo from "../assets/logo.png";

export default function Header() {
  // State for login error modal and profile image fallback
  const [isErrorLoginDialogOpen, setErrorLoginDialogOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, loginError, isAuthLoading, loadLoggedUser, logoutUser } = useUserStore();

  const isHome = location.pathname === "/";
  const [searchInput, setSearchInput] = useState("");
  const [searchInputErrors, setSearchInputErrors] = useState("")
  /**
   * Load current user session on mount
   * Checks if user is logged in from localStorage
   */
  useEffect(() => {
    loadLoggedUser();
  }, []);

  const handleCloseErrorLoginDialog = () => setErrorLoginDialogOpen(false);

  /**
   * Handle search form submission with URL encoding
   */
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!searchInputErrors) {
      if (searchInput.trim()) {
        navigate(`/?query=${encodeURIComponent(searchInput)}#featured-treasures`);
      } else {
        navigate(`/#featured-treasures`);
      }
    }
        
    setSearchInput("");
    setSearchInputErrors("");
  };

  const htmlRegex = /<\/?[a-z][\s\S]*>/i;
  const validateSearchInput = (val: string) => {
    let error = "";
    if (htmlRegex.test(val)) error = "HTML tags are not allowed. Be careful.";
    setSearchInputErrors(error);
  };

  return (
    <>
      <header className={`navbar container-fluid px-lg-5 py-3 sticky-top bg-white ${isHome ? 'header-border-line' : 'border-bottom shadow-sm'}`}>

        {/* LEFT SECTION: Logo and Back Link (Balanced width to center search) */}
        <div className="d-flex align-items-center" style={{ flex: 1 }}>
          <div className="logo-wrapper">
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
              <img src={logo} alt="Stilnovo" className="logo-img" width="35" />
              <span className="brand">Stilnovo</span>
            </Link>
          </div>

          {/* Corrected Back Link: Placed next to logo, subtle style to match aesthetics */}
          {!isHome && (
            <Link to="/" className="ms-4 back-link d-none d-md-flex align-items-center">
              <i className="fa-solid fa-chevron-left me-2" style={{ fontSize: '0.8rem' }}></i>
              <span>Back to Gallery</span>
            </Link>
          )}
        </div>

        {/* CENTER SECTION: Search Box (Home only) */}
        {isHome && (
          <form
            onSubmit={handleSearch}
            className="search-box d-none d-md-flex mx-auto position-relative"
            style={{ overflow: 'hidden' }} 
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              name="query"
              placeholder="Search for treasures..."
              value={searchInput}
              onChange={(e) => {
                const searchNeeds = e.target.value;
                setSearchInput(searchNeeds);
                validateSearchInput(searchNeeds);
              }}

              style={{ paddingRight: searchInputErrors ? '180px' : 'inherit' }}
            />
            <button type="submit" className="d-none"></button>

            {searchInputErrors && (
              <div
                className="text-danger fw-800 position-absolute d-flex align-items-center h-100"
                style={{
                  right: '20px',       
                  top: 0,              
                  fontSize: '14px',
                  pointerEvents: 'none',
                  backgroundColor: 'transparent' 
                }}
              >
                <i className="fa-solid fa-triangle-exclamation me-1"></i>
                {searchInputErrors}
              </div>
            )}
          </form>
        )}

        {/* RIGHT SECTION: User Actions (Always visible) */}
        <div className="d-flex align-items-center justify-content-end" style={{ flex: 1 }}>
          <nav className="nav-actions">
            {isAuthLoading ? (
              <div style={{ width: '42px', height: '42px' }} />
            ) : user ? (
              <NavDropdown
                title={
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-end d-none d-lg-block">
                      <p className="mb-0 small fw-800 lh-1 text-dark">{user.name}</p>
                      <p className="mb-0 x-small fw-700 text-muted">
                        My Account <i className="fa-solid fa-chevron-down ms-1" style={{ fontSize: "0.6rem" }}></i>
                      </p>
                    </div>
                    <div className="position-relative">
                      <img
                        src={profileImageError ? "/images/profile-photo.png" : `/api/v1/users/me/profile-photo?t=${Date.now()}`}
                        className="rounded-circle border border-2 border-white shadow-sm profile-nav-img"
                        width="42"
                        height="42"
                        style={{ objectFit: "cover" }}
                        onError={() => setProfileImageError(true)}
                        alt="Profile"
                      />
                      {!user.banned && (
                        <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle"></span>
                      )}
                    </div>
                  </div>
                }
                id="user-nav-dropdown"
                align="end"
                className="custom-nav-dropdown"
              >
                <NavDropdown.Item as={Link} to="/user/page" className="fw-700 small">My Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/user/products" className="fw-700 small">My Inventory</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/user/settings" className="fw-700 small">My Settings</NavDropdown.Item>

                {user.roles?.includes("ROLE_ADMIN") && (
                  <NavDropdown.Item as={Link} to="/admin" className="fw-700 small text-primary">Administration</NavDropdown.Item>
                )}

                <NavDropdown.Divider />
                <button onClick={() => logoutUser()} className="dropdown-item text-danger fw-700 small border-0 bg-transparent w-100 text-start">
                  <i className="fa-solid fa-sign-out-alt me-2" /> Log out
                </button>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <Link to="/login" className="link-login">Log in</Link>
                <Link to="/signup" className="btn-signup">Sign up</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Login Error Modal */}
      <Modal show={isErrorLoginDialogOpen} onHide={handleCloseErrorLoginDialog} centered>
        <Modal.Header className="bg-danger text-white border-0" closeButton>
          <Modal.Title className="fw-800">Login Error</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-center">
          <p className="mb-0 fw-600">{loginError}</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" className="rounded-3 fw-bold" onClick={handleCloseErrorLoginDialog}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}