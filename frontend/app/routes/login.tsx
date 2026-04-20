import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import Header from "~/components/header";
import { Container, Alert, Card, Form, Button, Image } from 'react-bootstrap';
import { useUserStore } from '~/stores/useUserStore';
import type { Route } from './+types/login';
import logo from "../assets/logo.png";
import Footer from '~/components/footer';
import Loader from '~/components/Loader';

export default function Login({ }: Route.ComponentProps) {
  const { loginUser, loginError, user } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && !isLoading) {
      if (user.banned) { navigate('/banned'); return; }
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
    }
  }, [user, navigate, location, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
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
      {isLoading && <Loader />}
      <div className="auth-page min-vh-100 d-flex flex-column">

        <header className="navbar container-fluid px-lg-5 py-3 header-border-line bg-white">
          <div className="logo-wrapper">
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
              <Image src={logo} alt="Stilnovo" className="logo-img" width="35" />
              <span className="brand">Stilnovo</span>
            </Link>
          </div>
          <nav className="nav-actions ms-auto">
            <span className="text-muted d-none d-sm-inline">Don't have an account?</span>
            <Link to="/signup" className="link-login ms-2">Sign up</Link>
          </nav>
        </header>

        <div className="hero-wrapper auth-background flex-grow-1 d-flex">
          <main className="container d-flex align-items-center justify-content-center flex-grow-1 py-5">
            <div className="auth-card clay-card p-5" style={{ maxWidth: '480px', width: '100%' }}>

              <div className="text-center mb-5">
                <h2 className="fw-800">Welcome Back</h2>
                <p className="hero-subtitle">Log in to your treasure chest</p>
              </div>

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit}>

                {loginError && (
                  <div className="alert alert-danger text-center fw-700 mb-4 border-0">
                    Wrong username or password
                  </div>
                )}

                {/* NAME INPUT */}
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

                {/* PASSWORD INPUT */}
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

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  className="btn-sell w-100 justify-content-center mb-4 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login to My Account'}
                </button>

                <div className="text-center">
                  <Link to="/" className="text-muted small text-decoration-none fw-700">
                    <i className="fa-solid fa-arrow-left me-2"></i>Back to Marketplace
                  </Link>
                </div>

              </form>
              {/* END OF LOGIN FORM */}

            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}