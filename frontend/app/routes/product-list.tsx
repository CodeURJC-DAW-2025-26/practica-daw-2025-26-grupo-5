import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/product-list";
import { getProducts } from "~/services/products-service";
import type ProductDTO from "~/dtos/ProductDTO";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";

/**
 * Client-side loader: Fetches products before rendering the component
 * This runs before the component mounts, so data is available immediately
 * Falls back to empty array if backend is unavailable
 */
export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    return await getProducts();
  } catch (error) {
    console.warn("Failed to fetch products, showing empty list:", error);
    return [];
  }
}

/**
 * Product List Component
 * Displays all available products in a grid layout
 */
export default function ProductsList({ loaderData }: Route.ComponentProps) {
  const products = loaderData as ProductDTO[];
  const { user } = useUserStore();

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mt-4 mb-4">Products</h2>

      <Row xs={1} md={3} className="g-4">
        {products.map((product: ProductDTO) => (
          <Col key={product.id}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>
                  <Link
                    to={`/product/${product.id}`}
                    className="text-decoration-none text-dark"
                  >
                    {product.name}
                  </Link>
                </Card.Title>
                <Card.Text className="text-muted">
                  ${product.price.toFixed(2)}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {user && (
        <div className="mt-4">
          <Button as={Link as any} to="/product-new" variant="primary">
            Create New Product
          </Button>
        </div>
      )}
    </Container>
  );
}
