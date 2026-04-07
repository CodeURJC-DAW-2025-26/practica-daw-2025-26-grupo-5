import React, { useActionState, useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";
import { Link } from "react-router";
import "../app.css";
import logo from "../assets/logo.png";

/**
 * Header Component
 * Fusión del diseño Stilnovo con la lógica de UserDTO y Zustand
 */
export default function Header() {
  const [isErrorLoginDialogOpen, setErrorLoginDialogOpen] = useState(false);

  // Accedemos al store de Zustand
  const { user, loginError, loadLoggedUser, loginUser, logoutUser } = useUserStore();

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
  }, [loadLoggedUser]);

  // Comprobación de Admin basada en tu UserDTO (roles: string[])
  const isAdmin = user?.roles.includes("ADMIN");

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
          {user ? (
            /* --- VISTA USUARIO LOGUEADO --- */
            <div className="dropdown">
              <div
                className="d-flex align-items-center gap-3"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: "pointer" }}
              >
                <div className="text-end d-none d-lg-block">
                  <p className="mb-0 small fw-800 lh-1 text-dark">{user.name}</p>
                  <p className="mb-0 x-small fw-700 text-muted">
                    My Account <i className="fa-solid fa-chevron-down ms-1" style={{ fontSize: "0.6rem" }}></i>
                  </p>
                </div>

                <div className="position-relative">
                  <img
                    src="/user/me/profile-photo"
                    className="rounded-circle border border-2 border-white shadow-sm profile-nav-img"
                    width="42"
                    height="42"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/profile-photo.png";
                    }}
                    alt="Profile"
                  />
                  {/* Punto verde de status si no está baneado */}
                  {!user.banned && (
                    <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle"></span>
                  )}
                </div>
              </div>

              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2 mt-3 animate slideIn">
                <li>
                  <Link className="dropdown-item rounded-3 py-2 fw-700 small" to="/user-page">
                    View Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item rounded-3 py-2 fw-700 small" to="/user-products-page">
                    My Inventory
                  </Link>
                </li>
                
                {/* Lógica para ADMIN usando roles.includes */}
                {isAdmin && (
                  <li>
                    <Link className="dropdown-item rounded-3 py-2 fw-700 small" to="/admin">
                      Administration
                    </Link>
                  </li>
                )}

                <li><hr className="dropdown-divider opacity-50" /></li>
                <li>
                  <form action={logoutFormAction} className="m-0">
                    <button
                      type="submit"
                      disabled={isLoggingOut}
                      className="dropdown-item rounded-3 py-2 fw-700 small text-danger border-0 bg-transparent w-100 text-start"
                    >
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </form>
                </li>
              </ul>
            </div>
          ) : (
            /* --- VISTA USUARIO NO LOGUEADO --- */
            <div className="d-flex align-items-center gap-3">
              <Link to="/login-page" className="link-login">Log in</Link>
              <Link to="/signup-page" className="btn-signup">Sign up</Link>
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