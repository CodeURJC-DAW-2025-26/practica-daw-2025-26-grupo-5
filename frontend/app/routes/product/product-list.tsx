import { Link, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/product-list";
import { getCatalog, getMoreProducts, getProductImageUrl } from "~/services/products-service"; 
import type ProductDTO from "~/dto/ProductDTO";
import type HomePageDTO from "~/dto/HomePageDTO"; 
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";

/**
 * Optimization: Prevent the list from reloading when coming back from a product.
 * This makes the "Back to Gallery" button instant.
 * EXCEPTION: Revalidate if a purchase just occurred to refresh the product list.
 */
export function shouldRevalidate({currentUrl, nextUrl }: any) {
  if (currentUrl.search !== nextUrl.search) {
    return true;
  }
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
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || undefined;
    const category = url.searchParams.get("category") || undefined;

    return await getCatalog(query, category, 0);
  } catch (error) {
    console.warn("Failed to fetch catalog, showing empty list:", error);
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
  const [searchParams] = useSearchParams();

  // Filter out products from banned sellers
  const activeProducts = homeData.products?.filter(p => !p.seller?.banned) || [];
  const activeRecommendations = homeData.recommendedProducts?.filter(p => !p.seller?.banned) || [];
  const [products, setProducts] = useState<ProductDTO[]>(activeProducts);

  // Pageable handled
  const [page, setPage] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    if (typeof homeData.last === 'boolean') {
      return !homeData.last; 
    }
    return activeProducts.length >= 10; 
  });

  useEffect(() => {
    setProducts(activeProducts);
    setPage(1);
    
    if (typeof homeData.last === 'boolean') {
      setHasMore(!homeData.last);
    } else {
      setHasMore(activeProducts.length > 10);
    }
  }, [homeData]);

  // Fill recommended products to always show 4 (or available)
  const recommendedCount = activeRecommendations.length;
  const filledRecommendations = [...activeRecommendations];
  
  if (recommendedCount < 4 && activeProducts) {
    const recommendedIds = new Set(filledRecommendations.map(p => p.id));
    const fillers = activeProducts.filter(p => !recommendedIds.has(p.id));
    const needed = 4 - recommendedCount;
    filledRecommendations.push(...fillers.slice(0, needed));
  }
  
  // handleLoadMore function adapted to Paged Response
  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const queryParam = searchParams.get('query') || '';
      const categoryParam = searchParams.get('category') || '';

      const delayPromise = new Promise(resolve => setTimeout(resolve, 800));
      
      const fetchPromise = getMoreProducts(page, queryParam, categoryParam);

      const [pagedResponse] = await Promise.all([fetchPromise, delayPromise]);

      const newProducts = pagedResponse.content || [];

      if (newProducts.length === 0) {
        setHasMore(false); 
      } else {
        const validNewProducts = newProducts.filter((p: ProductDTO) => !p.seller?.banned);
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewProducts = validNewProducts.filter((p: ProductDTO) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewProducts];
        });
        setPage(prev => prev + 1); 

        if (pagedResponse.last === true) {
            setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      alert("Could not load more products.");
    } finally {
      setIsLoading(false);
    }

  };

  const currentlyRecommendedIds = new Set(filledRecommendations.map(p => p.id));
  const allFilteredProducts = products.filter(p => !currentlyRecommendedIds.has(p.id));

  const displayProductsLimit = Math.max(0, products.length - filledRecommendations.length);
  const displayProducts = allFilteredProducts.slice(0, displayProductsLimit);

  return (
    <Container className="pt-5">
      
      {/* NEW SECTION: Recommended Products */}
      {filledRecommendations.length > 0 && (
        <div className="mb-5 pb-4 border-bottom">
          <h2 className="fw-800 mb-5 text-center text-primary">Recommended for You</h2>
          <Row xs={1} md={2} lg={4} className="g-4">
            {filledRecommendations.map((product: ProductDTO) => (
              <Col key={`rec-${product.id}`}> {/* Prefix cat- to avoid key conflicts */}
                <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                  <div className="clay-card">
                    <div className="img-container">
                      <img 
                        src={getProductImageUrl(product.id)}
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
          {displayProducts.map((product: ProductDTO) => (
            <Col key={`cat-${product.id}`}> {/* Prefisso cat- per evitare conflitti di chiavi */}
              <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                <div className="clay-card">
                  <div className="img-container">
                    <img 
                      src={getProductImageUrl(product.id)}
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

      {/* LOAD MORE BUTTON */}
        <div className="text-center mt-5 mb-5">
          {hasMore ? (
            <Button 
              onClick={handleLoadMore} 
              disabled={isLoading}
              className="btn-load-more px-4 py-2 fw-bold"
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Loading treasures...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          ) : (
            <Button disabled variant="secondary" className="btn-no-more px-4 py-2">
              No more treasures found
            </Button>
          )}
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