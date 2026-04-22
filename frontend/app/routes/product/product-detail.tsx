/**
 * Product Detail Page
 *
 * Displays comprehensive product information and purchasing interface.
 * Shows product images, specifications, seller info, pricing, and reviews.
 *
 * Features:
 * - Large product image with sold-out overlay if inactive
 * - Technical specifications (category, status, location, price)
 * - Product description with AI-enhanced formatting
 * - Seller profile section with ratings and statistics
 * - Recent valuations/reviews from other buyers
 * - Purchase button (checkout flow)
 * - Delete button for product owners
 * - Share product links
 * - Image gallery (if multiple images available)
 * - Status indicators (active/sold out)
 * - Inquiry contact form (if not sold)
 *
 * Purchase Flow:
 * 1. User clicks "Buy Now" button
 * 2. Checks if user is logged in
 * 3. Prevents self-purchase (seller can't buy own product)
 * 4. Navigates to checkout page
 * 5. Confirms transaction
 *
 * Delete Flow (Seller Only):
 * 1. Only product owner can delete
 * 2. Opens confirmation modal
 * 3. If confirmed, calls deleteProduct()
 * 4. Redirects to homepage
 * 5. Shows error if product in transaction
 *
 * State Management:
 * - deleteError: Error message if delete fails
 * - isPendingDelete: Loading state during deletion
 * - isDeleteDialogOpen: Controls delete confirmation modal
 *
 * Seller Information:
 * - Shows seller name, rating, sales count
 * - Links to seller public profile
 * - Average rating from buyer valuations
 *
 * Recent Reviews:
 * - Displays recent valorations/ratings from buyers
 * - Shows comment, rating, and reviewer name
 * - Limited to recent valuations (last 3-5)
 *
 * @component
 * @returns React component for product details and purchase
 */

import { useNavigate } from "react-router";
import { getProductById, deleteProduct, getProductImageUrl, getUserProfilePhotoUrl } from "~/services/products-service";
import {
  Alert,
  Button,
  Row,
  Col,
  Modal,
  Accordion,
} from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";
import { useState } from "react";
import { Link } from "react-router";
import { isSelfPurchase } from "~/services/transaction-service";

/**
 * Client-side loader: Fetches product details
 * 
 * Process:
 * 1. Receives product ID from URL params
 * 2. Calls getProductById() to fetch from backend
 * 3. Adds artificial delay for better UX
 * 4. Returns product data to component
 */
export async function clientLoader({ params }: { params: any }) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return await getProductById(params.id!);
}

/**
 * Product Detail Component Implementation
 * 
 * Main component showing all product information, seller details, and purchase options.
 */
