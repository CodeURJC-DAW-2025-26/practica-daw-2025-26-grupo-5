import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useUserStore } from '~/stores/useUserStore';
import type { Route } from './+types/login';
import 'bootstrap/dist/css/bootstrap.min.css';

interface LoginFormData {
  username: string;
  password: string;
}

/**
 * Login Page Component
 * Allows users to authenticate with the backend
 */
export default function Login({}: Route.ComponentProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { loginUser, loginError, user } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);

  // If already logged in, redirect to admin
  React.useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || '/admin';
      navigate(redirectTo);
    }
  }, [user, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await loginUser(data.username, data.password);
      // loginUser will set user in store, which triggers useEffect above
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Card className="shadow-lg" style={{ borderRadius: '20px', border: 'none' }}>
          <Card.Body className="p-5">
            {/* Logo and Title */}
            <div className="text-center mb-4">
              <img src="/images/logo.png" alt="Stilnovo" width="50" className="mb-3" />
              <h2 className="fw-800" style={{ color: '#1A365D', marginBottom: '0.5rem' }}>
                Stilnovo Admin
              </h2>
              <p className="text-muted small">Log in to access the admin panel</p>
            </div>

            {/* Error Alert */}
            {loginError && (
              <Alert variant="danger" className="mb-4" style={{ borderRadius: '12px' }}>
                <i className="fa-solid fa-exclamation-circle me-2" />
                {loginError}
              </Alert>
            )}

            {/* Login Form */}
            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Username Field */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-700 mb-2">Username</Form.Label>
                <Form.Control
                  {...register('username', {
                    required: 'Username is required',
                  })}
                  type="text"
                  placeholder="Enter your username"
                  isInvalid={!!errors.username}
                  disabled={isLoading}
                  style={{
                    borderRadius: '12px',
                    padding: '12px',
                    borderColor: errors.username ? '#dc3545' : '#e2e8f0',
                    fontSize: '0.95rem',
                  }}
                />
                {errors.username && (
                  <Form.Control.Feedback type="invalid" className="d-block mt-2 small">
                    {errors.username.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Password Field */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-700 mb-2">Password</Form.Label>
                <Form.Control
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type="password"
                  placeholder="Enter your password"
                  isInvalid={!!errors.password}
                  disabled={isLoading}
                  style={{
                    borderRadius: '12px',
                    padding: '12px',
                    borderColor: errors.password ? '#dc3545' : '#e2e8f0',
                    fontSize: '0.95rem',
                  }}
                />
                {errors.password && (
                  <Form.Control.Feedback type="invalid" className="d-block mt-2 small">
                    {errors.password.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-100 fw-800"
                style={{
                  backgroundColor: '#2f6ced',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '1rem',
                }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-sign-in-alt me-2" />
                    Log In
                  </>
                )}
              </Button>
            </Form>

            {/* Help Text */}
            <div className="mt-4 p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <p className="small text-muted mb-0">
                <strong>Demo Credentials:</strong>
                <br />
                Username: <code>admin</code>
                <br />
                Password: <code>admin123</code>
              </p>
            </div>

            {/* Back Link */}
            <div className="text-center mt-4">
              <a href="/" className="text-decoration-none" style={{ color: '#2f6ced' }}>
                <i className="fa-solid fa-arrow-left me-2" />
                Back to Market
              </a>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

import React from 'react';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <h4 className="alert-heading">Error!</h4>
        <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      </Alert>
    </Container>
  );
}
