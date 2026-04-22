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
import { Container, Form, Navbar, Nav, Row, Col, Card, Button, Image } from 'react-bootstrap';
import type { Route } from './+types/signup';
import React, { useState } from 'react';
import { signUp } from '~/services/login-service'; // MVC: Delegate to service
import logo from "../assets/logo.png";
import Footer from '~/components/Footer';
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

  //Only for validations
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (name === 'username') validateUsername(value);
    if (name === 'email') validateEmail(value);

    if (name === 'password') validatePasswords(value, formData.confirmPassword);
    if (name === 'confirmPassword') validatePasswords(formData.password, value);
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
    // MVC: Service builds FormData & delegates to API client
    try {
      const formDataToSend = new FormData();
      if (profilePicture) formDataToSend.append('profilePicture', profilePicture);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('confirmPassword', formData.confirmPassword);

      // Call service instead of fetch directly
      await signUp(formDataToSend);

      // Success: wait briefly then redirect to login
      await new Promise((resolve) => setTimeout(resolve, 2500));
      navigate('/login');
    } catch (error: any) {
      // Service/API client parses and provides error message
      const errorMsg = error.message || 'Registration failed. Please try again.';
      setSignupError(errorMsg);
      setIsLoading(false);
    }
  };

  /**
 * Performs minimal client-side validation.
 * Ensures that the required fields are not empty before proceeding with the action.
 * * @param value - The input string to be validated.
 * @returns {boolean} True if the value is present and not empty, false otherwise.
 */
  const validateUsername = (value: string) => {
    let error = value.trim().length < 3 ? "Name is too short (min. 3 chars)." : "";
    setErrors(prev => ({ ...prev, username: error }));
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let error = !emailRegex.test(value) ? "Invalid email address." : "";
    setErrors(prev => ({ ...prev, email: error }));
  };

  const validatePasswords = (pass: string, confirm: string) => {
    let passError = pass.length < 8 ? "Password must be at least 8 characters." : "";
    let matchError = pass !== confirm ? "Passwords do not match." : "";

    setErrors(prev => ({
      ...prev,
      password: passError,
      confirmPassword: matchError
    }));
  };

  return (
    <>
      {isLoading && <Loader />}

      <div className="auth-page min-vh-100 d-flex flex-column bg-light">

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
              <span className="text-muted d-none d-sm-inline me-2 fw-600">Already a member?</span>
              <Link to="/login" className="link-login">Log in</Link>
            </Nav>
          </Container>
        </Navbar>

        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <Container>
            <Row className="justify-content-center px-2">
              <Col xs={12} style={{ maxWidth: '750px' }}> 
                <Card className="clay-card border-0 shadow-sm" style={{ borderRadius: '28px' }}>
                  <Card.Body className="p-4 p-md-5">

                    <div className="text-center mb-4">
                      <h2 className="fw-800 mb-1">Join Us</h2>
                      <p className="text-muted small fw-600">Create your profile to start trading</p>
                    </div>

                    <Form onSubmit={handleSubmit}>

                      {/* Avatar Upload  */}
                      <div className="text-center mb-4">
                        <div className="mx-auto rounded-circle border d-flex align-items-center justify-content-center bg-white shadow-sm"
                          style={{ position: 'relative', overflow: 'hidden', width: '75px', height: '75px' }}>
                          {!previewUrl ? <i className="fa-solid fa-camera text-secondary fs-4"></i> :
                            <Image src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange as any}
                            style={{ position: 'absolute', opacity: 0, cursor: 'pointer', inset: 0 }}
                          />
                        </div>
                        <label className="fw-700 x-small mt-2 text-primary" style={{ letterSpacing: '0.5px' }}>
                          Upload Photo
                        </label>
                      </div>

                      <Row className="g-4 mb-4">

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-700 x-small mb-1 text-muted ms-3">Full Name</Form.Label>
                            <div className={`search-box d-flex align-items-center w-100 py-2 bg-light rounded-pill border-2 ${errors.username ? 'border-danger' : 'border-transparent'}`} style={{ minHeight: '52px' }}>
                              <i className="fa-solid fa-user small text-muted px-3"></i>
                              <Form.Control
                                name="username"
                                placeholder="Your name"
                                value={formData.username}
                                onChange={handleInputChange}
                                isInvalid={!!errors.username}
                                className="border-0 shadow-none bg-transparent p-0 flex-grow-1 small fw-600 w-100"
                              />
                            </div>
                            {errors.username && <div className="text-danger x-small fw-700 mt-1 ms-3">{errors.username}</div>}
                          </Form.Group>

                          <Form.Group>
                            <Form.Label className="fw-700 x-small mb-1 text-muted ms-3">Email Address</Form.Label>
                            <div className={`search-box d-flex align-items-center w-100 py-2 bg-light rounded-pill border-2 ${errors.email ? 'border-danger' : 'border-transparent'}`} style={{ minHeight: '52px' }}>
                              <i className="fa-solid fa-envelope small text-muted px-3"></i>
                              <Form.Control
                                name="email"
                                placeholder="email@stilnovo.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                isInvalid={!!errors.email}
                                className="border-0 shadow-none bg-transparent p-0 flex-grow-1 small fw-600 w-100"
                              />
                            </div>
                            {errors.email && <div className="text-danger x-small fw-700 mt-1 ms-3">{errors.email}</div>}
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-700 x-small mb-1 text-muted ms-3">Password</Form.Label>
                            <div className={`search-box d-flex align-items-center w-100 py-2 bg-light rounded-pill border-2 ${errors.password ? 'border-danger' : 'border-transparent'}`} style={{ minHeight: '52px' }}>
                              <i className="fa-solid fa-lock small text-muted px-3"></i>
                              <Form.Control
                                type="password"
                                name="password"
                                placeholder="••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                isInvalid={!!errors.password}
                                className="border-0 shadow-none bg-transparent p-0 flex-grow-1 small fw-600 w-100"
                              />
                            </div>
                            {errors.password && <div className="text-danger x-small fw-700 mt-1 ms-3">{errors.password}</div>}
                          </Form.Group>

                          <Form.Group>
                            <Form.Label className="fw-700 x-small mb-1 text-muted ms-3">Confirm Password</Form.Label>
                            <div className={`search-box d-flex align-items-center w-100 py-2 bg-light rounded-pill border-2 ${errors.confirmPassword ? 'border-danger' : 'border-transparent'}`} style={{ minHeight: '52px' }}>
                              <i className="fa-solid fa-shield-check small text-muted px-3"></i>
                              <Form.Control
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                isInvalid={!!errors.confirmPassword}
                                className="border-0 shadow-none bg-transparent p-0 flex-grow-1 small fw-600 w-100"
                              />
                            </div>
                            {errors.confirmPassword && <div className="text-danger x-small fw-700 mt-1 ms-3">{errors.confirmPassword}</div>}
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="text-center mt-2">
                        <Button
                          type="submit"
                          className="btn-sell w-100 py-3 mb-3 border-0 shadow-sm rounded-pill fw-800 fs-5"
                          disabled={isLoading || Object.values(errors).some(e => e !== '')}
                          style={{ transition: 'transform 0.2s' }}
                        >
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </div>
                      
                      {/* Back to Marketplace Link */}
                      <div className="text-center">
                        <Link to="/" className="text-muted small text-decoration-none fw-700">
                          <i className="fa-solid fa-arrow-left me-2"></i>Back to Marketplace
                        </Link>
                      </div>

                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
}