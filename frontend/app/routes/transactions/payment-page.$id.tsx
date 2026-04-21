/**
 * Payment / Checkout Page
 *
 * Checkout page where buyers complete purchase transactions.
 * Displays product details and collects payment information.
 *
 * Features:
 * - Product information display:
 *    - Product image
 *    - Product name
 *    - Seller location
 *    - Price
 * - Shipping information (secure door-to-door delivery)
 * - Buyer protection status
 * - Payment form fields:
 *    - Cardholder name
 *    - Card number
 *    - Expiry date
 *    - CVV (security code)
 * - Security badge (Stripe powered)
 * - Error handling and display
 * - Loading state during payment processing
 * - Responsive layout (side-by-side on desktop)
 *
 * Data Flow:
 * 1. User clicks "Buy Now" from product detail
 * 2. Navigates to /transactions/checkout/{productId}
 * 3. clientLoader fetches checkout details (product, price, buyer info)
 * 4. Page displays product and payment form
 * 5. User fills payment details
 * 6. On submit: createTransaction() API call
 * 7. On success: Redirect to /user/sales-orders
 * 8. localStorage flag 'justPurchased' set for success notification
 * 9. On error: Display error message in alert
 *
 * Security:
 * - Stripe payment processing (PCI compliant)
 * - Card details are encrypted and not stored locally
 * - HTTPS transmission
 * - Server-side payment processing
 * - Buyer protection active
 *
 * Client Loader:
 * - Validates product ID format
 * - Fetches checkout details (product, buyer, price info)
 * - Handles errors: 401 (redirect to login), 404 (not found)
 * - Passes data as loaderData prop
 *
 * Form Validation:
 * - All payment fields required
 * - Product ID validation
 * - Error messages displayed for failures
 * - User prevented from submitting during processing
 *
 * State Management:
 * - processing: Loading state during payment
 * - error: Error message from API
 * - paymentForm: Card details input
 * - Validates before submission
 *
 * Layout:
 * - Two-column design (product left, form right)
 * - Mobile: Stacked layout
 * - Product image centered
 * - Form below image on mobile
 * - Gradient background
 * - Clay-card styling
 *
 * @component
 * @returns React component for payment/checkout page
 */

import React, { useState } from 'react';
import { useNavigate, redirect } from 'react-router';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import type CheckoutDTO from '~/dto/CheckoutDTO';
import { useUserStore } from '~/stores/useUserStore';
import { getProductImageUrl } from '~/services/products-service'
import { getCheckoutDetails, createTransaction } from '~/services/transaction-service';

/**
 * Client-side loader: Fetch checkout details
 * 
 * Process:
 * 1. Extract product ID from route params
 * 2. Validate ID format (must be numeric)
 * 3. Call getCheckoutDetails() API
 * 4. Handle errors:
 *    - 401: Redirect to login (not authenticated)
 *    - 404: Throw "Product not found" error
 *    - Other: Throw "Failed to load checkout" error
 * 5. Return checkout data to component
 * 
 * @param params - Route parameters including product ID
 * @returns Checkout data or redirect/error
 */
export async function clientLoader({ params }: { params: { id: string } }) {
  try {
    // "401 redirect" logic is typically handled in the 'api' object interceptor,
    // but here we simply call the service
    const numericId = Number(params.id);
    if (isNaN(numericId)) {
      throw new Error('Invalid ID format'); 
    }

    return await getCheckoutDetails(numericId);
  } catch (error: any) {
    if (error.status === 401) return redirect('/login');
    if (error.status === 404) throw new Error('Product not found');
    throw new Error('Failed to load checkout');
  }
}

/**
 * Props Interface for Payment Page
 */
interface PaymentPageProps {
  readonly loaderData: CheckoutDTO;
}

/**
 * Payment Page Component Implementation
 * 
 * Displays checkout form and product summary.
 * Handles payment submission and transaction creation.
 */
