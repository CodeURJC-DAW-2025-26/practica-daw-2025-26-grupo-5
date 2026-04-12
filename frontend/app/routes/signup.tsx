import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { Container, Form, Alert, Row, Col } from 'react-bootstrap';
import type { Route } from './+types/signup';
import React, { useState } from 'react';
import logo from "../assets/logo.png";
import Footer from '~/components/footer';
import Loader from '~/components/SignupLoader'; // Tu componente de styled-components

interface SignupFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  profilePicture?: FileList;
}

export default function Signup({}: Route.ComponentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    setIsLoading(true); // Se activa el loader de "Generating..."
    
    const formData = new FormData();
    if (data.profilePicture?.[0]) {
      formData.append('profilePicture', data.profilePicture[0]);
    }
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);

    try {
      // Forzamos 2.5 segundos para que la animación de las letras luzca
      const [response] = await Promise.all([
        fetch(`${window.location.origin}/api/v1/users`, {
          method: 'POST',
          body: formData,
        }),
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);

      if (response.ok) {
        navigate('/login');
      } else {
        setSignupError('Registration failed. Please try again.');
      }
    } catch (error) {
      setSignupError('An error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {/* Renderizamos tu Loader solo cuando isLoading es true */}
    {isLoading && <Loader />}

    <div className="auth-page">
      {/* --- AUTH HEADER --- */}
      <header className="navbar container-fluid px-lg-5 py-3 header-border-line bg-white">
        <div className="logo-wrapper">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <img src={logo} alt="Stilnovo" className="logo-img" width="35" />
            <span className="brand">Stilnovo</span>
          </Link>
        </div>
        <nav className="nav-actions">
          <span className="text-muted d-none d-sm-inline">Already a member?</span>
          <Link to="/login" className="link-login ms-2">Log in</Link>
        </nav>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="auth-main-wrapper no-footer-layout">
        <Container className="d-flex align-items-center justify-content-center">
          <div className="auth-card clay-card p-4 my-3 bg-white" style={{ maxWidth: '550px', width: '100%' }}>
            
            <div className="text-center mb-3">
              <h2 className="fw-800 mb-1">Join Us</h2>
              <p className="hero-subtitle small">Create your profile to start trading</p>
            </div>

            {signupError && (
              <Alert variant="danger" className="py-2 small fw-700 rounded-3 mb-4">
                <i className="fa-solid fa-triangle-exclamation me-2"></i> {signupError}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
              
              <div className="text-center mb-3">
                <div className="profile-upload-container mx-auto position-relative overflow-hidden d-flex align-items-center justify-content-center">
                  {!previewUrl && <i className="fa-solid fa-user-plus text-muted"></i>}
                  {previewUrl && (
                    <img src={previewUrl} alt="preview" className="position-absolute w-100 h-100" style={{ objectFit: 'cover' }} />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="file-input-hidden"
                    {...register('profilePicture')}
                    onChange={(e) => {
                      register('profilePicture').onChange(e);
                      handleImageChange(e);
                    }}
                  />
                </div>
                <label className="form-label fw-700 x-small mt-1 d-block cursor-pointer" style={{ color: 'var(--brand-blue)' }}>
                  Upload Avatar
                </label>
              </div>

              <Row className="g-2">
                <Col xs={12} className="mb-2">
                  <Form.Label className="fw-700 x-small ms-2">Full Name</Form.Label>
                  <div className={`search-box w-100 py-2 ${errors.username ? 'border-danger' : ''}`}>
                    <i className="fa-solid fa-id-card small"></i>
                    <input 
                      type="text" 
                      placeholder="Your name" 
                      {...register('username', { required: true })} 
                    />
                  </div>
                </Col>

                <Col xs={12} className="mb-2">
                  <Form.Label className="fw-700 x-small ms-2">Email Address</Form.Label>
                  <div className={`search-box w-100 py-2 ${errors.email ? 'border-danger' : ''}`}>
                    <i className="fa-solid fa-envelope small"></i>
                    <input 
                      type="email" 
                      placeholder="email@stilnovo.com" 
                      {...register('email', { required: true })} 
                    />
                  </div>
                </Col>

                <Col md={6} className="mb-2">
                  <Form.Label className="fw-700 x-small ms-2">Password</Form.Label>
                  <div className={`search-box w-100 py-2 ${errors.password ? 'border-danger' : ''}`}>
                    <i className="fa-solid fa-lock small"></i>
                    <input 
                      type="password" 
                      placeholder="••••••" 
                      {...register('password', { required: true, minLength: 6 })} 
                    />
                  </div>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="fw-700 x-small ms-2">Confirm</Form.Label>
                  <div className={`search-box w-100 py-2 ${errors.confirmPassword ? 'border-danger' : ''}`}>
                    <i className="fa-solid fa-check-double small"></i>
                    <input 
                      type="password" 
                      placeholder="••••••" 
                      {...register('confirmPassword', { required: true })} 
                    />
                  </div>
                </Col>
              </Row>

              <button type="submit" className="btn-sell w-100 justify-content-center mb-3" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className="text-center">
                <Link to="/" className="text-muted small text-decoration-none fw-700">
                  <i className="fa-solid fa-arrow-left me-2"></i>Back to Marketplace
                </Link>
              </div>
            </Form>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
    </>
  );
}