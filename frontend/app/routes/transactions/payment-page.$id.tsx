import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner, Stack } from 'react-bootstrap';
import type CheckoutDTO from '../../dto/CheckoutDTO';
import { useUserStore } from '~/stores/useUserStore';
import { Navigate, useLocation } from 'react-router';

const PaymentPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [checkoutData, setCheckoutData] = useState<CheckoutDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [paymentForm, setPaymentForm] = useState({
        cardHolder: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });
    const { user } = useUserStore();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                const response = await fetch(`/api/v1/transactions/${id}/checkout`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch checkout details');
                }

                const data: CheckoutDTO = await response.json();
                setCheckoutData(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unexpected error occurred while fetching data.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCheckoutData();
        }
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        if (!id) {
            setError("Product ID is missing.");
            setProcessing(false);
            return;
        }

        try {
            const response = await fetch('/api/v1/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: parseInt(id, 10),
                })
            });

            if (!response.ok) {
                throw new Error('Transaction failed. Please try again.');
            }

            localStorage.setItem('justPurchased', 'true');
            navigate(`/user/sales-orders`);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred during payment processing.");
            }
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status" />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger" className="rounded-4 shadow-sm">{error}</Alert>
                <Button variant="outline-primary" className="mt-3" onClick={() => navigate('/')}>
                    Return to home
                </Button>
            </Container>
        );
    }

    const { product, buyer } = checkoutData || {};

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
                                                        src={`/api/v1/products/${product.id}/image?t=${Date.now()}`}
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
                                            {/* Card Display */}
                                            {buyer && (
                                                <>
                                                    <Card className="d-none d-md-block mb-4 border-0" style={{ backgroundColor: '#f3f4f6', minHeight: '220px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
                                                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                                                            <div>
                                                                <div style={{ width: '40px', height: '24px', backgroundColor: '#fbbf24', borderRadius: '4px', marginBottom: '16px' }} />
                                                                <p className="mb-0 fw-800 opacity-75 small">CARD NUMBER</p>
                                                                <p className="h5 fw-800 mb-3" style={{ letterSpacing: '2px' }}>
                                                                    {buyer.cardNumber || '0000 0000 0000 0000'}
                                                                </p>
                                                            </div>
                                                            <Row>
                                                                <Col>
                                                                    <p className="mb-0 opacity-50 small">HOLDER</p>
                                                                    <p className="small fw-800 mb-0 text-uppercase text-truncate" style={{ maxWidth: '150px' }}>
                                                                        {buyer.name}
                                                                    </p>
                                                                </Col>
                                                                <Col>
                                                                    <p className="mb-0 opacity-50 small">EXPIRES</p>
                                                                    <p className="small fw-800 mb-0">
                                                                        {buyer.cardExpiringDate || '00/00'}
                                                                    </p>
                                                                </Col>
                                                                <Col>
                                                                    <p className="mb-0 opacity-50 small">CVV</p>
                                                                    <p className="small fw-800 mb-0">
                                                                        {buyer.cardCvv || '000'}
                                                                    </p>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>

                                                    {/* Tip Card */}
                                                    {!buyer.cardExpiringDate && (
                                                        <Alert variant="light" className="d-flex align-items-center gap-3 mb-4 border-0" style={{ backgroundColor: '#eff6ff', boxShadow: '0 4px 12px rgba(3, 105, 161, 0.1)', borderRadius: '12px' }}>
                                                            <i className="fa-solid fa-wand-magic-sparkles text-primary fs-4" />
                                                            <div>
                                                                <p className="small fw-800 mb-0 text-dark">Want to buy faster?</p>
                                                                <p className="small mb-0 text-muted">Save your payment info in <strong>Settings</strong> to go faster in this form next time.</p>
                                                            </div>
                                                        </Alert>
                                                    )}
                                                </>
                                            )}

                                            {/* Payment Form */}
                                            <Form onSubmit={handlePaymentSubmit}>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        type="text"
                                                        name="cardHolder"
                                                        value={paymentForm.cardHolder}
                                                        onChange={handleInputChange}
                                                        placeholder="Cardholder Name"
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <div style={{ position: 'relative' }}>
                                                        <Form.Control
                                                            type="text"
                                                            name="cardNumber"
                                                            value={paymentForm.cardNumber}
                                                            onChange={handleInputChange}
                                                            placeholder="Card Number"
                                                            required
                                                        />
                                                        <i className="fa-brands fa-cc-visa ms-auto" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem', color: '#1f2937' }} />
                                                    </div>
                                                </Form.Group>

                                                <Row className="g-3 mb-3">
                                                    <Col xs={6}>
                                                        <Form.Control
                                                            type="text"
                                                            name="expiry"
                                                            value={paymentForm.expiry}
                                                            onChange={handleInputChange}
                                                            placeholder="MM/YY"
                                                            className="text-center"
                                                            required
                                                        />
                                                    </Col>
                                                    <Col xs={6}>
                                                        <Form.Control
                                                            type="password"
                                                            name="cvv"
                                                            value={paymentForm.cvv}
                                                            onChange={handleInputChange}
                                                            placeholder="CVV"
                                                            className="text-center"
                                                            required
                                                        />
                                                    </Col>
                                                </Row>

                                                <Button
                                                    variant="success"
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-100 mt-4 py-3 fw-800"
                                                    style={{ fontSize: '1.05rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s ease' }}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Spinner animation="border" size="sm" className="me-2" />
                                                            Processing Transaction...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-lock me-2" />
                                                            Confirm Secure Payment
                                                        </>
                                                    )}
                                                </Button>

                                                <div className="text-center mt-3">
                                                    <span className="small fw-800 text-muted text-uppercase">
                                                        <i className="fa-solid fa-circle text-success me-2" style={{ fontSize: '0.5rem' }} />
                                                        Secure Bank Connection Established
                                                    </span>
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