import React, { useState, useEffect } from 'react';
import { useRevalidator } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { Row, Col, Alert, Form, Spinner, Card, Image, Button, Stack } from 'react-bootstrap';
import { updateUserSettings } from '~/services/user-service';

/**
 * UserSettings Component
 * Refactored using Native React patterns (no external form libraries).
 */
export default function UserSettings() {
  const { user, setUser } = useUserStore();
  const revalidator = useRevalidator();

  // Local state for controlled inputs (needed for reactive character counting)
  const [description, setDescription] = useState(user?.description || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cardNumber, setCardNumber] = useState(user?.cardNumber || '');
  const [expiry, setExpiry] = useState(user?.cardExpiringDate || '');
  const [cvv, setCvv] = useState(user?.cardCvv || '');

  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  // Synchronize local state when the global user store changes
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setDescription(user.description || '');
      setCardNumber(user.cardNumber || '');
      setExpiry(user.cardExpiringDate || '');
      setCvv(user.cardCvv || '');
      setPreviewUrl(`/api/v1/users/me/profile-photo?t=${Date.now()}`);
    }
  }, [user]);

  /**
   * Handles local profile photo preview using FileReader API
   */
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

  /**
   * Native Form Submission Logic
   * Uses the browser's FormData API instead of third-party libraries.
   */
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Stop standard browser reload
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // 1. Native way: Extract data from the Form element
      const formElement = e.currentTarget;
      const data = new FormData(formElement);

      // 2. Prepare the object for the multi-part request (Native FormData)
      const formDataObj = new FormData();
      formDataObj.append('newEmail', data.get('email') as string);
      formDataObj.append('newDescription', data.get('description') as string);
      formDataObj.append('newCardNumber', data.get('cardNumber') as string);
      formDataObj.append('newCardExpiringDate', data.get('cardExpiringDate') as string);
      formDataObj.append('newCardCvv', data.get('cardCvv') as string);

      if (selectedPhoto) {
        formDataObj.append('newProfilePhoto', selectedPhoto);
      }

      // 3. Call service (which should use fetch() internally)
      const responseData = await updateUserSettings(formDataObj);

      if (responseData) {
        setUser(responseData);
        setSuccess(true);
        setSelectedPhoto(null);

        // 4. Force revalidation of the route data
        revalidator.revalidate();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: any) {
      // Manual error parsing (handling native HttpError status)
      const errorMsg = err.message || 'Error updating settings. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Guard clause for unauthenticated users
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 w-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2 text-dark">Settings</h1>
          <p className="text-muted small fw-600 mb-0">Manage your profile and account information.</p>
        </div>
      </header>

      {/* Feedback Alerts */}
      {error && (
        <Alert variant="danger" className="clay-card border-0 fw-700 mb-4 d-flex align-items-center gap-3">
          <i className="fa-solid fa-exclamation-circle text-danger fs-4"></i>
          <span>{error}</span>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="clay-card border-0 fw-700 mb-4 d-flex align-items-center gap-3">
          <i className="fa-solid fa-check-circle text-success fs-4"></i>
          <span>Profile successfully updated!</span>
        </Alert>
      )}

      {/* Main Settings Form */}
      <Form onSubmit={handleFormSubmit}>
        {/* Profile Picture Card */}
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
                <p className="text-muted small fw-600 mt-3 mb-0">Live Preview</p>
              </Col>

              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Upload New Photo</Form.Label>
                  <Form.Control
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="py-2 bg-light border-0 rounded-3 w-100"
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

        {/* Account Details Card */}
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
                  <small className="text-muted opacity-50 fw-600">Locked field</small>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-800 small text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Email Address *</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2 bg-light border-0 rounded-3 fw-600"
                    disabled={loading}
                    required
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
                    name="description"
                    as="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="py-2 bg-light border-0 rounded-3 fw-600"
                    disabled={loading}
                    rows={4}
                    placeholder="Tell our community about your treasures..."
                  />
                  <small className="text-muted fw-600 mt-1 d-block text-end">
                    {description.length}/500 characters
                  </small>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Billing Information Card */}
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
                    name="cardNumber"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
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
                    name="cardExpiringDate"
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
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
                    name="cardCvv"
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
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

        {/* Action Buttons */}
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
                  if (user) {
                    setEmail(user.email || '');
                    setDescription(user.description || '');
                    setCardNumber(user.cardNumber || '');
                    setExpiry(user.cardExpiringDate || '');
                    setCvv(user.cardCvv || '');
                    setSelectedPhoto(null);
                    setPreviewUrl(`/api/v1/users/me/profile-photo?t=${Date.now()}`);
                  }
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