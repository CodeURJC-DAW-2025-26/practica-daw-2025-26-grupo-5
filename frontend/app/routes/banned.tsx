import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import logo from "../assets/logo.png";
import { useUserStore } from '~/stores/useUserStore';

export default function Banned() {
  const navigate = useNavigate();
  const { logoutUser, user } = useUserStore();

  // If somehow user is not banned, redirect to home
  useEffect(() => {
    if (user && !user.banned) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  if (!user || !user.banned) {
    return null; // Loading state while redirect happens
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header className="navbar container-fluid px-lg-5 py-3" style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div className="logo-wrapper">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <img src={logo} alt="Stilnovo" className="logo-img" width="35" />
            <span className="brand fw-800">Stilnovo</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container d-flex align-items-center justify-content-center flex-grow-1 py-5">
        <div className="clay-card p-5 bg-white" style={{ maxWidth: '520px', width: '100%' }}>
          
          {/* Icon Circle */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <i className="fa-solid fa-ban" style={{ fontSize: '3rem', color: '#dc2626' }} />
          </div>

          {/* Heading */}
          <h1 className="fw-800 text-center mb-3" style={{ fontSize: '28px', color: '#111827' }}>
            Account Suspended
          </h1>
          
          {/* Main Message */}
          <p className="text-center text-muted mb-4" style={{ fontSize: '15px', lineHeight: '1.6' }}>
            Your account has been temporarily suspended. We take community guidelines seriously to maintain a safe and respectful marketplace for all users.
          </p>

          {/* Info Box */}
          <div className="alert" style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p className="mb-2" style={{ fontSize: '13px', fontWeight: '600', color: '#7f1d1d' }}>
              <i className="fa-solid fa-circle-info me-2" />
              Why was my account suspended?
            </p>
            <p className="mb-0" style={{ fontSize: '13px', color: '#991b1b', lineHeight: '1.5' }}>
              Your account was suspended due to activity that violates our Terms of Service or Community Guidelines. If you believe this was a mistake, our support team is here to help.
            </p>
          </div>

          {/* User Info */}
          <div className="text-center mb-4">
            <p className="small text-muted mb-1">Suspended User</p>
            <p className="fw-700" style={{ fontSize: '16px' }}>{user.name}</p>
            <p className="small text-muted">{user.email}</p>
          </div>

          {/* Actions */}
          <div className="d-flex flex-column gap-2 mb-4">
            <button 
              onClick={handleLogout}
              className="btn fw-600 py-2"
              style={{ 
                backgroundColor: '#dc2626', 
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <i className="fa-solid fa-sign-out-alt me-2" />
              Logout
            </button>
            
            <a 
              href="mailto:stilnovo.noreply@gmail.com" 
              className="btn py-2"
              style={{ 
                backgroundColor: '#f3f4f6', 
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <i className="fa-solid fa-envelope me-2" />
              Appeal Suspension
            </a>
          </div>

          {/* Footer Message */}
          <p className="text-center small text-muted" style={{ fontSize: '12px' }}>
            Questions? Email us at <strong>stilnovo.noreply@gmail.com</strong>
          </p>
        </div>
      </main>

      {/* Footer Spacing */}
      <footer className="mt-auto py-4 text-center text-muted small" style={{ backgroundColor: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <p className="mb-0">© 2026 Stilnovo. All rights reserved.</p>
      </footer>
    </div>
  );
}
