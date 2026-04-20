import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUserStore } from '~/stores/useUserStore';
import type ValorationDTO from '~/dto/ValorationDTO';
import type TransactionDTO from '~/dto/TransactionDTO';
import { Row, Col, Card, Alert, Image, Stack, Button, Spinner } from 'react-bootstrap';

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
        const valoResponse = await fetch('/api/v1/users/me/valorations?page=0&size=100', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

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