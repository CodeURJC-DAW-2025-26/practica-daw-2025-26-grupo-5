/**
 * User Valorations / Received Reviews Page
 *
 * Displays reviews/ratings that other buyers have left for the current user (as seller).
 * Shows feedback received and pending ratings from purchases.
 *
 * Features:
 * - Header with user profile photo link to settings
 * - Summary statistics cards:
 *    - Completed reviews: Number of ratings received
 *    - Pending reviews: Purchases awaiting rating
 *    - Average rating: Calculated from all reviews
 * - Completed Reviews section:
 *    - Shows all ratings and comments from buyers
 *    - Displays rating (1-5 stars)
 *    - Buyer name and review text
 *    - Product name (what was being reviewed)
 *    - Date of review
 *    - Seller can respond to reviews (if implemented)
 * - Pending Purchases section:
 *    - Shows unrated purchases requiring seller rating
 *    - Buyer name and purchase details
 *    - "Rate" button to submit feedback
 *    - Helps complete transaction record
 * - Empty state messages:
 *    - "No reviews yet" when no valorations
 *    - "All purchases rated" when no pending
 *
 * Data Flow:
 * 1. User navigates to /user/valorations
 * 2. Authentication check: If not logged in, redirect to /login
 * 3. Fetch two data sources:
 *    - GET /api/v1/users/me/valorations?page=0&size=100 (received reviews)
 *    - GET /api/v1/users/me/transactions (all purchases)
 * 4. Combine data:
 *    - Extract transaction IDs from valorations
 *    - Filter transactions to find pending ones (not in valoration list)
 * 5. Display summary stats:
 *    - completedCount: Length of valorations array
 *    - pendingCount: Length of pending transactions
 *    - averageRating: Sum all ratings / count
 * 6. Render two sections:
 *    - Completed: Display all received reviews
 *    - Pending: Display unrated purchases with "Rate" button
 * 7. User can click "Rate" to open rating modal
 *
 * API Endpoints:
 * - GET /api/v1/users/me/valorations: Fetch all reviews received
 *    - Returns: { content: ValorationDTO[] }
 *    - Each: { rating, comment, buyerName, productName, transactionId, date }
 * - GET /api/v1/users/me/transactions: Fetch all transactions
 *    - Returns: { orders: TransactionDTO[] }
 *    - Each: { transactionId, buyerName, productName, purchaseDate }
 *
 * Authentication:
 * - Requires Bearer token in header
 * - Redirects to login if not authenticated
 * - Session expiration check (401 response)
 *
 * State Management:
 * - valorations: Array of received reviews
 * - transactions: Array of pending purchases needing rating
 * - loading: True while fetching data
 * - error: Error message if API call fails
 *
 * Error Handling:
 * - Catches API errors (network, 401, 500)
 * - Displays user-friendly error messages
 * - Shows loading spinner during fetch
 * - Graceful fallback with empty lists
 *
 * Statistics Calculation:
 * - Completed count: valorations.length
 * - Pending count: transactions.length (filtered)
 * - Average rating: sum(ratings) / count (rounded to 1 decimal)
 *
 * Styling:
 * - Responsive layout (single column mobile, multi-column desktop)
 * - Card-based design for reviews
 * - Star rating visualization
 * - Color-coded pending vs completed
 *
 * @component
 * @returns Page displaying received reviews and pending ratings
 */

import { useState, useEffect } from 'react';
import { redirect, Link, useLoaderData, useNavigate } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { 
  getUserValorations, 
  deleteValoration, 
  updateValoration, 
  createValoration 
} from '~/services/valorations-service';
import { getTransactions } from '~/services/transaction-service';
import { Alert, Row, Col, Card, Badge, Button, Image, Stack } from 'react-bootstrap';
import ValorationModal from '~/components/ValorationModal';
import ConfirmModal from '~/components/ConfirmModal'; // Ensure this path is correct
import type ValorationDTO from '~/dto/ValorationDTO';

/**
 * Loader to fetch initial data for the valorations dashboard.
 */
