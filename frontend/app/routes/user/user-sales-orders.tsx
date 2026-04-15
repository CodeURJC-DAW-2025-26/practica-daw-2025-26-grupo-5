import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '~/stores/useUserStore';

// Adjust the import paths according to your project structure
import type TransactionDTO from '~/dto/TransactionDTO';

const UserSalesOrders = () => {
    // State management for lists, loading, errors, and selection
    const [sales, setSales] = useState<TransactionDTO[]>([]);
    const [purchases, setPurchases] = useState<TransactionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
    
    // Rating form state
    const [ratingData, setRatingData] = useState({ stars: 5, comment: '' });

    const { user } = useUserStore();
    const navigate = useNavigate();

    // Fetch transactions on component mount
    useEffect(() => {
        const fetchAllTransactions = async () => {
            try {
                const response = await fetch('/api/v1/users/me/transactions', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Session expired. Please log in again.");
                    }
                    throw new Error("Could not load your transactions.");
                }

                const data = await response.json();

                // Backend returns a PagedResponse, extract the 'content' array
                setSales(data.sales || []);
                setPurchases(data.orders || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAllTransactions();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    // Handle rating submission
    const submitRating = async (e: React.FormEvent, transactionId: number) => {
        e.preventDefault();
        
        alert(`Rating submitted for transaction ${transactionId}!`);
        // Note: You should update the local state or refetch here so the "Rate" button disappears
    };

    // Find the currently selected transaction from either sales or purchases
    const selectedTransaction = [...sales, ...purchases].find(t => t.transactionId === selectedTransactionId);

    // Render loading state
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 w-100">
            <svg className="stn-loader" viewBox="25 25 50 50">
                <circle cx="50" cy="50" r="20"></circle>
            </svg>
        </div>
    );

    return (
        <main className="flex-grow-1 p-4 p-md-5 overflow-auto bg-light min-vh-100">
            
            {/* Mobile menu trigger is handled by your layout, so we only need the Header */}
            <header className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-800 h2">Sales & Orders</h1>
                    <p className="text-muted small">Manage your transactions and community reputation.</p>
                </div>
                {user && (
                    <Link to="/user/settings" className="text-decoration-none">
                        <img 
                            src={`/api/v1/users/me/profile-photo`} 
                            alt="User" 
                            className="rounded-circle border border-2 shadow-sm" 
                            width="48" height="48" 
                            style={{ objectFit: 'cover' }} 
                            onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')} 
                        />
                    </Link>
                )}
            </header>

            {error && <div className="alert alert-danger rounded-4">{error}</div>}

            <div className="row g-4">
                {/* Left Column: Lists */}
                <div className="col-lg-7">
                    
                    {/* Sales Section */}
                    <h3 className="fw-800 h5 mb-3"><i className="fa-solid fa-tag me-2"></i>My Sales</h3>
                    <div className="d-flex flex-column gap-3 mb-5">
                        {sales.length > 0 ? sales.map((sale) => (
                            <div 
                                key={`sale-${sale.transactionId}`} 
                                className="clay-card p-4 border-start-status-success shadow-sm"
                                onClick={() => setSelectedTransactionId(sale.transactionId)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <span className="x-small fw-800 opacity-50 text-uppercase">Transaction #{sale.transactionId}</span>
                                        <h5 className="fw-800 mb-0">{sale.product.name}</h5>
                                    </div>
                                    <span className="badge rounded-pill bg-success-subtle text-success x-small">
                                        {sale.transactionStatus || 'Completed'}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <span className="small fw-700">Buyer: {sale.buyer.name}</span>
                                    <p className="fw-800 mb-0 text-primary">{sale.finalPrice.toFixed(2)} &euro;</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-muted small ps-2">No items sold yet.</p>
                        )}
                    </div>

                    {/* Purchases Section */}
                    <h3 className="fw-800 h5 mb-3"><i className="fa-solid fa-cart-shopping me-2"></i>My Purchases</h3>
                    <div className="d-flex flex-column gap-3">
                        {purchases.length > 0 ? purchases.map((purchase) => (
                            <div key={`purchase-${purchase.transactionId}`}>
                                <div 
                                    className="clay-card p-4 shadow-sm border-start-status-info"
                                    onClick={() => setSelectedTransactionId(purchase.transactionId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <span className="x-small fw-800 opacity-50 text-uppercase">Purchase #{purchase.transactionId}</span>
                                            <h5 className="fw-800 mb-0">{purchase.product.name}</h5>
                                        </div>
                                        <span className="badge rounded-pill bg-info-subtle text-info x-small">
                                            {purchase.transactionStatus || 'Bought'}
                                        </span>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center mt-4">
                                        <div className="d-flex align-items-center gap-3">
                                            {/* Accessing UserDTO's 'id' property */}
                                            <img 
                                                src={`/api/v1/users/${purchase.seller.id}/profile-photo`} 
                                                className="rounded-circle border" 
                                                width="32" height="32" 
                                                style={{ objectFit: 'cover' }} 
                                                onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')} 
                                                alt={purchase.seller.name} 
                                            />
                                            <span className="small fw-700">Seller: {purchase.seller.name}</span>
                                        </div>
                                        
                                        <div className="d-flex align-items-center gap-3">
                                            <p className="fw-800 mb-0">{purchase.finalPrice.toFixed(2)} &euro;</p>
                                            
                                            {/* Conditional Rendering based on 'rated' boolean from TransactionDTO */}
                                            {purchase.rated ? (
                                                <span className="badge rounded-pill bg-light text-muted border px-3 py-2 small">
                                                    <i className="fa-solid fa-check-circle me-1"></i> Rated
                                                </span>
                                            ) : (
                                                <button 
                                                    className="btn-about py-2 px-3 small d-flex align-items-center gap-2" 
                                                    data-bs-toggle="modal" 
                                                    data-bs-target={`#rateModal${purchase.transactionId}`}
                                                    onClick={(e) => e.stopPropagation()} // Prevent selecting card when clicking button
                                                >
                                                    <i className="fa-solid fa-star text-warning"></i> Rate Seller
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bootstrap Modal for Rating */}
                                {!purchase.rated && (
                                    <div className="modal fade" id={`rateModal${purchase.transactionId}`} tabIndex={-1} aria-hidden="true">
                                        <div className="modal-dialog modal-dialog-centered">
                                            <div className="clay-card modal-content p-4 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                                                <div className="text-center mb-4">
                                                    <h3 className="fw-800 h5 mb-1 text-primary">Rate your experience</h3>
                                                    <p className="small text-muted fw-700">{purchase.product.name} &bull; <span className="text-dark">{purchase.finalPrice.toFixed(2)} &euro;</span></p>
                                                    <hr className="opacity-10" />
                                                </div>

                                                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 mb-4">
                                                    <img 
                                                        src={`/api/v1/users/${purchase.seller.id}/profile-photo`} 
                                                        className="rounded-circle border border-2 border-white shadow-sm" 
                                                        width="55" height="55" 
                                                        style={{ objectFit: 'cover' }} 
                                                        onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')} 
                                                        alt="Seller" 
                                                    />
                                                    <div>
                                                        <p className="small fw-800 mb-0">{purchase.seller.name}</p>
                                                        <div className="d-flex align-items-center gap-1 text-warning small">
                                                            <i className="fa-solid fa-star"></i>
                                                            <span className="fw-700 text-dark">{purchase.seller.rating || 0}</span>
                                                            <span className="text-muted x-small">({purchase.seller.numRatings || 0} reviews)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <form onSubmit={(e) => submitRating(e, purchase.transactionId)}>
                                                    <div className="mb-3 text-center">
                                                        <label className="label-categories mb-3 d-block text-uppercase">Score (1-5)</label>
                                                        <input 
                                                            type="number" 
                                                            className="form-control form-control-lg rounded-pill bg-light border-0 text-center fw-800" 
                                                            min="1" max="5" 
                                                            value={ratingData.stars}
                                                            onChange={(e) => setRatingData({...ratingData, stars: Number(e.target.value)})}
                                                            style={{ color: '#2f6ced' }} 
                                                            required 
                                                        />
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="label-categories mb-2 text-uppercase">Commentary</label>
                                                        <textarea 
                                                            className="form-control rounded-4 bg-light border-0 p-3 small" 
                                                            rows={3} 
                                                            placeholder="How was the item and the shipping?" 
                                                            value={ratingData.comment}
                                                            onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                                                            required
                                                        ></textarea>
                                                    </div>
                                                    <button type="submit" className="btn-sell w-100 py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm" data-bs-dismiss="modal">
                                                        <i className="fa-solid fa-check-circle"></i> Submit Review
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p className="text-muted small ps-2">No purchases yet.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Transaction Details */}
                <div className="col-lg-5">
                    <div className="clay-card p-4 h-100 d-flex flex-column position-sticky" style={{ top: '20px' }}>
                        <h3 className="fw-800 h5 mb-4">Order Details</h3>
                        
                        {selectedTransaction ? (
                            <>
                                <div className="p-3 bg-light rounded-4 mb-4">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="fa-solid fa-location-dot text-danger opacity-50"></i>
                                        <span className="x-small fw-800 opacity-50 text-uppercase">Shipping Address</span>
                                    </div>
                                    <p className="small fw-700 mb-0">{selectedTransaction.product.location}</p>
                                    <p className="small fw-600 mb-0 text-muted mt-2">{selectedTransaction.product.category} &bull; {selectedTransaction.finalPrice.toFixed(2)} &euro;</p>
                                </div>

                                <div className="shipping-details mb-4">
                                    <label className="label-categories mb-3 text-uppercase">Logistics Status</label>
                                    <div className="timeline-simple">
                                        <div className="timeline-item-fine active">
                                            <i className="fa-solid fa-circle-check text-success"></i>
                                            <div className="ms-2">
                                                <p className="small fw-800 mb-0">Payment Verified</p>
                                                <p className="x-small opacity-50 mb-3">Transaction securely logged in Stilnovo.</p>
                                            </div>
                                        </div>
                                        <div className="timeline-item-fine active">
                                            <i className="fa-solid fa-box text-primary"></i>
                                            <div className="ms-2">
                                                <p className="small fw-800 mb-0">Order Ready</p>
                                                <p className="x-small opacity-50">Logistics label and invoice generated.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-top d-grid gap-3">
                                    <a className="btn-sell w-100 py-3 d-flex align-items-center justify-content-center gap-2 text-decoration-none" href={`/api/v1/pdf/shipping-label/${selectedTransaction.transactionId}`} target="_blank" rel="noreferrer">
                                        <i className="fa-solid fa-print"></i> Download Shipping Label
                                    </a>
                                    <a className="btn-about w-100 py-3 d-flex align-items-center justify-content-center gap-2 text-decoration-none" href={`/api/v1/pdf/invoice/${selectedTransaction.transactionId}`} target="_blank" rel="noreferrer">
                                        <i className="fa-solid fa-file-invoice"></i> Download Official Invoice
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="text-center my-auto opacity-50 pb-5">
                                <i className="fa-solid fa-hand-pointer fa-3x mb-3 text-primary"></i>
                                <p className="small fw-700">Select a transaction to see details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default UserSalesOrders;