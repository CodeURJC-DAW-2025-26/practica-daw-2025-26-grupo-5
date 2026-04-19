import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { Container, Row, Col, Button, Stack, Image, Card } from "react-bootstrap";
import logo from "../assets/logo.png";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  let status = 500;
  let title = "Server Error";
  let message = "Something went wrong on our end. Our tech treasures are being polished.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (status === 404) {
      title = "Not Found";
      message = "We couldn't find the treasure you were looking for, but the marketplace is still full of history.";
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="clay-card border-0 p-5 text-center">
              <Card.Body>
                <div className="mb-5 d-flex justify-content-center">
                  <div className="d-flex align-items-center justify-content-center bg-light shadow-sm rounded-4" style={{ width: '100px', height: '100px' }}>
                    <Image src={logo} alt="Stilnovo" width="60" />
                  </div>
                </div>

                <h1 className="fw-800 text-danger mb-2" style={{ fontSize: '72px', letterSpacing: '-2px' }}>{status}</h1>
                <h2 className="fw-800 text-dark mb-4" style={{ fontSize: '32px' }}>{title}</h2>
                <p className="text-muted fw-600 mb-5 px-md-4" style={{ lineHeight: '1.6' }}>{message}</p>

                <Stack direction="horizontal" gap={3} className="justify-content-center flex-wrap">
                  <Button variant="primary" className="fw-700 px-4 py-3 rounded-pill shadow-sm" style={{ backgroundColor: '#2f6ced', border: 'none' }} onClick={() => navigate("/")}>
                    <i className="fa-solid fa-house me-2"></i> Back to Homepage
                  </Button>
                  <Button variant="outline-secondary" className="fw-700 px-4 py-3 rounded-pill border-2" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-arrow-left me-2"></i> Go Back
                  </Button>
                </Stack>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}