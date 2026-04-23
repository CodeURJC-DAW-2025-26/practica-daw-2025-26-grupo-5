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
import { useState } from 'react';
import { useLoaderData, redirect, Link, useNavigate } from 'react-router';
import { Row, Col, Card, Badge, Button, Image, Stack, Alert } from 'react-bootstrap';
import { useUserStore } from '~/stores/useUserStore';
import ValorationModal from "~/components/ValorationModal";

import type TransactionDTO from '~/dto/TransactionDTO';
import { createValoration } from '~/services/valorations-service';
import { getTransactions } from '~/services/transaction-service';

interface TransactionsResponse {
    sales: TransactionDTO[];
    orders: TransactionDTO[];
}

export async function clientLoader() {
    const currentUser = useUserStore.getState().user;
    if (!currentUser) {
        throw redirect('/login');
    }

    try {
        const transactions = (await getTransactions()) as TransactionsResponse;
        return { transactions };
    } catch (error: any) {
        if (error.status === 401 || error.response?.status === 401) {
            useUserStore.getState().setUser(null);
            throw redirect('/login');
        }
        console.error("Error loading transactions in loader:", error);
        throw error;
    }
}

const UserSalesOrders = () => {
    const loaderData = useLoaderData() as { transactions: TransactionsResponse };

    const { user } = useUserStore();
    const navigate = useNavigate();

    const [sales, setSales] = useState<TransactionDTO[]>(loaderData.transactions?.sales || []);
    const [purchases, setPurchases] = useState<TransactionDTO[]>(loaderData.transactions?.orders || []);

    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [activeTransaction, setActiveTransaction] = useState<TransactionDTO | null>(null);

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

    return (
        <>
            {/* --- PAGE HEADER --- */}
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
                            width="48" height="48"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                        />
                    </Link>
                )}
            </Stack>

            {error && <Alert variant="danger" className="rounded-4">{error}</Alert>}

            {/* --- MAIN CONTENT LOGIC --- */}
            {sales.length === 0 && purchases.length === 0 ? (
                /* --- FULL WIDTH GLOBAL EMPTY STATE --- */
                <div
                    className="d-flex flex-column align-items-center text-center w-100"
                    style={{ marginTop: '15vh', marginBottom: '10vh' }}
                >
                    <div className="mb-4">
                        {/* Icon remains subtle and modern */}
                        <i className="fa-solid fa-couch fa-4x text-muted opacity-20" />
                    </div>
                    <h3 className="fw-800 text-dark">Your adventure starts here</h3>
                    <p className="text-muted mx-auto mb-4" style={{ maxWidth: '400px' }}>
                        It seems you haven't made any transactions yet. Explore the market to find unique design treasures!
                    </p>
                    <Link to="/#featured-treasures" className="text-decoration-none">
                        <button className="btn-sell py-2 px-5 shadow-sm">
                            Buy Treasures
                        </button>
                    </Link>
                </div>
            ) : (
                /* 
                    Shown if there is at least one sale or one purchase
                */
                <Row className="g-4">
                    <Col lg={7}>
                        {/* MY SALES SECTION */}
                        <h3 className="fw-800 h5 mb-3">
                            <i className="fa-solid fa-tag me-2" />
                            My Sales
                        </h3>
                        {sales.length > 0 ? (
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
                        ) : (
                            /* Standard empty state for Sales maintained */
                            <div className="ps-2 py-2 border-start border-2 opacity-50 mb-5 mt-n3">
                                <p className="text-muted small fw-600 mb-0">
                                    No sales recorded in your history yet.
                                </p>
                            </div>
                        )}

                        {/* MY PURCHASES SECTION */}
                        <h3 className="fw-800 h5 mb-3">
                            <i className="fa-solid fa-cart-shopping me-2" />
                            My Purchases
                        </h3>
                        {purchases.length > 0 ? (
                            <Stack gap={3} className="mb-5">
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
                                                <span className="badge fw-800 px-3 py-2 rounded-pill" style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5', letterSpacing: '0.5px' }}>
                                                    <i className="fa-solid fa-circle-check me-1"></i> Purchased
                                                </span>
                                            </Stack>
                                            <Stack direction="horizontal" gap={3} className="justify-content-between align-items-center mt-4">
                                                <Stack direction="horizontal" gap={2} className="align-items-center">
                                                    <Image
                                                        src={`/api/v1/users/${purchase.seller.id}/profile-photo?t=${Date.now()}`}
                                                        className="rounded-circle border shadow-sm"
                                                        width={32} height={32} style={{ objectFit: 'cover' }}
                                                        onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                                                    />
                                                    <span className="small fw-700 text-muted">Seller: {purchase.seller.name}</span>
                                                </Stack>

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
                        ) : (
                            /* Standard empty state for Purchases maintained */
                            <div className="ps-2 py-2 border-start border-2 opacity-50 mb-5 mt-n3">
                                <p className="text-muted small fw-600 mb-0">
                                    No purchases recorded in your history yet.
                                </p>
                            </div>
                        )}
                    </Col>

                    {/* SIDEBAR: Order Details 
                    Only visible when there is some activity in the lists
                */}
                    <Col lg={5}>
                        <Card
                            className="border-0 position-sticky shadow-sm"
                            style={{
                                top: '20px',
                                borderRadius: '20px',
                                backgroundColor: '#ffffff',
                                marginTop: '42px' // Perfect horizontal alignment with first card
                            }}
                        >
                            <Card.Body className="p-4">
                                <h3 className="fw-800 h5 mb-4 text-dark d-flex align-items-center">
                                    <i className="fa-solid fa-circle-info me-2 text-primary opacity-50" style={{ fontSize: '0.9rem' }}></i>
                                    Order Details
                                </h3>

                                {selectedTransaction ? (
                                    <>
                                        <div className="p-3 mb-4" style={{ backgroundColor: '#f8fafc', borderRadius: '15px', borderLeft: '5px solid #2f6ced' }}>
                                            <Stack direction="horizontal" className="align-items-center mb-1">
                                                <i className="fa-solid fa-location-dot text-primary me-2" style={{ fontSize: '0.8rem' }}></i>
                                                <span className="text-uppercase fw-800 text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                    Shipping Address
                                                </span>
                                            </Stack>
                                            <p className="small fw-700 mb-0 text-dark ps-3">
                                                {selectedTransaction.product.location}
                                            </p>
                                        </div>

                                        <Stack gap={2}>
                                            {sales.some(s => s.transactionId === selectedTransaction.transactionId) && (
                                                <Button
                                                    as="a"
                                                    href={`/api/v1/transactions/${selectedTransaction.transactionId}/shipping-label`}
                                                    target="_blank"
                                                    className="btn-sell py-2 px-4 fw-800 rounded-pill d-flex align-items-center justify-content-center gap-2 border-0"
                                                    style={{ backgroundColor: '#10b981', fontSize: '14px' }}
                                                >
                                                    <i className="fa-solid fa-print"></i> Shipping Label
                                                </Button>
                                            )}
                                            <Button
                                                as="a"
                                                href={`/api/v1/transactions/${selectedTransaction.transactionId}/invoice`}
                                                target="_blank"
                                                variant="dark"
                                                className="py-2 px-4 fw-800 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm border-0"
                                                style={{ fontSize: '14px', backgroundColor: '#1e293b' }}
                                            >
                                                <i className="fa-solid fa-file-invoice opacity-50"></i> View Invoice
                                            </Button>
                                        </Stack>
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="mb-3 opacity-20">
                                            <i className="fa-solid fa-receipt fa-3x"></i>
                                        </div>
                                        <p className="small fw-600 text-muted px-4">
                                            Select a transaction to view documents and shipping info.
                                        </p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <ValorationModal
                show={showModal}
                onHide={() => setShowModal(false)}
                transaction={activeTransaction}
                onSubmit={handleValorationSubmit}
                isProcessing={isProcessing}
            />
        </>
    );
};

export default UserSalesOrders;