export async function clientLoader() {
  const currentUser = useUserStore.getState().user;
  if (!currentUser) throw redirect('/login');

  const [valoData, transData] = await Promise.all([
    getUserValorations(),
    getTransactions()
  ]);

  const valorations = valoData?.content || [];
  const ratedTransactionIds = new Set(valorations.map((v: ValorationDTO) => v.transactionId));
  const pendingTransactions = (transData?.orders || []).filter(
    (order: any) => !ratedTransactionIds.has(order.transactionId)
  );

  return { valorations, pendingTransactions, date: Date.now() };
}

export default function UserValorations() {
  const loaderData = useLoaderData() as any;
  const { user } = useUserStore();
  const navigate = useNavigate();

  // --- STATE ---
  const [valorations, setValorations] = useState<ValorationDTO[]>(loaderData.valorations);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>(loaderData.pendingTransactions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedValoration, setSelectedValoration] = useState<ValorationDTO | null>(null);
  const [activeTransaction, setActiveTransaction] = useState<any>(null);

  // Delete Confirmation States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // Sync state with loader data
  useEffect(() => {
    setValorations(loaderData.valorations);
    setPendingTransactions(loaderData.pendingTransactions);
  }, [loaderData]);

  /**
   * Refreshes the page data using React Router's navigation
   */
  const refreshData = () => {
    navigate('.', { replace: true });
  };

  // --- ACTIONS ---

  const handleRateClick = (transaction: any) => {
    setActiveTransaction(transaction);
    setSelectedValoration(null);
    setShowModal(true);
  };

  const handleEditClick = (v: ValorationDTO) => {
    const transaction = {
      transactionId: v.transactionId,
      product: { name: "Purchased Product" },
      seller: { name: v.sellerName }
    };
    setActiveTransaction(transaction);
    setSelectedValoration(v);
    setShowModal(true);
  };

  const handleModalSubmit = async (rating: number, comment: string) => {
    setIsProcessing(true);
    try {
      if (selectedValoration) {
        await updateValoration(selectedValoration.id, { rating, comment });
      } else {
        await createValoration({
          rating,
          comment,
          buyerName: user?.name || "Buyer",
          transactionId: activeTransaction.transactionId
        });
      }
      setShowModal(false);
      refreshData();
    } catch (err) {
      setError("Operation failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Opens the confirmation modal
   */
  const handleDeleteClick = (id: number) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  /**
   * Executes the deletion after confirmation
   */
  const handleConfirmDelete = async () => {
    if (!idToDelete || isProcessing) return;

    setIsProcessing(true);
    try {
      await deleteValoration(idToDelete);
      setShowDeleteModal(false);
      setIdToDelete(null);
      refreshData();
    } catch (err) {
      setError("Delete failed.");
      setShowDeleteModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- CALCULATIONS ---
  const completedCount = valorations.length;
  const pendingCount = pendingTransactions.length;
  const averageRating = completedCount > 0 
    ? (valorations.reduce((acc, v) => acc + (v.rating || 0), 0) / completedCount).toFixed(1) 
    : "0.0";

  return (
    <>
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2 text-dark">My Valorations</h1>
          <p className="text-muted small fw-600 mb-0">Overview of your feedback and pending actions.</p>
        </div>
        {user && (
          <Link to="/user/settings">
            <Image
              src={`/api/v1/users/me/profile-photo?t=${loaderData.date}`}
              className="rounded-circle border border-2 shadow-sm"
              width={48} height={48}
              onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
            />
          </Link>
        )}
      </header>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible className="rounded-4 border-0">{error}</Alert>}

      {/* KPI Cards */}
      <Row className="g-4 mb-5">
        <Col md={4}><Card className="clay-card border-0 p-3 text-center shadow-sm"><Card.Body>
          <p className="text-muted small fw-700 mb-2">Completed</p>
          <h2 className="fw-800 text-success mb-0">{completedCount}</h2>
        </Card.Body></Card></Col>
        <Col md={4}><Card className="clay-card border-0 p-3 text-center shadow-sm"><Card.Body>
          <p className="text-muted small fw-700 mb-2">Pending</p>
          <h2 className="fw-800 text-warning mb-0">{pendingCount}</h2>
        </Card.Body></Card></Col>
        <Col md={4}><Card className="clay-card border-0 p-3 text-center shadow-sm"><Card.Body>
          <p className="text-muted small fw-700 mb-2">Avg. Score</p>
          <h2 className="fw-800 text-info mb-0">{averageRating}</h2>
        </Card.Body></Card></Col>
      </Row>

      {/* Pending Section */}
      {pendingCount > 0 && (
        <Card className="clay-card border-0 mb-5 p-3 shadow-sm">
          <Card.Body>
            <h5 className="fw-800 text-dark mb-4 text-center">Awaiting Your Review</h5>
            <Stack gap={3}>
              {pendingTransactions.map((t: any) => (
                <Card key={t.transactionId} className="bg-light border-0 rounded-4 p-2">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-800 mb-0 text-dark">{t.product?.name || `Order #${t.transactionId}`}</h6>
                      <small className="text-muted fw-600">Seller: {t.seller?.name}</small>
                    </div>
                    <Button 
                      className="btn-stilnovo-rate rounded-pill px-4 fw-800 shadow-sm border-0" 
                      onClick={() => handleRateClick(t)}
                    >
                      <i className="fa-solid fa-star me-2 text-warning"></i> RATE NOW
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          </Card.Body>
        </Card>
      )}

      {/* History Section */}
      <Card className="clay-card border-0 p-3 shadow-sm">
        <Card.Body>
          <h5 className="fw-800 text-dark mb-4 text-center">Feedback History</h5>
          {completedCount > 0 ? (
            <Stack gap={3}>
              {valorations.map((v: ValorationDTO) => (
                <Card key={v.id} className="bg-light border-0 rounded-4">
                  <Card.Body className="p-4">
                    <Row className="align-items-start">
                      <Col xs={12} sm={8}>
                        <h6 className="fw-800 mb-1 text-dark">Purchased Product</h6>
                        <p className="text-muted small mb-3">Seller: <span className="fw-700">{v.sellerName}</span></p>
                        <div className="bg-white p-3 rounded-4 border-start border-4 shadow-sm" style={{ borderColor: '#2f6ced' }}>
                          <p className="mb-0 small fw-600 fst-italic text-dark">"{v.comment}"</p>
                        </div>
                      </Col>
                      <Col xs={12} sm={4} className="text-sm-end mt-3 mt-sm-0 d-flex flex-column align-items-sm-end">
                        <div className="mb-2">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star ${i < v.rating ? 'text-warning' : 'text-muted-light'}`} style={{ fontSize: '1rem', marginRight: '4px' }} />
                          ))}
                        </div>
                        <Badge bg="white" text="dark" className="border fw-800 px-3 py-2 rounded-pill shadow-sm mb-3">{v.rating}/5</Badge>
                        
                        {/* SQUARE ACTION BUTTONS */}
                        <Stack direction="horizontal" gap={2} className="justify-content-end">
                          <Button 
                            variant="outline-secondary" size="sm" 
                            className="d-flex align-items-center justify-content-center border-0 bg-light shadow-sm" 
                            style={{ width: '40px', height: '40px', borderRadius: '8px' }} 
                            onClick={() => handleEditClick(v)}
                          >
                            <i className="fa-solid fa-pen-to-square text-secondary"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" size="sm" 
                            className="d-flex align-items-center justify-content-center border-0 shadow-sm" 
                            style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fef2f2' }} 
                            onClick={() => handleDeleteClick(v.id)}
                          >
                            <i className="fa-solid fa-trash-can text-danger"></i>
                          </Button>
                        </Stack>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          ) : (
            <div className="text-center py-5 opacity-50"><p className="fw-700 text-dark mb-0">No feedback submitted yet.</p></div>
          )}
        </Card.Body>
      </Card>

      {/* --- MODALS --- */}

      {/* Edit/Create Valoration Modal */}
      {activeTransaction && (
        <ValorationModal 
          show={showModal}
          onHide={() => { setShowModal(false); setActiveTransaction(null); }}
          transaction={activeTransaction} 
          onSubmit={handleModalSubmit}
          isProcessing={isProcessing}
          initialData={selectedValoration} 
        />
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        show={showDeleteModal}
        title="Remove Valoration"
        message="Are you sure you want to remove this review? The transaction will return to your pending list so you can rate it again later."
        confirmText="Remove & Reset"
        cancelText="Keep Review"
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isProcessing && setShowDeleteModal(false)}
      />
    </>
  );
}