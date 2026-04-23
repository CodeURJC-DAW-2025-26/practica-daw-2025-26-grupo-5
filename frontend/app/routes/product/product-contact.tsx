import { useNavigate, useLocation, useParams, Navigate } from "react-router";
import { useActionState, useState } from "react"; 
import { Alert, Button, Container, Row, Col, Card, Image } from "react-bootstrap";
import { sendInquiry, getProductImageUrl } from "~/services/products-service";
import { useUserStore } from "~/stores/useUserStore";

export default function ContactSellerPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUserStore(); 

    const productId = Number(id);
    const productName = location.state?.productName || "Product";
    const productPrice = location.state?.price ?? "0.00 €";
    const sellerName = location.state?.sellerName || "Seller";
    const productImageUrl = location.state?.productImageUrl || getProductImageUrl(productId);

    const [logoSrc, setLogoSrc] = useState('/images/logo.png');

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    async function contactAction(
        prevState: { success: boolean; error: string | null } | null,
        formData: FormData
    ) {
        const phone = formData.get("phone") as string;
        const type = formData.get("type") as string;
        const message = formData.get("message") as string;

        try {
            await sendInquiry({
                productId,
                phone,
                type,
                message,
            });
            return { success: true, error: null };
        } catch (error) {
            return { success: false, error: "Failed to send message. Please try again." };
        }
    }

    const [state, formAction, isPending] = useActionState(contactAction, null);

    if (state?.success) {
        return (
            <Container className="py-5 text-center">
                <i className="fa-solid fa-circle-check fa-4x text-success mb-4"></i>
                <h2 className="fw-800 mb-2">Message Sent!</h2>
                <p className="text-muted fw-600 mb-4">
                    The seller will get back to you soon.
                </p>
                <Button
                    variant="primary"
                    className="rounded-pill px-5 fw-700"
                    onClick={() => navigate(`/product/${id}`)}
                >
                    Back to product
                </Button>
            </Container>
        );
    }

    return (
        <div className="min-vh-100 bg-light py-4 py-md-5">
            <Container>

                {/* ❌ HEADER ELIMINADO COMPLETAMENTE */}

                <Card className="clay-card border-0 shadow-sm overflow-hidden mx-auto" style={{ maxWidth: "1100px" }}>
                    <Card.Body className="p-0">
                        <Row className="g-0">
                            <Col md={5} className="p-4 p-md-5 border-end bg-white">
                                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 mb-3">
                                    New inquiry
                                </span>

                                <div className="mb-4">
                                    <Image
                                        src={productImageUrl}
                                        alt={productName}
                                        className="img-fluid rounded-4 mb-3 w-100"
                                        style={{
                                            objectFit: "contain",
                                            height: "240px",
                                            backgroundColor: "#f8fafc",
                                        }}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = '/images/no-product-image.png';
                                        }}
                                    />
                                    <h2 className="fw-800 h4 mb-1">{productName}</h2>
                                    <p className="text-primary fw-800 h5 mb-0">
                                        {typeof productPrice === "number"
                                            ? `${productPrice.toFixed(2)} €`
                                            : productPrice}
                                    </p>
                                </div>

                                <div className="d-flex align-items-center p-3 bg-light rounded-4 mb-4">
                                    <div className="bg-white rounded-circle p-2 me-3 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }}>
                                        <i className="fa-solid fa-user text-muted"></i>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block small text-uppercase">Seller</small>
                                        <span className="fw-800">{sellerName}</span>
                                    </div>
                                </div>

                                <div className="small text-muted">
                                    <p className="mb-1"><i className="fa-solid fa-circle-check text-success me-2"></i> Your message will be sent through the platform.</p>
                                    <p className="mb-0"><i className="fa-solid fa-circle-check text-success me-2"></i> Response time: usually less than 24 hours.</p>
                                </div>
                            </Col>

                            <Col md={7} className="p-4 p-md-5 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                        <h3 className="fw-800 h4 m-0">Contact seller</h3>
                                        <p className="text-muted mb-0">Complete the form below to send your inquiry.</p>
                                    </div>
                                    <span className="badge bg-dark rounded-pill px-3 py-2 fw-700">
                                        <i className="fa-solid fa-lock me-2"></i> Secure form
                                    </span>
                                </div>

                                <form action={formAction}>
                                    <Row className="g-3 mb-3">
                                        <Col md={6}>
                                            <label className="form-label small fw-bold text-muted text-uppercase">Phone</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0">
                                                    <i className="fa-solid fa-phone text-muted"></i>
                                                </span>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    className="form-control bg-light border-0 py-2"
                                                    placeholder="+34 600 000 000"
                                                    required
                                                />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <label className="form-label small fw-bold text-muted text-uppercase">Inquiry Type</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0">
                                                    <i className="fa-solid fa-tag text-muted"></i>
                                                </span>
                                                <select name="type" className="form-select bg-light border-0 py-2" required>
                                                    <option value="GENERAL">General question</option>
                                                    <option value="INFO">Request info</option>
                                                    <option value="PRICE">Negotiate</option>
                                                </select>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Message</label>
                                        <div className="position-relative">
                                            <i className="fa-solid fa-comment position-absolute text-muted" style={{ left: '12px', top: '15px' }}></i>
                                            <textarea
                                                name="message"
                                                className="form-control bg-light border-0 ps-5 py-3"
                                                rows={5}
                                                placeholder={`Hi ${sellerName}, is this still available?`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {state?.error && <Alert variant="danger" className="mb-4">{state.error}</Alert>}

                                    <div className="d-flex gap-3 justify-content-end">
                                        <Button
                                            type="button"
                                            variant="light"
                                            className="rounded-pill px-4 fw-700"
                                            onClick={() => navigate(-1)}
                                            disabled={isPending}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="rounded-pill px-4 fw-700"
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <>
                                                    <i className="fa-solid fa-spinner fa-spin me-2"></i> Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-paper-plane me-2"></i> Send inquiry
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}