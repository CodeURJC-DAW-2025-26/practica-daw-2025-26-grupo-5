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

import { useState } from 'react';
import { redirect, Link, useNavigate, useLoaderData } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import { getUserValorations } from '~/services/valorations-service';
import { getTransactions } from '~/services/transaction-service';
import { Alert, Row, Col, Card, Badge, Button, Image, Stack, Spinner } from 'react-bootstrap';
import type ValorationDTO from '~/dto/ValorationDTO';
import type TransactionDTO from '~/dto/TransactionDTO';

/**
 * Client-side loader: Fetch and Format User Valorations and Pending Transactions
 * * Process:
 * 1. Validate session.
 * 2. Fetch valorations and transactions in parallel.
 * 3. Filter transactions to find only those awaiting a rating.
 * 4. Calculate stats (averages and counts).
 */
export async function clientLoader() {
  const currentUser = useUserStore.getState().user;
  if (!currentUser) throw redirect('/login');

  try {
    // 1. Parallel fetching for better performance
    const [valoData, transData] = await Promise.all([
      getUserValorations(),
      getTransactions()
    ]);

    const valorations = valoData.content || [];

    // 2. Identify pending ratings
    // Logic: Transactions in 'orders' that don't have a matching ID in valorations
    const ratedTransactionIds = new Set(valorations.map((v: any) => v.transactionId));
    const pendingTransactions = (transData.orders || []).filter(
      (order: any) => !ratedTransactionIds.has(order.transactionId)
    );

    // 3. Calculate statistics
    const averageRating = valorations.length > 0
      ? (valorations.reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / valorations.length).toFixed(1)
      : '0.0';

    return {
      valorations,
      pendingTransactions,
      averageRating,
      completedCount: valorations.length,
      pendingCount: pendingTransactions.length,
      date: Date.now()
    };
  } catch (error: any) {
    if (error.status === 401 || error.response?.status === 401) {
      useUserStore.getState().setUser(null);
      throw redirect('/login');
    }
    console.error("Error in Valorations Loader:", error);
    throw error;
  }
}

/**
 * User Valorations Component Implementation
 * * Displays reviews submitted by the user and identifies pending purchases to rate.
 */
