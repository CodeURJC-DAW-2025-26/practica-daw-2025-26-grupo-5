import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router';
import { Container, Alert } from 'react-bootstrap';
import { useUserStore } from '~/stores/useUserStore';
import type { Route } from './+types/login';
import logo from "../assets/logo.png";
import Footer from '~/components/footer';
import Loader from '~/components/Loader'; 

interface LoginFormData {
  username: string;
  password: string;
}

export default function Login({ }: Route.ComponentProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { loginUser, loginError, user } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
    }
  }, [user, navigate, location, isLoading]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await Promise.all([
        loginUser(data.username, data.password),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}

      <div className="auth-page">
        <header className="navbar container-fluid px-lg-5 py-3 header-border-line bg-white">
          <div className="logo-wrapper">
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
              <img src={logo} alt="Stilnovo" className="logo-img" width="35" />
              <span className="brand">Stilnovo</span>
            </Link>
          </div>
          <nav className="nav-actions">
            <span className="text-muted d-none d-sm-inline">Don't have an account?</span>
            <Link to="/signup" className="link-login ms-2">Sign up</Link>
          </nav>
        </header>

        <div className="hero-wrapper auth-background">
          <main className="container d-flex align-items-center justify-content-center flex-grow-1">

            <div className="auth-card clay-card p-5 bg-white" style={{ maxWidth: '480px', width: '100%' }}>

              <div className="text-center mb-5">
                <h2 className="fw-800">Welcome Back</h2>
                <p className="hero-subtitle">Log in to your treasure chest</p>
              </div>

              {loginError && (
                <Alert variant="danger" className="text-center fw-700 mb-4 border-0 rounded-3">
                  Wrong username or password
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>

                <div className="mb-4">
                  <label className="form-label fw-700 small ms-2">Username</label>
                  <div className={`search-box w-100 py-2 ${errors.username ? 'border-danger' : ''}`}>
                    <i className="fa-solid fa-user small"></i>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      {...register('username', { required: true })}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="form-label fw-700 small ms-2">Password</label>
                  <div className={`search-box w-100 py-2 ${errors.password ? 'border-danger' : ''}`}>
                    <i className="fa-solid fa-lock small"></i>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      {...register('password', { required: true })}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-sell w-100 justify-content-center mb-4"
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
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}