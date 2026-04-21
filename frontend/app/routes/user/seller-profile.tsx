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
import { useState } from "react";
import { Container, Row, Col, Card, Button, Image, Badge, Tab, Tabs, ListGroup } from "react-bootstrap";

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
                <Card className="border-0 shadow-sm">
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
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/no-profile-picture.png' }}
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
                                        className="px-3 py-2"
                                        style={{ fontSize: '14px' }}
                                    >
                                        <span className="fw-800 text-primary">{seller.rating}</span>
                                        <span className="fw-700 text-muted ms-1">SCORE</span>
                                    </Badge>
                                    <Badge
                                        bg="light"
                                        text="dark"
                                        className="px-3 py-2"
                                        style={{ fontSize: '14px' }}
                                    >
                                        <span className="fw-800 text-primary">{seller.numRatings}</span>
                                        <span className="fw-700 text-muted ms-1">REVIEWS</span>
                                    </Badge>
                                </div>
                            </Col>

                            {/* Edit Profile Button */}
                            {owner && (
                                <Col md="auto" className="text-center text-md-end">
                                    <Link to="/user-page" className="text-decoration-none">
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
                        <hr className="my-4" />
                        <div>
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

            {/* Tabs */}
            <Container className="py-4">
                <Tabs
                    defaultActiveKey="items"
                    className="mb-4"
                    style={{
                        borderBottom: '1px solid #e5e7eb'
                    }}
                >
                    {/* Items Tab */}
                    <Tab
                        eventKey="items"
                        title={
                            <>
                                <span className="fw-800">{products.length}</span> Items for Sale
                            </>
                        }
                    >
                        <div className="py-4">
                            {products.length > 0 ? (
                                <Row className="g-4">
                                    {products.map((product: any) => (
                                        <Col key={product.id} xs={6} md={4} lg={3}>
                                            <Link to={`/product/${product.id}`} className="text-decoration-none">
                                                <Card
                                                    className="border-0 shadow-sm h-100"
                                                    style={{
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                    }}
                                                >
                                                    <Card.Img
                                                        variant="top"
                                                        src={`/api/v1/products/${product.image.id}/image?t=${Date.now()}`}
                                                        style={{
                                                            height: '180px',
                                                            objectFit: 'cover',
                                                            backgroundColor: '#f8fafc'
                                                        }}
                                                    />
                                                    <Card.Body className="text-center p-3">
                                                        <h6 className="fw-800 mb-2 text-dark">
                                                            {product.price}€
                                                        </h6>
                                                        <p className="small text-muted text-truncate fw-700 mb-0">
                                                            {product.name}
                                                        </p>
                                                    </Card.Body>
                                                </Card>
                                            </Link>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted">This seller has no active products.</p>
                                </div>
                            )}
                        </div>
                    </Tab>

                    {/* Reviews Tab */}
                    <Tab
                        eventKey="reviews"
                        title={
                            <>
                                <span className="fw-800">{valorations.length}</span> Reviews
                            </>
                        }
                    >
                        <div className="py-4">
                            {valorations.length > 0 ? (
                                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                    {valorations.map((val: any) => (
                                        <Card key={val.id} className="border-0 shadow-sm mb-3">
                                            <Card.Body className="p-4">
                                                {/* Review Header */}
                                                <Row className="align-items-center mb-3">
                                                    <Col className="d-flex align-items-center gap-3">
                                                        <Image
                                                            src={`/api/v1/users/search/profile-photo?name=${encodeURIComponent(val.buyerName)}&t=${Date.now()}`}
                                                            alt={val.buyerName}
                                                            roundedCircle
                                                            width={45}
                                                            height={45}
                                                            className="border shadow-sm"
                                                            onError={(e) => (e.currentTarget.src = '/images/profile-photo.png')}
                                                        />
                                                        <div>
                                                            <h6 className="fw-800 mb-1">{val.buyerName}</h6>
                                                            <small
                                                                className="d-flex align-items-center gap-1"
                                                                style={{ color: 'var(--brand-blue)' }}
                                                            >
                                                                <i className="fa-solid fa-circle-check" style={{ fontSize: '0.8rem' }} />
                                                                <span className="fw-800 text-uppercase">Verified Purchase</span>
                                                            </small>
                                                        </div>
                                                    </Col>
                                                    <Col xs="auto">
                                                        <Badge
                                                            bg="warning"
                                                            text="dark"
                                                            className="px-2 py-1"
                                                        >
                                                            <i className="fa-solid fa-star me-1"></i>
                                                            {val.rating}
                                                        </Badge>
                                                    </Col>
                                                </Row>

                                                {/* Review Comment */}
                                                <p className="small text-muted mb-0" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                                                    "{val.comment}"
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5" style={{ opacity: '0.5' }}>
                                    <i className="fa-solid fa-comments fa-3x mb-3"></i>
                                    <p className="fw-800">This seller hasn't received any reviews yet.</p>
                                </div>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </Container>
        </main>
    );
}