export default function UserValorations() {
  const loaderData = useLoaderData() as any;
  const { user } = useUserStore();

  // Note: Local state 'loading' and 'useEffect' are removed as data is now provided by loaderData.
  const { valorations, pendingTransactions, averageRating, completedCount, pendingCount } = loaderData;

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
              src={`/api/v1/users/me/profile-photo?t=${loaderData.date}`}
              className="rounded-circle border border-2 shadow-sm"
              width={48}
              height={48}
              alt="Profile"
              onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
            />
          </Link>
        )}
      </header>

      {/* KPI Cards */}
      <Row className="g-4 mb-5">
        <Col md={6} lg={4}>
          <Card className="clay-card border-0 h-100 p-3 shadow-sm">
            <Card.Body style={{ textAlign: 'center' }}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Completed Reviews</p>
              <h2 className="fw-800 text-success mb-1">Total: {completedCount}</h2>
              <span className="text-muted fw-600 small">Feedback submitted</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="clay-card border-0 h-100 p-3 shadow-sm">
            <Card.Body style={{ textAlign: 'center' }}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Pending for Rating</p>
              <h2 className="fw-800 text-warning mb-1">Waiting: {pendingCount}</h2>
              <span className="text-muted fw-600 small">Purchases to review</span>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="clay-card border-0 h-100 p-3 shadow-sm">
            <Card.Body style={{ textAlign: 'center' }}>
              <p className="text-muted small fw-700 mb-2" style={{ letterSpacing: '0.5px' }}>Average Rating Given</p>
              <h2 className="fw-800 text-info mb-1">{averageRating}</h2>
              <span className="text-muted fw-600 small">Your feedback score</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Valorations Section */}
      {pendingCount > 0 ? (
        <Card className="clay-card border-0 mb-5 p-3 shadow-sm">
          <Card.Body>
            <Stack direction="horizontal" gap={3} className="align-items-center mb-4">
              <div className="bg-warning-light p-3 rounded-circle">
                <i className="fa-solid fa-hourglass-end fa-xl text-warning"></i>
              </div>
              <div>
                <h5 className="fw-800 mb-1 text-dark">Pending for Rating</h5>
                <p className="text-muted small mb-0 fw-600">
                  You have {pendingCount} purchase{pendingCount === 1 ? '' : 's'} waiting for your feedback.
                </p>
              </div>
            </Stack>

            <Stack gap={3}>
              {pendingTransactions.map((transaction: any) => (
                <Card key={transaction.transactionId} className="bg-light border-0 rounded-4">
                  <Card.Body className="d-flex justify-content-between align-items-center p-3">
                    <div>
                      <h6 className="fw-800 mb-1 text-dark">{transaction.product?.name}</h6>
                      <p className="text-muted small mb-0">
                        Seller: <span className="fw-700">{transaction.seller?.name}</span>
                      </p>
                    </div>
                    <Link to="/user/sales-orders" className="text-decoration-none">
                      <Button
                        className="btn-stilnovo-rate d-flex align-items-center gap-2 fw-800 rounded-pill px-4 py-2 shadow-sm"
                        style={{ fontSize: '14px', whiteSpace: 'nowrap' }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <i className="fa-solid fa-star" style={{ color: '#F59E0B' }} /> Rate Now
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="success" className="clay-card border-0 d-flex align-items-center gap-3 mb-5 p-4 shadow-sm rounded-4">
          <i className="fa-solid fa-check-circle fa-2x text-success"></i>
          <div>
            <h6 className="fw-800 mb-1 text-dark">All Caught Up!</h6>
            <p className="mb-0 small fw-600 text-muted">All your purchases have been rated. Great!</p>
          </div>
        </Alert>
      )}

      {/* Completed Valorations Section */}
      <Card className="clay-card border-0 p-3 shadow-sm">
        <Card.Body>
          <h5 className="fw-800 text-dark mb-4">Feedback for Sellers</h5>

          {completedCount > 0 ? (
            <Stack gap={3}>
              {valorations.map((valoration: any) => (
                <Card key={valoration.id} className="bg-light border-0 rounded-4">
                  <Card.Body className="p-4">
                    <Row className="align-items-start">
                      <Col xs={12} sm={8}>
                        <h6 className="fw-800 mb-1 text-dark">Purchased Product</h6>
                        <p className="text-muted small mb-3">
                          Seller: <span className="fw-700">{valoration.sellerName}</span>
                        </p>
                        <div className="bg-white p-3 rounded-4 border-start border-4 shadow-sm" style={{ borderColor: '#2f6ced' }}>
                          <p className="mb-0 small fw-600 fst-italic text-dark">"{valoration.comment}"</p>
                        </div>
                      </Col>
                      <Col xs={12} sm={4} className="text-sm-end mt-3 mt-sm-0">
                        <div className="mb-2">
                          {[...new Array(5)].map((_, i) => (
                            <i
                              key={`star-${valoration.id}-${i}`}
                              className={`fa-solid fa-star ${i < (valoration.rating || 0) ? 'text-warning' : 'text-muted-light'}`}
                              style={{ fontSize: '1rem', marginRight: '4px' }}
                            />
                          ))}
                        </div>
                        <Badge bg="white" text="dark" className="border fw-800 px-3 py-2 rounded-pill shadow-sm">
                          {valoration.rating}/5
                        </Badge>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          ) : (
            <div className="text-center py-5 opacity-50">
              <i className="fa-solid fa-comment-dots fa-3x mb-3 text-muted"></i>
              <p className="fw-700 text-dark mb-0">No valorations yet. Complete a purchase to share your feedback!</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}