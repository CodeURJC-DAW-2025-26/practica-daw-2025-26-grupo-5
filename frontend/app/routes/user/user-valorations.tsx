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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { getValorationsDashboard } from '~/services/valorations-service'; // MVC: All API calls delegated to service
import type ValorationDTO from '~/dto/ValorationDTO';
import type TransactionDTO from '~/dto/TransactionDTO';
import { Row, Col, Card, Alert, Image, Stack, Button, Spinner } from 'react-bootstrap';

/**
 * User Valorations Component Implementation
 * 
 * Displays reviews received and pending ratings to submit.
 */
export default function UserValorations() {
  // All reviews/ratings received by current user (as seller)
  const [valorations, setValorations] = useState<ValorationDTO[]>([]);
  
  // Purchases awaiting user's rating
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);
  
  // Error message if API call fails
  const [error, setError] = useState<string | null>(null);

  const { user } = useUserStore();
  const navigate = useNavigate();

  /**
   * Check Authentication
   * 
   * Redirects to login if user not logged in.
   * Ensures only authenticated users access this page.
   */
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  /**
   * Fetch User Reviews and Pending Ratings
   * 
   * Process:
   * 1. Check if user is authenticated (skip if not)
   * 2. Fetch all received valorations (reviews)
   *    - Endpoint: /api/v1/users/me/valorations
   *    - Includes: rating, comment, buyer info, product info
   * 3. Fetch all user transactions (purchases)
  /**
   * Fetch User Reviews and Pending Ratings
   * 
   * Uses MVC pattern: Service layer handles all API communication
   * - getValorationsDashboard() from valorations-service
   * - Combines valorations + pending transactions in one call
   * - Service manages auth headers & error responses
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Service delegates to API client → handles token injection automatically
        const { valorations: valoData, pendingTransactions } = await getValorationsDashboard();
        setValorations(valoData);
        setTransactions(pendingTransactions);
        setLoading(false);
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to load reviews. Please try again.';
        setError(errorMsg);
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5 w-100">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  const completedCount = valorations.length;
  const pendingCount = transactions.length;
  const averageRating = valorations.length > 0
    ? (valorations.reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / valorations.length).toFixed(1)
    : '0.0';

  return (
    <>
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2 text-dark">My Valorations</h1>
          <p className="text-muted small fw-600 mb-0">Overview of your submitted feedback and pending actions.</p>
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
      </header>

      {error && <Alert variant="danger" className="clay-card border-0 fw-700">{error}</Alert>}

      {/* KPI Cards */}
      <Row className="g-4 mb-5">
        <Col md={6} lg={4}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body  style={{textAlign: 'center'}}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Completed Reviews</p>
              <h2 className="fw-800 text-success mb-1">Total: {completedCount}</h2>
              <span className="text-muted fw-600 small">Feedback submitted</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body  style={{textAlign: 'center'}}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Pending for Rating</p>
              <h2 className="fw-800 text-warning mb-1">Waiting: {pendingCount}</h2>
              <span className="text-muted fw-600 small">Purchases to review</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="clay-card border-0 h-100 p-3">
            <Card.Body style={{textAlign: 'center'}}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Average Rating Given</p>
              <h2 className="fw-800 text-info mb-1">{averageRating}</h2>
              <span className="text-muted fw-600 small">Your feedback score</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Valorations Section */}
      {pendingCount > 0 ? (
        <Card className="clay-card border-0 mb-5 p-3">
          <Card.Body>
            <Stack direction="horizontal" gap={3} className="align-items-center mb-4">
              <i className="fa-solid fa-hourglass-end fa-2x text-warning"></i>
              <div>
                <h5 className="fw-800 mb-1 text-dark">Pending for Rating</h5>
                <p className="text-muted small mb-0 fw-600">
                  You have {pendingCount} purchase{pendingCount === 1 ? '' : 's'} waiting for your feedback.
                </p>
              </div>
            </Stack>
            
            <Stack gap={3}>
              {transactions.map((transaction: any) => (
                <Card key={transaction.transactionId} className="bg-light border-0">
                  <Card.Body className="d-flex justify-content-between align-items-center p-3">
                    <div>
                      <h6 className="fw-800 mb-1 text-dark">{transaction.product?.name}</h6>
                      <p className="text-muted small mb-0">
                        Seller: <span className="fw-700">{transaction.seller?.name}</span>
                      </p>
                    </div>
                    <Link to="/user/sales-orders" className="text-decoration-none">
                      <Button 
                        className="fw-800 rounded-3 border-0 px-4 py-2 d-flex align-items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          fontSize: '14px',
                          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                          transition: 'all 0.3s ease'
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
                        <i className="fa-solid fa-star"></i> Rate Now
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="success" className="clay-card border-0 d-flex align-items-center gap-3 mb-5 p-4">
          <i className="fa-solid fa-check-circle fa-2x text-success"></i>
          <div>
            <h6 className="fw-800 mb-1 text-dark">All Caught Up!</h6>
            <p className="mb-0 small fw-600 text-muted">All your purchases have been rated. Great!</p>
          </div>
        </Alert>
      )}

      {/* Completed Valorations Section */}
      <Card className="clay-card border-0 p-3">
        <Card.Body>
          <h5 className="fw-800 text-dark mb-4">Feedback for Sellers</h5>
          
          {completedCount > 0 ? (
            <Stack gap={3}>
              {valorations.map((valoration: any) => (
                <Card key={valoration.id} className="bg-light border-0">
                  <Card.Body className="p-4">
                    <Row className="align-items-start">
                      <Col xs={12} sm={8}>
                        <h6 className="fw-800 mb-1 text-dark">Purchased Product</h6>
                        <p className="text-muted small mb-3">
                          Seller: <span className="fw-700">{valoration.sellerName}</span>
                        </p>
                        <div className="bg-white p-3 rounded-3 border-start border-4" style={{ borderColor: '#2f6ced' }}>
                          <p className="mb-0 small fw-600 fst-italic text-dark">"{valoration.comment}"</p>
                        </div>
                      </Col>
                      <Col xs={12} sm={4} className="text-sm-end mt-3 mt-sm-0">
                        <div className="mb-2">
                          {[...new Array(5)].map((_, i) => (
                            <i
                              key={`star-${valoration.id}-${i}`}
                              className={`fa-solid fa-star ${i < (valoration.rating || 0) ? 'text-warning' : 'text-muted'}`}
                              style={{ fontSize: '1rem', marginRight: '4px' }}
                            />
                          ))}
                        </div>
                        <span className="badge bg-white text-dark border fw-800 px-3 py-2 rounded-pill shadow-sm">{valoration.rating}/5</span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          ) : (
            <div className="text-center py-5 opacity-50">
              <i className="fa-solid fa-comment-dots fa-3x mb-3 text-muted"></i>
              <p className="fw-700 text-dark mb-0">No valorations yet. Complete a purchase and share your feedback!</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}