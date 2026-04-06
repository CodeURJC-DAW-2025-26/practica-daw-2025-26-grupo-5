import { Container, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router";

/**
 * 404 Not Found Page
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container className="mt-4">
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>404 - Page not found</p>
        <Button variant="outline-danger" onClick={() => navigate("/")}>
          Back to home
        </Button>
      </Alert>
    </Container>
  );
}