export default function ProductDetail({ loaderData }: { loaderData: any }) {
  const { user } = useUserStore();
  const product = loaderData;
  const navigate = useNavigate();

  // Delete operation state
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPendingDelete, setPendingDelete] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  /**
   * Check if product is available for purchase
   * Active products can be purchased; sold-out/inactive cannot
   */
  const isActive = product.status?.toLowerCase() === "active" || product.active === true;

  /**
   * Open Delete Confirmation Modal
   */
  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);

  /**
   * Close Delete Confirmation Modal
   * Only allows closing if not currently deleting
   */
  const handleCloseDeleteDialog = () => {
    if (!isPendingDelete) {
      setDeleteDialogOpen(false);
      setDeleteError(null);
    }
  };

  /**
   * Execute Product Deletion
   * 
   * Process:
   * 1. Set deleting state
   * 2. Call deleteProduct() API
   * 3. Redirect to homepage on success
   * 4. Show error message on failure
   */
  async function handleDelete() {
    setPendingDelete(true);
    setDeleteError(null);
    try {
      await deleteProduct(product.id);
      navigate("/");
    } catch (err) {
      console.error(err);
      setDeleteError("Error deleting product");
      setPendingDelete(false);
    }
  }

  /**
   * Check if current user is the product owner
   * Prevents users from purchasing their own products
   */
  const isSelfProduct = isSelfPurchase(product, user)

  return (
    <>
      <main className="container py-5">
        <Row className="g-5 align-items-start">

          {/* LEFT COLUMN: Image & Technical Specs */}
          <Col lg={7}>
            <div className="product-image-frame clay-card p-2 mb-4 bg-white d-flex align-items-center justify-content-center position-relative">

              {!isActive && (
                <div className="position-absolute top-50 start-50 translate-middle w-100 text-center" style={{ zIndex: 10, pointerEvents: 'none' }}>
                  <span className="badge rounded-pill bg-danger px-5 py-3 shadow-lg fw-800 border border-white border-4"
                    style={{ fontSize: '2rem', transform: 'rotate(-15deg)', display: 'inline-block' }}>
                    SOLD OUT
                  </span>
                </div>
              )}

              <img
                src={getProductImageUrl(product.id)}
                alt={product.name}
                className={`main-product-image img-fluid rounded-4 ${!isActive ? 'opacity-25 grayscale' : ''}`}
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>

            <div className="clay-card p-4 bg-white mt-4">
              <h4 className="fw-800 h5 mb-4">Technical Specifications</h4>
              <Row className="g-3">
                <Col xs={6} md={4}>
                  <p className="x-small fw-800 text-muted mb-1">Category</p>
                  <p className="small fw-700 text-uppercase">{product.category}</p>
                </Col>
                <Col xs={6} md={4}>
                  <p className="x-small fw-800 text-muted mb-1">Status</p>
                  <p className={`small fw-800 text-uppercase ${isActive ? 'text-success' : 'text-danger'}`}>
                    {product.status || (isActive ? "ACTIVE" : "SOLD")}
                  </p>
                </Col>
                <Col xs={6} md={4}>
                  <p className="x-small fw-800 text-muted mb-1">Reference</p>
                  <p className="small fw-700">ST-{product.id}</p>
                </Col>
              </Row>
            </div>
          </Col>

          {/* RIGHT COLUMN: Price, Actions & Seller */}
          <Col lg={5} className="sticky-lg-top" style={{ top: '100px', zIndex: 1 }}>
            <div className={`clay-card p-4 p-md-5 ${isActive ? 'bg-white' : 'bg-danger-subtle border border-danger'} shadow-sm`}>

              <h1 className="fw-800 h3 mb-3 lh-sm">{product.name}</h1>

              <div className="mb-4">
                <h2 className={`display-5 fw-800 mb-0 ${isActive ? 'text-primary' : 'text-danger'}`}>
                  {product.price ? product.price.toFixed(2) : "0.00"} &euro;
                </h2>
                <p className="small text-muted fw-700">Ref: ST-{product.id} &bull; Verified Treasure</p>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-5">
                <span className="badge-attribute">
                  <i className={`fa-solid ${isActive ? 'fa-check-circle text-success' : 'fa-circle-xmark text-danger'} me-1`}></i>
                  {product.status || (isActive ? "Active" : "Sold")}
                </span>
                <span className="badge-attribute text-uppercase">
                  <i className="fa-solid fa-tag me-1 opacity-50"></i> {product.category}
                </span>
              </div>

              {isActive ? (
                <div className="d-grid gap-3 mb-5">
                  {!isSelfProduct ? (
                    <Link to={`../transactions/payment/${product.id}`} className="btn-sell py-3 fw-800 shadow-sm rounded-pill d-flex align-items-center justify-content-center gap-2 border-0 text-decoration-none" style={{ fontSize: '1.1rem' }}>
                      <i className="fa-solid fa-bag-shopping"></i> Buy Now
                    </Link>
                  ) : (
                    <div
                      className="py-3 fw-800 shadow-sm rounded-pill d-flex align-items-center justify-content-center gap-2 border-0 text-decoration-none"
                      style={{
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #f50519 0%, #dc2626 100%)',
                        color: 'white',
                        cursor: 'default' // Indicate that it's not clickable (seller viewing own product)
                      }}
                    >
                      <i className="fa-solid fa-lock"></i> This is your product
                    </div>
                  )}
                  <Link
                    to={`../product/contact/${product.id}`}
                    state={{ productName: product.name, productId: product.id }}
                    className="btn btn-outline-primary py-3 fw-800 rounded-pill border-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none"
                    style={{ fontSize: '1.1rem' }}
                  >
                    <i className="fa-regular fa-comment-dots fa-lg"></i> Send Message to Seller
                  </Link>
                </div>
              ) : (
                <div className="alert alert-danger rounded-4 py-4 mb-5 text-center shadow-sm border-0 bg-white">
                  <i className="fa-solid fa-handshake-slash fa-2x mb-2 text-danger"></i>
                  <p className="fw-800 mb-0 text-dark">This item has been sold.</p>
                </div>
              )}

              {/* Seller Card */}
              {product.seller && (
                <Link to={`/seller/${product.seller.id}`} className="text-decoration-none">
                  <div className="seller-card p-3 rounded-4 bg-light border d-flex align-items-center justify-content-between mb-4 shadow-sm">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={getUserProfilePhotoUrl(product.seller.id)}
                        className="rounded-circle border border-white shadow-sm"
                        width="55"
                        height="55"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/no-profile-picture.png'
                        }}
                        alt="Seller"
                      />
                      <div>
                        <p className="fw-800 mb-0 text-dark">{product.seller.name}</p>
                        <p className="small fw-700 text-muted mb-0">Verified Seller</p>
                      </div>
                    </div>
                    <i className="fa-solid fa-chevron-right opacity-25 text-dark"></i>
                  </div>
                </Link>
              )}

              {/* Admin/Owner Actions */}
              {user && user.id === product.seller?.id && (
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-danger-custom w-100 py-3 small fw-800 shadow-sm border-0 rounded-pill d-flex align-items-center justify-content-center gap-2"
                      onClick={handleOpenDeleteDialog}
                    >
                      <i className="fa-solid fa-trash-can"></i> Delete Product
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn-sell w-100 py-3 small fw-800 shadow-sm border-0 rounded-pill d-flex align-items-center justify-content-center gap-2"
                      style={{ height: 'auto' }}
                      onClick={() => navigate(`/product/${product.id}/edit`)}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit Details
                    </button>
                  </div>
                </div>
              )}

              <Accordion flush id="accordionDetails">
                <Accordion.Item eventKey="0" className="bg-transparent">
                  <Accordion.Header className="bg-transparent fw-800 px-0 shadow-none">
                    Product Description
                  </Accordion.Header>
                  <Accordion.Body className="px-0 text-muted fw-600 small">
                    <p>{product.description}</p>
                    <p className="mb-0"><i className="fa-solid fa-location-dot me-2 opacity-50"></i>{product.location}</p>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </Col>
        </Row>
      </main>

      {/* DELETE MODAL */}
      <Modal
        show={isDeleteDialogOpen}
        onHide={handleCloseDeleteDialog}
        centered
        contentClassName="clay-card border-0 shadow-lg text-center bg-white"
        style={{ '--bs-modal-border-radius': '24px' } as React.CSSProperties} // Fuerza el radio curvo en Bootstrap 5
      >
        <Modal.Body className="p-4 p-md-5">
          {/* Icono de advertencia */}
          <div
            className="bg-danger-subtle text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto"
            style={{ width: '60px', height: '60px' }}
          >
            <i className="fa-solid fa-triangle-exclamation fa-2x"></i>
          </div>

          <h3 className="fw-800 h5 mb-2 text-danger">Confirm Deletion</h3>

          <p className="small text-muted fw-700 mb-4 px-3">
            Are you sure you want to remove <strong>{product.name}</strong>?
          </p>

          {deleteError && (
            <Alert variant="danger" className="mb-4 small fw-600 rounded-4">
              {deleteError}
            </Alert>
          )}

          {/* Action buttons using d-grid to make them full-width and stack vertically on mobile */}
          <div className="d-grid gap-2">
            <button
              type="button"
              className="btn btn-danger w-100 py-3 rounded-pill fw-800 border-0 shadow-sm"
              onClick={handleDelete}
              disabled={isPendingDelete}
            >
              {isPendingDelete ? (
                <><i className="fa-solid fa-spinner fa-spin me-2"></i>Deleting...</>
              ) : (
                "Delete Forever"
              )}
            </button>

            <button
              type="button"
              className="btn btn-light w-100 py-3 rounded-pill fw-800 border-0"
              onClick={handleCloseDeleteDialog}
              disabled={isPendingDelete}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}