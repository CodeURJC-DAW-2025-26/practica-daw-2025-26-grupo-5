import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import type ValorationDTO from '~/dto/ValorationDTO';
import type TransactionDTO from '~/dto/TransactionDTO';
import { Row, Col, Alert } from 'react-bootstrap';

export default function UserValorations() {
  const [valorations, setValorations] = useState<ValorationDTO[]>([]);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch completed valorations
        const valoResponse = await fetch('/api/v1/users/me/valorations?page=0&size=100', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Fetch transactions (to find pending ones)
        const transResponse = await fetch('/api/v1/users/me/transactions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!valoResponse.ok || !transResponse.ok) {
          if (valoResponse.status === 401 || transResponse.status === 401) {
            throw new Error("Session expired.");
          }
          throw new Error("Could not load data.");
        }

        const valoData = await valoResponse.json();
        const transData = await transResponse.json();

        setValorations(valoData.content || []);
        
        // Find pending purchases (orders that haven't been rated)
        const purchasesWithValorations = new Set(
          (valoData.content || []).map((v: any) => v.transactionId)
        );
        const pendingPurchases = (transData.orders || []).filter(
          (order: any) => !purchasesWithValorations.has(order.transactionId)
        );
        
        setTransactions(pendingPurchases);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 w-100">
      <svg className="stn-loader" viewBox="25 25 50 50"><circle cx="50" cy="50" r="20"></circle></svg>
    </div>
  );

  const completedCount = valorations.length;
  const pendingCount = transactions.length;
  const averageRating = valorations.length > 0
    ? (valorations.reduce((sum: number, v: any) => sum + (v.rating || 0), 0) / valorations.length).toFixed(1)
    : '0.0';

  return (
    <main className="flex-grow-1 p-4 p-md-5 overflow-auto bg-light min-vh-100">
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 h2">My Valorations</h1>
          <p className="text-muted small">Overview of your submitted feedback and pending actions.</p>
        </div>
        {user && (
          <Link to="/user/settings">
            <img
              src={`/api/v1/users/me/profile-photo?t=${Date.now()}`}
              className="rounded-circle border border-2 shadow-sm"
              width="48"
              height="48"
              alt="Profile"
              onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
            />
          </Link>
        )}
      </header>

      {error && <div className="alert alert-danger rounded-4">{error}</div>}

      {/* KPI Cards */}
      <Row className="g-4 mb-5">
        <Col md={6} lg={4}>
          <div className="clay-card p-4 h-100">
            <p className="label-categories mb-1 text-uppercase small opacity-50">Completed Reviews</p>
            <h2 className="fw-800 text-success">Total: {completedCount}</h2>
            <span className="text-muted fw-600 small">Feedback submitted</span>
          </div>
        </Col>
        <Col md={6} lg={4}>
          <div className="clay-card p-4 h-100">
            <p className="label-categories mb-1 text-uppercase small opacity-50">Pending for Rating</p>
            <h2 className="fw-800 text-warning">Waiting: {pendingCount}</h2>
            <span className="text-muted fw-600 small">Purchases to review</span>
          </div>
        </Col>
        <Col md={6} lg={4}>
          <div className="clay-card p-4 h-100">
            <p className="label-categories mb-1 text-uppercase small opacity-50">Average Rating Given</p>
            <h2 className="fw-800 text-info">{averageRating}⭐</h2>
            <span className="text-muted fw-600 small">Your feedback score</span>
          </div>
        </Col>
      </Row>

      {/* Pending Valorations Section */}
      {pendingCount > 0 ? (
        <div className="clay-card p-4 mb-5 shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div style={{ fontSize: '1.5rem', color: '#f59e0b' }}>
              <i className="fa-solid fa-hourglass-end"></i>
            </div>
            <div>
              <h5 className="fw-800 mb-1">Pending for Rating</h5>
              <p className="text-muted small mb-0">You have {pendingCount} purchase{pendingCount !== 1 ? 's' : ''} waiting for your feedback.</p>
            </div>
          </div>
          <div className="d-flex flex-column gap-3">
            {transactions.map((transaction: any) => (
              <div key={transaction.transactionId} className="border rounded-3 p-3 d-flex justify-content-between align-items-center bg-light">
                <div>
                  <h6 className="fw-700 mb-1">{transaction.product?.name}</h6>
                  <p className="text-muted small mb-0">
                    Seller: <span className="fw-600">{transaction.seller?.name}</span>
                  </p>
                </div>
                <Link to="/user/sales-orders" className="btn-about py-2 px-3 small d-flex align-items-center gap-2">
                  <i className="fa-solid fa-star"></i> Rate Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Alert variant="success" className="rounded-4 d-flex align-items-center gap-3 mb-5">
          <div style={{ fontSize: '1.5rem' }}>
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <div>
            <h6 className="fw-800 mb-1">All Caught Up!</h6>
            <p className="mb-0 small">All your purchases have been rated. Great!</p>
          </div>
        </Alert>
      )}

      {/* Completed Valorations Section */}
      <div className="clay-card p-4 shadow-sm">
        <h5 className="fw-800 h5 mb-4">Feedback for Sellers</h5>
        
        {completedCount > 0 ? (
          <div className="d-flex flex-column gap-4">
            {valorations.map((valoration: any) => (
              <div key={valoration.id} className="border rounded-3 p-4 bg-light">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-800 mb-1">
                      Purchased: Product
                    </h6>
                    <p className="text-muted small mb-2">
                      Seller: <span className="fw-600">{valoration.sellerName}</span>
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fa-solid fa-star ${
                            i < (valoration.rating || 0) ? 'text-warning' : 'text-muted'
                          }`}
                          style={{ fontSize: '1.1rem', marginRight: '4px' }}
                        ></i>
                      ))}
                    </div>
                    <span className="badge bg-light text-dark fw-700">{valoration.rating}/5</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-2 border-start border-4" style={{ borderColor: '#2f6ced' }}>
                  <p className="mb-0 small">"{valoration.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 opacity-50">
            <i className="fa-solid fa-comment-dots fa-3x mb-3 text-muted"></i>
            <p className="small fw-600">No valorations yet. Complete a purchase and share your feedback!</p>
          </div>
        )}
      </div>
    </main>
  );
}