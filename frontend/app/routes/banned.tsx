import { Link } from 'react-router';
import logo from "../assets/logo.png";
import Footer from '~/components/footer';

export default function Banned() {
  return (
    <>
      <div className="auth-page">
        <header className="navbar container-fluid px-lg-5 py-3 header-border-line bg-white">
          <div className="logo-wrapper">
            <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
              <img src={logo} alt="Stilnovo" className="logo-img" width="35" />
              <span className="brand">Stilnovo</span>
            </Link>
          </div>
        </header>

        <div className="hero-wrapper auth-background">
          <main className="container d-flex align-items-center justify-content-center flex-grow-1">
            <div className="auth-card clay-card p-5 bg-white text-center" style={{ maxWidth: '500px', width: '100%' }}>
              
              <div className="mb-4">
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <i className="fa-solid fa-ban" style={{ fontSize: '2.5rem', color: '#dc2626' }} />
                </div>
              </div>

              <h2 className="fw-800 mb-2">Account Suspended</h2>
              <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                Your account has been suspended due to a violation of our community guidelines.
              </p>

              <div className="alert alert-light border-1" style={{ backgroundColor: '#f9fafb' }}>
                <p className="small mb-2 text-muted"><strong>Why was this action taken?</strong></p>
                <p className="small text-muted mb-0">
                  If you believe this suspension is a mistake, please contact our support team with details about your appeal.
                </p>
              </div>

              <div className="mt-5 d-flex gap-2">
                <Link 
                  to="/login" 
                  className="btn btn-outline-secondary flex-grow-1"
                >
                  <i className="fa-solid fa-arrow-left me-2" />
                  Back to Login
                </Link>
                <a 
                  href="mailto:support@stilnovo.com" 
                  className="btn btn-primary flex-grow-1"
                >
                  <i className="fa-solid fa-envelope me-2" />
                  Contact Support
                </a>
              </div>

              <p className="small text-muted mt-4 mb-0">
                If you need help, email us at <strong>support@stilnovo.com</strong>
              </p>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}
