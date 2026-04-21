// ============================================================================
// FILE: frontend/app/routes/login.tsx
// UPDATED: Complete JSDoc documentation with English comments
// ============================================================================

/**
 * Login Page Component
 *
 * The Login page provides authentication functionality for existing Stilnovo users.
 * It allows users to enter their credentials and access their personalized marketplace features.
 *
 * Authentication Flow:
 * 1. User enters username and password
 * 2. Form submission calls loginUser() from Zustand store
 * 3. Store sends credentials to backend via login-service
 * 4. Backend validates and returns user session token
 * 5. Token stored in localStorage and used for API requests
 * 6. User redirected to requested page or dashboard
 *
 * Security Features:
 * - Passwords sent over HTTPS (enforced by backend)
 * - Session tokens validated on each API request
 * - Automatic redirect for already-logged-in users
 * - Banned users redirected to /banned page
 *
 * Redirect Logic:
 * - If logged in + banned → /banned
 * - If logged in + not banned → Previous page or /
 * - Location.state?.from?.pathname → Stores the page user tried to access before login
 *
 * UI Features:
 * - Clay-style card design matching Stilnovo aesthetic
 * - Form validation (required fields)
 * - Loading spinner during submission
 * - Error message display for failed attempts
 * - Sign up link for new users
 * - Back to marketplace link
 *
 * @returns React component displaying login form
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import Header from "~/components/header";
import { Container, Alert, Card, Form, Button, Image } from 'react-bootstrap';
import { useUserStore } from '~/stores/useUserStore';
import type { Route } from './+types/login';
import logo from "../assets/logo.png";
import Footer from '~/components/footer';
import Loader from '~/components/Loader';

/**
 * Login Component
 *
 * Renders the full-page login form with header and footer.
 * Handles credential submission and session establishment.
 */
export default function Login({ }: Route.ComponentProps) {
  // Authentication functions and state from Zustand
  const { loginUser, loginError, user } = useUserStore();
  
  // Router navigation and location info
  const navigate = useNavigate();
  const location = useLocation();

  // Local form state
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Effect: Auto-redirect if Already Logged In
   *
   * If user is already authenticated when this page loads, redirect them.
   * This prevents users from staying on the login page if they're already logged in.
   *
   * Redirect Destinations:
   * 1. If banned → /banned
   * 2. If returning from protected route → location.state.from.pathname
   * 3. Otherwise → / (home page)
   */
  useEffect(() => {
    if (user && !isLoading) {
      // Check if user is banned first
      if (user.banned) { 
        navigate('/banned'); 
        return; 
      }
      
      // Redirect to original page user tried to access, or home
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
    }
  }, [user, navigate, location, isLoading]);

  /**
   * Handle Login Form Submission
   *
   * Process Flow:
   * 1. Prevent default form submission
   * 2. Set loading state (shows spinner, disables inputs)
   * 3. Run loginUser() and artificial 2-second delay in parallel
   * 4. Auto-redirect via useEffect when user state updates
   * 5. Clear loading state
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Run both in parallel: actual login + minimum UI delay
      await Promise.all([
        loginUser(username, password),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
    } catch (error) {
      console.error('Error:', error);
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Full-Page Loading Overlay during form submission */}
      {isLoading && <Loader />}

      <div className="auth-page min-vh-100 d-flex flex-column">

        {/* HEADER: Mini header for login page */}
        <header className="navbar container-fluid px-lg-5 py-3 header-border-line bg-white">
          <div className="logo-wrapper">
            {/* Logo links back to home page */}
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
              <Image src={logo} alt="Stilnovo" className="logo-img" width="35" />
              <span className="brand">Stilnovo</span>
            </Link>
          </div>

          {/* Right side: Sign up prompt and link */}
          <nav className="nav-actions ms-auto">
            <span className="text-muted d-none d-sm-inline">Don't have an account?</span>
            <Link to="/signup" className="link-login ms-2">Sign up</Link>
          </nav>
        </header>

        {/* MAIN CONTENT: Login form container */}
        <div className="hero-wrapper auth-background flex-grow-1 d-flex">
          <main className="container d-flex align-items-center justify-content-center flex-grow-1 py-5">
            <div className="auth-card clay-card p-5" style={{ maxWidth: '480px', width: '100%' }}>

              {/* Form Header: Welcome message and subtitle */}
              <div className="text-center mb-5">
                <h2 className="fw-800">Welcome Back</h2>
                <p className="hero-subtitle">Log in to your treasure chest</p>
              </div>

              {/* LOGIN FORM SECTION */}
              <form onSubmit={handleSubmit}>

                {/* Error Alert: Shows when authentication fails */}
                {loginError && (
                  <div className="alert alert-danger text-center fw-700 mb-4 border-0">
                    Wrong username or password
                  </div>
                )}

                {/* USERNAME INPUT FIELD */}
                <div className="mb-4">
                  <label className="form-label fw-700 small">Username</label>
                  <div className="search-box w-100 py-2">
                    <i className="fa-solid fa-user small"></i>
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT FIELD */}
                <div className="mb-5">
                  <label className="form-label fw-700 small">Password</label>
                  <div className="search-box w-100 py-2">
                    <i className="fa-solid fa-lock small"></i>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* LOGIN SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="btn-sell w-100 justify-content-center mb-4 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login to My Account'}
                </button>

                {/* Back to Marketplace Link */}
                <div className="text-center">
                  <Link to="/" className="text-muted small text-decoration-none fw-700">
                    <i className="fa-solid fa-arrow-left me-2"></i>Back to Marketplace
                  </Link>
                </div>

              </form>

            </div>
          </main>
        </div>

        {/* FOOTER: Consistent footer across pages */}
        <Footer />
      </div>
    </>
  );
}
