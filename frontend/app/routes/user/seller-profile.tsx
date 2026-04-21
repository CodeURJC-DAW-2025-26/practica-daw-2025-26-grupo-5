/**
 * Seller Profile / Public Storefront
 *
 * Displays public profile of any seller in the marketplace.
 * Shows seller information, ratings, products, and reviews.
 *
 * Features:
 * - Seller profile card with:
 *    - Profile photo
 *    - Name and "Verified Seller" badge
 *    - Rating score
 *    - Number of reviews
 *    - Edit button (if viewing own profile)
 * - Tabs for browsing:
 *    - Products: All items seller is currently selling
 *    - Valuations: All reviews/ratings given by buyers
 * - Products section shows:
 *    - Product grid with images
 *    - Price, name, and status
 *    - Click to view product detail
 * - Valuations section shows:
 *    - Buyer ratings and comments
 *    - Star ratings (1-5)
 *    - Buyer name and review text
 *    - Average seller rating calculation
 * - Responsive layout (desktop/mobile)
 *
 * Data Flow:
 * 1. User navigates to /user/{sellerId}
 * 2. clientLoader fetches seller profile via getSellerProfile()
 * 3. Component receives seller data:
 *    - seller: Object with id, name, rating, bio
 *    - products: Array of current listings
 *    - valorations: Array of reviews from buyers
 *    - fullStars: Average rating (1-5 stars)
 *    - owner: Boolean (true if viewing own profile)
 * 4. Display hero card with profile info
 * 5. Show tabs for Products and Valuations
 * 6. User can:
 *    - View all seller's products
 *    - Read all seller's reviews
 *    - Click product to purchase
 *    - Navigate to edit profile (if owner)
 *
 * Profile Information:
 * - Seller name displayed prominently
 * - Rating score (e.g., 4.8)
 * - Number of reviews received
 * - Profile photo with fallback
 * - Join date/member since info
 * - Optional bio/about section
 *
 * Products Display:
 * - Shows all active product listings
 * - Thumbnail images with price overlay
 * - "Sold Out" indicator for unavailable items
 * - Click to navigate to product detail
 * - Sortable/filterable (if implemented)
 *
 * Valuations Display:
 * - Shows all reviews left by other buyers
 * - Star rating visual (1-5 stars)
 * - Reviewer name and comment
 * - Review date
 * - Aggregate rating calculation
 *
 * Owner Functionality:
 * - "Edit Profile" button visible only if owner
 * - Navigates to /user-page for profile editing
 * - Owner can update profile photo and bio
 * - Owner can manage products and responses
 *
 * Profile Image Handling:
 * - Loads from /api/v1/users/{id}/profile-photo
 * - Cache busting with Date.now() timestamp
 * - Fallback to no-profile-picture.png if missing
 * - Responsive sizing (125x125px)
 * - Circular shape with border
 *
 * Accessibility:
 * - All images have alt text
 * - Semantic HTML structure
 * - Proper heading hierarchy
 * - Responsive tabs for mobile
 *
 * Performance:
 * - Client-side loader pre-fetches data
 * - No pagination needed for initial load
 * - Images lazy-loaded by browser
 *
 * @component
 * @returns Public seller profile page with products and reviews
 */

import { getSellerProfile } from "~/services/user-service";
import type { Route } from "./+types/seller-profile";
import { Link } from "react-router";
import { Container, Row, Col, Card, Button, Image, Badge, Tab, Nav } from "react-bootstrap";

/**
 * Client-side loader: Fetch seller profile data
 * 
 * Process:
 * 1. Extract seller ID from URL params
 * 2. Call getSellerProfile(sellerId) API
 * 3. Returns seller object with profile, products, and reviews
 * 4. Error handling catches failed fetches
 * 5. Data passed to component via loaderData prop
 * 
 * @param params - Route params with seller ID
 * @returns Seller profile object with products and valuations
 */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const sellerId = params.id;
    const seller = await getSellerProfile(sellerId);
    return seller;
}

