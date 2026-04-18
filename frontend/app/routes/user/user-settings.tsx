import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRevalidator } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { Row, Col, Alert, Form, Spinner } from 'react-bootstrap';
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

  // Sincronizar formulario si el usuario cambia en el store
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
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar configuración';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <main className="flex-grow-1 p-4 p-md-5 overflow-auto bg-light min-vh-100">
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2">Settings</h1>
          <p className="text-muted small">Manage your profile and account information.</p>
        </div>
      </header>

      {error && (
        <Alert variant="danger" className="rounded-4 d-flex align-items-center gap-3 mb-4">
          <i className="fa-solid fa-exclamation-circle"></i>
          <div>{error}</div>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="rounded-4 d-flex align-items-center gap-3 mb-4">
          <i className="fa-solid fa-check-circle"></i>
          <div>✅ ¡Cambios guardados correctamente!</div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Profile Picture Section */}
        <div className="clay-card p-4 p-md-5 shadow-sm mb-4 rounded-4">
          <h5 className="fw-800 h5 mb-4 d-flex align-items-center gap-2">
            <i className="fa-solid fa-image text-primary"></i> Change Profile Picture
          </h5>
          
          <Row className="align-items-center">
            <Col md={4} className="text-center mb-4 mb-md-0">
              <img
                src={previewUrl}
                alt="Profile"
                className="rounded-circle border border-4 border-primary shadow-sm"
                width="150"
                height="150"
                style={{ objectFit: 'cover' }}
                onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
              />
              <p className="text-muted small mt-3">Current Profile Photo</p>
            </Col>

            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-700">Upload New Photo</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="search-box"
                  disabled={loading}
                />
                <small className="text-muted d-block mt-2">
                  Accepted formats: JPG, PNG, GIF (Max 5MB)
                </small>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Account Details Section */}
        <div className="clay-card p-4 p-md-5 shadow-sm mb-4 rounded-4">
          <h5 className="fw-800 h5 mb-4 d-flex align-items-center gap-2">
            <i className="fa-solid fa-user text-info"></i> Account Details
          </h5>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-700">Full Name</Form.Label>
                <Form.Control type="text" value={user.name} disabled className="search-box bg-white" />
                <small className="text-muted">Cannot be changed</small>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-700">Username</Form.Label>
                <Form.Control type="text" value={user.name} disabled className="search-box bg-white" />
                <small className="text-muted">Cannot be changed</small>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-700">Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  {...register('email')}
                  className="search-box"
                  disabled={loading}
                  placeholder="your@email.com"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-700">Average Rating</Form.Label>
                <div className="search-box d-flex align-items-center bg-white">
                  <span className="fw-700">{user.rating ? user.rating.toFixed(1) : '0.0'} / 5</span>
                  <div className="ms-2">
                    {new Array(5).fill(0).map((_, i) => (
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
                <Form.Label className="fw-700">Profile Description</Form.Label>
                <Form.Control
                  as="textarea"
                  {...register('description')}
                  className="search-box"
                  disabled={loading}
                  rows={4}
                  placeholder="Tell buyers about yourself..."
                />
                <small className="text-muted">{(descriptionValue || '').length}/500 characters</small>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Billing Information Section */}
        <div className="clay-card p-4 p-md-5 shadow-sm mb-4 rounded-4">
          <h5 className="fw-800 h5 mb-4 d-flex align-items-center gap-2">
            <i className="fa-solid fa-credit-card text-success"></i> Billing Information
          </h5>

          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-700">Card Number</Form.Label>
                <Form.Control
                  type="text"
                  {...register('cardNumber')}
                  className="search-box"
                  disabled={loading}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-700">Expiring Date</Form.Label>
                <Form.Control
                  type="text"
                  {...register('cardExpiringDate')}
                  className="search-box"
                  disabled={loading}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-700">CVV</Form.Label>
                <Form.Control
                  type="text"
                  {...register('cardCvv')}
                  className="search-box"
                  disabled={loading}
                  placeholder="123"
                  maxLength={4}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Digital Seller Card Section */}
        <div className="clay-card p-4 p-md-5 shadow-sm mb-4 rounded-4">
          <h5 className="fw-800 h5 mb-4 d-flex align-items-center gap-2">
            <i className="fa-solid fa-qrcode text-warning"></i> Your Digital Seller Card
          </h5>

          <Row className="g-4">
            <Col md={6}>
              <div className="border rounded-3 p-4 bg-light" style={{ borderLeft: '5px solid #2f6ced' }}>
                <p className="small text-muted text-uppercase mb-2 fw-700">Seller ID</p>
                <h3 className="fw-800 text-primary mb-3">2026-ST-{user.id}</h3>
                <p className="small text-muted mb-0">Your unique identifier for transactions</p>
              </div>
            </Col>

            <Col md={6}>
              <div className="border rounded-3 p-4 bg-light d-flex flex-column align-items-center justify-content-center" 
                   style={{ minHeight: '200px', borderLeft: '5px solid #f59e0b' }}>
                <i className="fa-solid fa-qrcode fa-3x text-warning mb-3 opacity-75"></i>
                <p className="small text-muted text-center">
                  Dynamic QR code links your card to transactions for secure delivery verification.
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Submit Buttons */}
        <div className="clay-card p-4 shadow-sm d-flex gap-3 rounded-4 mb-5">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary py-3 px-4 d-flex align-items-center gap-2 rounded-3 fw-700"
          >
            {loading ? <Spinner animation="border" size="sm" /> : <i className="fa-solid fa-save"></i>} 
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setSelectedPhoto(null);
              setPreviewUrl(`/api/v1/users/me/profile-photo?t=${Date.now()}`);
            }}
            className="btn btn-outline-secondary py-3 px-4 rounded-3 fw-700"
            disabled={loading}
          >
            <i className="fa-solid fa-redo me-2"></i> Reset
          </button>
        </div>
      </form>
    </main>
  );
}