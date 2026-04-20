import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
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
      <div className="auth-page min-vh-100 d-flex flex-column bg-light">
        <header className="navbar container-fluid px-lg-5 py-3 bg-white border-bottom shadow-sm">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <Image src={logo} alt="Stilnovo" width="35" />
            <span className="brand fw-800 text-primary mb-0 fs-4">Stilnovo</span>
          </Link>
          <nav className="ms-auto fw-600">
            <span className="text-muted d-none d-sm-inline">Don't have an account?</span>
            <Link to="/signup" className="link-login ms-2">Sign up</Link>
          </nav>
        </header>

        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <Container className="d-flex justify-content-center">
            <Card className="clay-card border-0 p-3" style={{ maxWidth: '480px', width: '100%' }}>
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5">
                  <h2 className="fw-800 text-dark">Welcome Back</h2>
                  <p className="text-muted small fw-600">Log in to your treasure chest</p>
                </div>

                {loginError && <Alert variant="danger" className="text-center fw-700 mb-4 border-0 rounded-3">Wrong username or password</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-800 small text-muted ms-2" style={{ letterSpacing: '0.5px' }}>Username</Form.Label>
                    <Form.Control 
                      className="py-3 bg-light border-0 rounded-3 fw-600" 
                      placeholder="Enter your username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading} 
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label className="fw-800 small text-muted ms-2" style={{ letterSpacing: '0.5px' }}>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      className="py-3 bg-light border-0 rounded-3 fw-600" 
                      placeholder="Enter your password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading} 
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="btn-sell w-100 justify-content-center mb-4" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login to My Account'}
                  </Button>

                  <div className="text-center">
                    <Link to="/" className="text-muted small text-decoration-none fw-700">
                      <i className="fa-solid fa-arrow-left me-2"></i>Back to Marketplace
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Container>
        </main>
        <Footer />
      </div>
    </>
  );
}