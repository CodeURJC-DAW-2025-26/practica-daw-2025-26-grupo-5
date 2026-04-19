import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRevalidator, Link } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { Row, Col, Alert, Form, Spinner, Card, Image, Button, Stack } from 'react-bootstrap';
import { updateUserSettings } from '~/services/user-service';

interface SettingsFormData {
  email: string;
  description: string;
  cardNumber: string;
  cardExpiringDate: string;
  cardCvv: string;
}

export default function UserSettings() {
  const { user, setUser } = useUserStore();
  const revalidator = useRevalidator();
  
  const { register, handleSubmit, reset, watch } = useForm<SettingsFormData>({
    defaultValues: {
      email: user?.email || '',
      description: user?.description || '',
      cardNumber: user?.cardNumber || '',
      cardExpiringDate: user?.cardExpiringDate || '',
      cardCvv: user?.cardCvv || '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const descriptionValue = watch('description');

  useEffect(() => {
    if (user) {
      reset({
        email: user.email || '',
        description: user.description || '',
        cardNumber: user.cardNumber || '',
        cardExpiringDate: user.cardExpiringDate || '',
        cardCvv: user.cardCvv || '',
      });
      setPreviewUrl(`/api/v1/users/me/profile-photo?t=${Date.now()}`);
    }
  }, [user, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData: SettingsFormData) => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const formDataObj = new FormData();
      
      if (formData.email) formDataObj.append('newEmail', formData.email);
      if (formData.description) formDataObj.append('newDescription', formData.description);
      if (formData.cardNumber) formDataObj.append('newCardNumber', formData.cardNumber);
      if (formData.cardExpiringDate) formDataObj.append('newCardExpiringDate', formData.cardExpiringDate);
      if (formData.cardCvv) formDataObj.append('newCardCvv', formData.cardCvv);
      
      if (selectedPhoto) {
        formDataObj.append('newProfilePhoto', selectedPhoto);
      }

      const responseData = await updateUserSettings(formDataObj);

      if (responseData) {
        setUser(responseData);
        setSuccess(true);
        setSelectedPhoto(null);
        setPreviewUrl(`/api/v1/users/me/profile-photo?t=${Date.now()}`);
        
        revalidator.revalidate();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update settings';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 w-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2 text-dark">Settings</h1>
          <p className="text-muted small fw-600 mb-0">Manage your profile and account information.</p>
        </div>
      </header>

      {error && (
        <Alert variant="danger" className="clay-card border-0 fw-700 mb-4 d-flex align-items-center gap-3">
          <i className="fa-solid fa-exclamation-circle text-danger fs-4"></i>
          <span>{error}</span>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="clay-card border-0 fw-700 mb-4 d-flex align-items-center gap-3">
          <i className="fa-solid fa-check-circle text-success fs-4"></i>
          <span>Successfully updated!</span>
        </Alert>
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Profile Picture Section */}
        <Card className="clay-card border-0 p-3 mb-4">
          <Card.Body>
            <h5 className="fw-800 mb-4 text-dark d-flex align-items-center gap-2">
              <i className="fa-solid fa-image text-primary"></i> Change Profile Picture
            </h5>
            
            <Row className="align-items-center">
              <Col md={4} className="text-center mb-4 mb-md-0">
                <Image
                  src={previewUrl}
                  alt="Profile"
                  roundedCircle
                  className="border border-4 border-primary shadow-sm"
                  width={150}
                  height={150}
                  style={{ objectFit: 'cover' }}
                  onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                />
                <p className="text-muted small fw-600 mt-3 mb-0">Current Profile Photo</p>
              </Col>

              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Upload New Photo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="search-box py-2 bg-light border-0 rounded-3 w-100"
                    disabled={loading}
                  />
                  <small className="text-muted fw-600 d-block mt-2">
                    Accepted formats: JPG, PNG, GIF (Max 5MB)
                  </small>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Account Details Section */}
        <Card className="clay-card border-0 p-3 mb-4">
          <Card.Body>
            <h5 className="fw-800 mb-4 text-dark d-flex align-items-center gap-2">
              <i className="fa-solid fa-user text-info"></i> Account Details
            </h5>

            <Row className="g-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Full Name</Form.Label>
                  <Form.Control type="text" value={user.name} disabled className="py-2 bg-light border-0 rounded-3 text-muted fw-600" />
                  <small className="text-muted opacity-50 fw-600">Cannot be changed</small>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Username</Form.Label>
                  <Form.Control type="text" value={user.name} disabled className="py-2 bg-light border-0 rounded-3 text-muted fw-600" />
                  <small className="text-muted opacity-50 fw-600">Cannot be changed</small>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    {...register('email')}
                    className="py-2 bg-light border-0 rounded-3 fw-600"
                    disabled={loading}
                    placeholder="your@email.com"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Average Rating</Form.Label>
                  <div className="py-2 px-3 bg-light border-0 rounded-3 d-flex align-items-center">
                    <span className="fw-800 text-dark">{user.rating ? user.rating.toFixed(1) : '0.0'} / 5</span>
                    <div className="ms-3">
                      {[...new Array(5)].map((_, i) => (
                        <i
                          key={`star-${i}`}
                          className={`fa-solid fa-star ${i < Math.floor(user.rating || 0) ? 'text-warning' : 'text-muted'}`}
                          style={{ marginRight: '4px', fontSize: '0.9rem' }}
                        ></i>
                      ))}
                    </div>
                  </div>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Profile Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    {...register('description')}
                    className="py-2 bg-light border-0 rounded-3 fw-600"
                    disabled={loading}
                    rows={4}
                    placeholder="Tell buyers about yourself..."
                  />
                  <small className="text-muted fw-600 mt-1 d-block text-end">{(descriptionValue || '').length}/500 characters</small>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Billing Information Section */}
        <Card className="clay-card border-0 p-3 mb-4">
          <Card.Body>
            <h5 className="fw-800 mb-4 text-dark d-flex align-items-center gap-2">
              <i className="fa-solid fa-credit-card text-success"></i> Billing Information
            </h5>

            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Card Number</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('cardNumber')}
                    className="py-2 bg-light border-0 rounded-3 fw-600"
                    disabled={loading}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Expiring Date</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('cardExpiringDate')}
                    className="py-2 bg-light border-0 rounded-3 fw-600"
                    disabled={loading}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>CVV</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('cardCvv')}
                    className="py-2 bg-light border-0 rounded-3 fw-600"
                    disabled={loading}
                    placeholder="123"
                    maxLength={4}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Digital Seller Card Section */}
        <Card className="clay-card border-0 p-3 mb-4">
          <Card.Body>
            <h5 className="fw-800 mb-4 text-dark d-flex align-items-center gap-2">
              <i className="fa-solid fa-qrcode text-warning"></i> Your Digital Seller Card
            </h5>

            <Row className="g-4">
              <Col md={6}>
                <div className="border rounded-3 p-4 bg-light h-100" style={{ borderLeft: '5px solid #2f6ced' }}>
                  <p className="small text-muted text-uppercase mb-2 fw-800" style={{ letterSpacing: '0.5px' }}>Seller ID</p>
                  <h3 className="fw-800 text-primary mb-3">2026-ST-{user.id}</h3>
                  <p className="small fw-600 text-muted mb-0">Your unique identifier for transactions</p>
                </div>
              </Col>

              <Col md={6}>
                <div className="border rounded-3 p-4 bg-light d-flex flex-column align-items-center justify-content-center h-100" 
                     style={{ borderLeft: '5px solid #f59e0b' }}>
                  <i className="fa-solid fa-qrcode fa-3x text-warning mb-3 opacity-75"></i>
                  <p className="small fw-600 text-muted text-center mb-0 px-3">
                    Dynamic QR code links your card to transactions for secure delivery verification.
                  </p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Submit Buttons */}
        <Card className="clay-card border-0 p-3 mb-5">
          <Card.Body>
            <Stack direction="horizontal" gap={3}>
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="py-3 px-4 d-flex align-items-center gap-2 rounded-pill fw-800"
                style={{ backgroundColor: '#2f6ced', border: 'none' }}
              >
                {loading ? <Spinner animation="border" size="sm" /> : <i className="fa-solid fa-save"></i>} 
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  reset();
                  setSelectedPhoto(null);
                  setPreviewUrl(`/api/v1/users/me/profile-photo?t=${Date.now()}`);
                }}
                className="py-3 px-4 rounded-pill fw-800 border-2"
                disabled={loading}
              >
                <i className="fa-solid fa-redo me-2"></i> Reset
              </Button>
            </Stack>
          </Card.Body>
        </Card>
      </Form>
    </>
  );
}