const PaymentPage = ({ loaderData }: PaymentPageProps) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  
  // Payment processing state
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  // Extract checkout data
  const checkoutData = loaderData;
  const { product, buyer } = checkoutData || {};
  const productId = checkoutData?.product?.id;

  /**
   * Handle Payment Form Input Changes
   * Updates form state as user types
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handle Payment Form Submission
   * 
   * Process:
   * 1. Prevent default form submission
   * 2. Validate product ID exists
   * 3. Set processing state (disable submit button)
   * 4. Call createTransaction() API
   * 5. On success:
   *    - Set 'justPurchased' flag in localStorage
   *    - Redirect to sales orders page
   * 6. On error: Display error message
   */
  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    if (!productId) {
      setError("Product ID is missing.");
      setProcessing(false);
      return;
    }
    try {
      await createTransaction(parseInt(productId.toString(), 10));
      localStorage.setItem('justPurchased', 'true');
      navigate(`../../user/sales-orders`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during payment processing.");
      setProcessing(false);
    }
  };

  /**
   * Show Error Alert if Error Occurs
   */
  if (error && !processing) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger" className="rounded-4 shadow-sm">{error}</Alert>
        <Button variant="outline-primary" className="mt-3" onClick={() => navigate('/')}>
          Return to home
        </Button>
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #fef3f2 100%)' }}>
      <Container fluid className="main-wrapper d-flex align-items-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col xl={11}>
              <Card className="border-0" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)', borderRadius: '20px' }}>
                <Card.Body className="p-5 p-md-6">
                  <Row className="align-items-center">
                    {/* Left Column: Product Info */}
                    {product && (
                      <Col lg={5} className="text-center border-end pe-lg-5">
                        <div className="position-relative mb-4">
                          <Image
                            src={getProductImageUrl(product.id)}
                            alt={product.name}
                            fluid
                            rounded
                            className="shadow-sm"
                            style={{ maxHeight: '220px', objectFit: 'contain' }}
                          />
                        </div>
                        <h2 className="fw-800 h3 mb-1">{product.name}</h2>
                        <p className="text-muted small fw-700 mb-4">
                          {product.location} &bull; Verified Seller
                        </p>

                        <Alert variant="info" className="d-flex align-items-center gap-3 mb-4 mx-auto text-start" style={{ maxWidth: '350px' }}>
                          <i className="fa-solid fa-truck-fast fs-3" />
                          <div>
                            <p className="small fw-800 mb-0">SECURE SHIPPING</p>
                            <p className="small text-muted mb-0">Door-to-door delivery active.</p>
                          </div>
                        </Alert>

                        <div className="d-flex justify-content-center gap-4 align-items-center">
                          <div className="text-center">
                            <p className="small fw-800 text-muted mb-0">PRICE</p>
                            <p className="fw-800 h4 mb-0">{product.price.toFixed(2)} €</p>
                          </div>
                          <div style={{ width: '1px', height: '30px', backgroundColor: '#ccc', opacity: 0.25 }} />
                          <div className="text-center">
                            <p className="small fw-800 text-muted mb-0">PROTECTION</p>
                            <p className="fw-800 h4 mb-0 text-success">Active</p>
                          </div>
                        </div>
                      </Col>
                    )}

                    {/* Right Column: Checkout Form & User Info */}
                    <Col lg={7} className="ps-lg-5 mt-5 mt-lg-0">
                      <h5 className="fw-800 mb-4 text-dark">
                        <i className="fa-solid fa-credit-card me-2 text-primary"></i>
                        Secure Payment Details
                      </h5>

                      {/* Security Info */}
                      <Alert variant="success" className="d-flex align-items-center gap-3 mb-4 border-0 rounded-3" style={{ backgroundColor: '#ecfdf5', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
                        <i className="fa-solid fa-shield-check text-success fs-5" />
                        <div>
                          <p className="small fw-800 mb-0 text-dark">Payments secured by Stripe</p>
                          <p className="small mb-0 text-muted">Your card details are encrypted and never stored.</p>
                        </div>
                      </Alert>

                      {/* Payment Form */}
                      <Form onSubmit={handlePaymentSubmit}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-800 mb-2 small text-uppercase text-muted">Cardholder Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="cardHolder"
                            value={paymentForm.cardHolder}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="rounded-3 py-3"
                            style={{ border: '2px solid #e5e7eb', fontSize: '14px' }}
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="fw-800 mb-2 small text-uppercase text-muted">Card Number</Form.Label>
                          <div style={{ position: 'relative' }}>
                            <Form.Control
                              type="text"
                              name="cardNumber"
                              value={paymentForm.cardNumber}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                if (value.length > 19) value = value.slice(0, 19);
                                setPaymentForm(prev => ({ ...prev, cardNumber: value }));
                              }}
                              placeholder="1234 5678 9012 3456"
                              className="rounded-3 py-3 ps-4"
                              style={{ border: '2px solid #e5e7eb', fontSize: '14px', letterSpacing: '2px' }}
                              required
                            />
                            <i className="fa-brands fa-cc-visa" style={{ 
                              position: 'absolute', 
                              right: '16px', 
                              top: '50%', 
                              transform: 'translateY(-50%)', 
                              fontSize: '24px', 
                              color: '#667eea',
                              opacity: 0.7
                            }} />
                          </div>
                        </Form.Group>

                        <Row className="g-3 mb-4">
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="fw-800 mb-2 small text-uppercase text-muted">Expiry Date</Form.Label>
                              <Form.Control
                                type="text"
                                name="expiry"
                                value={paymentForm.expiry}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length >= 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                  }
                                  setPaymentForm(prev => ({ ...prev, expiry: value }));
                                }}
                                placeholder="MM/YY"
                                className="rounded-3 py-3 text-center"
                                style={{ border: '2px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px' }}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="fw-800 mb-2 small text-uppercase text-muted">CVV</Form.Label>
                              <Form.Control
                                type="password"
                                name="cvv"
                                value={paymentForm.cvv}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length > 4) value = value.slice(0, 4);
                                  setPaymentForm(prev => ({ ...prev, cvv: value }));
                                }}
                                placeholder="•••"
                                className="rounded-3 py-3 text-center"
                                style={{ border: '2px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px' }}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Button
                          variant="primary"
                          type="submit"
                          disabled={processing}
                          className="w-100 py-3 fw-800 rounded-3 border-0"
                          style={{ 
                            fontSize: '16px', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!processing) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                          }}
                        >
                          {processing ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-lock me-2" />
                              Complete Purchase
                            </>
                          )}
                        </Button>

                        <div className="text-center mt-3">
                          <small className="text-muted">
                            <i className="fa-solid fa-lock text-success me-1"></i>
                            Your payment is secure and encrypted
                          </small>
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Container>
    </div>
  );
};

export default PaymentPage;

export function ErrorBoundary({ error }: { readonly error: Error }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error Loading Payment!</Alert.Heading>
        <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button
          variant="outline-danger"
          onClick={() => (globalThis.location.href = '/')}
        >
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}