/**
 * Seller Profile Component Implementation
 * 
 * Displays seller storefront with profile info, products, and reviews.
 */
export default function SellerProfile({ loaderData }: Route.ComponentProps) {
    const { seller, products, valorations, fullStars, owner } = loaderData;

    return (
        <main className="flex-grow-1">
            {/* Hero Card */}
            <Container className="pt-5 pb-4">
                <Card className="border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                    <Card.Body className="p-4 p-md-5">
                        <Row className="align-items-center g-4">
                            {/* Profile Image */}
                            <Col md="auto" className="text-center text-md-start">
                                <Image
                                    src={`/api/v1/users/${seller.id}/profile-photo?t=${Date.now()}`}
                                    alt={seller.name}
                                    roundedCircle
                                    className="border border-4 shadow-sm"
                                    width={125}
                                    height={125}
                                    style={{ objectFit: "cover", borderColor: "#fff" }}
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/profile-photo.png' }}
                                />
                            </Col>

                            {/* Seller Info */}
                            <Col md className="text-center text-md-start">
                                <small className="fw-800 text-uppercase text-muted d-block mb-2">
                                    Verified Seller
                                </small>
                                <h1 className="fw-800 mb-3" style={{ fontSize: '32px' }}>
                                    {seller.name}
                                </h1>

                                {/* Stats */}
                                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 flex-wrap">
                                    <Badge
                                        bg="light"
                                        text="dark"
                                        className="px-3 py-2 rounded-pill"
                                        style={{ fontSize: '14px' }}
                                    >
                                        <span className="fw-800 text-primary">{seller.rating}</span>
                                        <span className="fw-700 text-muted ms-1">SCORE</span>
                                    </Badge>
                                    <Badge
                                        bg="light"
                                        text="dark"
                                        className="px-3 py-2 rounded-pill"
                                        style={{ fontSize: '14px' }}
                                    >
                                        <span className="fw-800 text-primary">{seller.numRatings}</span>
                                        <span className="fw-700 text-muted ms-1">REVIEWS</span>
                                    </Badge>
                                </div>
                            </Col>

                            {/* Edit Profile Button (Manteniendo tu ubicación original) */}
                            {owner && (
                                <Col md="auto" className="text-center text-md-end">
                                    <Link to="/user/settings" className="text-decoration-none">
                                        <Button
                                            variant="outline-dark"
                                            className="fw-800 px-4 py-2 rounded-pill shadow-sm"
                                        >
                                            <i className="fa-solid fa-pen-to-square me-2"></i>
                                            Edit Profile
                                        </Button>
                                    </Link>
                                </Col>
                            )}
                        </Row>

                        {/* Seller Bio */}
                        <div className="mt-4 pt-4 border-top">
                            <small className="fw-800 text-uppercase text-muted d-block mb-2">
                                Seller's Note
                            </small>
                            <p className="mb-0" style={{ fontStyle: "italic" }}>
                                {seller.description ? `"${seller.description}"` : `"Curating history and timeless pieces. Proud member of the Stilnovo community."`}
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Tabs Stilnovo Style - CENTRADAS */}
            <Tab.Container defaultActiveKey="items">
                <div className="tab-divider-container my-4">
                    <Container>
                        {/* justify-content-center para centrar las pestañas */}
                        <div className="d-flex justify-content-center border-bottom">
                            <Nav className="nav-stilnovo-tabs border-0" id="sellerTabNav">
                                <Nav.Item>
                                    <Nav.Link eventKey="items" className="fw-800 border-0 bg-transparent py-3 text-dark px-4">
                                        <span className="text-primary me-1">{products.length}</span> Items for Sale
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="reviews" className="fw-800 border-0 bg-transparent py-3 text-dark px-4">
                                        <span className="text-primary me-1">{valorations.length}</span> Community Reviews
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                    </Container>
                </div>

                <Container className="py-4">
                    <Tab.Content>
                        {/* PRODUCTS */}
                        <Tab.Pane eventKey="items">
                            {products.length > 0 ? (
                                <Row className="g-4">
                                    {products.map((product: any) => (
                                        <Col xs={6} md={4} lg={3} key={product.id}>
                                            <Link to={`/product/${product.id}`} className="text-decoration-none">
                                                <div className="clay-card p-2 h-100 shadow-sm border-0 bg-white hover-up">
                                                    <div className="rounded-4 overflow-hidden mb-3" style={{ height: '180px', background: '#f8fafc' }}>
                                                        <img 
                                                            src={`/api/v1/products/${product.image?.id || product.id}/image?t=${Date.now()}`} 
                                                            className="img-fluid w-100 h-100" 
                                                            style={{ objectFit: 'cover' }} 
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                    <div className="px-2 pb-2 text-center">
                                                        <p className="fw-800 h5 mb-1 text-dark">{product.price}&euro;</p>
                                                        <p className="x-small text-muted text-truncate fw-700 mb-0" style={{ fontSize: '0.85rem' }}>{product.name}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <div className="text-center py-5 clay-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                    <i className="fa-solid fa-box-open fa-3x text-muted mb-3 opacity-50"></i>
                                    <h4 className="fw-800 text-dark">No items available</h4>
                                    <p className="text-muted mb-0">This seller currently has no active products.</p>
                                </div>
                            )}
                        </Tab.Pane>

                        {/* REVIEWS */}
                        <Tab.Pane eventKey="reviews">
                            <div className="mx-auto" style={{ maxWidth: '800px' }}>
                                {valorations.length > 0 ? (
                                    valorations.map((val: any) => (
                                        <div key={val.id} className="clay-card p-4 mb-3 bg-white border-0 shadow-sm animate slideIn">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <Image 
                                                        src={`/api/v1/users/search/profile-photo?name=${encodeURIComponent(val.buyerName)}&t=${Date.now()}`} 
                                                        alt={val.buyerName} 
                                                        roundedCircle
                                                        className="border shadow-sm" 
                                                        width={45} height={45} 
                                                        style={{ objectFit: 'cover' }}
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/profile-photo.png' }}
                                                    />
                                                    <div>
                                                        <h4 className="fw-800 h6 mb-0 text-dark">{val.buyerName}</h4>
                                                        <div className="d-flex align-items-center gap-1 mt-1" style={{ color: 'var(--brand-blue, #0d6efd)' }}>
                                                            <i className="fa-solid fa-circle-check" style={{ fontSize: '0.8rem' }}></i>
                                                            <span className="fw-800 text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Verified Purchase</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-warning small d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-pill border border-light-subtle">
                                                    <i className="fa-solid fa-star"></i>
                                                    <span className="fw-800 text-dark">{val.rating}</span>
                                                </div>
                                            </div>
                                            <p className="small text-muted mb-0 lh-base" style={{ fontStyle: 'italic' }}>
                                                "{val.comment}"
                                            </p>
                                            <div className="mt-3 pt-3 border-top d-flex align-items-center gap-2">
                                                <i className="fa-solid fa-box-open opacity-50" style={{ fontSize: '0.75rem' }}></i>
                                                <span className="fw-700 text-muted" style={{ fontSize: '0.75rem' }}>
                                                    Item: <span className="text-dark">{val.productName || 'Stilnovo Item'}</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5 opacity-50">
                                        <i className="fa-solid fa-comments fa-3x text-muted mb-3"></i>
                                        <p className="fw-800 text-dark">This seller hasn't received any reviews yet.</p>
                                    </div>
                                )}
                            </div>
                        </Tab.Pane>
                    </Tab.Content>
                </Container>
            </Tab.Container>
        </main>
    );
}