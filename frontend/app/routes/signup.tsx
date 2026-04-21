/**
 * Signup Page Component
 *
 * User registration page for creating new Stilnovo marketplace accounts.
 *
 * Features:
 * - User information form (name, email, username, password)
 * - Password confirmation with validation
 * - Profile picture upload with preview
 * - Form validation before submission
 * - Error handling and display
 * - Loading state during submission
 * - Navigation to home/login on success
 * - Responsive design with Bootstrap grid
 * - Link to login page for existing users
 *
 * Registration Flow:
 * 1. User enters registration details
 * 2. Profile picture is selected (optional)
 * 3. Form validates password confirmation matches
 * 4. FormData created with all fields
 * 5. POST request to /v1/auth/signup endpoint
 * 6. On success → redirect to /login with success message
 * 7. On error → display error message to user
 *
 * State Management:
 * - isLoading: Controls form submission and loader visibility
 * - signupError: Stores and displays validation/API errors
 * - formData: Stores all text input fields
 * - profilePicture: Stores selected file
 * - previewUrl: Displays image preview before upload
 *
 * Image Handling:
 * - FileReader used to create preview URL
 * - Profile picture is optional field
 * - Attached to FormData for multipart upload
 *
 * Validation:
 * - Passwords must match before submission
 * - Error message displayed if validation fails
 * - API handles additional validation server-side
 *
 * @component
 * @returns React component for user account registration
 */

import { useNavigate, Link } from 'react-router';
import { Container, Form, Alert, Row, Col, Card, Button, Image } from 'react-bootstrap';
import type { Route } from './+types/signup';
import React, { useState } from 'react';
import logo from "../assets/logo.png";
import Footer from '~/components/footer';
import Loader from '~/components/Loader';

/**
 * Signup Component Implementation
 * 
 * Manages user registration form with profile picture upload.
 */
export default function Signup({ }: Route.ComponentProps) {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  /**
   * Handle Profile Picture Selection
   * Creates preview URL using FileReader
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /**
   * Handle Text Input Changes
   * Updates form data state
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handle Form Submission
   * 
   * Process:
   * 1. Validate passwords match
   * 2. Prepare FormData with all fields
   * 3. Include optional profile picture
   * 4. Submit POST request to /v1/auth/signup
   * 5. Redirect to login on success
   * 6. Display error message on failure
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    if (profilePicture) data.append('profilePicture', profilePicture);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('confirmPassword', formData.confirmPassword);

    try {
      const [response] = await Promise.all([
        fetch(`${window.location.origin}/api/v1/users`, {
          method: 'POST',
          body: data,
          credentials: 'include'
        }),
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);

      if (response.ok) {
        navigate('/login');
      } else {
        try {
          const errorData = await response.json();
          setSignupError(errorData.error || 'Registration failed. Please try again.');
        } catch (parseError) {
          setSignupError('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      setSignupError('An error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="auth-page min-vh-100 d-flex flex-column bg-light">

        <header className="navbar container-fluid px-lg-5 py-2 bg-white header-border-line">
          <div className="logo-wrapper">
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
              <Image src={logo} alt="Stilnovo" className="logo-img" width="30" />
              <span className="brand">Stilnovo</span>
            </Link>
          </div>
          <nav className="nav-actions ms-auto">
            <span className="text-muted d-none d-sm-inline">Already a member?</span>
            <Link to="/login" className="link-login ms-2">Log in</Link>
          </nav>
        </header>

        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-3">
          <Container className="d-flex align-items-center justify-content-center">

            <Card className="auth-card clay-card border-0 shadow-sm w-100" style={{ maxWidth: '500px' }}>
              <Card.Body className="p-4">

                <div className="text-center mb-3">
                  <h2 className="fw-800 mb-1 fs-3">Join Us</h2>
                  <p className="hero-subtitle small text-primary mb-0">Create your profile to start trading</p>
                </div>

                {signupError && (
                  <Alert variant="danger" className="py-2 small fw-700 rounded-3 mb-3 text-center">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i> {signupError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>

                  <div className="text-center mb-3">
                    <div
                      className="profile-upload-container mx-auto rounded-circle border d-flex align-items-center justify-content-center bg-white shadow-sm"
                      style={{ position: 'relative', overflow: 'hidden', width: '75px', height: '75px' }}
                    >
                      {!previewUrl && <i className="fa-solid fa-user-plus text-secondary fs-4"></i>}
                      {previewUrl && <Image src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />}

                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange as any}
                        disabled={isLoading}
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                    </div>
                    <Form.Label className="fw-700 x-small mt-2 d-block cursor-pointer text-primary" style={{ pointerEvents: 'none' }}>
                      Upload Avatar
                    </Form.Label>
                  </div>

                  <Row className="g-3 mb-3">

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="fw-700 x-small mb-1 text-muted">Full Name</Form.Label>
                        <div className="search-box w-100 py-2 bg-light rounded-pill">
                          <i className="fa-solid fa-id-card small text-muted px-3"></i>
                          <Form.Control
                            type="text"
                            name="username"
                            placeholder="Your name"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                            className="border-0 shadow-none bg-transparent p-0 flex-grow-1"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="fw-700 x-small mb-1 text-muted">Email Address</Form.Label>
                        <div className="search-box w-100 py-2 bg-light rounded-pill">
                          <i className="fa-solid fa-envelope small text-muted px-3"></i>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="email@stilnovo.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                            className="border-0 shadow-none bg-transparent p-0 flex-grow-1"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-700 x-small mb-1 text-muted">Password</Form.Label>
                        <div className="search-box w-100 py-2 bg-light rounded-pill">
                          <i className="fa-solid fa-lock small text-muted px-3"></i>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                            className="border-0 shadow-none bg-transparent p-0 flex-grow-1"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-700 x-small mb-1 text-muted">Confirm</Form.Label>
                        <div className="search-box w-100 py-2 bg-light rounded-pill">
                          <i className="fa-solid fa-check-double small text-muted px-3"></i>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                            className="border-0 shadow-none bg-transparent p-0 flex-grow-1"
                          />
                        </div>
                      </Form.Group>
                    </Col>

                  </Row>

                  <div className="text-center mt-2">
                    <Button
                      type="submit"
                      className="btn-sell w-100 py-2 mb-3 border-0 shadow-sm rounded-pill"
                      disabled={isLoading}
                      style={{ fontSize: '1rem', fontWeight: 800 }}
                    >
                      {isLoading ? 'Processing...' : 'Create Account'}
                    </Button>

                    <Link to="/" className="text-muted small text-decoration-none fw-700 d-inline-block">
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