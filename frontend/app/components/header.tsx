import React, { useEffect, useState } from "react";
import { Modal, Button, NavDropdown } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";
import { Link, useLocation } from "react-router"; 
import "~/app.css";
import logo from "../assets/logo.png";

export default function Header() {
  const [isErrorLoginDialogOpen, setErrorLoginDialogOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const location = useLocation();
  const { user, loginError, isAuthLoading, loadLoggedUser, logoutUser } = useUserStore();

  const isHome = location.pathname === "/";
  const isProductDetail = location.pathname.startsWith("/product/");

  useEffect(() => {
    loadLoggedUser();
  }, []);

  const handleCloseErrorLoginDialog = () => setErrorLoginDialogOpen(false);

  return (
    <>
      <header className={`navbar container-fluid px-lg-5 py-3 sticky-top bg-white ${isHome ? 'header-border-line' : 'border-bottom shadow-sm'}`}>

        {/* LEFT: Logo Section */}
        <div className="logo-wrapper">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <img src={logo} alt="Stilnovo" className="logo-img" width="35" />
            <span className="brand">Stilnovo</span>
          </Link>
        </div>

        {/* CENTER: Search Box */}
        {isHome && (
          <form action="/#featured-treasures" method="get" className="search-box d-none d-md-flex mx-auto">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" name="query" placeholder="Search for treasures..." />
            <button type="submit" className="d-none"></button>
          </form>
        )}

        {/* RIGHT: Actions Container */}
        <div className={`${isHome ? "" : "ms-auto"} d-flex align-items-center gap-3`}>

          {!isHome && (
            <Link to="/" className="btn-about py-2 px-3 small text-decoration-none fw-700">
              <i className="fa-solid fa-arrow-left me-2"></i>Back to Gallery
            </Link>
          )}

          {!isProductDetail && (
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
                          src={profileImageError ? "/images/profile-photo.png" : `/api/v1/users/me/profile-photo`}
                          className="rounded-circle border border-2 border-white shadow-sm profile-nav-img"
                          width="42"
                          height="42"
                          style={{ border: "2px solid white", objectFit: "cover" }}
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
                  className="custom-nav-dropdown" // Clase añadida para el fix de la flecha
                >
                  <NavDropdown.Item as={Link} to="/user/page" className="fw-700 small">View Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/user/products" className="fw-700 small">My Inventory</NavDropdown.Item>
                  
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
          )}
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