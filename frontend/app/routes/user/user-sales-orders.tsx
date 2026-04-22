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
 * - Fetches transactions via getUserTransactions() service (MVC pattern)
 * - Service delegates to API client which adds Bearer token automatically
 * - No manual headers needed (api.ts handles auth)
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
import { getUserTransactions } from '~/services/transaction-service'; // MVC: Delegate to service
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
     * Fetch transactions via service (MVC pattern)
     * Service handles auth headers and data transformation
     */
    useEffect(() => {
        const fetchAllTransactions = async () => {
            try {
                // Service delegates to API client → handles token injection automatically
                const data = await getUserTransactions();
                setSales(data.sales || []);
                setPurchases(data.orders || []);
            } catch (err: any) {
                const errorMsg = err.message || 'Failed to load transactions. Please try again.';
                setError(errorMsg);
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
                                    <Stack direction="horizontal" gap={3} className="justify-content-between align-items-center">
                                        <h5 className="fw-800 mb-0 text-dark">{purchase.product.name}</h5>
                                        <span
                                            className="badge fw-800 px-3 py-2 rounded-pill"
                                            style={{
                                                backgroundColor: '#ecfdf5',
                                                color: '#059669',
                                                border: '1px solid #d1fae5',
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            <i className="fa-solid fa-circle-check me-1"></i> Purchased
                                        </span>
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
                                                    className="btn-stilnovo-rate d-flex align-items-center gap-2 fw-800 rounded-pill px-4 py-2 shadow-sm"
                                                    style={{ fontSize: '14px', whiteSpace: 'nowrap' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShowModal(purchase);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-star" style={{ color: '#F59E0B' }} /> Rate Seller
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
                                                as="a"
                                                href={`/api/v1/transactions/${selectedTransaction.transactionId}/shipping-label`}
                                                target="_blank"
                                                variant="outline-dark"
                                                className="py-2 px-4 fw-800 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                                style={{ fontSize: '15px' }}
                                            >
                                                <i className="fa-solid fa-truck fs-5" style={{ color: '#10B981' }} /> Shipping Label
                                            </Button>
                                        )}
                                        {/* Show Invoice for everyone (both sales and purchases) */}
                                        <Button
                                            as="a"
                                            href={`/api/v1/transactions/${selectedTransaction.transactionId}/invoice`}
                                            target="_blank"
                                            variant="dark"
                                            className="py-2 px-4 fw-800 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                            style={{ fontSize: '15px' }}
                                        >
                                            <i className="fa-solid fa-file-invoice fs-5" style={{ color: '#94a3b8' }} /> View Invoice
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