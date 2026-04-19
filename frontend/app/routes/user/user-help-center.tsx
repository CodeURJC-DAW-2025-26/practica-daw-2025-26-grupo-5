import { Alert, Row, Col, Card } from 'react-bootstrap';

export default function UserHelpCenter() {
  return (
    <>
      <header className="mb-5">
        <h1 className="fw-800 h2 text-dark mb-2">Help Center</h1>
        <p className="text-muted small fw-600 mb-0">Everything you need to know about Stilnovo.</p>
      </header>

      {/* Help Center Cards */}
      <Row className="g-4 mb-5">
        <Col lg={6}>
          <Card className="clay-card border-0 h-100 p-2">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="fa-solid fa-box text-primary fs-3"></i>
                <h5 className="fw-800 mb-0 text-dark">How do I sell?</h5>
              </div>
              <p className="text-muted fw-600 mb-0">
                Upload your items through <strong>'Create Listing'</strong>, set your price, and wait for buyers to contact you.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="clay-card border-0 h-100 p-2">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="fa-solid fa-lock text-primary fs-3"></i>
                <h5 className="fw-800 mb-0 text-dark">Secure Payments</h5>
              </div>
              <p className="text-muted fw-600 mb-0">
                We protect every transaction. Funds are safely held until the delivery is confirmed.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="clay-card border-0 h-100 p-2">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="fa-solid fa-id-card text-primary fs-3"></i>
                <h5 className="fw-800 mb-0 text-dark">Identity Verification</h5>
              </div>
              <p className="text-muted fw-600 mb-0">
                Use your Digital Seller Card in settings to verify your identity with other members.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="clay-card border-0 h-100 p-2">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="fa-solid fa-truck text-primary fs-3"></i>
                <h5 className="fw-800 mb-0 text-dark">Shipping Logistics</h5>
              </div>
              <p className="text-muted fw-600 mb-0">
                We provide integrated shipping labels and tracking for all design treasures.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contact Section */}
      <Card className="clay-card border-0 p-3 p-md-4 mb-5">
        <Card.Body>
          <h4 className="fw-800 text-dark mb-3">Still need help?</h4>
          <p className="text-muted fw-600 mb-4">
            Our specialized support team is available to assist you with any technical or transactional issues.
          </p>

          <Row className="g-4 mb-4">
            <Col md={6}>
              <Card className="bg-light border-0 h-100">
                <Card.Body className="p-4 text-center">
                  <i className="fa-solid fa-envelope text-primary fs-2 mb-3"></i>
                  <h6 className="fw-800 text-dark mb-2">Email Support</h6>
                  <a href="mailto:stilnovo.noreply@gmail.com" className="text-decoration-none text-primary fw-800">
                    stilnovo.noreply@gmail.com
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="bg-light border-0 h-100">
                <Card.Body className="p-4 text-center">
                  <i className="fa-solid fa-phone text-primary fs-2 mb-3"></i>
                  <h6 className="fw-800 text-dark mb-2">Phone Support</h6>
                  <a href="tel:+34678987654" className="text-decoration-none text-primary fw-800">
                    +34 678 987 654
                  </a>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Alert variant="info" className="border-0 rounded-3 mb-0 d-flex align-items-center gap-3 py-3 fw-600 shadow-sm">
            <i className="fa-solid fa-info-circle fs-4"></i>
            <span className="text-dark">
              <strong className="fw-800">Response time:</strong> Less than 24 hours
            </span>
          </Alert>
        </Card.Body>
      </Card>
    </>
  );
}