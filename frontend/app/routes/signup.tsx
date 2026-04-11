import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import type { Route } from './+types/signup';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

interface SignupFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

/**
 * Signup Page Component
 * Registration form for new users
 */
export default function Signup({}: Route.ComponentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [signupError, setSignupError] = React.useState<string | null>(null);
  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${window.location.origin}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          username: data.username,
          password: data.password,
        }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const error = await response.json();
        setSignupError(error.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      setSignupError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <Card className="shadow-lg" style={{ borderRadius: '20px', border: 'none' }}>
          <Card.Body className="p-5">
            {/* Logo and Title */}
            <div className="text-center mb-4">
              <img src="/images/logo.png" alt="Stilnovo" width="50" className="mb-3" />
              <h2 className="fw-800" style={{ color: '#1A365D', marginBottom: '0.5rem' }}>
                Join Stilnovo
              </h2>
              <p className="text-muted small">Create your account and start trading</p>
            </div>

            {/* Error Alert */}
            {signupError && (
              <Alert variant="danger" className="mb-4" style={{ borderRadius: '12px' }}>
                <i className="fa-solid fa-exclamation-circle me-2" />
                {signupError}
              </Alert>
            )}

            {/* Signup Form */}
            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Name Field */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-700 mb-2">Full Name</Form.Label>
                <Form.Control
                  {...register('name', {
                    required: 'Full name is required',
                  })}
                  type="text"
                  placeholder="Enter your full name"
                  isInvalid={!!errors.name}
                  disabled={isLoading}
                  style={{
                    borderRadius: '12px',
                    padding: '12px',
                    borderColor: errors.name ? '#dc3545' : '#e2e8f0',
                    fontSize: '0.95rem',
                  }}
                />
                {errors.name && (
                  <Form.Control.Feedback type="invalid" className="d-block mt-2 small">
                    {errors.name.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Email Field */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-700 mb-2">Email Address</Form.Label>
                <Form.Control
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email',
                    },
                  })}
                  type="email"
                  placeholder="Enter your email"
                  isInvalid={!!errors.email}
                  disabled={isLoading}
                  style={{
                    borderRadius: '12px',
                    padding: '12px',
                    borderColor: errors.email ? '#dc3545' : '#e2e8f0',
                    fontSize: '0.95rem',
                  }}
                />
                {errors.email && (
                  <Form.Control.Feedback type="invalid" className="d-block mt-2 small">
                    {errors.email.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Username Field */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-700 mb-2">Username</Form.Label>
                <Form.Control
                  {...register('username', {
                    required: 'Username is required',
                  })}
                  type="text"
                  placeholder="Choose a username"
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
              <Form.Group className="mb-3">
                <Form.Label className="fw-700 mb-2">Password</Form.Label>
                <Form.Control
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  placeholder="Enter a password"
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

              {/* Confirm Password Field */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-700 mb-2">Confirm Password</Form.Label>
                <Form.Control
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                  type="password"
                  placeholder="Confirm your password"
                  isInvalid={!!errors.confirmPassword}
                  disabled={isLoading}
                  style={{
                    borderRadius: '12px',
                    padding: '12px',
                    borderColor: errors.confirmPassword ? '#dc3545' : '#e2e8f0',
                    fontSize: '0.95rem',
                  }}
                />
                {errors.confirmPassword && (
                  <Form.Control.Feedback type="invalid" className="d-block mt-2 small">
                    {errors.confirmPassword.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-100 fw-800 mb-3"
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-plus me-2" />
                    Create Account
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="small text-muted mb-0">
                  Already have an account?{' '}
                  <a href="/login" className="fw-700" style={{ color: '#2f6ced', textDecoration: 'none' }}>
                    Log in here
                  </a>
                </p>
              </div>
            </Form>

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
