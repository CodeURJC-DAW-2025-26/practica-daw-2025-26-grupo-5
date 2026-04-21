/**
 * Product List / Catalog Page
 *
 * Main marketplace catalog display with search and filtering.
 * Shows available products with pagination and category filtering.
 *
 * Features:
 * - Product grid/list layout
 * - Search products by name or query
 * - Filter by category (Fashion, Tech, Cars, Home)
 * - Pagination with "Load More" button
 * - Product cards with:
 *    - Product image
 *    - Product name
 *    - Price
 *    - Seller info
 *    - Status indicator
 *    - Link to product detail
 * - Empty state when no products found
 * - Loading spinner during fetch
 * - Cache optimization to prevent reload on back navigation
 * - Revalidation after purchase to show updated stock
 *
 * Data Flow:
 * 1. User lands on homepage (/product or with query params)
 * 2. clientLoader fetches initial catalog data
 * 3. Component displays product grid
 * 4. User can:
 *    - Search by query parameter (?query=...)
 *    - Filter by category (?category=...)
 *    - Click product to view details
 *    - Click "Load More" to fetch more products
 * 5. Navigate back: List stays cached (no reload)
 * 6. After purchase: List revalidates to show updated products
 *
 * Query Parameters:
 * - query: Search text (e.g., ?query=vintage)
 * - category: Category filter (e.g., ?category=Fashion)
 * - Combined: ?query=vintage&category=Fashion
 *
 * Pagination:
 * - Initial load: Fetches first page of results
 * - Load More button: Fetches next page
 * - Can load multiple pages in same session
 * - Appends to existing list (infinite scroll pattern)
 *
 * Cache Optimization:
 * - shouldRevalidate() prevents reload on back
 * - When user returns to catalog, previous list displayed
 * - Faster UX by avoiding unnecessary refetch
 * - EXCEPTION: After purchase, list revalidated
 *
 * Purchase Tracking:
 * - localStorage flag 'justPurchased' set after buy
 * - Triggers revalidation to update product list
 * - Shows purchased item as sold/unavailable
 * - Flag cleared after revalidation
 *
 * Search Implementation:
 * - URL-based filtering (shareable links)
 * - Query sent to getCatalog() API
 * - Both text search and category filters work together
 * - Backend handles search logic
 *
 * Category Filtering:
 * - Predefined categories for browsing
 * - Category links in hero section navigation
 * - Can be combined with text search
 * - URL updates to reflect active filter
 *
 * Client Loader:
 * - Extracts search params from URL
 * - Calls getCatalog() with filters
 * - Handles errors gracefully (returns empty list)
 * - No artificial delay (fast page load)
 *
 * Components:
 * - Product grid: Responsive columns
 * - Product card: Image, name, price, seller
 * - Load More button: Pagination control
 * - Empty state: "No products found" message
 * - Loading spinner: During data fetch
 *
 * @component
 * @returns React component with searchable product catalog
 */

import { Link, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/product-list";
import { getCatalog, getMoreProducts, getProductImageUrl } from "~/services/products-service"; 
import type ProductDTO from "~/dto/ProductDTO";
import type HomePageDTO from "~/dto/HomePageDTO"; 
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";

/**
 * Determine if Component Should Revalidate
 * 
 * Optimization: Prevent list reload when navigating back from product detail.
 * Cache the product list for better UX.
 * EXCEPTION: Revalidate after purchase to show updated stock.
 * 
 * @param currentUrl - Current URL
 * @param nextUrl - Next URL to navigate to
 * @returns True if should revalidate, false to use cache
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
 * Client-side loader: Fetch product catalog
 * 
 * Process:
 * 1. Extract query and category from URL search params
 * 2. Call getCatalog() with filters
 * 3. Return catalog data (products, recommendations)
 * 4. Handle errors by returning empty list
 * 5. No artificial delay for fast loading
 * 
 * @param request - Route request with URL
 * @returns Catalog data with products
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

/**
 * Product List Component Implementation
 * 
 * Displays searchable product catalog with pagination.
 */
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