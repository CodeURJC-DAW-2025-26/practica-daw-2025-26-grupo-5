/**
 * User Sales Orders & Purchases Page
 *
 * Comprehensive transaction management page for sellers and buyers.
 * Displays both sales (items sold) and purchases (items bought).
 *
 * Features:
 * - Dual-tab interface:
 *    - Sales tab: Products sold by user
 *    - Purchases tab: Products bought by user
 * - For each transaction displays:
 *    - Product image
 *    - Product name
 *    - Buyer/Seller name (depending on tab)
 *    - Amount/Price
 *    - Transaction status
 *    - Transaction date
 * - Rating system:
 *    - Rate purchases you've received
 *    - Rate sales (buyer rates seller)
 *    - Shows valoration modal for rating submissions
 *    - Displays existing ratings
 * - Success notification:
 *    - Shows after purchase completion
 *    - Auto-dismisses after 5 seconds
 *    - Uses localStorage flag 'justPurchased'
 * - Transaction status indicators
 * - Empty state messages
 * - Loading state during data fetch
 * - Error handling
 * - Responsive table layout
 *
 * Data Flow:
 * 1. Component mounts and fetches transactions
 * 2. Fetches user's transactions via /api/v1/users/me/transactions
 * 3. Separates sales and purchases into two arrays
 * 4. Displays active tab (purchases by default)
 * 5. User can:
 *    - Switch between Sales/Purchases tabs
 *    - Click "Rate" button to open valoration modal
 *    - Submit rating and comment
 *    - View existing ratings
 * 6. After rating submission, transaction updates
 *
 * State Management:
 * - sales: Array of user's sales transactions
 * - purchases: Array of user's purchases
 * - selectedTransactionId: Currently selected for rating
 * - loading: Initial data fetch state
 * - error: Error message if fetch fails
 * - isProcessing: Loading state during rating submit
 * - showModal: Valoration modal visibility
 * - activeTransaction: Transaction being rated
 *
 * HTTP Requests:
 * - Fetches transactions from /api/v1/users/me/transactions
 * - Uses Bearer token from localStorage
 * - Manual fetch (not using api service) with direct headers
 * - Token auto-included in Authorization header
 *
 * Valoration (Rating):
 * - Users can rate completed transactions
 * - Rating scale: 1-5 stars
 * - Optional comment/review
 * - Submitted to /v1/valorations endpoint
 * - Affects seller rating and reputation
 *
 * Success Notification:
 * - Triggered by 'justPurchased' localStorage flag
 * - Shows success alert with transaction summary
 * - Auto-hides after 5 seconds
 * - Clears flag after display
 *
 * Transaction Types:
 * - Sales: User is seller (showed in Sales tab)
 * - Purchases: User is buyer (showed in Purchases tab)
 * - Status shows transaction state (Completed, Pending, etc.)
 *
 * Protected Component:
 * - Requires user authentication
 * - Redirects to login if not logged in
 * - Shows loading spinner during fetch
 *
 * @component
 * @returns React component for transaction history and rating
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Container, Row, Col, Card, Badge, Button, Image, Spinner, Stack, Alert } from 'react-bootstrap';
import { useUserStore } from '~/stores/useUserStore';
import ValorationModal from "~/components/valoration-modal";

import type TransactionDTO from '~/dto/TransactionDTO';
import { createValoration } from '~/services/valorations-service';

/**
 * User Sales Orders Component
 * 
 * Displays user's transaction history and manages product ratings.
 */
