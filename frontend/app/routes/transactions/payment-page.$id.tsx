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

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const htmlRegex = /<\/?[a-z][\s\S]*>/i;

  const checkoutData = loaderData;
  const { product, buyer } = checkoutData || {};
  const productId = checkoutData?.product?.id;

  /**
   * XSS Validation
   */
  const validateXSS = (name: string, value: string) => {
    const isMalicious = htmlRegex.test(value);
    setFieldErrors(prev => ({ 
      ...prev, 
      [name]: isMalicious ? "Security alert: HTML tags not allowed. Be careful." : "" 
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
    validateXSS(name, value); 
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (Object.values(fieldErrors).some(err => err !== "")) return;

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

  return (
    <div className="bg-light pb-5 pt-4">
      <Container fluid>
        <Container>
          <Row className="justify-content-center">
            <Col xl={10} lg={11}>
              <Card className="border-0 shadow-sm mx-auto" style={{ borderRadius: '24px', maxWidth: '1000px' }}>
                <Card.Body className="p-4 p-md-5">
                  <Row className="align-items-center g-4">
                    
                    {/* Left Column: Product Info (Mantenido igual) */}
                    {product && (
                      <Col lg={5} className="text-center border-end-lg pe-lg-4">
                        <div className="position-relative mb-4 clay-card p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                          <Image
                            src={getProductImageUrl(product.id)}
                            alt={product.name}
                            fluid
                            className="rounded-3"
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                          />
                        </div>
                        <h3 className="fw-800 h4 mb-2 text-dark">{product.name}</h3>
                        <p className="text-muted small fw-700 mb-4">
                          <i className="fa-solid fa-location-dot me-1"></i> {product.location} &bull; Verified Seller
                        </p>

                        <div className="bg-light rounded-4 p-3 mb-4 mx-auto text-start d-flex align-items-center gap-3" style={{ maxWidth: '350px' }}>
                          <div className="text-primary ps-2">
                            <i className="fa-solid fa-truck-fast fs-3" />
                          </div>
                          <div>
                            <p className="small fw-800 mb-0 text-dark">SECURE SHIPPING</p>
                            <p className="small text-muted mb-0">Door-to-door delivery active.</p>
                          </div>
                        </div>

                        <div className="d-flex justify-content-center gap-4 align-items-center">
                          <div className="text-center">
                            <p className="small fw-800 text-muted mb-1">PRICE</p>
                            <p className="fw-800 h4 mb-0 text-dark">{product.price.toFixed(2)} €</p>
                          </div>
                          <div style={{ width: '2px', height: '30px', backgroundColor: '#e2e8f0' }} />
                          <div className="text-center">
                            <p className="small fw-800 text-muted mb-1">PROTECTION</p>
                            <p className="fw-800 h4 mb-0 text-success">Active</p>
                          </div>
                        </div>
                      </Col>
                    )}

                    {/* Right Column: Checkout Form */}
                    <Col lg={7} className="ps-lg-5">
                      <h4 className="fw-800 mb-3 text-dark">
                        <i className="fa-regular fa-credit-card me-2 text-primary"></i>
                        Secure Payment
                      </h4>

                      {/* Security Info*/}
                      <Alert variant="success" className="d-flex align-items-center gap-3 mb-4 py-2 border-0" style={{ borderRadius: '12px', backgroundColor: '#ecfdf5' }}>
                        <i className="fa-solid fa-shield-halved text-success fs-4 ms-2" />
                        <div>
                          <p className="fw-800 mb-0 text-dark" style={{ fontSize: '0.9rem' }}>Payments secured by Stripe</p>
                          <p className="small mb-0 text-muted">Your card details are encrypted and never stored.</p>
                        </div>
                      </Alert>

                      {/* Payment Form */}
                      <Form onSubmit={handlePaymentSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-800 mb-2 small text-uppercase text-muted">Cardholder Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="cardHolder"
                            value={paymentForm.cardHolder}
                            onChange={handleInputChange}
                            isInvalid={!!fieldErrors.cardHolder}
                            placeholder="Raul Oliveira"
                            className="py-3 px-4 bg-light border-0 shadow-none"
                            style={{ borderRadius: '12px', fontSize: '15px' }}
                            required
                          />
                          {fieldErrors.cardHolder && <div className="text-danger x-small fw-700 mt-1 ms-2">{fieldErrors.cardHolder}</div>}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="fw-800 mb-2 small text-uppercase text-muted">Card Number</Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type="text"
                              name="cardNumber"
                              value={paymentForm.cardNumber}
                              isInvalid={!!fieldErrors.cardNumber}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                if (value.length > 19) value = value.slice(0, 19);
                                setPaymentForm(prev => ({ ...prev, cardNumber: value }));
                                validateXSS('cardNumber', value);
                              }}
                              placeholder="1234 5678 9012 3456"
                              className="py-3 px-4 bg-light border-0 shadow-none"
                              style={{ borderRadius: '12px', fontSize: '15px', letterSpacing: '2px' }}
                              required
                            />
                            {!fieldErrors.cardNumber && <i className="fa-brands fa-cc-visa position-absolute" style={{ right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '24px', color: '#94a3b8' }} />}
                          </div>
                          {fieldErrors.cardNumber && <div className="text-danger x-small fw-700 mt-1 ms-2">{fieldErrors.cardNumber}</div>}
                        </Form.Group>

                        <Row className="g-3 mb-4">
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="fw-800 mb-2 small text-uppercase text-muted">Expiry Date</Form.Label>
                              <Form.Control
                                type="text"
                                name="expiry"
                                value={paymentForm.expiry}
                                isInvalid={!!fieldErrors.expiry}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length >= 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                  }
                                  setPaymentForm(prev => ({ ...prev, expiry: value }));
                                  validateXSS('expiry', value);
                                }}
                                placeholder="MM/YY"
                                className="py-3 text-center bg-light border-0 shadow-none"
                                style={{ borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px' }}
                                required
                              />
                              {fieldErrors.expiry && <div className="text-danger x-small fw-700 mt-1">{fieldErrors.expiry}</div>}
                            </Form.Group>
                          </Col>
                          <Col xs={6}>
                            <Form.Group>
                              <Form.Label className="fw-800 mb-2 small text-uppercase text-muted">CVV</Form.Label>
                              <Form.Control
                                type="password"
                                name="cvv"
                                value={paymentForm.cvv}
                                isInvalid={!!fieldErrors.cvv}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length > 4) value = value.slice(0, 4);
                                  setPaymentForm(prev => ({ ...prev, cvv: value }));
                                  validateXSS('cvv', value);
                                }}
                                placeholder="•••"
                                className="py-3 text-center bg-light border-0 shadow-none"
                                style={{ borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px' }}
                                required
                              />
                              {fieldErrors.cvv && <div className="text-danger x-small fw-700 mt-1">{fieldErrors.cvv}</div>}
                            </Form.Group>
                          </Col>
                        </Row>

                        <Button
                          variant="dark"
                          type="submit"
                          disabled={processing || Object.values(fieldErrors).some(err => err !== "")}
                          className="w-100 py-3 fw-800 rounded-pill border-0 shadow-sm"
                          style={{ fontSize: '16px' }}
                        >
                          {processing ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Processing securely...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-lock me-2" />
                              Pay {product?.price ? product.price.toFixed(2) : '0.00'} €
                            </>
                          )}
                        </Button>

                        <div className="text-center mt-3">
                          <small className="fw-700 text-muted">
                            <i className="fa-solid fa-shield-check text-success me-1"></i>
                            Encrypted and secure connection
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
    <Container className="mt-5 text-center">
      <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <Alert.Heading className="fw-800"><i className="fa-solid fa-triangle-exclamation me-2"></i>Error Loading Checkout</Alert.Heading>
        <p className="fw-700 text-muted">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        <Button variant="outline-danger" className="mt-3 rounded-pill fw-700 px-4" onClick={() => (globalThis.location.href = '/')}>
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}