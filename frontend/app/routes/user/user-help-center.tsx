import { Alert } from 'react-bootstrap';

export default function UserHelpCenter() {
  return (
    <>
      <h1 className="fw-800 h2 mb-2">Help Center</h1>
      <p className="text-muted small mb-5">Everything you need to know about Stilnovo.</p>

      {/* Help Center Cards */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div className="clay-card p-4 rounded-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <i className="fa-solid fa-box text-primary fs-4"></i>
              <h5 className="fw-800 mb-0">How do I sell?</h5>
            </div>
            <p className="text-muted mb-0">
              Upload your items through <strong>'Create Listing'</strong>, set your price, and wait for buyers to contact you.
            </p>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="clay-card p-4 rounded-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <i className="fa-solid fa-lock text-primary fs-4"></i>
              <h5 className="fw-800 mb-0">Secure Payments</h5>
            </div>
            <p className="text-muted mb-0">
              We protect every transaction. Funds are safely held until the delivery is confirmed.
            </p>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="clay-card p-4 rounded-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <i className="fa-solid fa-id-card text-primary fs-4"></i>
              <h5 className="fw-800 mb-0">Identity Verification</h5>
            </div>
            <p className="text-muted mb-0">
              Use your Digital Seller Card in settings to verify your identity with other members.
            </p>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="clay-card p-4 rounded-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <i className="fa-solid fa-truck text-primary fs-4"></i>
              <h5 className="fw-800 mb-0">Shipping Logistics</h5>
            </div>
            <p className="text-muted mb-0">
              We provide integrated shipping labels and tracking for all design treasures.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="clay-card p-4 p-md-5 rounded-4">
        <h4 className="fw-800 mb-4">Still need help?</h4>
        <p className="text-muted mb-4">
          Our specialized support team is available to assist you with any technical or transactional issues.
        </p>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="border border-light p-3 rounded-3">
              <i className="fa-solid fa-envelope text-primary fs-4 mb-3 d-block"></i>
              <h6 className="fw-800 mb-2">Email Support</h6>
              <a href="mailto:stilnovo.noreply@gmail.com" className="text-decoration-none text-primary fw-700">
                stilnovo.noreply@gmail.com
              </a>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border border-light p-3 rounded-3">
              <i className="fa-solid fa-phone text-primary fs-4 mb-3 d-block"></i>
              <h6 className="fw-800 mb-2">Phone Support</h6>
              <a href="tel:+34678987654" className="text-decoration-none text-primary fw-700">
                +34 678 987 654
              </a>
            </div>
          </div>
        </div>

        <Alert variant="info" className="rounded-3 mb-0 d-flex align-items-center gap-2 small">
          <i className="fa-solid fa-info-circle"></i>
          <strong>Response time:</strong> Less than 24 hours
        </Alert>
      </div>
    </>
  );
}