const UserSalesOrders = () => {
    // State management
    const [sales, setSales] = useState<TransactionDTO[]>([]);
    const [purchases, setPurchases] = useState<TransactionDTO[]>([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Modal control
    const [showModal, setShowModal] = useState(false);
    const [activeTransaction, setActiveTransaction] = useState<TransactionDTO | null>(null);

    const { user } = useUserStore();
    const navigate = useNavigate();

    /**
     * Fetch User Transactions
     * 
     * Gets all user's sales and purchases from backend.
     * Separates them into two arrays for tab display.
     * Handles authentication and error cases.
     */
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

    const handleValorationSubmit = async (rating: number, comment: string) => {
        if (!activeTransaction) return;
        setIsProcessing(true);
        try {
            await createValoration({
                rating,
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
            <Spinner animation="border" role="status" />
        </div>
    );

    return (
        <Container fluid className="py-4 py-md-5">
            <Stack direction="horizontal" gap={3} className="justify-content-between align-items-start mb-5">
                <div>
                    <h1 className="fw-800 h2">Sales & Orders</h1>
                    <p className="text-muted small">Manage your transactions and community reputation.</p>
                </div>
                {user && (
                    <Link to="/user/settings">
                        <Image
                            src={`/api/v1/users/me/profile-photo?t=${Date.now()}`}
                            className="rounded-circle border border-2 shadow-sm"
                            width={48}
                            height={48}
                            alt="Profile"
                            onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                        />
                    </Link>
                )}
            </Stack>

            {error && <Alert variant="danger" className="rounded-4">{error}</Alert>}

            <Row className="g-4">
                {/* LEFT COLUMN: Lists */}
                <Col lg={7}>
                    <h3 className="fw-800 h5 mb-3">
                        <i className="fa-solid fa-tag me-2" />
                        My Sales
                    </h3>
                    <Stack gap={3} className="mb-5">
                        {sales.map((sale) => (
                            <Card
                                key={sale.transactionId}
                                className="border-0"
                                onClick={() => setSelectedTransactionId(sale.transactionId)}
                                style={{ cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', borderRadius: '12px', transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <Card.Body>
                                    <Stack direction="horizontal" gap={3} className="justify-content-between">
                                        <h5 className="fw-800 mb-0">{sale.product.name}</h5>
                                        <Badge bg="success">{sale.transactionStatus}</Badge>
                                    </Stack>
                                    <Stack direction="horizontal" gap={3} className="justify-content-between align-items-center mt-4">
                                        <span className="small fw-700 text-muted">Buyer: {sale.buyer.name}</span>
                                        <p className="fw-800 mb-0 text-primary">{sale.finalPrice.toFixed(2)}€</p>
                                    </Stack>
                                </Card.Body>
                            </Card>
                        ))}
                    </Stack>

                    <h3 className="fw-800 h5 mb-3">
                        <i className="fa-solid fa-cart-shopping me-2" />
                        My Purchases
                    </h3>
                    <Stack gap={3}>
                        {purchases.map((purchase) => (
                            <Card
                                key={purchase.transactionId}
                                className="border-0"
                                onClick={() => setSelectedTransactionId(purchase.transactionId)}
                                style={{ cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', borderRadius: '12px', transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <Card.Body>
                                    <Stack direction="horizontal" gap={3} className="justify-content-between">
                                        <h5 className="fw-800 mb-0">{purchase.product.name}</h5>
                                        <Badge bg="info">Bought</Badge>
                                    </Stack>
                                    <Stack direction="horizontal" gap={3} className="justify-content-between align-items-center mt-4">
                                        {/* Seller Info Group */}
                                        <Stack direction="horizontal" gap={2} className="align-items-center">
                                            <Image
                                                src={`/api/v1/users/${purchase.seller.id}/profile-photo?t=${Date.now()}`}
                                                alt={purchase.seller.name}
                                                className="rounded-circle border shadow-sm"
                                                width={32}
                                                height={32}
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                                            />
                                            <span className="small fw-700 text-muted">Seller: {purchase.seller.name}</span>
                                        </Stack>

                                        {/* Price and Action Group */}
                                        <Stack direction="horizontal" gap={3} className="align-items-center">
                                            <p className="fw-800 mb-0">{purchase.finalPrice.toFixed(2)}€</p>

                                            {purchase.rated ? (
                                                <Badge bg="light" text="muted" className="border px-3 py-2 rounded-pill">
                                                    <i className="fa-solid fa-check-circle me-1 text-success" /> Rated
                                                </Badge>
                                            ) : (
                                                <Button
                                                    className="d-flex align-items-center gap-2 fw-800 rounded-3 border-0 px-4 py-2"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                        color: 'white',
                                                        fontSize: '14px',
                                                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                                                        transition: 'all 0.3s ease',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShowModal(purchase);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.45)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.35)';
                                                    }}
                                                >
                                                    <i className="fa-solid fa-star" /> Rate Seller
                                                </Button>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Card.Body>
                            </Card>
                        ))}
                    </Stack>
                </Col>

                {/* RIGHT COLUMN: Order Details */}
                <Col lg={5}>
                    <Card className="border-0 position-sticky" style={{ top: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', borderRadius: '16px' }}>
                        <Card.Body>
                            <h3 className="fw-800 h5 mb-4">Order Details</h3>
                            {selectedTransaction ? (
                                <>
                                    <Card className="border-0 mb-4" style={{ backgroundColor: '#f0f9ff', borderLeft: '4px solid #06b6d4', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.1)', borderRadius: '10px' }}>
                                        <Card.Body>
                                            <span className="x-small fw-800 text-muted">Shipping Address</span>
                                            <p className="small fw-700 mb-0">{selectedTransaction.product.location}</p>
                                        </Card.Body>
                                    </Card>
                                    <Stack gap={3}>
                                        {/* Show Shipping Label only for sellers (sales) */}
                                        {sales.some(s => s.transactionId === selectedTransaction.transactionId) && (
                                            <Button
                                                className="py-3 fw-800 rounded-3 border-0 d-flex align-items-center justify-content-center gap-2"
                                                style={{
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    color: 'white',
                                                    fontSize: '15px',
                                                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                as="a"
                                                href={`/api/v1/transactions/${selectedTransaction.transactionId}/shipping-label`}
                                                target="_blank"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.45)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
                                                }}
                                            >
                                                <i className="fa-solid fa-truck fs-5" /> Shipping Label
                                            </Button>
                                        )}
                                        {/* Show Invoice for everyone (both sales and purchases) */}
                                        <Button
                                            className="py-3 fw-800 rounded-3 border-0 d-flex align-items-center justify-content-center gap-2"
                                            style={{
                                                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                                                color: 'white',
                                                fontSize: '15px',
                                                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.35)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            as="a"
                                            href={`/api/v1/transactions/${selectedTransaction.transactionId}/invoice`}
                                            target="_blank"
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.45)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.35)';
                                            }}
                                        >
                                            <i className="fa-solid fa-file-invoice fs-5" /> Invoice
                                        </Button>
                                    </Stack>
                                </>
                            ) : (
                                <div className="text-center py-5 opacity-50">
                                    <i className="fa-solid fa-hand-pointer fa-3x mb-3 text-primary" />
                                    <p className="small fw-700">Select a transaction to see details</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* VALORATION MODAL */}
            <ValorationModal
                show={showModal}
                onHide={() => setShowModal(false)}
                transaction={activeTransaction}
                onSubmit={handleValorationSubmit}
                isProcessing={isProcessing}
            />
        </Container>
    );
};

export default UserSalesOrders;