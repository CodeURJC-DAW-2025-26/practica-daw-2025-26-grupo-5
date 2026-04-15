import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type CheckoutDTO from '../../dto/CheckoutDTO';
import { useUserStore } from '~/stores/useUserStore';
import { Navigate, useLocation } from 'react-router';

const PaymentPage = () => {
    // URL parameters and navigation hooks
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();

    // Component state typed with your official CheckoutDTO
    const [checkoutData, setCheckoutData] = useState<CheckoutDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state for payment details
    const [paymentForm, setPaymentForm] = useState({
        cardHolder: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });
    const { user } = useUserStore();
    const location = useLocation();

    // Global protection: Check if the user is logged, and if he is not redirect him to login page
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    };
    // Fetch checkout data on component mount
    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                // Call to GET /api/v1/transactions/{id}/checkout
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

                // Type assertion using your official DTO
                const data: CheckoutDTO = await response.json();
                setCheckoutData(data); 
            } catch (err) {
                // Safely handle unknown error type
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

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle transaction submission
    const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        // Ensure the ID exists before sending the request
        if (!id) {
            setError("Product ID is missing.");
            setProcessing(false);
            return;
        }

        try {
            // Call to POST /api/v1/transactions
            const response = await fetch('/api/v1/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is sent on POST too
                },
                body: JSON.stringify({
                    productId: parseInt(id, 10), 
                })
            });

            if (!response.ok) {
                throw new Error('Transaction failed. Please try again.');
            }

            const result = await response.json();
            
            // Redirect to a success page using the returned transaction ID
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
                {/* Utilizing the custom Stilnovo loader from your app.css */}
                <svg className="stn-loader" viewBox="25 25 50 50">
                    <circle cx="50" cy="50" r="20"></circle>
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger rounded-4 shadow-sm">{error}</div>
                <button className="btn btn-outline-stilnovo mt-3" onClick={() => navigate('/')}>Return to home</button>
            </div>
        );
    }

    // Safely destructure relying on the CheckoutDTO structure
    const { product, buyer } = checkoutData || {};

    return (
        <div className="bg-light min-vh-100">
            {/* Header section */}
            <header className="navbar container-fluid px-4 py-3 border-bottom bg-white sticky-top position-relative justify-content-center">
                <Link to={`/info-product-page/${id}`} className="text-decoration-none text-muted small fw-800 position-absolute start-0 ms-4">
                    <i className="fa-solid fa-chevron-left me-1"></i> Back to Product
                </Link>
                <img src="/images/logo.png" alt="Stilnovo" className="logo-img" />
            </header>

            <main className="container-fluid main-wrapper d-flex align-items-center py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-11">
                            {/* Uses global glass-card from app.css */}
                            <div className="glass-card p-4 p-md-5 shadow-lg">
                                <div className="row align-items-center">
                                    
                                    {/* Left Column: Product Info */}
                                    {product && (
                                        <div className="col-lg-5 text-center border-end pe-lg-5">
                                            <div className="position-relative mb-4">
                                                {/* Utilizing your API endpoint for images as seen in ProductDetail */}
                                                <img 
                                                    src={`/api/v1/products/${product.id}/image`} 
                                                    alt={product.name} 
                                                    className="img-fluid rounded-4 shadow-sm" 
                                                    style={{ maxHeight: '220px', width: '100%', objectFit: 'contain' }} 
                                                />
                                            </div>
                                            <h2 className="fw-800 h3 mb-1">{product.name}</h2>
                                            <p className="text-muted small fw-700 mb-4">{product.location} &bull; Verified Seller</p>

                                            <div className="alert-oversized p-3 rounded-4 border d-flex align-items-center gap-3 mb-4 mx-auto text-start" style={{ maxWidth: '350px' }}>
                                                <i className="fa-solid fa-truck-fast text-primary fs-3"></i>
                                                <div>
                                                    <p className="small fw-800 mb-0">SECURE SHIPPING</p>
                                                    <p className="small text-muted mb-0">Door-to-door delivery active.</p>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-center gap-4 align-items-center">
                                                <div className="text-center">
                                                    <p className="small fw-800 text-muted mb-0">PRICE</p>
                                                    {/* Formatted price to 2 decimal places */}
                                                    <p className="fw-800 h4 mb-0">{product.price.toFixed(2)} &euro;</p> 
                                                </div>
                                                <div className="vr opacity-25" style={{ height: '30px' }}></div>
                                                <div className="text-center">
                                                    <p className="small fw-800 text-muted mb-0">PROTECTION</p>
                                                    <p className="fw-800 h4 mb-0 text-success">Active</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Right Column: Checkout Form & User Info */}
                                    <div className="col-lg-7 ps-lg-5 mt-5 mt-lg-0">
                                        
                                        {/* Visual Card Representation using .visual-card from app.css */}
                                        {buyer && (
                                            <>
                                                <div className="visual-card d-none d-md-block mb-4">
                                                    <div className="chip"></div>
                                                    <p className="mb-0 fw-800 opacity-75 small">CARD NUMBER</p>
                                                    <p className="h5 fw-800 mb-3" style={{ letterSpacing: '2px' }}>
                                                        {buyer.cardNumber || '0000 0000 0000 0000'}
                                                    </p>
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <p className="mb-0 opacity-50 small">HOLDER</p>
                                                            <p className="small fw-800 mb-0 text-uppercase text-truncate" style={{ maxWidth: '150px' }}>
                                                                {buyer.name}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="mb-0 opacity-50 small">EXPIRES</p>
                                                            <p className="small fw-800 mb-0">
                                                                {buyer.cardExpiringDate || '00/00'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="mb-0 opacity-50 small">CVV</p>
                                                            <p className="small fw-800 mb-0">
                                                                {buyer.cardCvv || '000'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tooltip if user has no saved card using .tip-card-blue from app.css */}
                                                {!buyer.cardExpiringDate && (
                                                    <div className="tip-card-blue mb-4 d-flex align-items-center gap-3">
                                                        <i className="fa-solid fa-wand-magic-sparkles text-primary fs-4"></i>
                                                        <div>
                                                            <p className="small fw-800 mb-0 text-dark">Want to buy faster?</p>
                                                            <p className="small mb-0 text-muted">Save your payment info in <strong>Settings</strong> to go faster in this form next time.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Payment Form utilizing .search-box inputs from app.css */}
                                        <form onSubmit={handlePaymentSubmit} className="row g-3">
                                            <div className="col-12">
                                                <div className="search-box w-100">
                                                    <input 
                                                        type="text" 
                                                        name="cardHolder" 
                                                        value={paymentForm.cardHolder}
                                                        onChange={handleInputChange}
                                                        placeholder="Cardholder Name" 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="search-box w-100">
                                                    <input 
                                                        type="text" 
                                                        name="cardNumber" 
                                                        value={paymentForm.cardNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="Card Number" 
                                                        required 
                                                    />
                                                    <i className="fa-brands fa-cc-visa fa-lg ms-auto"></i>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="search-box w-100 text-center">
                                                    <input 
                                                        type="text" 
                                                        name="expiry" 
                                                        value={paymentForm.expiry}
                                                        onChange={handleInputChange}
                                                        className="text-center"
                                                        placeholder="MM/YY" 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="search-box w-100 text-center">
                                                    <input 
                                                        type="password" 
                                                        name="cvv" 
                                                        value={paymentForm.cvv}
                                                        onChange={handleInputChange}
                                                        className="text-center"
                                                        placeholder="CVV" 
                                                        required 
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-12 mt-4">
                                                {/* Replaced standard bootstrap btn with your custom .btn-sell class */}
                                                <button 
                                                    type="submit" 
                                                    disabled={processing}
                                                    className="btn-sell w-100 justify-content-center"
                                                >
                                                    {processing ? (
                                                        <><i className="fas fa-spinner fa-spin me-2"></i> Processing Transaction...</>
                                                    ) : (
                                                        <><i className="fa-solid fa-lock me-2"></i> Confirm Secure Payment</>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="col-12 text-center mt-3">
                                                <span className="small fw-800 text-muted text-uppercase">
                                                    <span className="status-pulse me-2"></span> Secure Bank Connection Established
                                                </span>
                                            </div>
                                        </form>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentPage;