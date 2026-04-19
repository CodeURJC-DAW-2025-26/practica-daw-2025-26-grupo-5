import { useNavigate, Link } from 'react-router';
import { Container, Form, Alert, Row, Col, Card, Button, Image } from 'react-bootstrap';
import type { Route } from './+types/signup';
import React, { useState } from 'react';
import logo from "../assets/logo.png";
import Footer from '~/components/footer';
import Loader from '~/components/Loader';

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
        fetch(`${window.location.origin}/api/v1/users`, { method: 'POST', body: data, credentials: 'include' }),
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);
      if (response.ok) navigate('/login');
      else setSignupError('Registration failed. Please try again.');
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
        <header className="navbar container-fluid px-lg-5 py-3 bg-white border-bottom shadow-sm">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <Image src={logo} alt="Stilnovo" width="35" />
            <span className="brand fw-800 text-primary mb-0 fs-4">Stilnovo</span>
          </Link>
          <nav className="ms-auto fw-600">
            <span className="text-muted d-none d-sm-inline">Already a member?</span>
            <Link to="/login" className="link-login ms-2">Log in</Link>
          </nav>
        </header>

        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <Container className="d-flex justify-content-center">
            <Card className="clay-card border-0 p-3" style={{ maxWidth: '550px', width: '100%' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-800 text-dark mb-1">Join Us</h2>
                  <p className="text-muted small fw-600">Create your profile to start trading</p>
                </div>

                {signupError && <Alert variant="danger" className="fw-700 rounded-3 mb-4 py-2 small">{signupError}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <div className="text-center mb-4">
                    <div className="profile-upload-container mx-auto position-relative overflow-hidden d-flex align-items-center justify-content-center border-2 border-dashed rounded-circle" style={{ width: '100px', height: '100px' }}>
                      {!previewUrl ? <i className="fa-solid fa-user-plus text-muted fs-3"></i> : <Image src={previewUrl} className="position-absolute w-100 h-100" style={{ objectFit: 'cover' }} />}
                      <input type="file" accept="image/*" className="file-input-hidden position-absolute w-100 h-100 opacity-0" onChange={handleImageChange} style={{ cursor: 'pointer' }} />
                    </div>
                    <label className="fw-700 x-small mt-2 text-primary cursor-pointer text-uppercase">Upload Avatar</label>
                  </div>

                  <Row className="g-3 mb-4">
                    <Col xs={12}>
                      <Form.Label className="fw-800 small text-muted ms-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Full Name</Form.Label>
                      <Form.Control 
                        className="py-2 bg-light border-0 rounded-3 fw-600" 
                        placeholder="Your name" 
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required 
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Label className="fw-800 small text-muted ms-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Email Address</Form.Label>
                      <Form.Control 
                        type="email" 
                        className="py-2 bg-light border-0 rounded-3 fw-600" 
                        placeholder="email@stilnovo.com" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-800 small text-muted ms-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Password</Form.Label>
                      <Form.Control 
                        type="password" 
                        className="py-2 bg-light border-0 rounded-3 fw-600" 
                        placeholder="••••••" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        minLength={6}
                        required 
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-800 small text-muted ms-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Confirm</Form.Label>
                      <Form.Control 
                        type="password" 
                        className="py-2 bg-light border-0 rounded-3 fw-600" 
                        placeholder="••••••" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required 
                      />
                    </Col>
                  </Row>

                  <Button type="submit" className="btn-sell w-100 py-3 fw-800 border-0 mb-3 rounded-pill" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
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