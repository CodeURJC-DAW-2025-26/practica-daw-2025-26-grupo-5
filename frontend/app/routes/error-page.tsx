/**
 * Error Page Component
 *
 * Fallback page displayed when route errors occur or page not found.
 * Provides user-friendly error messages with navigation options.
 *
 * Features:
 * - Displays error status code (404, 500, etc.)
 * - Shows descriptive error message based on status
 * - Stilnovo logo/branding
 * - Navigation buttons:
 *    - "Back to Homepage" → Navigate to root
 *    - "Go Back" → Browser back navigation
 * - Responsive card layout
 * - Centered on page
 *
 * Error Handling:
 * - Detects if error is a RouteErrorResponse
 * - Shows specific message for 404 (Not Found)
 * - Shows generic message for other errors (500+)
 * - Default: 500 Server Error
 *
 * Messages:
 * - 404: "We couldn't find the treasure you were looking for..."
 * - 500+: "Something went wrong on our end. Our tech treasures..."
 * - Both maintain Stilnovo marketplace branding/tone
 *
 * Navigation Options:
 * - "Back to Homepage": Reliable way back to main page
 * - "Go Back": Browser history button
 * - Both prevent user frustration
 *
 * Use Cases:
 * - Route not found (404)
 * - Server error (500+)
 * - Route resolution fails
 * - Any unhandled error in React Router
 *
 * Styling:
 * - Clay-card design consistent with app
 * - Full viewport height (min-vh-100)
 * - Centered layout with flexbox
 * - Large error number (72px) for visibility
 * - Light background
 *
 * Accessibility:
 * - Semantic HTML (heading structure)
 * - Clear error description
 * - Multiple navigation paths
 * - Button styling for easy interaction
 *
 * @component
 * @returns React component for error pages
 */

import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { Container, Row, Col, Button, Stack, Image, Card } from "react-bootstrap";
import logo from "../assets/logo.png";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error: any = useRouteError(); // We use any to access custom properties easily

  // Default values for unexpected cases
  let status = 500;
  let title = "Server Error";
  let message = "Something went wrong on our end. Our tech treasures are being polished.";

  /**
   * CASE 1: Standard React Router Response Errors
   * Triggered by: throw new Response() or 404 Route Not Found
   */
  if (isRouteErrorResponse(error)) {
    status = error.status;

    if (status === 404) {
      title = "Not Found";
      // error.data often contains the message thrown from the loader
      message = typeof error.data === 'string' ? error.data : "We couldn't find the treasure you were looking for.";
    } else if (status === 403) {
      title = "Access Denied";
      message = error.data || "You do not have permission to view this resource.";
    } else if (status === 401) {
      title = "Unauthorized";
      message = "Please log in to access this page.";
    } else {
      title = error.statusText || title;
    }
  }
  /**
   * CASE 2: Custom API Errors (HttpError) or objects with status
   * Triggered by: throw new HttpError() in services or loaders
   */
  else if (error && typeof error === 'object' && 'status' in error) {
    status = error.status;
    message = error.message || message;

    if (status === 404) title = "Resource Not Found";
    if (status === 403) title = "Forbidden Access";
  }
  /**
   * CASE 3: Generic JavaScript Errors
   * Triggered by: Reference errors, undefined variables, etc.
   */
  else if (error instanceof Error) {
    message = error.message;
  }
  /**
   * CASE 4: Fallback for null/undefined errors
   * Usually happens if someone navigates to the error route directly
   */
  else if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
    status = 404;
    title = "Not Found";
    message = "The page you are looking for does not exist in our records.";
  }

  // Helper for conditional styling (e.g., icons or colors)
  const isForbidden = status === 403;

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="clay-card border-0 p-5 text-center shadow-sm">
              <Card.Body>
                {/* Branding Icon */}
                <div className="mb-5 d-flex justify-content-center">
                  <div className="d-flex align-items-center justify-content-center bg-light shadow-sm rounded-4" style={{ width: '100px', height: '100px' }}>
                    {isForbidden ? (
                      <i className="fa-solid fa-shield-halved text-danger" style={{ fontSize: '50px' }}></i>
                    ) : (
                      <Image src={logo} alt="Stilnovo" width="60" />
                    )}
                  </div>
                </div>

                {/* Big Status Number */}
                <h1 className="fw-800 text-danger mb-2" style={{ fontSize: '72px', letterSpacing: '-2px' }}>
                  {status}
                </h1>

                {/* Dynamic Title and Message */}
                <h2 className="fw-800 text-dark mb-4" style={{ fontSize: '32px' }}>{title}</h2>
                <p className="text-muted fw-600 mb-5 px-md-4" style={{ lineHeight: '1.6' }}>{message}</p>

                {/* Navigation Actions */}
                <Stack direction="horizontal" gap={3} className="justify-content-center flex-wrap">
                  <Button
                    variant="primary"
                    className="fw-700 px-4 py-3 rounded-pill shadow-sm border-0"
                    style={{ backgroundColor: '#2f6ced' }}
                    onClick={() => navigate("/")}
                  >
                    <i className="fa-solid fa-house me-2"></i> Back to Homepage
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="fw-700 px-4 py-3 rounded-pill border-2"
                    onClick={() => navigate(-1)}
                  >
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