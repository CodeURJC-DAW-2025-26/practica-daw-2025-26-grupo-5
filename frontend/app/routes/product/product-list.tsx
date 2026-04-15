import { Link } from "react-router";
import type { Route } from "./+types/product-list";
import { getCatalog } from "~/services/products-service"; 
import type ProductDTO from "~/dto/ProductDTO";
import type HomePageDTO from "~/dto/HomePageDTO"; 
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
 * Client-side loader: Fetches the combined catalog data from the Spring Boot API.
 * NO setTimeout here to keep the Home page fast.
 */
export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    return await getCatalog();
  } catch (error) {
    console.warn("Failed to fetch catalog, showing empty list:", error);
    // Return a default empty homepage DTO
    return {
      products: [],
      recommendedProducts: [],
      searching: false
    } as unknown as HomePageDTO;
  }
}

export default function ProductsList({ loaderData }: Route.ComponentProps) {
  const homeData = loaderData as HomePageDTO;
  const { user } = useUserStore();

  return (
    <Container className="pt-5">
      
      {/* NEW SECTION: Recommended Products */}
      {homeData.recommendedProducts && homeData.recommendedProducts.length > 0 && (
        <div className="mb-5 pb-4 border-bottom">
          <h2 className="fw-800 mb-5 text-center text-primary">Recommended for You</h2>
          <Row xs={1} md={2} lg={4} className="g-4">
            {homeData.recommendedProducts.map((product: ProductDTO) => (
              <Col key={`rec-${product.id}`}> {/* Prefisso rec- per evitare conflitti di chiavi */}
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
        </div>
      )}

      {/* EXISTING SECTION: Standard Catalog */}
      <div className="product-grid-container">
        {/* Show a different title if the user is searching */}
        <h2 className="fw-800 mb-5 text-center">
          {homeData.searching ? "Search Results" : "Featured Treasures"}
        </h2>

        <Row xs={1} md={2} lg={4} className="g-4">
          {homeData.products.map((product: ProductDTO) => (
            <Col key={`cat-${product.id}`}> {/* Prefisso cat- per evitare conflitti di chiavi */}
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
      </div>

      {user && (
        <div className="text-center mt-5">
          <Button as={Link as any} to="/product/new" className="btn-sell">
            Sell New Treasure
          </Button>
        </div>
      )}
    </Container>
  );
}