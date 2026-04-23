// ============================================================================
// FILE: frontend/app/routes/login.tsx
// DESCRIPTION: Login Page Component using React-Bootstrap
// ============================================================================

/**
 * Login Page Component
 *
 * Provides authentication functionality for existing Stilnovo users.
 * Uses React-Bootstrap components for structured, accessible UI rendering
 * while preserving the custom 'clay-card' and 'Stilnovo' aesthetics.
 *
 * Authentication Flow:
 * 1. User enters username and password
 * 2. Form submission calls loginUser() from Zustand store
 * 3. Store handles the backend API request
 * 4. Token is stored and user session is established
 * 5. Automatic redirect triggers upon successful login
 *
 * @returns React component displaying the login interface
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Container, Alert, Card, Form, Button, Image, Navbar, Nav } from 'react-bootstrap';
import { useUserStore } from '~/stores/useUserStore';
import type { Route } from './+types/login';
import logo from "../assets/logo.png";
import Footer from '~/components/Footer';
import Loader from '~/components/Loader';

export default function Login({ }: Route.ComponentProps) {
  // Authentication functions and state mapped from Zustand global store
  const { loginUser, loginError, user } = useUserStore();

  // React Router hooks for navigation and accessing previous location
  const navigate = useNavigate();
  const location = useLocation();

  // Local state for form fields and UI feedback
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState("");

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Effect: Auto-redirect authenticated users
   *
   * Prevents authenticated users from viewing the login page.
   * Checks ban status first, then redirects to their original destination
   * (or home if no previous destination is found).
   */
  useEffect(() => {
    if (user && !isLoading) {
      if (user.banned) {
        navigate('/banned');
        return;
      }

      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
    }
  }, [user, navigate, location, isLoading]);

  /**
   * Handle Login Form Submission
   *
   * @param e - The React FormEvent
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Execute login and artificial UI delay in parallel for better UX
      await Promise.all([
        loginUser(username, password),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
    } catch (error) {
      console.error('Authentication Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  /**
 * Performs minimal client-side validation.
 * Ensures that the required fields are not empty before proceeding with the action.
 * * @param value - The input string to be validated.
 * @returns {boolean} True if the value is present and not empty, false otherwise.
 */
  const htmlRegex = /<\/?[a-z][\s\S]*>/i;

  const validatePassword = (value: string) => {
    let errorMessage = "";

    if (value.length === 0) {
      errorMessage = "Password cannot be empty.";
    } else if (htmlRegex.test(value)) {
      errorMessage = "Malicious characters detected. Be careful.";
    }

    setPasswordError(errorMessage);
  };

  const validateUsername = (value: string) => {
    let errorMessage = "";

    if (value.length === 0) {
      errorMessage = "Username cannot be empty.";
    }else if (htmlRegex.test(value)) {
      errorMessage = "Malicious characters detected. Be careful.";
    }

    setUsernameError(errorMessage);
  };

  return (
    <>
      {/* Full-Page Loading Overlay during form submission */}
      {isLoading && <Loader />}

      <div className="auth-page min-vh-100 d-flex flex-column">

        {/* HEADER: React-Bootstrap Navbar implementation */}
        <Navbar className="px-lg-5 py-3 header-border-line bg-white" expand={false}>
          <Container fluid>
            {/* Logo linked to home */}
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
              <Image src={logo} alt="Stilnovo" className="logo-img" width="35" />
              <span className="brand mb-0">Stilnovo</span>
            </Navbar.Brand>

            {/* Right-aligned navigation actions */}
            <Nav className="ms-auto flex-row align-items-center">
              <span className="text-muted d-none d-sm-inline me-2 fw-600">Don't have an account?</span>
              <Link to="/signup" className="link-login">Sign up</Link>
            </Nav>
          </Container>
        </Navbar>

        {/* MAIN CONTENT: Layout using React-Bootstrap Containers and Cards */}
        <div className="hero-wrapper auth-background flex-grow-1 d-flex">
          <Container as="main" className="d-flex align-items-center justify-content-center flex-grow-1 py-5">

            <Card className="auth-card clay-card p-4 p-md-5 border-0" style={{ maxWidth: '480px', width: '100%' }}>
              <Card.Body className="p-0">

                {/* Form Header */}
                <div className="text-center mb-5">
                  <h2 className="fw-800">Welcome Back</h2>
                  <p className="hero-subtitle">Log in to your treasure chest</p>
                </div>

                {/* LOGIN FORM SECTION: React-Bootstrap Form implementation */}
                <Form onSubmit={handleSubmit}>

                  {/* Error Alert Display */}
                  {loginError && (
                    <Alert variant="danger" className="text-center fw-700 mb-4 border-0">
                      Wrong username or password
                    </Alert>
                  )}

                  {/* USERNAME FIELD */}
                  <Form.Group className="mb-4" controlId="loginUsername">
                    <Form.Label className="fw-700 small">Username</Form.Label>
                    <div className="search-box w-100 py-2 d-flex align-items-center">
                      <i className="fa-solid fa-user small ms-3 text-muted"></i>
                      <Form.Control
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        value={username}

                        onChange={(e) => {
                          const username_val = e.target.value;
                          setUsername(e.target.value);
                          validateUsername(username_val);
                        }}
                        isInvalid={!!usernameError}

                        disabled={isLoading}
                        required
                        className="border-0 bg-transparent shadow-none py-1"
                      />
                    </div>
                    {usernameError && <div className="text-danger x-small fw-700 mt-1 ms-3">{usernameError}</div>}
                  </Form.Group>


                  {/* PASSWORD FIELD */}
                  <Form.Group className="mb-5" controlId="loginPassword">
                    <Form.Label className="fw-700 small">Password</Form.Label>
                    <div className="search-box w-100 py-2 d-flex align-items-center">
                      <i className="fa-solid fa-lock small ms-3 text-muted"></i>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={password}

                        onChange={(e) => {
                          const pass_val = e.target.value;
                          setPassword(e.target.value);
                          validatePassword(pass_val);
                        }}
                        isInvalid={!!passwordError}

                        disabled={isLoading}
                        required
                        className="border-0 bg-transparent shadow-none py-1"
                      />
                      <i
                          className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                          id="toggleCvv"
                          onClick={togglePassword}
                          style={{ cursor: 'pointer' }}
                        ></i>
                    </div>
                    {passwordError && <div className="text-danger x-small fw-700 mt-1 ms-3">{passwordError}</div>}
                  </Form.Group>


                  {/* SUBMIT BUTTON */}
                  <Button
                    type="submit"
                    variant="primary" // Bootstrap default variant, overridden by custom class
                    className="btn-sell w-100 py-3 fw-800 mb-4 border-0 rounded-pill d-flex justify-content-center align-items-center"
                    disabled={isLoading || !!passwordError || !!usernameError}
                  >
                    {isLoading ? 'Logging in...' : 'Login to My Account'}
                  </Button>

                  {/* Back to Marketplace Link */}
                  <div className="text-center">
                    <Link to="/" className="text-muted small text-decoration-none fw-700">
                      <i className="fa-solid fa-arrow-left me-2"></i>Back to Marketplace
                    </Link>
                  </div>

                </Form>

              </Card.Body>
            </Card>

          </Container>
        </div>

        {/* FOOTER */}
        <Footer />

      </div>
    </>
  );
}