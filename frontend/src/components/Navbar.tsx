import { Navbar as BNavbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

/**
 * Global Navigation Bar Component.
 * Features:
 * - Responsive design using React-Bootstrap.
 * - Dynamic auth states using Zustand (shows user info or login button).
 * - Client-side routing with react-router-dom (no page reloads).
 */
export const Navbar = () => {
    // Get authentication state and logout action from Zustand store
    const { isLoggedIn, user, logout, isAdmin } = useUserStore();
    const navigate = useNavigate();

    /**
     * Handles user logout and redirects to home page.
     */
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <BNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
            <Container>
                {/* Brand logo linked to Home */}
                <BNavbar.Brand as={Link} to="/" className="fw-bold">
                    STILNOVO <span className="text-primary">SPA</span>
                </BNavbar.Brand>

                <BNavbar.Toggle aria-controls="main-navbar" />

                <BNavbar.Collapse id="main-navbar">
                    <Nav className="me-auto">
                        {/* NavLink automatically adds the 'active' class to the current route */}
                        <Nav.Link as={NavLink} to="/">Home</Nav.Link>
                        <Nav.Link as={NavLink} to="/products">Products</Nav.Link>

                        {/* Example of a conditional link: only visible to Admins */}
                        {isAdmin() && (
                            <Nav.Link as={NavLink} to="/admin" className="text-warning">
                                Admin Panel
                            </Nav.Link>
                        )}
                    </Nav>

                    <Nav className="ms-auto align-items-center">
                        {isLoggedIn ? (
                            // IF LOGGED IN: Show username and Logout button
                            <>
                                <span className="text-light me-3">
                                    Welcome, <strong>{user?.username}</strong>
                                </span>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            // IF NOT LOGGED IN: Show Login button
                            <Nav.Link as={Link} to="/login">
                                <Button variant="primary" size="sm" className="px-4">
                                    Login
                                </Button>
                            </Nav.Link>
                        )}
                    </Nav>
                </BNavbar.Collapse>
            </Container>
        </BNavbar>
    );
};
