import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { Container, Row, Col, Button, Stack } from "react-bootstrap";
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
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f9fafb' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} className="text-center">
            {/* LOGO */}
            <div className="mb-5 d-flex justify-content-center">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '12px',
                  backgroundColor: '#f3f4f6',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <img src={logo} alt="Stilnovo" width="60" />
              </div>
            </div>

            {/* CONTENT */}
            <div>
              <h1 className="fw-800 mb-2" style={{ fontSize: '72px', color: '#dc2626' }}>
                {status}
              </h1>
              <h2 className="fw-800 text-dark mb-4" style={{ fontSize: '32px' }}>
                {title}
              </h2>

              <p className="text-muted fw-500 fs-6 mb-5" style={{ lineHeight: '1.6' }}>
                {message}
              </p>

              {/* BUTTONS */}
              <Stack direction="horizontal" gap={3} className="justify-content-center flex-wrap">
                <Button
                  variant="primary"
                  className="fw-600 px-4 py-2"
                  onClick={() => navigate("/")}
                >
                  <i className="fa-solid fa-house me-2"></i>
                  Back to Homepage
                </Button>

                <Button
                  variant="outline-primary"
                  className="fw-600 px-4 py-2"
                  onClick={() => navigate(-1)}
                >
                  <i className="fa-solid fa-arrow-left me-2"></i>
                  Go Back
                </Button>
              </Stack>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}