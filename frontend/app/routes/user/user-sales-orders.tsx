import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router'; // Corrected to react-router
import { useUserStore } from '~/stores/useUserStore';
import ValorationModal from "~/components/valoration-modal";

import type TransactionDTO from '~/dto/TransactionDTO';
import { createValoration } from '~/services/valorations-service';

const UserSalesOrders = () => {
    // 1. State management
    const [sales, setSales] = useState<TransactionDTO[]>([]);
    const [purchases, setPurchases] = useState<TransactionDTO[]>([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false); // Added missing state

    // Modal Control
    const [showModal, setShowModal] = useState(false);
    const [activeTransaction, setActiveTransaction] = useState<TransactionDTO | null>(null);

    const { user } = useUserStore();
    const navigate = useNavigate();

    // 2. Fetch data
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
                    if (response.status === 401) throw new Error("Session expired.");
                    throw new Error("Could not load transactions.");
                }
                const data = await response.json();
                setSales(data.sales || []);
                setPurchases(data.orders || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAllTransactions();
        else navigate('/login');
    }, [user, navigate]);

    // 3. Handlers
    const handleShowModal = (transaction: TransactionDTO) => {
        setActiveTransaction(transaction);
        setShowModal(true);
    };

    const handleValorationSubmit = async (stars: number, comment: string) => {
        if (!activeTransaction) return;
        setIsProcessing(true);
        try {
            await createValoration({
                stars,
                comment,
                buyerName: user?.name || "Buyer",
                transactionId: activeTransaction.transactionId
            });

            // Update UI locally
            setPurchases(prev => prev.map(p =>
                p.transactionId === activeTransaction.transactionId ? { ...p, rated: true } : p
            ));
            setShowModal(false);
        } catch (err) {
            setError("Failed to submit review.");
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedTransaction = [...sales, ...purchases].find(t => t.transactionId === selectedTransactionId);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 w-100">
            <svg className="stn-loader" viewBox="25 25 50 50"><circle cx="50" cy="50" r="20"></circle></svg>
        </div>
    );

    return (
        <main className="flex-grow-1 p-4 p-md-5 overflow-auto bg-light min-vh-100">
            <header className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-800 h2">Sales & Orders</h1>
                    <p className="text-muted small">Manage your transactions and community reputation.</p>
                </div>
                {user && (
                    <Link to="/user/settings">
                        <img src={`/api/v1/users/me/profile-photo`} className="rounded-circle border border-2 shadow-sm" width="48" height="48" alt="Profile" onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')} />
                    </Link>
                )}
            </header>

            {error && <div className="alert alert-danger rounded-4">{error}</div>}

            <div className="row g-4">
                {/* LEFT COLUMN: Lists */}
                <div className="col-lg-7">
                    <h3 className="fw-800 h5 mb-3"><i className="fa-solid fa-tag me-2"></i>My Sales</h3>
                    <div className="d-flex flex-column gap-3 mb-5">
                        {sales.map((sale) => (
                            <div key={sale.transactionId} className="clay-card p-4 shadow-sm" onClick={() => setSelectedTransactionId(sale.transactionId)} style={{ cursor: 'pointer' }}>
                                <div className="d-flex justify-content-between">
                                    <h5 className="fw-800 mb-0">{sale.product.name}</h5>
                                    <span className="badge rounded-pill bg-success-subtle text-success small">{sale.transactionStatus}</span>
                                </div>
                                <div className="mt-4 d-flex justify-content-between align-items-center">
                                    <span className="small fw-700 text-muted">Buyer: {sale.buyer.name}</span>
                                    <p className="fw-800 mb-0 text-primary">{sale.finalPrice.toFixed(2)}€</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 className="fw-800 h5 mb-3"><i className="fa-solid fa-cart-shopping me-2"></i>My Purchases</h3>
                    <div className="d-flex flex-column gap-3">
                        {purchases.map((purchase) => (
                            <div key={purchase.transactionId} className="clay-card p-4 shadow-sm" onClick={() => setSelectedTransactionId(purchase.transactionId)} style={{ cursor: 'pointer' }}>
                                <div className="d-flex justify-content-between">
                                    <h5 className="fw-800 mb-0">{purchase.product.name}</h5>
                                    <span className="badge rounded-pill bg-info-subtle text-info small">Bought</span>
                                </div>
                                <div className="mt-4 d-flex justify-content-between align-items-center">
                                    {/* Seller Info Group */}
                                    <div className="d-flex align-items-center gap-2">
                                        <img
                                            src={`/api/v1/users/${purchase.seller.id}/profile-photo`}
                                            alt={purchase.seller.name}
                                            className="rounded-circle border shadow-sm"
                                            width="32"
                                            height="32"
                                            style={{ objectFit: 'cover' }}
                                            onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                                        />
                                        <span className="small fw-700 text-muted">Seller: {purchase.seller.name}</span>
                                    </div>

                                    {/* Price and Action Group */}
                                    <div className="d-flex align-items-center gap-3">
                                        <p className="fw-800 mb-0">{purchase.finalPrice.toFixed(2)}€</p>

                                        {purchase.rated ? (
                                            <span className="badge rounded-pill bg-light text-muted border px-3 py-2">
                                                <i className="fa-solid fa-check-circle me-1 text-success"></i> Rated
                                            </span>
                                        ) : (
                                            <button
                                                className="btn-about py-2 px-3 small d-flex align-items-center gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShowModal(purchase);
                                                }}
                                            >
                                                <i className="fa-solid fa-star text-warning"></i> Rate Seller
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: Order Details */}
                <div className="col-lg-5">
                    <div className="clay-card p-4 h-100 position-sticky" style={{ top: '20px' }}>
                        <h3 className="fw-800 h5 mb-4">Order Details</h3>
                        {selectedTransaction ? (
                            <>
                                <div className="p-3 bg-light rounded-4 mb-4">
                                    <span className="x-small fw-800 text-muted text-uppercase">Shipping Address</span>
                                    <p className="small fw-700 mb-0">{selectedTransaction.product.location}</p>
                                </div>
                                <div className="d-grid gap-3">
                                    <a className="btn-sell py-3 text-center text-decoration-none" href={`/api/v1/pdf/shipping-label/${selectedTransaction.transactionId}`} target="_blank">
                                        <i className="fa-solid fa-print me-2"></i> Shipping Label
                                    </a>
                                    <a className="btn-about py-3 text-center text-decoration-none" href={`/api/v1/pdf/invoice/${selectedTransaction.transactionId}`} target="_blank">
                                        <i className="fa-solid fa-file-invoice me-2"></i> Invoice
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5 opacity-50">
                                <i className="fa-solid fa-hand-pointer fa-3x mb-3 text-primary"></i>
                                <p className="small fw-700">Select a transaction to see details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* VALORATION MODAL */}
            <ValorationModal
                show={showModal}
                onHide={() => setShowModal(false)}
                transaction={activeTransaction}
                onSubmit={handleValorationSubmit}
                isProcessing={isProcessing}
            />
        </main>
    );
};

export default UserSalesOrders;