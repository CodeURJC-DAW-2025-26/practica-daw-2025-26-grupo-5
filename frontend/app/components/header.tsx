import React, { useActionState, useEffect, useState } from "react";
import { Modal, Button, NavDropdown } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";
import { Link } from "react-router-dom";
import "../app.css";
import logo from "../assets/logo.png";

/**
 * Header Component
 * Fusión del diseño Stilnovo con la lógica de UserDTO y Zustand
 */
export default function Header() {
  const [isErrorLoginDialogOpen, setErrorLoginDialogOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // Accedemos al store de Zustand
  const { user, loginError, isAuthLoading, loadLoggedUser, loginUser, logoutUser } = useUserStore();

  const handleShowErrorLoginDialog = () => setErrorLoginDialogOpen(true);
  const handleCloseErrorLoginDialog = () => setErrorLoginDialogOpen(false);

  /**
   * Login Action
   */
  async function loginUserAction(_prevState: void | null, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    await loginUser(username, password);
    const error = useUserStore.getState().loginError;

    if (error) {
      handleShowErrorLoginDialog();
    }
  }

  const [, loginFormAction, isPending] = useActionState(loginUserAction, null);

  /**
   * Logout Action
   */
  async function logoutUserAction() {
    await logoutUser();
  }

  const [, logoutFormAction, isLoggingOut] = useActionState(logoutUserAction, null);

  /**
   * Carga inicial del usuario
   */
  useEffect(() => {
    loadLoggedUser();
  }, []);

  // Comprobación de Admin basada en tu UserDTO (roles: string[])
  const isAdmin = user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ADMIN");

  return (
    <>
      <header className="navbar container-fluid px-lg-5 py-3 sticky-top bg-white header-border-line">
        <div className="logo-wrapper">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <img src={logo} alt="Stilnovo" className="logo-img" width="35" />
            <span className="brand">Stilnovo</span>
          </Link>
        </div>

        {/* BUSCADOR ORIGINAL STILNOVO */}
        <form action="/#featured-treasures" method="get" className="search-box d-none d-md-flex">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" name="query" placeholder="Search for treasures..." />
          <button type="submit" className="d-none"></button>
        </form>

        <nav className="nav-actions">
          {isAuthLoading ? (
            /* --- LOADING STATE --- */
            <div style={{ width: '42px', height: '42px' }} />
          ) : user ? (
            /* --- VISTA USUARIO LOGUEADO --- */
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
                      src={profileImageError ? `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%231A365D' font-size='40' font-weight='bold'%3E${user.name?.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E` : `http://localhost:8443/api/v1/users/me/photo`}
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
              className="user-dropdown"
            >
              <NavDropdown.Item as={Link} to="/user-page" className="fw-700 small">
                <i className="fa-solid fa-user me-2" />
                My Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sales-and-orders-page" className="fw-700 small">
                <i className="fa-solid fa-bag-shopping me-2" />
                My Purchases
              </NavDropdown.Item>
              
              {/* Admin Panel Link - Visible for all logged-in users for testing */}
              <NavDropdown.Item as={Link} to="/admin" className="fw-700 small text-primary">
                <i className="fa-solid fa-shield me-2" />
                Admin Panel
              </NavDropdown.Item>

              <NavDropdown.Divider />
              <NavDropdown.Item as="div" className="p-0">
                <form action={logoutFormAction} className="m-0">
                  <button
                    type="submit"
                    disabled={isLoggingOut}
                    className="dropdown-item rounded-3 py-2 fw-700 small text-danger border-0 bg-transparent w-100 text-start"
                  >
                    <i className="fa-solid fa-sign-out-alt me-2" />
                    {isLoggingOut ? "Logging out..." : "Sign out"}
                  </button>
                </form>
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            /* --- VISTA USUARIO NO LOGUEADO --- */
            <div className="d-flex align-items-center gap-3">
              <Link to="/login" className="link-login">Log in</Link>
              <Link to="/signup" className="btn-signup">Sign up</Link>
            </div>
          )}
        </nav>
      </header>

      {/* MODAL DE ERROR */}
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