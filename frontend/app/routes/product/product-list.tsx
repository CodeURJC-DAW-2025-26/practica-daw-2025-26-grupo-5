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
 * EXCEPTION: Revalidate if a purchase just occurred to refresh the product list.
 */
export function shouldRevalidate() {
  // Check if a purchase was just completed
  const justPurchased = localStorage.getItem('justPurchased');
  if (justPurchased === 'true') {
    localStorage.removeItem('justPurchased');
    return true; // Revalidate to fetch updated products
  }
  return false; // Don't revalidate for normal navigation
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

  // Filter out products from banned sellers
  const activeProducts = homeData.products?.filter(p => !p.seller?.banned) || [];
  const activeRecommendations = homeData.recommendedProducts?.filter(p => !p.seller?.banned) || [];

  // Fill recommended products to always show 4 (or available)
  const recommendedCount = activeRecommendations.length;
  const filledRecommendations = [...activeRecommendations];
  
  if (recommendedCount < 4 && activeProducts) {
    const recommendedIds = new Set(filledRecommendations.map(p => p.id));
    const fillers = activeProducts.filter(p => !recommendedIds.has(p.id));
    const needed = 4 - recommendedCount;
    filledRecommendations.push(...fillers.slice(0, needed));
  }

  return (
    <Container className="pt-5">
      
      {/* NEW SECTION: Recommended Products */}
      {filledRecommendations.length > 0 && (
        <div className="mb-5 pb-4 border-bottom">
          <h2 className="fw-800 mb-5 text-center text-primary">Recommended for You</h2>
          <Row xs={1} md={2} lg={4} className="g-4">
            {filledRecommendations.map((product: ProductDTO) => (
              <Col key={`rec-${product.id}`}> {/* Prefisso rec- per evitare conflitti di chiavi */}
                <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                  <div className="clay-card">
                    <div className="img-container">
                      <img 
                        src={`/api/v1/products/${product.id}/image?t=${Date.now()}`} 
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
          {activeProducts.map((product: ProductDTO) => (
            <Col key={`cat-${product.id}`}> {/* Prefisso cat- per evitare conflitti di chiavi */}
              <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                <div className="clay-card">
                  <div className="img-container">
                    <img 
                      src={`/api/v1/products/${product.id}/image?t=${Date.now()}`} 
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