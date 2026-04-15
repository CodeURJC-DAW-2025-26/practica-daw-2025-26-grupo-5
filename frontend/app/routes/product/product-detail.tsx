import { useNavigate, useParams, useNavigation } from "react-router";
import { getProductById, removeProduct } from "~/services/products-service";
import {
  Alert,
  Button,
  Container,
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
 */
export async function clientLoader({ params }: { params: any }) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return await getProductById(params.id!);
}

/**
 * Product Detail Component
 * Fixed syntax and logic for Stilnovo P3
 */
export default function ProductDetail({ loaderData }: { loaderData: any }) {
  const { user } = useUserStore();
  const product = loaderData;
  const navigate = useNavigate();

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPendingDelete, setPendingDelete] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Logical checks for product status
  const isActive = product.status?.toLowerCase() === "active" || product.active === true;

  const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);

  // FIXED: Function name consistency
  const handleCloseDeleteDialog = () => {
    if (!isPendingDelete) {
      setDeleteDialogOpen(false);
      setDeleteError(null);
    }
  };

  async function handleDelete() {
    setPendingDelete(true);
    setDeleteError(null);
    try {
      await removeProduct(product.id);
      navigate("/");
    } catch (err) {
      console.error(err);
      setDeleteError("Error deleting product");
      setPendingDelete(false);
    }
  }

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
                src={`/api/v1/products/${product.id}/image`}
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
                    <Link to={`/transactions/payment/${product.id}`} className="btn-sell py-3 fw-800 shadow-lg rounded-pill d-flex align-items-center justify-content-center gap-2 border-0 text-decoration-none" style={{ fontSize: '1.1rem' }}>
                      <i className="fa-solid fa-bag-shopping"></i> Buy Now
                    </Link>
                  ) : (
                    <div className="btn-sell py-3 fw-800 shadow-lg rounded-pill d-flex align-items-center justify-content-center gap-2 border-0 text-decoration-none" style={{ fontSize: '1.1rem', backgroundColor: 'red' }}>
                      This is your product
                    </div>
                  )}
                  <Link
                    to={`/product/contact/${product.id}`}  
                    state={{ productName: product.name, productId: product.id }}
                    className="btn btn-outline-primary py-3 fw-800 rounded-pill border-2 d-flex align-items-center justify-content-center gap-2 text-decoration-none">
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
                        src={`/api/v1/users/${product.seller.id}/profile-photo`}
                        className="rounded-circle border border-white shadow-sm"
                        width="55" height="55"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/no-profile-picture.png' }}
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
              {user && (
                <div className="d-flex gap-2 mb-4">
                  {user.roles?.includes("ADMIN") && (
                    <Button variant="danger" className="rounded-pill px-4 fw-700" onClick={handleOpenDeleteDialog}>
                      Remove Listing
                    </Button>
                  )}
                  {user.id === product.seller?.id && (
                    <Button variant="warning" className="rounded-pill px-4 fw-700" onClick={() => navigate(`/product/${product.id}/edit`)}>
                      Edit Details
                    </Button>
                  )}
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

      {/* DELETE MODAL - FIXED SECTION */}
      <Modal show={isDeleteDialogOpen} onHide={handleCloseDeleteDialog} centered>
        <Modal.Header className="bg-danger text-white border-0" closeButton>
          <Modal.Title className="fw-800">Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-center">
          <p className="mb-2 fw-600">Are you sure you want to delete <b>"{product.name}"</b>?</p>
          <p className="small text-muted mb-0">This action cannot be undone.</p>
          {deleteError && <Alert variant="danger" className="mt-3">{deleteError}</Alert>}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" className="rounded-3 fw-bold" onClick={handleCloseDeleteDialog} disabled={isPendingDelete}>
            Cancel
          </Button>
          <Button variant="danger" className="rounded-3 fw-bold" onClick={handleDelete} disabled={isPendingDelete}>
            {isPendingDelete ? "Deleting..." : "Confirm Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}