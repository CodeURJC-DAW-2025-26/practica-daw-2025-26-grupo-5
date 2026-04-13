import { Link } from "react-router";
import type { Route } from "./+types/product-list";
import { getProducts } from "~/services/products-service";
import type ProductDTO from "~/dto/ProductDTO";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";

/**
 * Optimization: Prevent the list from reloading when coming back from a product.
 * This makes the "Back to Gallery" button instant.
 */
export function shouldRevalidate() {
  return false; 
}

/**
 * Client-side loader: Fetches products from the Spring Boot API.
 * NO setTimeout here to keep the Home page fast.
 */
export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    return await getProducts();
  } catch (error) {
    console.warn("Failed to fetch products, showing empty list:", error);
    return [];
  }
}

export default function ProductsList({ loaderData }: Route.ComponentProps) {
  const products = loaderData as ProductDTO[];
  const { user } = useUserStore();

  return (
    <Container className="product-grid-container pt-5">
      <h2 className="fw-800 mb-5 text-center">Featured Treasures</h2>

      <Row xs={1} md={2} lg={4} className="g-4">
        {products.map((product: ProductDTO) => (
          <Col key={product.id}>
            <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
              <div className="clay-card">
                <div className="img-container">
                  <img 
                    src={`/api/v1/images/${product.id}/file`} 
                    alt={product.name} 
                  />
                </div>
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="price">{product.price.toFixed(2)}&euro;</p>
                </div>
              </div>
            </Link>
          </Col>
        ))}
      </Row>

      {user && (
        <div className="text-center mt-5">
          <Button as={Link as any} to="/product-new" className="btn-sell">
            Sell New Treasure
          </Button>
        </div>
      )}
    </Container>
  );
}